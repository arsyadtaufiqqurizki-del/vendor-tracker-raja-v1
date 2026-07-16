# Security Audit & Rencana Perbaikan

Hasil audit keamanan (red-team style) terhadap arsitektur Supabase (RLS, RPC, Storage) dan alur auth aplikasi ini, per **2026-07-13**. Dokumen ini adalah rencana implementasi — belum ada perbaikan yang dieksekusi, semua masih di tahap SQL/kode yang perlu direview lalu di-apply lewat migration.

## Ringkasan Temuan

| # | Temuan | Severity | Status |
|---|---|---|---|
| 1 | Access key: shared secret 6 digit, brute-forceable, tidak terikat identitas vendor | Critical | **Diperbaiki (2026-07-13, dengan modifikasi — lihat Fase 1)** |
| 2 | `submit_vendor_request` percaya path dokumen dari client tanpa validasi kepemilikan | High | Belum diperbaiki |
| 3 | Tidak ada batas peran "vendor" di RLS — semua user `authenticated` = staff penuh | Critical (laten) | Belum diperbaiki |
| 4 | `SECURITY DEFINER` function (`rls_auto_enable`) ter-expose ke anon/authenticated tanpa perlu | Medium | Belum diperbaiki |
| 5 | Leaked password protection nonaktif di Supabase Auth | Low | Belum diperbaiki |

Detail exploit scenario tiap temuan ada di riwayat percakapan audit (`response.md` di scratchpad) — ringkasan fix ada di bawah, dikelompokkan jadi fase implementasi.

---

## Fase 1 — Access Key Hardening (Critical, prioritas pertama) — ✅ Selesai 2026-07-13

**Masalah:** `check_vendor_access_key` bisa dipanggil langsung lewat REST tanpa rate limit. Kode 6 digit numerik (1 juta kemungkinan) bisa di-brute-force dalam hitungan menit lewat script. Kode juga tidak terikat ke satu vendor tertentu dan tidak pernah expired — sekali bocor/ketebak, bisa dipakai siapa saja berkali-kali untuk submit data palsu.

**Modifikasi dari rencana awal (keputusan user, 2026-07-13):**
- **Reusable, bukan single-use** — tidak ada `used_at`. Kode tetap bisa dipakai berkali-kali sampai staff nonaktifkan manual, expired, atau ke-lock. Ini beda dari draft awal yang mengusulkan single-use.
- **Expiry ditambahkan**: kolom `expires_at`, default **3 hari** sejak `created_at`.
- **Lockout**: 5 kali gagal berturut-turut (dilacak per string kode yang dicoba, termasuk kode yang tidak pernah ada) → lock 15 menit.
- **Turnstile di-skip** untuk fase ini (DB-level only) — lihat catatan batasan di bawah.

**Implementasi:**
1. `vendor_access_keys` +kolom `expires_at timestamptz not null default (now() + interval '3 days')`.
2. Tabel baru `vendor_access_key_attempts (code, failed_attempts, locked_until)` — terpisah dari tabel utama, tanpa grant ke anon/authenticated, hanya bisa diubah lewat function `SECURITY DEFINER`. Melacak percobaan gagal per string kode (baik kode yang ada di `vendor_access_keys` maupun yang tidak), jadi retry berulang pada kode tebakan yang sama tetap kena lock walau kodenya tidak pernah valid.
3. Function internal `_access_key_status(p_code)` — dipakai bareng oleh `check_vendor_access_key` dan `submit_vendor_request` supaya keduanya pakai aturan yang sama persis (urutan cek: locked → invalid/inactive/expired → valid). `execute` di-revoke eksplisit dari `anon`/`authenticated` (catatan: `revoke ... from public` saja tidak cukup — Supabase auto-grant execute ke `anon`/`authenticated` lewat default privileges setiap function baru dibuat, jadi butuh revoke eksplisit per-role).
4. `check_vendor_access_key` berubah `returns boolean` → `returns jsonb` (`{valid, reason}`, reason: `ok`/`invalid`/`inactive`/`expired`/`locked`) supaya UI bisa kasih pesan spesifik. **Breaking change** ke signature RPC.
5. `pg_sleep(0.3)` di semua return path biar timing response konsisten (tidak bocorin lewat response time apakah kode ada atau tidak).
6. Turnstile **tidak** dipasang di fase ini.

**Catatan batasan (residual risk, disetujui user):** lockout per-kode ini efektif untuk retry berulang pada satu string yang sama, tapi **tidak** menghentikan attacker yang spray seluruh keyspace 900rb kombinasi dengan satu percobaan per kode berbeda — itu baru benar-benar tertutup oleh Turnstile/rate-limit network, yang sengaja di-skip dulu untuk fase ini.

