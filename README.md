# YAPERZ<span style="color: #E65C00">.</span>

> A premium, highly-editorial streetwear e-commerce storefront. Designed with a luxury minimalist aesthetic and inspired by high-end brands like **BLUORNG** and **Peregrine Clothing**.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61dafb?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![CSS Modules](https://img.shields.io/badge/CSS--Modules-Vanilla-df6397?style=flat&logo=css3)](https://github.com/css-modules/css-modules)

---

## 🌟 Visual & Interaction Highlights

### 1. Peregrine-Style Desktop Navigation & Mega Menus
- **Desktop-First Layout**: Left-aligned logo, horizontally centered categories, and right-aligned actions with a country currency selector (`INTL/USD`).
- **Rich Hover Dropdowns**:
  - **Men, Women & Accessories**: Features double-column text lists, a custom rust-brown call-to-action button, and three vertical image cards with dark overlays, white bold text, and zoom effects.
  - **About Us**: A 6-column grid of square story cards detailing the brand’s mills, factory, suppliers, and care guides.
- **Mobile Responsive State**: Collapses into a left-aligned hamburger toggle opening a drawer nav, a centered logo, and right action buttons.

### 2. Location & Currency Selector Modal
- Interactive warm-cream (`#FAF8F5`) modal displaying location options.
- circular SVG flags for the **United Kingdom**, **Europe**, **United States**, **Canada**, **India** (with saffron, white, and green stripes and Ashoka Chakra), and a blue wireframe Globe for the **Rest of the world**.
- Choice is synchronized instantly in the header and persisted to `localStorage`.

### 3. Dynamic Catalog Filtering & PDP Zoom
- **Grid Filters**: Live URL query parameter filtering (Price range slider, Size buttons, Color swatches, Stock status).
- **Product Detail Page (PDP)**: Split screen vertical thumbnail strip (desktop) and swipe carousel (mobile) with mouse-tracking hover zoom, care accordions, and related collections.

### 4. Interactive E-Commerce Mechanics
- **Instagram-Style Stories**: Circular thumbnail story bar at the top of the homepage that opens full-screen visual modal transitions on tap.
- **Persistent Cart Drawer**: Slide-out cart with line items, quantity adjustments, and automated tax/total calculations.
- **Checkout Simulator**: Step-by-step guest checkout capturing address, shipping speeds, and simulating payment logs.

---

## 🎨 Design System & Color Tokens

Authoring styles in pure **Vanilla CSS** with CSS Modules to enforce editorial control:

| Token Name | Hex Value | Purpose |
| :--- | :--- | :--- |
| `--color-background` | `#FFFFFF` | Page canvas background |
| `--color-surface` | `#F5F5F5` | Secondary soft gray for cards, drawers |
| `--color-text-primary` | `#111111` | High-contrast rich text |
| `--color-text-muted` | `#666666` | Secondary body text |
| `--color-accent` | `#E65C00` | Bold brand orange highlights |
| `--color-border` | `#E5E5E5` | Minimal separators |

---

## 📂 Project Architecture

```bash
yaperz/
├── public/
│   ├── next.svg
│   └── images/
│       ├── hero-desktop.png
│       ├── menu/              # Mega Menu Card images
│       └── products/          # Streetwear item photos
├── src/
│   ├── app/                   # Next.js App Router (16.x)
│   │   ├── about-us/
│   │   ├── account/           # Account portals
│   │   ├── checkout/          # Checkout flows
│   │   ├── collections/       # Catalog & filters
│   │   ├── faq/
│   │   ├── policies/          # Shipping, refund, return terms
│   │   ├── products/          # PDP split grids
│   │   ├── store/             # Physical stores finders
│   │   ├── track-order/
│   │   ├── error.tsx          # Custom 500
│   │   ├── not-found.tsx      # Custom 404
│   │   └── globals.css        # Design tokens & resets
│   ├── components/            # Shared UI components
│   │   ├── CartDrawer.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx         # Responsive navbar & mega menus
│   │   ├── LayoutShell.tsx
│   │   ├── LocationModal.tsx  # SVG circular flags modal
│   │   ├── ProductCard.tsx
│   │   ├── SearchOverlay.tsx
│   │   └── StoriesBar.tsx
│   ├── context/               # Global Cart State
│   ├── data/                  # Static database products.json
│   └── types/                 # TypeScript interfaces
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
Ensure you have Node.js installed, then run:
```bash
git clone https://github.com/JayantOlhyan/Yaperz.git
cd yaperz
npm install
```

### 2. Start the Development Server
```bash
npm run dev -- -p 3002
```
Now, open your browser and navigate to **[http://localhost:3002](http://localhost:3002)**.

### 3. Build for Production
To build and verify the optimized Next.js static pages:
```bash
npm run build
npm run start
```
