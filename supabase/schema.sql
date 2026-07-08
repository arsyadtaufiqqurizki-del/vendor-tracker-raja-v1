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
-- object path per document type instead of "Yes"/"No".
insert into storage.buckets (id, name, public)
values ('vendor-documents', 'vendor-documents', false)
on conflict (id) do nothing;

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
