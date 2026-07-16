# Rencana Implementasi: Notifikasi, Settings, Profile

Status saat ini: ketiga ikon di `src/components/TopNav.tsx` (Bell, Settings, avatar) adalah placeholder murni — tidak ada `onClick`, tidak ada view/dropdown, dan avatar masih hardcoded ke foto Unsplash meskipun `Login.tsx` sudah pakai Supabase Auth asli.

## 1. Notifikasi (Bell icon — `TopNav.tsx:42-45`)

**Tujuan**: alert untuk hal-hal yang butuh aksi user, langsung terhubung ke inti fungsi app (compliance tracking).

**Sumber data notifikasi**:
- Dokumen vendor yang mendekati/sudah expired (berdasarkan `calculateCompliance()` di `VendorContext.tsx`)
- Vendor request baru masuk yang masih pending (belum di-accept/reject di `RequestForm.tsx`)

**Implementasi**:
1. Buat `NotificationDropdown.tsx` di `src/components/` — panel dropdown yang muncul saat Bell diklik (pola serupa modal `viewMode` yang sudah ada, tapi non-modal/popover).
2. Hitung notifikasi secara derived dari state yang sudah ada di `VendorContext` (vendors dengan dokumen mendekati expired, prospective vendors dengan status pending) — tidak perlu tabel notifikasi baru di Supabase dulu, cukup computed di client.
3. Badge count merah (titik kecil yang sudah ada di `TopNav.tsx:44`) diganti jadi angka jumlah notifikasi, disembunyikan kalau 0.
4. Klik item notifikasi → navigasi ke view terkait (mis. ke `Compliance` view dengan vendor ter-filter, atau ke `RequestForm`).

**Opsional (fase 2)**: threshold "H-berapa hari sebelum expired" dikonfigurasi lewat Settings, dan/atau notifikasi persisted di Supabase kalau butuh riwayat/read-state antar sesi.

## 2. Settings (Gear icon — `TopNav.tsx:46-48`)

**Tujuan**: satu tempat untuk preferensi user & konfigurasi yang sekarang tidak ada UI-nya sama sekali.

**Isi yang diusulkan**:
- **Preferensi notifikasi**: threshold hari sebelum expired untuk trigger alert (dipakai fitur Notifikasi di atas)
- **Manajemen access key vendor**: mengingat ada temuan security soal access key enumeration (lihat security audit sebelumnya), Settings adalah tempat wajar untuk admin regenerate/revoke access key
- **Tema** (opsional, fase belakangan): toggle light/dark kalau nanti mau didukung

**Implementasi**:
1. Extend `ViewType` di `src/types.ts` menjadi menambahkan `'settings'`.
2. Buat `src/views/Settings.tsx` mengikuti pola view lain (routed lewat `switch` di `App.tsx`, entry baru di `Sidebar.tsx` ATAU diakses langsung dari klik ikon gear tanpa masuk nav utama — perlu diputuskan).
3. Section-based layout: Notifikasi, Access Key, (Tema).
4. Access key management butuh query/mutation ke Supabase (tabel terkait access key vendor) — cek skema dulu sebelum implement.

## 3. Profile (avatar — `TopNav.tsx:49-55`)

**Tujuan**: menampilkan identitas user yang benar-benar login (bukan foto placeholder), dan menyediakan cara logout — saat ini **tidak ada tombol logout di UI sama sekali**.

**Implementasi**:
1. Ambil data user dari Supabase Auth session (`supabase.auth.getUser()` / context yang sudah ada dari `Login.tsx`).
2. Ganti `<img>` hardcoded jadi avatar inisial (kalau tidak ada foto profil) atau foto dari user metadata.
3. Klik avatar → dropdown kecil berisi: email user yang login, tombol **Logout** (`supabase.auth.signOut()`), dan mungkin link ke Settings.
4. Setelah logout, redirect balik ke `Login` view (cek gimana `App.tsx` gate auth saat ini, kemungkinan lewat state `isAuthenticated` atau sejenis).

## Urutan pengerjaan yang disarankan

1. **Profile dulu** — paling kecil scope-nya, dan mengisi gap fungsional nyata (belum ada logout).
2. **Notifikasi** — value tertinggi untuk core function app, tapi butuh sedikit lebih banyak logic (derived compliance data).
3. **Settings** — paling besar karena Access Key Management butuh eksplorasi skema Supabase dulu; bisa dipecah jadi sub-tasks.

Semua tiga bisa dimulai sebagai versi sederhana (dropdown UI, computed dari state yang sudah ada) tanpa perlu tabel/schema baru di Supabase, kecuali Access Key Management di Settings yang kemungkinan butuh query ke tabel yang sudah ada.