**File yang berubah:** migration `harden_vendor_access_keys_phase1` + `revoke_access_key_status_direct_execute` (applied ke project `ulyttibwwbeqfpzodxyn` lewat `mcp__supabase__apply_migration`), `supabase/schema.sql`, `src/lib/vendorRequests.ts` (`AccessKeyCheckResult` type), `src/views/Login.tsx` (pesan error per-reason), `src/lib/accessKeys.ts` + `src/types.ts` + `src/views/RequestForm.tsx` (kolom "Berlaku Hingga" di tabel Kelola Access Key).

---

## Fase 2 — Validasi Kepemilikan Dokumen di `submit_vendor_request` (High)

**Masalah:** RPC ini insert `p_documents` (path storage) apa adanya, tanpa cek bahwa path itu benar-benar berada di bawah folder `p_id` atau benar-benar ada di bucket. Ditambah storage policy `anon upload vendor request documents` mengizinkan upload apapun asal `bucket_id` cocok — tidak ada pengecekan access key sama sekali di level upload. Kombinasi keduanya memungkinkan dokumen "disusupkan" ke request orang lain atau di-refer dari path yang tidak pernah divalidasi, lalu ikut ter-copy ke bucket resmi `vendor-documents` saat staff approve.

**Rencana:**
1. Ganti skema ID request dari `VR-${Date.now()}-${4 digit random}` (predictable) ke UUID yang di-generate server-side lewat RPC baru `begin_vendor_request()` (`returns text` → `'VR-' || gen_random_uuid()`), dipanggil sebelum upload dokumen pertama.
2. Tambah validasi di `submit_vendor_request`: loop tiap value di `p_documents`, pastikan diawali `p_id || '/'`, dan pastikan barisnya ada di `storage.objects` (bucket `vendor-request-documents`). Tolak (`raise exception`) kalau tidak cocok.
3. Update `src/lib/vendorRequests.ts`: `generateVendorRequestId()` → panggil RPC baru, bukan bikin ID di client lagi.

**File yang berubah:** migration SQL, `src/lib/vendorRequests.ts`, kemungkinan `src/components/VendorRequestForm.tsx` (urutan generate ID jadi async/butuh network call).

---

## Fase 3 — Siapkan RLS untuk Peran Vendor (Critical, laten — sebelum fitur login vendor dibuat)

**Masalah:** Semua policy tabel inti (`vendors`, `prospective_vendors`, `vendor_requests`, `vendor_access_keys`) pakai `for all to authenticated using (true) with check (true)`. Ini aman selama satu-satunya yang punya akun Supabase Auth adalah staff. Begitu ada fitur "vendor login" (akun asli, bukan access-key sekali pakai), vendor itu otomatis dapat akses penuh ke semua data vendor lain — bukan cuma datanya sendiri.

**Rencana (siapkan sebelum fitur vendor-login dibangun, jangan sesudah):**
1. Tandai staff dengan custom claim saat akun dibuat: `app_metadata.role = 'staff'` (lewat Supabase dashboard atau service-role script, bukan self-signup).
2. Ganti policy `authenticated full access to X` → cek `auth.jwt() -> 'app_metadata' ->> 'role' = 'staff'`.
3. Kalau nanti ada tabel/kolom yang vendor boleh akses sendiri (mis. status request miliknya), buat policy terpisah yang scoped ke `vendor_id = auth.uid()` atau kolom pemilik serupa — jangan pernah `to authenticated` polos lagi.

**Catatan:** fase ini murni pencegahan (tidak ada eksploit aktif hari ini karena belum ada akun vendor beneran), tapi harus jadi gate sebelum siapa pun mengerjakan "vendor bisa login dan lihat dokumennya sendiri".

---

## Fase 4 — Housekeeping (Medium/Low)

1. `revoke execute on function public.rls_auto_enable() from public, anon, authenticated;` — function ini cuma dipakai event trigger, tidak perlu bisa dipanggil lewat `/rest/v1/rpc/`.
2. Tambahkan `revoke execute on function public.check_vendor_access_key from public;` dan `revoke execute on function public.submit_vendor_request from public;` sebelum `grant ... to anon` — supaya grant eksplisit, bukan warisan default `public`.
3. Aktifkan **Leaked Password Protection** di Supabase Dashboard → Authentication → Policies (proteksi HaveIBeenPwned untuk akun staff).

---

## Urutan Eksekusi yang Disarankan

1. **Fase 1** dulu (access key) — ini yang paling gampang dieksploitasi dari luar hari ini.
2. **Fase 2** (validasi dokumen) — sepaket secara logis karena sama-sama menyentuh `submit_vendor_request`.
3. **Fase 4** (housekeeping) — cepat, low-risk, bisa disisipkan kapan saja.
4. **Fase 3** (RLS peran vendor) — kerjakan sebagai gate *sebelum* fitur vendor-login mulai dibangun, bukan buru-buru sekarang.

Setiap fase butuh migration baru lewat `mcp__supabase__apply_migration` (jangan edit `supabase/schema.sql` manual tanpa apply ke project live), lalu jalankan `mcp__supabase__get_advisors` ulang untuk konfirmasi warning hilang.
