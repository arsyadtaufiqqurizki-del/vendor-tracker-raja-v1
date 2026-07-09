# Vendor Self-Registration & Request Approval

Spek untuk fitur baru: vendor luar bisa mengisi form pendaftaran sendiri lewat halaman Login (pakai access key, bukan email/password), lalu tim internal me-review dan approve/reject dari menu baru sebelum data masuk ke daftar Vendor resmi.

## Latar Belakang

Saat ini satu-satunya cara menambah vendor adalah tombol "Add New Vendor" di dalam dashboard internal (butuh login staff). Karena jumlah vendor banyak, tim internal ingin vendor bisa mengisi data mereka sendiri, supaya tim internal tinggal verifikasi dan approve. Supaya form ini tidak terbuka untuk sembarang orang di internet, akses ke form dikunci pakai **access key** (kode angka) yang dibagikan tim internal ke vendor.

## Alur Singkat

1. Vendor buka halaman Login → pilih tab **"Vendor Login"** → masukkan access key.
2. Access key divalidasi ke Supabase (server-side). Kalau valid → form pendaftaran vendor terbuka (isi data + upload dokumen).
3. Submit → data masuk ke tabel `vendor_requests` dengan status `pending`.
4. Staff internal (login normal email/password) membuka menu baru **"Request Form"** → lihat daftar request pending.
5. Staff **Accept** → data dipindahkan ke tabel `vendors` (lewat `calculateCompliance` seperti biasa) → muncul di menu Vendors.
   Staff **Reject** → request diarsipkan (`status = 'rejected'`, row tetap ada supaya riwayatnya bisa dilihat), tidak masuk ke Vendors.

## Keputusan Arsitektur

### 0. Field wajib vs opsional di form vendor

**Keputusan (final):**

| Wajib diisi | Tidak wajib (boleh kosong) |
|---|---|
| Nama Vendor (`name`) | Dokumen — semua 9 jenis (`documents`: NIB, Akta Pendirian, Akta Pengesahan, NPWP, PKP, Non PKP, Sertifikat, Dokumen Pendukung, Registration Form RAJA) |
| Kategori (`category`) | Remarks (`remarks`) |
| Email (`email`) | |
| No. HP (`phone`) | |
| Rekening Bank — Nama Bank, Nama Pemilik Rekening, No. Rekening (`bankName`, `bankAccountName`, `bankAccount`) | |
| Alamat — Alamat NIB & Alamat Korespondensi (`nibAddress`, `correspAddress`) | |

Dua asumsi yang saya ambil karena tidak disebutkan eksplisit (tolong koreksi kalau salah):
- **Sub Kategori** (`subCategory`) diperlakukan sama seperti dokumen — opsional, karena tidak disebut sebagai bagian dari 4 field "Informasi Dasar" yang wajib.
- **No. NPWP** (`npwpNumber`, field teks di section "Informasi Pajak" — beda dari dokumen upload "NPWP") saya masukkan ke kelompok **wajib**, disamakan dengan data identitas bisnis lain (rekening bank, alamat), bukan "dokumen".
- **Sales Person** (`salesPerson`) saya **hilangkan dari form vendor sama sekali** — ini penugasan internal RAJA, vendor tidak akan tahu siapa PIC-nya. Field ini tetap ada di tabel/skema tapi dikosongkan saat submit, dan staff isi belakangan (saat review di Request Form atau edit manual di menu Vendors setelah approve).

Implikasi ke `VendorRequestForm.tsx` (Fase 3): field wajib di atas butuh tanda `*`, validasi sebelum submit (tombol submit disabled kalau ada yang kosong), beda dari form "Tambah Vendor" internal yang sekarang tidak ada validasi sama sekali.

### 1. Access key: tabel `vendor_access_keys` + validasi lewat RPC

**Keputusan (final):** kode **6 digit numerik** (misal `"483920"`), dan tim bisa punya **beberapa kode aktif sekaligus** — tabel di bawah sudah mendukung ini secara natural (tinggal insert beberapa row dengan `active = true`, tidak ada batasan satu kode aktif). Generate/nonaktifkan kode dilakukan lewat **UI kecil di dalam app** (lihat "Kelola Access Key" di bagian Fase 4), bukan manual lewat Supabase dashboard.

