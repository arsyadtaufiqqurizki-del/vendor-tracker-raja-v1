# Vendor Management System

Vendor Management System is a comprehensive, client-side React application built to streamline the tracking, compliance, and onboarding of vendors. It provides a centralized dashboard to manage both active vendors and prospective vendors, complete with real-time compliance validation.

## Features

- **Dashboard Analytics**: Visualizes vendor distribution by category and tracks administrative compliance rates using interactive `recharts`.
- **Vendor Tracking**: Maintains a detailed registry of vendors with search and filter capabilities.
- **Prospective Vendors**: A dedicated pipeline for tracking potential vendors through stages (New, In Discussion, Converted).
- **Compliance Engine**: Automatically calculates vendor compliance status based on required documentation (NIB, Akta Pendirian, NPWP, PKP, dll).
- **Responsive Layout**: Modern, clean UI built with Tailwind CSS, featuring a responsive sidebar and dynamic modal components.

## Tech Stack

- **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Animations**: [Motion](https://motion.dev/)

## Project Structure

- `src/views/`: Contains the main page components (`Dashboard`, `Vendors`, `ProspectiveVendors`, `Compliance`, `Login`).
- `src/components/`: Reusable UI components such as `Sidebar`, `TopNav`, `VendorModal`, and `ProspectiveVendorModal`.
- `src/contexts/`: React Context providers for global state management (`VendorContext.tsx`).
- `src/types.ts`: Global TypeScript interfaces and types.

## Getting Started

### Prerequisites

Ensure you have Node.js (v18+) installed.

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
