# Cloudflare Pages Deployment Plan (migrasi dari Vercel)

Rencana implementasi migrasi frontend **Vendor Tracker** dari Vercel ke
Cloudflare Pages. Backend/data tetap 100% di Supabase — yang pindah cuma
hosting static build-nya.

**Legenda status**: ✅ Selesai · ⬜ Belum dikerjakan · ⏳ Sedang berjalan

---

## Fase 0 — Audit codebase ✅ Selesai

- [x] Cek `package.json` — build tool Vite 6, tidak ada framework SSR
      adapter, `express`/`dotenv` ada di deps tapi tidak dipakai di `src/`.
- [x] Cek `vite.config.ts` — tidak ada override `build.outDir`, jadi output
      build default Vite adalah `dist/`.
- [x] Cek `src/lib/supabase.ts` — koneksi Supabase pakai
      `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, yaitu
      **env var build-time Vite**, bukan env var runtime server.
- [x] Konfirmasi tidak ada router URL (`App.tsx` pakai state `currentView`),
      jadi tidak perlu rule `_redirects` untuk SPA fallback.
- [x] Konfirmasi tidak ada Cloudflare Pages Functions yang dibutuhkan — app
      murni static SPA, tidak ada binding (KV/D1/dll) yang perlu didaftarkan.

## Fase 1 — Config infra file ✅ Selesai

- [x] Buat `wrangler.toml` di root repo — `pages_build_output_dir = "dist"`,
      `name = "vendor-tracker"`, tanpa binding apa pun.
- [x] Tambah script `pages:dev` dan `pages:deploy` di `package.json`.
- [x] Tambah `wrangler` ke `devDependencies` (`^4.107.1`).
- [x] Script `build` (`vite build`) tidak diubah — outputnya sudah `dist`,
      sudah sesuai.
- [x] **Tidak menyentuh apa pun di `src/`** — login karyawan
      (`src/views/Login.tsx`) dan alur access-key vendor tetap persis sama.

## Fase 2 — Setup akun & project Cloudflare ✅ Selesai

- [x] `npm install` — install `wrangler` yang baru ditambahkan ke
      `devDependencies`.
- [x] `npx wrangler login` — autentikasi CLI ke akun Cloudflare.
- [x] Buat Pages project: `vendor-tracker` sudah dibuat, production branch
      `main`. URL sementara (belum ada deployment): `https://vendor-tracker-7c7.pages.dev/`.

## Fase 3 — Environment variables ✅ Selesai (Opsi A)

Titik paling rawan gagal — **`VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`
adalah nilai build-time, bukan secret runtime.** Vite nge-inline nilainya ke
JS bundle saat `vite build` jalan; tidak ada server di Cloudflare Pages yang
membacanya belakangan. Konsekuensinya: **jangan** pakai
`wrangler pages secret put` untuk dua var ini — itu cuma kebaca oleh Pages
Functions saat request, bukan saat build SPA statis.

- [x] Putuskan jalur deploy: **Opsi A (CLI direct upload)** — dipakai
      `pages:deploy`, baca `.env.local` lokal secara otomatis saat
      `vite build`.
- [x] Konfirmasi `.env.local` berisi `VITE_SUPABASE_URL` (40 char, format
      `https://...`) dan `VITE_SUPABASE_ANON_KEY` (46 char, format
      `sb_publishable_...`) — keduanya ada dan tidak kosong.
- [ ] *(N/A untuk sekarang — Opsi B)* input manual dua var itu di dashboard
      Cloudflare, hanya relevan kalau nanti pindah ke Git integration.
- [ ] *(N/A untuk sekarang — CI)* set dua var itu sebagai CI secret/env,
      hanya relevan kalau nanti deploy lewat GitHub Actions dll.

## Fase 4 — First deploy & verifikasi ⏳ Sedang berjalan (2 item butuh manual)

- [x] Jalankan deploy (build + upload ke Cloudflare). Catatan: script npm
      `pages:deploy`/`pages:dev` awalnya gagal exit 127 (`wrangler` tidak
      ketemu di PATH lewat `npm run` di shell ini) — sudah diperbaiki dengan
      prefix `npx` di kedua script. Deploy pertama dijalankan langsung via
      `npx wrangler pages deploy dist --project-name=vendor-tracker`.
- [x] Buka URL `*.pages.dev` yang dihasilkan:
      **https://03272922.vendor-tracker-7c7.pages.dev** — dicek via `curl`,
      responnya `HTTP 200`.