Access key **tidak boleh** hanya dicek di frontend — kalau cuma dicek di React lalu "unlock" form, orang bisa bypass lewat devtools dan langsung panggil Supabase API pakai anon key. Validasi harus terjadi di server lewat Postgres function (`SECURITY DEFINER`) yang dipanggil via `supabase.rpc()`.

Desain paling simpel: satu tabel kecil berisi kode-kode yang valid, tidak dikaitkan ke nama/email vendor tertentu (tidak ada langkah "invite per-vendor" — staff cukup generate/aktifkan kode dan bagikan ke vendor manapun).

```sql
create table if not exists public.vendor_access_keys (
  code text primary key,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.vendor_access_keys enable row level security;
-- Tidak ada policy untuk anon/authenticated select langsung di tabel ini —
-- satu-satunya jalan baca/pakai kode adalah lewat function di bawah (SECURITY DEFINER
-- berjalan sebagai owner, tidak tunduk ke RLS pemanggil). Ini mencegah anon
-- mengintip daftar kode yang valid.

create policy "authenticated manage vendor access keys" on public.vendor_access_keys
  for all to authenticated using (true) with check (true);

-- Dipanggil vendor saat isi kode di tab "Vendor Login", sebelum form muncul.
create or replace function public.check_vendor_access_key(p_code text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.vendor_access_keys where code = p_code and active = true
  );
$$;

grant execute on function public.check_vendor_access_key to anon;
```

Generate/nonaktifkan kode oleh staff **tidak** butuh function RPC tambahan — policy `authenticated manage vendor access keys` di atas sudah kasih staff (yang login lewat `supabase.auth`) akses penuh `insert`/`update`/`select` langsung ke tabel ini. UI "Kelola Access Key" (Fase 4) cukup panggil `supabase.from('vendor_access_keys')` langsung dari client, mirip pola CRUD vendor/prospective vendor yang sudah ada di `VendorContext.tsx`.

### 2. Tabel `vendor_requests` — insert hanya lewat RPC, bukan policy langsung

Tidak reuse tabel `vendors` langsung (RLS-nya `authenticated only`; kalau anon dikasih insert langsung ke situ, resikonya lebih tinggi). Bedanya dari draf sebelumnya: `vendor_requests` **tidak** dikasih policy insert untuk `anon` sama sekali — submit hanya bisa lewat function `submit_vendor_request`, yang sekaligus re-validasi access key di dalamnya (jadi tidak bisa disubmit tanpa kode valid meskipun anon key publik).

```sql
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
-- insert untuk anon — submit wajib lewat function di bawah.
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
begin
  if not exists (select 1 from public.vendor_access_keys where code = p_access_key and active = true) then
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
```

### 3. Storage bucket terpisah untuk dokumen dari form vendor

Bucket `vendor-documents` yang ada sekarang RLS-nya `authenticated only`. Vendor butuh bucket sendiri, misal `vendor-request-documents`, dengan policy insert-only untuk `anon` (tanpa read), supaya vendor tidak bisa mengakses dokumen vendor lain via path tebak-tebakan.

```sql
insert into storage.buckets (id, name, public)
values ('vendor-request-documents', 'vendor-request-documents', false)
on conflict (id) do nothing;

create policy "anon upload vendor request documents"
on storage.objects for insert
to anon
with check (bucket_id = 'vendor-request-documents');

create policy "authenticated read vendor request documents"
on storage.objects for select
to authenticated
using (bucket_id = 'vendor-request-documents');
```

Catatan trade-off: upload dokumen ini tetap lewat anon key biasa (tidak melalui RPC), jadi secara teknis siapa pun yang tahu URL Storage bisa upload file sampah ke bucket ini walau tidak submit access key valid — risikonya rendah untuk tool internal (tidak ada data sensitif yang bisa dibaca, cuma bisa "menulis" file random), tapi dicatat di sini supaya sadar. Kalau nanti mau ditutup rapat, upload dokumen bisa dipindah jadi sesudah `submit_vendor_request` berhasil (pakai `request id` yang baru dibuat sebagai bagian path yang di-generate server, bukan ditebak client) — untuk versi awal ini tidak perlu.

### 4. Tidak perlu routing/path terpisah

Karena access key sekarang jadi tab di halaman **Login** yang sudah ada (bukan path publik baru), tidak perlu percabangan `window.location.pathname` di `App.tsx`. `Login.tsx` cukup punya dua mode:

