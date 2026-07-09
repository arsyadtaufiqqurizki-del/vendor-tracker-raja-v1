# Procurement RAJA (Vendor Management System)

Procurement RAJA is a React application for tracking vendors, prospective vendors, and their compliance status against Indonesian business documentation requirements (NIB, Akta Pendirian, Akta Pengesahan, NPWP, PKP, dll). It is backed by Supabase for authentication, data persistence, and document storage.

## Features

- **Dashboard Analytics**: Visualizes vendor distribution by category and tracks administrative compliance rates using interactive `recharts`.
- **Vendor Tracking**: Maintains a detailed registry of vendors with search and filter capabilities, including bank account and NPWP details.
- **Prospective Vendors**: A dedicated pipeline for tracking potential vendors through stages (New, In Discussion, Converted).
- **Compliance Engine**: Automatically calculates vendor compliance status based on required documentation.
- **Vendor Self-Registration**: Prospective vendors can submit their own onboarding request (with an access key) through a public request form; staff review, approve, or reject submissions from a dedicated review queue, and approved requests are converted into vendor records.
- **Document Storage**: Vendor documents are uploaded to Supabase Storage rather than tracked as simple yes/no flags.
- **Authentication**: Real Supabase Auth login for staff, plus a separate access-key flow for vendors submitting requests.
- **Responsive Layout**: Modern, clean UI built with Tailwind CSS, featuring a responsive sidebar and dynamic modal components.

## Tech Stack

- **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend**: [Supabase](https://supabase.com/) (Auth, Postgres, Storage)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Animations**: [Motion](https://motion.dev/)

## Project Structure

- `src/views/`: Main page components (`Dashboard`, `Vendors`, `ProspectiveVendors`, `Compliance`, `RequestForm`, `Login`).
- `src/components/`: Reusable UI components such as `Sidebar`, `TopNav`, `VendorModal`, `ProspectiveVendorModal`, and `VendorRequestForm`/`VendorRequestDetailModal` for the self-registration review flow.
- `src/contexts/`: React Context providers for global state management (`VendorContext.tsx`), including vendor requests and access keys.
- `src/lib/`: Supabase client (`supabase.ts`) and data-access helpers for document uploads, vendor requests, and access keys.
- `src/types.ts`: Global TypeScript interfaces and types.

## Getting Started

### Prerequisites

- Node.js (v18+)
- A Supabase project (for Auth, database tables, and Storage bucket)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase project's URL and anon key (Supabase dashboard → Settings → API):

```bash
VITE_SUPABASE_URL="https://xxxxxxxxxxxx.supabase.co"
VITE_SUPABASE_ANON_KEY="MY_SUPABASE_ANON_KEY"
```

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open the provided local URL in your browser.

### Build for Production

To create a production-ready build:

```bash
npm run build
```

The output will be generated in the `dist` directory.

### Other Commands

- `npm run preview` — preview a production build locally
- `npm run lint` — type-check the project (`tsc --noEmit`); there is no separate linter configured
- `npm run clean` — remove `dist/` and `server.js`
