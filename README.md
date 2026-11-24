# Lumen & Co. — Storefront & Admin

React 19 + Vite 7 + Tailwind CSS 4 storefront with a full admin dashboard. Data comes from the Lumen & Co. API (`e-commerce_1_server`).

## Setup

```bash
npm install
npm run dev        # http://localhost:5173
```

`.env.local` needs the Firebase web config (`VITE_apiKey`, `VITE_authDomain`, `VITE_projectId`, `VITE_storageBucket`, `VITE_messagingSenderId`, `VITE_appId`), the Stripe **publishable** key (`VITE_payment_Key`) and the API URL (`VITE_BASE_URL`). For local development `.env.development.local` points `VITE_BASE_URL` at `http://localhost:5000`.

Only public values belong here — everything prefixed `VITE_` is shipped to the browser.

## Features

**Store:** dynamic hero banners, categories mega-menu, live search suggestions, shop with filters (category, brand, price, rating, stock, sale) and URL-synced sorting/pagination, quick view, product gallery with zoom, colour/size options, reviews with verified-buyer badges, wishlist, recently viewed, cart drawer with free-shipping progress, coupon codes, Stripe card or cash-on-delivery checkout, saved addresses, order history with timeline, cancel/refund, pay-later, printable invoice, guest order tracking, newsletter, contact form, dark mode, fully responsive.

**Admin (`/admin`):** sales dashboard (revenue, orders, AOV, customers, charts, top products, category revenue, low stock), products CRUD with image upload and bulk actions, categories, orders with status workflow, tracking numbers, refunds and CSV export, customers (roles, blocking, history), review moderation and replies, coupons, hero banners, inbox, subscribers export, store settings (name, shipping, tax, COD, announcement, contact, social).

## Build

```bash
npm run build      # outputs dist/
firebase deploy    # hosting config in firebase.json
```