- `mode: 'staff'` — form email/password yang sudah ada sekarang.
- `mode: 'vendor-key'` — input access key → panggil `check_vendor_access_key` via RPC → kalau valid, ganti state lokal ke `mode: 'vendor-form'` dan render form pendaftaran vendor inline (tanpa navigasi/route apa pun, tanpa butuh Supabase Auth session).

`App.tsx` tidak berubah untuk bagian ini — tetap render `<Login />` saat tidak ada session, dan semua logic tab ada di dalam `Login.tsx`.

## Perubahan yang Dibutuhkan

### Baru
- `supabase/schema.sql` — tambahan tabel `vendor_access_keys`, `vendor_requests`, function `check_vendor_access_key` & `submit_vendor_request`, bucket `vendor-request-documents`, dan policy-policy di atas.
- `src/lib/vendorRequests.ts` — helper: `checkAccessKey(code)`, `submitVendorRequest(code, data)`, `uploadRequestDocument(requestId, docName, file)`, `listVendorRequests()`, `approveVendorRequest(request)`, `rejectVendorRequest(id)`.
- `src/lib/accessKeys.ts` — helper staff-side: `listAccessKeys()`, `generateAccessKey()` (bikin kode 6 digit acak + insert `active: true`), `setAccessKeyActive(code, active)`.
- `src/components/VendorRequestForm.tsx` — form pendaftaran vendor (reuse struktur section dari `VendorModal.tsx`), dirender inline dari dalam `Login.tsx` setelah access key valid.
- `src/views/RequestForm.tsx` — view internal baru dengan dua tab: **"Permintaan"** (daftar `vendor_requests` pending + tombol Accept/Reject) dan **"Access Key"** (daftar kode + toggle aktif/nonaktif + tombol generate kode baru).
- `src/types.ts` — tambah `VendorRequest` interface & `AccessKey` interface, tambah `'requestForm'` ke `ViewType`.

### Diubah
- `src/views/Login.tsx` — tambah tab "Staff Login" / "Vendor Login", state `mode`, input access key, render `VendorRequestForm` setelah key valid.
- `src/components/Sidebar.tsx` — tambah nav item "Request Form".
- `src/contexts/VendorContext.tsx` — tambah state/fetch untuk `vendorRequests` + fungsi `approveVendorRequest`/`rejectVendorRequest`.
- `src/App.tsx` — tambah case `'requestForm'` di `renderView()`/`getTitle()` (tidak ada perubahan untuk gate login/routing).

## Fase Implementasi

### Fase 0 — Kunci Keputusan Desain

- [x] Format access key: **6 digit numerik**.
- [x] **Beberapa kode aktif sekaligus** diperbolehkan (tidak dibatasi satu kode aktif).
- [x] Kode dikelola lewat **UI kecil di dalam app** ("Kelola Access Key" di menu Request Form), bukan manual lewat Supabase dashboard.
- [x] Reject = **arsip** (`status = 'rejected'`, row tidak dihapus).
- [x] **Tidak perlu** notifikasi email.
- [x] Field wajib: Nama Vendor, Kategori, Email, No. HP, Rekening Bank, Alamat. Field opsional: Dokumen, Remarks. (Detail lengkap di "Keputusan Arsitektur" bagian 0.)

Semua poin Fase 0 sudah selesai — siap lanjut ke Fase 1.

### Fase 1 — Database & Storage (Supabase)
1. Tambahkan blok SQL tabel `vendor_access_keys`, `vendor_requests`, dan kedua function (`check_vendor_access_key`, `submit_vendor_request`) ke `supabase/schema.sql` (sudah didraft di bagian "Keputusan Arsitektur" di atas).
2. Tambahkan blok SQL bucket `vendor-request-documents` + policy insert-only `anon` / select `authenticated`.
3. Jalankan SQL tersebut di Supabase SQL Editor (project yang sama dengan `vendors`/`prospective_vendors`).
4. Isi minimal satu row di `vendor_access_keys` secara manual buat testing (`insert into vendor_access_keys (code) values ('123456');`).
5. Verifikasi lewat Supabase dashboard: tabel & function muncul, RLS aktif, bucket muncul di Storage.
6. **Test manual RLS/RPC**: panggil `check_vendor_access_key` via anon key dengan kode benar (harus `true`) dan salah (harus `false`); coba `select * from vendor_access_keys` langsung pakai anon key (harus ditolak/kosong) — pastikan kode tidak bisa diintip langsung, hanya lewat function.

