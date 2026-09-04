# Yaperz

> A high-performance, purely frontend mock e-commerce storefront built as a Progressive Web App (PWA) with Next.js.

## Project Status

**EXPERIMENTAL / MOCK-UP**

This repository contains a purely frontend application. It is designed to simulate a modern e-commerce experience but does **not** contain a real backend, database, payment gateway integration, or real authentication system.

## Overview

Yaperz is a simulated e-commerce web application designed to demonstrate a complete user purchasing journey. It showcases modern frontend architecture using the Next.js App Router, CSS Modules for styling, and React Context for state management. The application is configured as a Progressive Web App (PWA), allowing for offline capabilities and native-like installation on mobile devices.

## Features

### Implemented Features
- **Product Catalog**: Browsing products loaded from a static JSON datastore.
- **Product Details**: Dynamic routing for individual product pages (`/products/[slug]`).
- **Shopping Cart**: Fully functional frontend cart using React Context with `localStorage` persistence.
- **Mock Checkout Flow**: Form validation, total calculations (including mock tax and shipping), and mock order generation.
- **Mock Account Dashboard**: Static login state simulation and hardcoded order history.
- **Progressive Web App (PWA)**: Includes Service Worker (`sw.js`), web manifest, and installability prompts.
- **Responsive Layout**: Designed for mobile and desktop screens using standard CSS Modules.
- **Static Pages**: Policies (Privacy, Refund, Terms), FAQ, About Us, Track Order.

### Not Implemented (Known Limitations)
- **Real Backend / API**: There is no API server or backend framework.
- **Database**: All product data is hardcoded in a static JSON file.
- **Authentication**: The account login is a mock UI that accepts any input without validation.
- **Payment Processing**: The checkout completes locally without processing real transactions.
- **Dynamic Inventory**: Inventory counts do not update after a mock purchase.

## Architecture

```text
User
 ↓
Next.js App Router (Frontend)
 ↓
React Context (Cart State) 
 ↓
localStorage (Persistence) & Static JSON (Data)
```

The application relies completely on client-side state and static assets:
1. **Data Layer**: `/src/data/products.json` acts as the read-only database.
2. **State Layer**: `/src/context/CartContext.tsx` manages cart additions, removals, and subtotal calculations, syncing with the browser's `localStorage`.
3. **View Layer**: Next.js React components styled with CSS Modules.

## Tech Stack

### Frontend
- **Framework**: Next.js (16.2.9)
- **Language**: TypeScript
- **Styling**: CSS Modules (`.module.css`)
- **Icons**: `lucide-react`
- **Image Optimization**: `sharp` (Node.js)

### State & Storage
- **State Management**: React Context API
- **Persistence**: Browser `localStorage`
- **Data Source**: Local JSON file

## Repository Structure

```text
yaperz/
├── public/                 # Static assets, PWA manifest, and Service Worker
│   ├── manifest.webmanifest
│   └── sw.js
├── scripts/                # Development utilities
│   ├── generate-pwa-icons.js
│   └── optimize-images.js
├── src/
│   ├── app/                # Next.js App Router pages and layouts
│   ├── components/         # Reusable UI components (Header, Footer, CartDrawer)
│   ├── context/            # React Context providers (CartContext)
│   ├── data/               # Static data (products.json)
│   └── types/              # TypeScript interfaces
├── package.json
└── next.config.ts
```

## Prerequisites

- **Node.js**: v20 or higher (implied by `@types/node` dependency)
- **npm**: Package manager (or yarn/pnpm/bun)

## Local Development

To run this project locally, follow these steps:

1. **Clone the repository** (or navigate to the directory):
   ```bash
   cd yaperz
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Purpose |
| ------- | ------- |
| `npm run dev` | Starts the Next.js development server. |
| `npm run build` | Builds the application for production. |
| `npm run start` | Starts the production server (requires a prior build). |
| `npm run lint` | Runs ESLint to check for code quality issues. |
| `node scripts/generate-pwa-icons.js` | Generates required PWA icon sizes. |
| `node scripts/optimize-images.js` | Optimizes static images using Sharp. |

## Development Workflow

This is a pure frontend project. To modify data, edit `src/data/products.json`. To modify the cart behavior, edit `src/context/CartContext.tsx`. 

Since the project uses CSS Modules, style changes are scoped locally to their respective components (e.g., editing `CartDrawer.module.css` only affects `CartDrawer.tsx`).

## Deployment

This static Next.js application can be easily deployed on Vercel, Netlify, or any static hosting provider.

### Vercel Deployment
1. Connect your repository to Vercel.
2. The framework preset should automatically detect **Next.js**.
3. Deploy.

No environment variables or external database connections are required for production.

## Architectural Trade-offs

### Static JSON vs Database
- **Reason**: To build a rapid prototype and UI mock-up without infrastructure overhead.
- **Trade-off**: Requires manual code updates to change product details, inventory, or prices. 

### LocalStorage Cart vs Server-Side Cart
- **Reason**: Simplifies the frontend architecture and avoids needing an authentication layer to tie carts to user sessions.
- **Trade-off**: Carts do not sync across a user's multiple devices.

## Known Limitations

- **Checkout is a Simulation**: Filling out the checkout form and clicking "Place Order" only clears the local cart and shows a success screen.
- **Account is a Simulation**: The account page allows any email/password combination and hardcodes the user's order history.
- **No API Routes**: Next.js API routes are not utilized; all logic is executed directly inside client components.

## License

*(No explicit license found in repository. Assume proprietary unless otherwise stated.)*
