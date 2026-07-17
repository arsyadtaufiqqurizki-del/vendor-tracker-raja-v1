import { ReactNode } from 'react';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
      <div className="p-lg border-b border-outline-variant bg-surface-bright">
        <h3 className="font-headline-md text-headline-md text-primary">{title}</h3>
      </div>
      <div className="p-lg flex flex-col gap-md font-body-md text-body-md text-on-surface">
        {children}
      </div>
    </div>
  );
}

function SubHeading({ children }: { children: ReactNode }) {
  return <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mt-xs">{children}</h4>;
}

function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc list-inside flex flex-col gap-xs text-on-surface-variant">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function InfoTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto border border-outline-variant rounded-lg">
      <table className="w-full text-left border-collapse min-w-[500px]">
        <thead>
          <tr className="bg-surface-bright border-b border-outline-variant font-label-caps text-label-caps text-on-surface-variant uppercase">
            {head.map((h) => (
              <th key={h} className="p-sm font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="font-body-sm text-body-sm divide-y divide-surface-container-highest">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="p-sm align-top">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function UserGuide() {
  return (
    <div className="flex flex-col gap-lg pb-xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md mb-xs border-b border-outline-variant pb-sm">
        <div>
          <h2 className="font-display-lg text-display-lg text-primary mb-1">Panduan Pengguna</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Cara menggunakan Procurement RAJA untuk Staff dan Vendor.</p>
        </div>
      </div>

      <Section title="1. Login">
        <p>Halaman login punya dua tab:</p>
        <InfoTable
          head={['Tab', 'Untuk siapa', 'Cara masuk']}
          rows={[
            ['Staff Login', 'Tim internal', 'Email + password (akun Supabase Auth)'],
            ['Vendor Login', 'Vendor eksternal', 'Kode akses 6 digit dari staff'],
          ]}
        />
        <p>Vendor yang memasukkan kode akses valid diarahkan langsung ke form pendaftaran mandiri — bukan ke dashboard staff.</p>
      </Section>

      <Section title="2. Untuk Staff">
        <p>Setelah login, staff melihat sidebar dengan 5 menu: <strong>Dashboard, Vendors, Prospective Vendors, Compliance, Request Form</strong>, plus ikon notifikasi, settings, dan profil di TopNav.</p>

        <SubHeading>2.1 Dashboard</SubHeading>
        <p>Ringkasan performa vendor: KPI (Total Vendors, Vendor Readiness, Top Category), grafik distribusi kategori dan kelengkapan dokumen (NPWP/Akta/NIB/PKP), serta tabel vendor dengan pencarian cepat dan aksi lihat/edit/hapus per baris.</p>

        <SubHeading>2.2 Vendors (Direktori Vendor)</SubHeading>
        <p><strong>Menambah vendor baru:</strong> klik <em>Add New Vendor</em>, isi 6 bagian form (Informasi Dasar, Dokumen Administrasi, Rekening Bank, Informasi Pajak, Alamat, Remarks), unggah dokumen PDF per jenis lewat tombol <em>Upload</em>, lalu klik <em>Tambah Vendor</em>. Status kepatuhan dihitung otomatis — lihat bagian 4.</p>
        <p><strong>Cari &amp; filter:</strong> kotak <em>Filter vendors...</em> mencari nama/kategori/ID; dropdown kategori dan status menyaring lebih lanjut; tombol <em>Reset</em> mengembalikan semua filter. Tabel menampilkan 10 baris per halaman. Baris bergaris merah menandakan vendor belum lengkap dokumennya.</p>
        <p><strong>Edit/hapus:</strong> ikon Eye untuk lihat, Edit untuk ubah, Trash untuk hapus (dengan konfirmasi).</p>

        <SubHeading>2.3 Prospective Vendors</SubHeading>
        <p>Untuk melacak calon vendor yang belum resmi terdaftar. Status: <strong>New</strong>, <strong>In Discussion</strong>, <strong>Converted</strong>. Bisa kirim email atau buka WhatsApp langsung dari tabel. Menu ini terpisah dari direktori Vendors — memindahkan prospect menjadi vendor resmi dilakukan manual lewat menu Vendors.</p>

        <SubHeading>2.4 Compliance</SubHeading>
        <p>Fokus memantau kelengkapan dokumen seluruh vendor: KPI Compliant/Non-Compliant/Missing PKP, dan tabel dengan tanda ✓/✗ per jenis dokumen (NIB, Akta, NPWP, PKP/Non). Tersedia pencarian, filter status, dan pagination. Gunakan menu ini untuk audit cepat vendor mana yang butuh tindak lanjut dokumen.</p>

        <SubHeading>2.5 Request Form</SubHeading>
        <p>Tempat meninjau pendaftaran mandiri vendor dan mengelola kode akses, dalam 2 tab:</p>
        <List
          items={[
            <><strong>Permintaan</strong> — filter Pending/Rejected/Approved/Semua. Accept memindahkan data menjadi vendor resmi; Reject menolak (hanya untuk Pending); Hapus menghapus permanen request Approved/Rejected beserta dokumennya. Tombol "Bersihkan File Belum Submit" memindai dan menghapus file yang terunggah tapi request-nya tidak pernah disubmit.</>,
            <><strong>Access Key</strong> — Generate Kode Baru membuat kode 6 digit untuk dibagikan ke calon vendor. Kode punya masa berlaku (kode kedaluwarsa ditandai merah). Toggle mengaktifkan/menonaktifkan kode; ikon tempat sampah menghapusnya. Vendor yang salah kode berulang kali akan terkunci sementara 15 menit.</>,
          ]}
        />

        <SubHeading>2.6 Notifikasi, Profil &amp; Settings</SubHeading>
        <p>Ikon lonceng menampilkan dropdown notifikasi. Ikon gear membuka halaman Settings (email akun, Sign Out, pintasan ke Request Form untuk access key). Avatar bulat membuka dropdown profil singkat dengan Sign Out.</p>
      </Section>

      <Section title="3. Untuk Vendor (Pendaftaran Mandiri)">
        <p>Alur ini digunakan calon vendor yang menerima kode akses dari staff:</p>
        <List
          items={[
            'Buka halaman login, pilih tab Vendor Login.',
            'Masukkan kode akses 6 digit, klik Lanjutkan.',
            'Isi semua data wajib: nama perusahaan, kategori, sub-kategori, kontak, sales person, rekening bank, NPWP, alamat (sesuai NIB & korespondensi).',
            'Unggah dokumen yang diperlukan (PDF) lewat tombol Upload per baris dokumen.',
            'Setelah semua field wajib terisi, submit pendaftaran. Request berstatus Pending menunggu ditinjau staff di menu Request Form.',
          ]}
        />
        <InfoTable
          head={['Pesan error kode akses', 'Artinya']}
          rows={[
            ['Kode akses tidak valid', 'Kode salah/tidak terdaftar'],
            ['Kode akses sudah tidak aktif', 'Kode dinonaktifkan staff'],
            ['Kode akses sudah kedaluwarsa', 'Melewati tanggal Berlaku Hingga'],
            ['Terlalu banyak percobaan gagal', 'Coba lagi setelah 15 menit'],
          ]}
        />
      </Section>

      <Section title="4. Status Kepatuhan Dijelaskan">
        <p>Status vendor dihitung otomatis berdasarkan dokumen yang sudah diunggah — tidak bisa diatur manual:</p>
        <List
          items={[
            <>Jika salah satu dari <strong>NIB, Akta Pendirian, Akta Pengesahan, NPWP</strong> belum ada → status <strong>"Missing [nama dokumen]"</strong> (merah).</>,
            <>Jika keempat dokumen di atas lengkap tapi <strong>PKP</strong> maupun <strong>Non PKP</strong> dua-duanya kosong → status <strong>"Missing PKP/Non PKP"</strong> (merah).</>,
            <>Jika semua syarat terpenuhi → status <strong>"Compliant"</strong> (hijau).</>,
          ]}
        />
        <p>Dokumen lain (Sertifikat, Dokumen Pendukung, Registration Form RAJA) bersifat pelengkap dan tidak memengaruhi status kepatuhan.</p>
      </Section>

      <Section title="5. Pertanyaan Umum">
        <div>
          <p className="font-semibold text-primary">Kenapa vendor baru tidak langsung compliant walau semua dokumen sudah dicentang?</p>
          <p className="text-on-surface-variant">Status dihitung dari dokumen yang benar-benar terunggah (ada file-nya), bukan sekadar ditandai. Pastikan setiap dokumen wajib punya file yang berhasil diunggah.</p>
        </div>
        <div>
          <p className="font-semibold text-primary">Apakah menghapus vendor/request bisa dibatalkan?</p>
          <p className="text-on-surface-variant">Tidak. Semua aksi hapus (vendor, request, access key, file orphan) bersifat permanen dan meminta konfirmasi terlebih dahulu.</p>
        </div>
        <div>
          <p className="font-semibold text-primary">Vendor sudah punya kode akses tapi tidak bisa login?</p>
          <p className="text-on-surface-variant">Cek tab Access Key di Request Form — kemungkinan kode nonaktif, kedaluwarsa, atau akun terkunci sementara karena terlalu banyak percobaan salah.</p>
        </div>
        <div>
          <p className="font-semibold text-primary">Apa bedanya Prospective Vendors dan Vendors?</p>
          <p className="text-on-surface-variant">Prospective Vendors untuk calon vendor yang masih tahap penjajakan (belum ada dokumen resmi). Vendors adalah direktori resmi dengan data lengkap dan status kepatuhan. Perpindahan dilakukan manual oleh staff.</p>
        </div>
      </Section>
    </div>
  );
}
