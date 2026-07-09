# TODO: Bersihkan File Yatim di Bucket `vendor-request-documents`

Catatan untuk dikerjakan belakangan — bukan bug/celah keamanan, cuma potensi sampah storage yang menumpuk seiring waktu.

## Latar Belakang

Di alur pendaftaran vendor mandiri (`VendorRequestForm.tsx`), upload dokumen dan submit form adalah dua langkah terpisah:

1. Vendor klik "Upload" di salah satu jenis dokumen → file **langsung terkirim** ke bucket `vendor-request-documents` lewat `uploadRequestDocument()` (`src/lib/vendorRequests.ts`).
2. Baru setelah vendor mengisi semua field wajib dan klik "Kirim Pendaftaran" → baris baru dibuat di tabel `vendor_requests` lewat RPC `submit_vendor_request`, yang menyimpan path file dari langkah 1.

Kalau vendor upload 1+ dokumen lalu **tidak jadi submit** (tutup tab, batal, koneksi putus, dll), file yang sudah terupload di langkah 1 tetap ada di storage — tidak ada baris `vendor_requests` yang menunjuk ke sana (file yatim/orphaned).

## Kenapa Belum Bisa Dibersihkan Sekarang

Policy `storage.objects` untuk bucket `vendor-request-documents` (per pengecekan `pg_policies` di project `ulyttibwwbeqfpzodxyn`, 2026-07-09) cuma ada dua:

| Role | Perintah |
|---|---|
| `anon` | INSERT saja |
| `authenticated` (staff) | SELECT saja |

Tidak ada satu pun role yang punya izin **DELETE** di bucket ini — jadi staff tidak bisa hapus file yatim lewat aplikasi, harus manual dari Supabase Dashboard.

## Kenapa Bukan Prioritas Mendesak

- Bukan celah keamanan: `anon` tetap tidak bisa baca file siapa pun (tidak ada policy SELECT untuk anon), jadi tidak ada risiko data bocor dari file yatim ini.
- Efeknya murni penumpukan kuota storage Supabase. Sejak 2026-07-09 bucket ini juga sudah dibatasi PDF-only max 10MB per file (lihat `supabase/schema.sql`), jadi laju pertumbuhannya terbatas.

## Opsi Perbaikan

### Opsi A — Izin DELETE untuk staff + tombol manual
- Tambah policy `authenticated delete vendor request documents` di `storage.objects` (mirror bucket `vendor-documents` yang sudah punya delete untuk `authenticated`).
- Tambah tombol "Bersihkan file belum submit" di tab terkait di `src/views/RequestForm.tsx`, yang list objek di bucket lewat `supabase.storage.from('vendor-request-documents').list(...)` lalu filter path yang **tidak** match `id` mana pun di tabel `vendor_requests`, baru hapus yang tersisa.
- Plus/minus: staff harus trigger manual, tapi implementasinya simpel dan tidak butuh infra tambahan (cron/edge function).

### Opsi B — Scheduled cleanup otomatis
- Bikin Supabase Edge Function atau Postgres cron job (`pg_cron`) yang jalan berkala (misal harian), scan bucket `vendor-request-documents`, hapus objek yang lebih tua dari X hari (misal 7 hari) **dan** path-nya tidak match `id` mana pun di `vendor_requests`.
- Perlu service-role key (edge function jalan dengan privilege lebih tinggi, bypass RLS insert-only di atas).
- Plus/minus: sepenuhnya otomatis, tidak perlu diingat staff, tapi butuh setup infra (edge function / pg_cron) dan sedikit lebih rumit untuk ditest.

**Rekomendasi:** mulai dari Opsi A dulu (lebih cepat dikerjakan, tidak butuh infra baru); upgrade ke Opsi B kalau ternyata volume sampah cukup besar untuk butuh otomatisasi.

## Yang Perlu Diputuskan Sebelum Eksekusi

- [ ] Pilih Opsi A, B, atau keduanya?
- [ ] Kalau Opsi B: berapa hari retensi sebelum file dianggap "yatim" dan aman dihapus?
- [ ] Kalau Opsi A: apakah tombol cleanup perlu konfirmasi/preview daftar file sebelum hapus, atau langsung hapus semua yang tidak match?
