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

-- NOTE: Login.tsx is still a fake stub with no real Supabase Auth session,
-- so the app talks to Supabase only with the public anon key. These policies
-- grant the anon role full read/write, which means anyone with the anon key
-- (it's in the client bundle) can read/write this data. Tighten these once
-- real auth is wired up (e.g. restrict to `authenticated` + an ownership check).
create policy "anon full access to vendors" on public.vendors
  for all to anon using (true) with check (true);

create policy "anon full access to prospective_vendors" on public.prospective_vendors
  for all to anon using (true) with check (true);
