# Panduan Pengguna — Procurement RAJA

Panduan ini menjelaskan cara menggunakan aplikasi Vendor Management System ("Procurement RAJA") untuk dua jenis pengguna: **Staff** (tim internal yang mengelola data vendor) dan **Vendor** (pihak eksternal yang mendaftarkan diri lewat kode akses).

## Daftar Isi

1. [Login](#1-login)
2. [Untuk Staff](#2-untuk-staff)
   - [2.1 Dashboard](#21-dashboard)
   - [2.2 Vendors (Direktori Vendor)](#22-vendors-direktori-vendor)
   - [2.3 Prospective Vendors](#23-prospective-vendors)
   - [2.4 Compliance](#24-compliance)
   - [2.5 Request Form](#25-request-form)
   - [2.6 Notifikasi, Profil & Settings](#26-notifikasi-profil--settings)
3. [Untuk Vendor (Pendaftaran Mandiri)](#3-untuk-vendor-pendaftaran-mandiri)
4. [Status Kepatuhan Dijelaskan](#4-status-kepatuhan-dijelaskan)
5. [Pertanyaan Umum](#5-pertanyaan-umum)

---

## 1. Login

Halaman login punya dua tab:

| Tab | Untuk siapa | Cara masuk |
|---|---|---|
| **Staff Login** | Tim internal | Email + password (akun dibuat lewat Supabase Auth) |
| **Vendor Login** | Vendor eksternal | Kode akses 6 digit yang diberikan staff |

Vendor yang memasukkan kode akses valid akan diarahkan langsung ke [form pendaftaran mandiri](#3-untuk-vendor-pendaftaran-mandiri) — bukan ke dashboard staff.

---

## 2. Untuk Staff

Setelah login, staff akan melihat sidebar dengan 5 menu: **Dashboard, Vendors, Prospective Vendors, Compliance, Request Form**, plus ikon **notifikasi**, **settings**, dan **profil** di pojok kanan atas (TopNav).

### 2.1 Dashboard

Ringkasan performa vendor secara keseluruhan:

- **KPI cards**: Total Vendors, Vendor Readiness (persentase kelengkapan NPWP), Top Category.
- **Grafik**: distribusi vendor per kategori (pie chart) dan tingkat kelengkapan dokumen administratif — NPWP, Akta, NIB, PKP (bar chart).
- **Tabel vendor** dengan kolom pencarian cepat (nama/kategori/status) dan aksi cepat: lihat (👁), edit (✏), hapus (🗑) langsung dari baris tabel.

Klik ikon mata/pensil pada sebuah baris untuk membuka modal detail vendor dalam mode lihat atau edit.

### 2.2 Vendors (Direktori Vendor)

Menu utama untuk mengelola data vendor terdaftar.

**Menambah vendor baru**
1. Klik **Add New Vendor** di pojok kanan atas.
2. Isi form dalam 6 bagian: Informasi Dasar, Dokumen Administrasi, Rekening Bank, Informasi Pajak, Alamat, Remarks.
3. Untuk setiap jenis dokumen (NIB, Akta Pendirian, Akta Pengesahan, NPWP, PKP/Non PKP, Sertifikat, dll), klik **Upload** untuk mengunggah file PDF. File yang sudah diunggah bisa dibuka lewat tombol **Lihat**, atau dihapus lewat **Hapus**.
4. Klik **Tambah Vendor** untuk menyimpan. Status kepatuhan dihitung otomatis (lihat [bagian 4](#4-status-kepatuhan-dijelaskan)) — tidak perlu diisi manual.

**Mencari, memfilter, dan melihat data**
- Kotak **Filter vendors...** mencari berdasarkan nama, kategori, atau ID vendor.
- Dropdown **All Categories** dan **All Status** menyaring hasil lebih lanjut; tombol **Reset** mengembalikan semua filter.
- Tabel menampilkan 10 baris per halaman — gunakan tombol panah di footer untuk pindah halaman.
- Baris dengan garis merah di sisi kiri menandakan vendor **belum lengkap dokumennya**.

**Mengedit atau menghapus vendor**
- Klik ikon **Eye** untuk melihat detail (read-only), **Edit** untuk mengubah data, atau **Trash** untuk menghapus (akan muncul konfirmasi sebelum data dihapus permanen).

**Kartu KPI di bagian atas** menunjukkan Total Vendors, Active (vendor Compliant), Pending Verification (jumlah request yang belum diproses), dan Non-Compliant.

### 2.3 Prospective Vendors

Untuk melacak calon vendor yang belum resmi terdaftar (belum melalui proses dokumen lengkap).

- Klik **Add Prospect** untuk menambahkan calon vendor baru (nama, kontak, kategori, status).
- Status yang tersedia: **New**, **In Discussion**, **Converted**.
- Dari tabel, bisa langsung mengirim email (ikon amplop) atau membuka WhatsApp (ikon chat, jika nomor tersedia) ke kontak vendor.
- Gunakan ikon pensil/tempat sampah untuk mengedit atau menghapus data prospect.

Menu ini terpisah dari direktori Vendors utama — mengubah status prospect di sini **tidak otomatis** memindahkannya ke daftar Vendors; itu perlu ditambahkan manual lewat menu Vendors.

### 2.4 Compliance

Fokus khusus untuk memantau kelengkapan dokumen administrasi seluruh vendor.

- **KPI cards**: jumlah vendor Compliant, Non-Compliant, dan yang kekurangan dokumen PKP/Non-PKP (isu paling umum).
- **Tabel Compliance Records** menampilkan status per-dokumen (NIB, Akta, NPWP, PKP/Non) dengan tanda ✓ (hijau) atau ✗ (merah) untuk tiap vendor, plus status keseluruhan.
- Sama seperti menu Vendors, tersedia pencarian, filter status, dan pagination (10 baris/halaman).
- Klik ikon mata/pensil untuk membuka detail vendor dan melengkapi dokumen yang kurang.

Gunakan menu ini saat ingin audit cepat vendor mana saja yang butuh tindak lanjut dokumen.

### 2.5 Request Form

Tempat staff meninjau pendaftaran mandiri dari vendor dan mengelola kode akses. Ada 2 tab:

**Tab "Permintaan"**
- Menampilkan semua request pendaftaran vendor, dengan filter status: Pending, Rejected, Approved, atau Semua.
- Klik ikon mata untuk melihat detail lengkap request sebelum memutuskan.
- **Accept (✓)**: memindahkan data request menjadi vendor resmi di menu Vendors.
- **Reject (⊘)**: menolak request (hanya tersedia untuk status Pending); request tetap tersimpan dengan status Rejected dan bisa di-Accept kemudian jika berubah pikiran.
- **Hapus (🗑)**: menghapus permanen request yang sudah Approved/Rejected beserta dokumen yang terunggah — tindakan ini tidak bisa dibatalkan.
- Tombol **Bersihkan File Belum Submit** memindai dan menghapus file dokumen yang sempat diunggah vendor tapi request-nya tidak pernah benar-benar disubmit (mencegah storage penuh oleh file "yatim").

**Tab "Access Key"**
- Klik **Generate Kode Baru** untuk membuat kode akses 6 digit baru yang dibagikan ke calon vendor (lewat WA/email di luar sistem).
- Kode punya masa berlaku (**Berlaku Hingga**) — kode yang kedaluwarsa ditandai merah.
- Toggle switch mengaktifkan/menonaktifkan kode tanpa menghapusnya.
- Ikon tempat sampah menghapus kode permanen.
- Vendor yang salah memasukkan kode berulang kali akan terkunci sementara (15 menit) — ini bagian dari proteksi bawaan sistem, bukan bug.

### 2.6 Notifikasi, Profil & Settings

- **Ikon lonceng** (notifikasi) di TopNav menampilkan dropdown pemberitahuan terkait aktivitas vendor/request.
- **Ikon gear** (Settings) membuka halaman Settings: menampilkan email akun yang sedang login, tombol **Sign Out**, dan pintasan ke Request Form untuk mengelola access key.
- **Avatar bulat** (inisial huruf pertama email) di ujung kanan membuka dropdown profil singkat dengan opsi Sign Out.

---

## 3. Untuk Vendor (Pendaftaran Mandiri)

Alur ini digunakan oleh calon vendor yang menerima kode akses dari staff:

1. Buka halaman login, pilih tab **Vendor Login**.
2. Masukkan kode akses 6 digit yang diberikan staff, klik **Lanjutkan**.
   - Jika kode salah/tidak aktif/kedaluwarsa, pesan error akan muncul (lihat tabel di bawah).
3. Setelah kode valid, form pendaftaran vendor terbuka. Isi semua data wajib: nama perusahaan, kategori, sub-kategori, kontak (telepon & email), sales person, informasi rekening bank, NPWP, alamat (sesuai NIB & korespondensi).
4. Unggah dokumen yang diperlukan (PDF) satu per satu lewat tombol **Upload** di tiap baris dokumen.
5. Setelah semua field wajib terisi, tombol submit akan aktif. Klik untuk mengirim pendaftaran.
6. Request akan berstatus **Pending** dan menunggu ditinjau staff di menu Request Form.

| Pesan error kode akses | Artinya |
|---|---|
| Kode akses tidak valid | Kode salah/tidak terdaftar |
| Kode akses sudah tidak aktif | Kode dinonaktifkan staff |
| Kode akses sudah kedaluwarsa | Melewati tanggal **Berlaku Hingga** |
| Terlalu banyak percobaan gagal | Coba lagi setelah 15 menit |

---

## 4. Status Kepatuhan Dijelaskan

Status vendor dihitung **otomatis** berdasarkan dokumen yang sudah diunggah — tidak bisa diatur manual:

1. Jika salah satu dari **NIB, Akta Pendirian, Akta Pengesahan, NPWP** belum ada → status **"Missing [nama dokumen]"** (merah).
2. Jika keempat dokumen di atas lengkap tapi **PKP maupun Non PKP** dua-duanya kosong → status **"Missing PKP/Non PKP"** (merah).
3. Jika semua syarat di atas terpenuhi → status **"Compliant"** (hijau).

Dokumen lain (Sertifikat, Dokumen Pendukung, Registration Form RAJA) bersifat pelengkap dan tidak memengaruhi status kepatuhan.

---

## 5. Pertanyaan Umum

**Q: Kenapa data vendor yang baru saya tambahkan tidak langsung terlihat compliant walau semua dokumen sudah saya centang?**
A: Status dihitung dari dokumen yang benar-benar **terunggah** (ada file-nya), bukan sekadar ditandai. Pastikan setiap dokumen wajib punya file yang berhasil diunggah.

**Q: Apakah menghapus vendor/request bisa dibatalkan?**
A: Tidak. Semua aksi hapus (vendor, request, access key, file orphan) bersifat permanen dan akan meminta konfirmasi terlebih dahulu.

**Q: Vendor sudah punya kode akses tapi tidak bisa login, kenapa?**
A: Cek tab Access Key di Request Form — kemungkinan kode sudah nonaktif, kedaluwarsa, atau akun terkunci sementara karena terlalu banyak percobaan salah.

**Q: Apa bedanya menu Prospective Vendors dan Vendors?**
A: Prospective Vendors untuk calon vendor yang masih dalam tahap penjajakan (belum ada dokumen resmi). Vendors adalah direktori vendor resmi dengan data lengkap dan status kepatuhan. Perpindahan dari prospect ke vendor resmi dilakukan manual oleh staff.