### Fase 2 — Types & Helper Layer
1. `src/types.ts` — tambah interface `VendorRequest` (mirror `Vendor` tapi tanpa `status`/`statusColor`/`dotColor`/`color`/`error`, plus `requestStatus: 'pending' | 'approved' | 'rejected'`) dan interface `AccessKey` (`code: string`, `active: boolean`, `createdAt: string`).
2. Tambah `'requestForm'` ke union `ViewType`.
3. `src/lib/vendorRequests.ts` — helper baru:
   - `checkAccessKey(code)` — panggil RPC `check_vendor_access_key`, return boolean.
   - `submitVendorRequest(code, data)` — panggil RPC `submit_vendor_request` dengan access key + payload.
   - `uploadRequestDocument(requestId, docName, file)` — upload ke bucket `vendor-request-documents` (mirror `documentUpload.ts`).
   - `listVendorRequests()` — select semua `vendor_requests` (tanpa filter status; filter `pending`/`rejected`/`approved`/semua dilakukan di UI tab Permintaan, bukan di query) (dipanggil dari context, authenticated).
   - `approveVendorRequest(request)` — orkestrasi: copy dokumen dari `vendor-request-documents` ke `vendor-documents`, insert row ke `vendors`, update `vendor_requests.status = 'approved'`.
   - `rejectVendorRequest(id)` — update `vendor_requests.status = 'rejected'` (arsip, bukan hapus).
4. `src/lib/accessKeys.ts` — helper baru:
   - `listAccessKeys()` — select semua `vendor_access_keys` (authenticated).
   - `generateAccessKey()` — bikin string 6 digit acak (`Math.floor(100000 + Math.random() * 900000)`), insert row baru `active: true`; kalau bentrok primary key (peluang sangat kecil), retry sekali.
   - `setAccessKeyActive(code, active)` — update kolom `active` (toggle on/off dari UI).
5. `src/contexts/VendorContext.tsx` — tambah state `vendorRequests`, fetch on mount (hanya jika ada session — ini data internal), dan expose `approveVendorRequest`/`rejectVendorRequest` lewat context.

### Fase 3 — Tab "Vendor Login" & Form Pendaftaran
1. `src/views/Login.tsx` — tambah dua tab di atas form (misal segmented control "Staff" / "Vendor"), state `mode: 'staff' | 'vendor-key' | 'vendor-form'`.
   - Mode `vendor-key`: satu input access key + tombol submit → panggil `checkAccessKey`. Kalau valid → `setMode('vendor-form')`. Kalau tidak → tampilkan pesan error (mirror pola error staff login yang sudah ada).
2. `src/components/VendorRequestForm.tsx` — reuse struktur section form dari `VendorModal.tsx` (Informasi Dasar, Dokumen Administrasi, Rekening Bank, NPWP, Alamat, Remarks), tapi:
   - Semua field editable (tidak ada `viewMode`), tidak pakai `useVendors()`/`VendorProvider`.
   - Tidak menampilkan field **Sales Person** sama sekali (diisi staff belakangan, lihat Keputusan Arsitektur bagian 0).
   - Validasi wajib sebelum submit: Nama Vendor, Kategori, Email, No. HP, Nama Bank + Nama Pemilik Rekening + No. Rekening, Alamat NIB + Alamat Korespondensi, dan No. NPWP — tombol submit disabled kalau salah satu kosong, tandai field wajib dengan `*`. Dokumen & Remarks tidak divalidasi.
   - Upload dokumen langsung ke bucket `vendor-request-documents` via helper Fase 2.
   - Submit → `submitVendorRequest(code, data)` → tampilkan halaman "Terima kasih, request Anda sedang direview" (state lokal, tidak redirect kemana-mana).
3. Manual test: dari halaman Login, pilih tab Vendor, masukkan kode benar → coba submit dengan field wajib kosong (harus tertahan/disabled) → isi semua field wajib (tanpa dokumen) → submit harus berhasil → cek row muncul di `vendor_requests` dengan status `pending`. Coba juga kode salah → harus ditolak dengan pesan error, form tidak muncul.

