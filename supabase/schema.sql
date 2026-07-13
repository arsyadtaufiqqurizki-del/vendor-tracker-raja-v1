-- Run this once in the Supabase SQL Editor (Dashboard > SQL Editor > New query).

create table if not exists public.vendors (
  id text primary key,
  name text not null default '',
  category text not null default '',
  sub_category text not null default '',
  phone text not null default '',
  email text not null default '',
  sales_person text not null default '',
  documents jsonb not null default '{}'::jsonb,
  bank_name text not null default '',
  bank_account_name text not null default '',
  bank_account text not null default '',
  npwp_number text not null default '',
  nib_address text not null default '',
  corresp_address text not null default '',
  remarks text not null default '',
  icon text,
  created_at timestamptz not null default now()
);

create table if not exists public.prospective_vendors (
  id text primary key,
  name text not null default '',
  contact_email text not null default '',
  contact_person text,
  whatsapp text,
  category text not null default '',
  status text not null default 'New',
  created_at timestamptz not null default now()
);

alter table public.vendors enable row level security;
alter table public.prospective_vendors enable row level security;

-- Login.tsx now uses real Supabase Auth (email/password). Only signed-in
-- users (created manually in Supabase Dashboard > Authentication) can
-- read/write vendor data; the anon key alone is no longer enough.
create policy "authenticated full access to vendors" on public.vendors
  for all to authenticated using (true) with check (true);

create policy "authenticated full access to prospective_vendors" on public.prospective_vendors
  for all to authenticated using (true) with check (true);

-- Vendor document uploads (Dokumen Administrasi section) are stored in a
-- private Storage bucket; the vendors.documents jsonb column stores the
-- object path per document type instead of "Yes"/"No". PDF-only, max 10MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vendor-documents', 'vendor-documents', false, 10485760, array['application/pdf'])
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "authenticated read vendor documents"
on storage.objects for select
to authenticated
using (bucket_id = 'vendor-documents');

create policy "authenticated upload vendor documents"
on storage.objects for insert
to authenticated
with check (bucket_id = 'vendor-documents');

create policy "authenticated update vendor documents"
on storage.objects for update
to authenticated
using (bucket_id = 'vendor-documents')
with check (bucket_id = 'vendor-documents');

create policy "authenticated delete vendor documents"
on storage.objects for delete
to authenticated
using (bucket_id = 'vendor-documents');

-- Vendor self-registration: access keys + pending vendor requests.
-- Vendor luar mengisi form pendaftaran sendiri (dikunci access key), staff
-- me-review dan approve/reject dari menu "Request Form" sebelum data masuk
-- ke tabel vendors resmi. Lihat VENDOR_SELF_REGISTRATION.md untuk spek lengkap.

create table if not exists public.vendor_access_keys (
  code text primary key,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '3 days')
);

alter table public.vendor_access_keys enable row level security;
-- Tidak ada policy select untuk anon di tabel ini — satu-satunya jalan
-- baca/pakai kode adalah lewat check_vendor_access_key (SECURITY DEFINER),
-- supaya anon tidak bisa mengintip daftar kode yang valid.

create policy "authenticated manage vendor access keys" on public.vendor_access_keys
  for all to authenticated using (true) with check (true);

-- Phase 1 hardening (2026-07-13): brute-force lockout tracking, keyed by the
-- literal code string tried (whether or not it exists in vendor_access_keys)
-- so repeatedly retrying one guessed/dead code gets locked too. No policies
-- granted to anon/authenticated — only reachable via _access_key_status
-- below (SECURITY DEFINER, execute revoked from anon/authenticated directly;
-- Supabase auto-grants execute to those roles on every new function, so that
-- revoke has to be explicit, not just "revoke ... from public").
create table if not exists public.vendor_access_key_attempts (
  code text primary key,
  failed_attempts int not null default 0,
  locked_until timestamptz
);

alter table public.vendor_access_key_attempts enable row level security;

