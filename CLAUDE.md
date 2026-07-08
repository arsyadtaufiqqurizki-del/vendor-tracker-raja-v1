# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Vendor Management System ("Procurement RAJA") — a client-side React app for tracking vendors, prospective vendors, and their compliance status (Indonesian business documents: NIB, Akta Pendirian, Akta Pengesahan, NPWP, PKP, etc).

## Commands

- `npm run dev` — start dev server (Vite, port 3000, `--host=0.0.0.0`)
- `npm run build` — production build to `dist/`
- `npm run preview` — preview a production build
- `npm run lint` — type-check only (`tsc --noEmit`); there is no separate linter (no ESLint config)
- `npm run clean` — removes `dist/` and `server.js`

There is no test runner configured in this repo.

## Architecture

- **Entry**: `src/main.tsx` → `src/App.tsx`. `App` wraps everything in `VendorProvider` and gates the whole UI behind `Login` (auth is a fake `setTimeout`-based stub in `src/views/Login.tsx` — no real backend auth).
- **State**: All vendor/prospective-vendor data lives in React state inside `src/contexts/VendorContext.tsx` (`VendorProvider`), consumed via the `useVendors()` hook. There is **no persistence layer** — state resets on reload, and both `initialVendors`/`initialProspectiveVendors` start empty.
- **Compliance logic**: `calculateCompliance(docs)` in `VendorContext.tsx` is the single source of truth for a vendor's compliance status/color. It's invoked automatically inside `addVendor`/`updateVendor`, so callers never set `status`/`statusColor`/`dotColor`/`color`/`error` by hand.
- **Views** (`src/views/`) are routed by a `currentView` string state in `App.tsx` (no router library) — `Dashboard`, `Vendors`, `ProspectiveVendors`, `Compliance`, `Login`. Adding a view means extending `ViewType` in `src/types.ts`, the `switch` in `App.tsx`, and a nav entry in `src/components/Sidebar.tsx`.
- **Modals**: `VendorModal`/`ProspectiveVendorModal` and the inline detail modal in `Vendors.tsx` follow a shared `viewMode: 'view' | 'edit' | 'add'` pattern — the same form renders read-only or editable based on this mode rather than having separate components.
- **Types**: All shared interfaces (`Vendor`, `ProspectiveVendor`, `ViewType`, `ProspectiveStatus`) live in `src/types.ts`.
- `@/*` path alias resolves to the repo root (see `tsconfig.json` / `vite.config.ts`), not to `src/`.

## Styling

- Tailwind CSS v4 with a custom Material Design 3–style token system defined in `src/index.css` via `@theme` (colors like `--color-surface-container-lowest`, `--color-on-surface-variant`; custom spacing scale `xs/sm/md/lg/xl`; custom text styles `display-lg`, `headline-md`, `body-sm`, `data-lg`, `label-caps`, etc). Use these semantic tokens (e.g. `bg-surface-container-lowest`, `text-on-surface-variant`, `p-md`, `font-body-sm text-body-sm`) instead of raw Tailwind colors/spacing to stay consistent with the rest of the UI.
- Use the `cn()` helper from `src/lib/utils.ts` (clsx + tailwind-merge) for conditional/merged class names.
- Icons: `lucide-react`. Animation: `motion/react` (Motion).

## Notes

- `@google/genai`, `express`, and `dotenv` are present in `package.json` (AI Studio scaffolding / `.env.example` references `GEMINI_API_KEY`), but nothing in `src/` currently imports or calls them — treat the app as purely client-side unless you're intentionally wiring up a backend/AI feature.
- Copy is a mix of English and Indonesian (e.g. modal labels like "Tambah Vendor Baru", "Simpan Perubahan") — match the existing language per section rather than translating wholesale.