### Fase 4 — Menu & View Internal "Request Form"
1. `src/components/Sidebar.tsx` — tambah nav item baru (icon + label "Request Form") ke array `navItems`, arahkan ke `ViewType` `'requestForm'`.
2. `src/App.tsx` — tambah case `'requestForm'` di `renderView()` dan `getTitle()`.
3. `src/views/RequestForm.tsx` — dua tab di dalam satu view:
   - **Tab "Permintaan"**: list `vendorRequests` dalam bentuk tabel/kartu mirip `ProspectiveVendors.tsx`, dengan filter status di atas tabel — **Semua / Pending / Rejected / Approved** (default: `Pending`). Aksi per row:
     - Tombol **Lihat Detail** — buka modal read-only (reuse pola `VendorModal` viewMode `'view'`, tapi sumber datanya `VendorRequest` bukan `Vendor`).
     - Tombol **Accept** — muncul untuk request berstatus `pending` **maupun** `rejected` (jadi staff bisa berubah pikiran dan menerima request yang tadinya ditolak), **tidak muncul** untuk yang sudah `approved`. Panggil `approveVendorRequest`, tampilkan konfirmasi, refresh list.
     - Tombol **Reject** — hanya muncul untuk status `pending` (request yang sudah `approved` tidak relevan di-reject; yang sudah `rejected` tidak perlu di-reject ulang). Panggil `rejectVendorRequest`, minta konfirmasi (aman diklik karena hanya arsip, bukan hapus permanen).
   - **Tab "Access Key"**: list `AccessKey[]` dari `listAccessKeys()` — tabel kode + status aktif/nonaktif + toggle switch (panggil `setAccessKeyActive`) + tombol **"Generate Kode Baru"** (panggil `generateAccessKey`, tampilkan kode barunya biar bisa langsung di-copy staff untuk dibagikan ke vendor).
4. Manual test: request pending dari Fase 3 muncul di tab Permintaan (filter default Pending); Reject satu request → pindah ke filter Rejected → coba Accept dari situ → harus berhasil pindah ke Vendors seperti alur Accept biasa. Generate kode baru di tab Access Key lalu langsung dicoba di tab "Vendor Login" pada Login page — harus langsung valid tanpa perlu refresh/deploy apa pun.

### Fase 5 — Alur Approve End-to-End
1. Pastikan `approveVendorRequest` (Fase 2) benar-benar memindahkan file dokumen antar bucket (bukan sekadar copy referensi path) sebelum insert ke `vendors`, supaya `vendor-request-documents` bisa dibersihkan/private selamanya dan `vendors.documents` menunjuk ke bucket yang benar (`vendor-documents`).
2. Setelah approve, vendor baru harus otomatis lolos `calculateCompliance` sesuai dokumen yang sudah diupload (tidak perlu re-upload manual oleh staff).
3. Manual test penuh: submit dari tab Vendor Login → muncul di Request Form (pending) → Accept → cek muncul di menu Vendors dengan status compliance yang benar → cek dokumen bisa dibuka (tombol "Lihat") dari menu Vendors.
4. Manual test Reject: submit request baru → Reject → pastikan tidak muncul di Vendors, row-nya tetap ada di database dengan `status = 'rejected'` (arsip, sesuai keputusan Fase 0).

### Fase 6 — Polish & Deploy
1. `npm run lint` (type-check) harus bersih.
2. `npm run build` harus sukses.
3. Review UX tab Vendor Login + form di mobile viewport (vendor kemungkinan besar mengisi dari HP).
4. Commit & push, verifikasi deploy Vercel otomatis jalan, test tab Vendor Login di URL production.

## Pertanyaan Terbuka

Semua poin Fase 0 sudah terjawab. Dua asumsi kecil masih perlu dikonfirmasi (lihat catatan di "Keputusan Arsitektur" bagian 0):

- Sub Kategori diperlakukan opsional (belum dikonfirmasi eksplisit).
- No. NPWP (field teks) dimasukkan ke kelompok wajib, disamakan dengan rekening bank/alamat (belum dikonfirmasi eksplisit).
- Sales Person dihilangkan total dari form vendor, diisi staff belakangan — perlu dikonfirmasi apakah ini caranya, atau field ini sebaiknya tetap ada di form tapi opsional.