-- Shared by check_vendor_access_key and submit_vendor_request so both apply
-- identical expiry/lockout rules: locked_until wins first, then invalid
-- (no row) / inactive / expired, each recording a failed attempt and
-- escalating to a 15-minute lock after 5 consecutive failures for that code.
-- Keys are reusable by design (staff toggles `active` manually) — no
-- single-use/used_at column.
create or replace function public._access_key_status(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_locked_until timestamptz;
  v_failed int;
  v_key public.vendor_access_keys;
  v_reason text;
begin
  select failed_attempts, locked_until into v_failed, v_locked_until
    from public.vendor_access_key_attempts where code = p_code;

  if v_locked_until is not null and v_locked_until > now() then
    perform pg_sleep(0.3);
    return jsonb_build_object('valid', false, 'reason', 'locked');
  end if;

  select * into v_key from public.vendor_access_keys where code = p_code;

  if v_key.code is null then
    v_reason := 'invalid';
  elsif not v_key.active then
    v_reason := 'inactive';
  elsif v_key.expires_at < now() then
    v_reason := 'expired';
  end if;

  if v_reason is not null then
    insert into public.vendor_access_key_attempts (code, failed_attempts, locked_until)
    values (p_code, 1, null)
    on conflict (code) do update
      set failed_attempts = vendor_access_key_attempts.failed_attempts + 1,
          locked_until = case when vendor_access_key_attempts.failed_attempts + 1 >= 5
                          then now() + interval '15 minutes' else null end;
    perform pg_sleep(0.3);
    return jsonb_build_object('valid', false, 'reason', v_reason);
  end if;

  delete from public.vendor_access_key_attempts where code = p_code;
  perform pg_sleep(0.3);
  return jsonb_build_object('valid', true, 'reason', 'ok');
end;
$$;

revoke all on function public._access_key_status(text) from public;
revoke execute on function public._access_key_status(text) from anon, authenticated;

-- Dipanggil vendor saat isi kode di tab "Vendor Login", sebelum form muncul.
-- Returns jsonb {valid, reason} — reason is 'ok' | 'invalid' | 'inactive' |
-- 'expired' | 'locked', so the UI can show a specific message.
create or replace function public.check_vendor_access_key(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return public._access_key_status(p_code);
end;
$$;

grant execute on function public.check_vendor_access_key to anon;

create table if not exists public.vendor_requests (
  id text primary key,
  status text not null default 'pending', -- 'pending' | 'approved' | 'rejected'
  name text not null default '',
  category text not null default '',
  sub_category text not null default '',
  phone text not null default '',
  email text not null default '',
  sales_person text not null default '',
  documents jsonb not null default '{}'::jsonb,
  bank_name text not null default '',
  bank_account_name text not null default '',
  bank_account text not null default '',
  npwp_number text not null default '',
  nib_address text not null default '',
  corresp_address text not null default '',
  remarks text not null default '',
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text
);

alter table public.vendor_requests enable row level security;

-- Staff (authenticated) full access untuk review. Sengaja TIDAK ada policy
-- insert untuk anon — submit wajib lewat function di bawah, yang
-- re-validasi access key sebelum insert.
create policy "authenticated full access to vendor_requests" on public.vendor_requests
  for all to authenticated using (true) with check (true);

create or replace function public.submit_vendor_request(
  p_access_key text,
  p_id text,
  p_name text,
  p_category text,
  p_sub_category text,
  p_phone text,
  p_email text,
  p_sales_person text,
  p_documents jsonb,
  p_bank_name text,
  p_bank_account_name text,
  p_bank_account text,
  p_npwp_number text,
  p_nib_address text,
  p_corresp_address text,
  p_remarks text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status jsonb;
begin
  v_status := public._access_key_status(p_access_key);
  if not (v_status->>'valid')::boolean then
    raise exception 'Access key tidak valid';
  end if;

  insert into public.vendor_requests (
    id, status, name, category, sub_category, phone, email, sales_person,
    documents, bank_name, bank_account_name, bank_account, npwp_number,
    nib_address, corresp_address, remarks
  ) values (
    p_id, 'pending', p_name, p_category, p_sub_category, p_phone, p_email, p_sales_person,
    p_documents, p_bank_name, p_bank_account_name, p_bank_account, p_npwp_number,
    p_nib_address, p_corresp_address, p_remarks
  );
end;
$$;

grant execute on function public.submit_vendor_request to anon;

-- Storage bucket for documents uploaded during vendor self-registration.
-- Separate from vendor-documents (authenticated-only read) so vendors never
-- get read access to other vendors' files; approveVendorRequest (Phase 2)
-- moves accepted files into vendor-documents. PDF-only, max 10MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vendor-request-documents', 'vendor-request-documents', false, 10485760, array['application/pdf'])
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Insert-only for anon on purpose: no anon select/update policy, so a vendor
-- can never read or overwrite another vendor's uploaded documents in this
-- bucket. uploadRequestDocument() must NOT pass { upsert: true } — Postgres
-- checks ON CONFLICT DO UPDATE's RLS (which needs SELECT+UPDATE policies)
-- even when no row actually conflicts, so upsert would force widening this.
create policy "anon upload vendor request documents"
on storage.objects for insert
to anon
with check (bucket_id = 'vendor-request-documents');

create policy "authenticated read vendor request documents"
on storage.objects for select
to authenticated
using (bucket_id = 'vendor-request-documents');

-- Lets staff clean up files left behind when a vendor uploads a document but
-- never submits the request (see TODO_CLEANUP_ORPHANED_REQUEST_DOCUMENTS.MD).
create policy "authenticated delete vendor request documents"
on storage.objects for delete
to authenticated
using (bucket_id = 'vendor-request-documents');