- [x] Checklist fungsional — dites otomatis pakai Playwright
      (`chromium.launch()` headless) terhadap URL live:
  - [x] Halaman login karyawan render dengan benar (judul "vendor tracker
        v1", form Staff Login: Email Address/Password/Sign In). Tidak ada
        console error maupun failed request.
  - [ ] Login karyawan sukses — **belum dites**, butuh kredensial staff
        asli yang tidak aku punya. Perlu dicoba manual.
  - [x] Alur self-registration vendor / access-key ke-load — tab "Vendor
        Login" diklik, form "Kode Akses" render dengan benar.
  - [ ] Upload dokumen vendor ke Supabase Storage — **belum dites**, butuh
        kode akses vendor yang valid untuk masuk ke step upload. Perlu
        dicoba manual dengan access key asli.
  - [x] Konektivitas Supabase terbukti jalan: saat halaman dimuat, 3
        request REST ke `ulyttibwwbeqfpzodxyn.supabase.co` (`vendors`,
        `prospective_vendors`, `vendor_requests`) semuanya balas `200 OK`
        — jadi env var build-time (`VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`)
        sudah benar dan RLS mengizinkan read yang seharusnya publik.
  - Screenshot disimpan di scratchpad session ini untuk referensi visual
    (tidak dicommit ke repo).

## Fase 5 — Auto-deploy via GitHub Actions ⏳ Sedang berjalan (butuh setup manual di GitHub)

`vendor-tracker` dibuat sebagai project **Direct Upload**
(`wrangler pages project create`), dan menurut dokumentasi Cloudflare,
**project tipe ini tidak bisa dikonversi ke Git integration** — begitu
Direct Upload, selamanya Direct Upload (kecuali bikin project baru lewat
dashboard "Connect to Git", yang berarti URL `*.pages.dev` beda dan
project lama jadi harus dihapus manual). Karena itu, deploy otomatis
diimplementasikan lewat **GitHub Actions yang menjalankan `wrangler pages
deploy`** tiap push ke `main` — project & URL Cloudflare yang sekarang
tetap dipakai, cuma build-nya pindah dari laptop ke runner GitHub.

- [x] Buat workflow `.github/workflows/deploy-cloudflare-pages.yml`:
      trigger `push` ke `main` → `npm ci` → `npm run build` (dengan env
      `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` dari GitHub Secrets,
      karena build sekarang jalan di runner GitHub, bukan lokal/`.env.local`)
      → `cloudflare/wrangler-action@v3` menjalankan
      `pages deploy dist --project-name=vendor-tracker`.
- [x] Ambil Cloudflare Account ID lewat `npx wrangler whoami`:
      `c98dbd3aae562daa762548ec55d19977` (bukan rahasia, tapi tetap
      disimpan sebagai secret di bawah demi konsistensi).
- [ ] **Belum bisa dikerjakan otomatis oleh Claude** — `gh` CLI di mesin ini
      belum login (`gh auth status` gagal), jadi 4 GitHub Actions secret di
      bawah harus di-set manual oleh kamu. Buka repo di GitHub →
      **Settings → Secrets and variables → Actions → New repository
      secret**, buat 4 secret ini:

  | Secret name | Value | Cara dapetinnya |
  |---|---|---|
  | `CLOUDFLARE_API_TOKEN` | token baru | **Jangan** pakai OAuth token dari `wrangler login` (itu punya scope kebanyakan & bukan buat CI). Buat token khusus: [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) → Create Token → cari template **"Edit Cloudflare Workers"** atau custom permission **Account → Cloudflare Pages → Edit** → scope ke account kamu saja. |
  | `CLOUDFLARE_ACCOUNT_ID` | `c98dbd3aae562daa762548ec55d19977` | Sudah didapat dari `wrangler whoami` di atas. |
  | `VITE_SUPABASE_URL` | isi dari `.env.local` | Sama persis dengan yang dipakai deploy manual lokal. |
  | `VITE_SUPABASE_ANON_KEY` | isi dari `.env.local` | Sama persis dengan yang dipakai deploy manual lokal. |

- [ ] Setelah 4 secret di atas ke-set, push apa pun ke `main` (atau
      **Actions → Deploy to Cloudflare Pages → Run workflow** buat trigger
      manual pertama kali) buat mastiin workflow-nya jalan sukses.
- [ ] Cek tab **Actions** di GitHub — job hijau berarti deploy otomatis
      sudah aktif. Kalau merah, kemungkinan besar salah satu dari 4 secret
      di atas salah/kosong.

> Kalau nanti mau ganti ke Git integration native Cloudflare (bukan lewat
> GitHub Actions), itu berarti bikin project baru — bilang aja, aku bisa
> bantu bandingin trade-off-nya lebih detail dulu.

## Fase 6 — Custom domain cutover ⬜ Belum dikerjakan (opsional/kondisional)

- [ ] `npx wrangler pages domain add vendor-tracker <domain>` (atau lewat
      dashboard: project → Custom domains).
- [ ] Ikuti instruksi DNS dari Cloudflare (CNAME, atau otomatis kalau domain
      sudah pakai nameserver Cloudflare).
- [ ] **Jangan cutover DNS produksi** sebelum checklist Fase 4 lolos semua di
      URL `*.pages.dev`.
- [ ] Setelah cutover, biarkan deployment Vercel tetap hidup beberapa hari
      sebagai fallback sebelum benar-benar didekomisioning.

## Fase 7 — Rollback plan (dokumentasi, belum pernah diuji)

- [ ] Rollback di Cloudflare: dashboard → project → Deployments → pilih
      deployment sebelumnya → "Rollback to this deployment".
- [ ] Rollback darurat ke Vercel: arahkan kembali DNS/domain ke deployment
      Vercel yang masih hidup (baru bisa dilakukan kalau Vercel belum
      didekomisioning di Fase 5).

---

## Di luar scope migrasi ini

- Tidak ada perubahan di `src/` — logic compliance, `VendorContext.tsx`,
  semua views/components, dan `src/lib/supabase.ts` tetap sama persis.
- Tidak menambahkan Pages Functions/binding apa pun — kalau nanti butuh
  server-side logic (misal API route custom), itu perencanaan terpisah.
