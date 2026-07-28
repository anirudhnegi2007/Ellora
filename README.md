<div align="center">

# 🛍️ Ellora — Next-Gen E-Commerce Platform

  <p align="center">
    A modern, high-performance, full-stack E-Commerce storefront built with Next.js 16 (App Router), React 19, Prisma ORM, MongoDB, Better Auth, and Razorpay.
  </p>

  <p align="center">
    <a href="#-features"><strong>Features</strong></a> •
    <a href="#-tech-stack"><strong>Tech Stack</strong></a> •
    <a href="#-getting-started"><strong>Getting Started</strong></a> •
    <a href="#-environment-variables"><strong>Environment Setup</strong></a> •
    <a href="#-project-structure"><strong>Architecture</strong></a> •
    <a href="#-database-schema"><strong>Database Schema</strong></a>
  </p>

  <div>
    <img src="https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=nextdotjs" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma" alt="Prisma ORM" />
    <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Razorpay-Payment_Gateway-0C2340?style=for-the-badge&logo=razorpay" alt="Razorpay" />
  </div>

</div>

---

## 🌟 Overview

**Ellora** is a feature-packed, production-grade E-Commerce platform designed to offer a seamless shopping experience for customers and robust management capabilities for store owners. It seamlessly integrates database management via **Prisma & MongoDB**, secure authentication with **Better Auth**, real-time payment handling through **Razorpay**, and optional dynamic product synchronization using **Shopify Storefront API**.

---

## ✨ Features

### 🛒 Storefront & Shopping Experience
- **Dynamic Catalog**: Browse products across various categories with real-time stock and pricing display.
- **Product Variants & Details**: Multi-option product variants (size, color, SKU management) with inventory tracking.
- **Interactive Shopping Cart**: Client-side reactive cart state with persistent item management.
- **Ratings & Reviews**: Product rating system with user reviews, comments, and verified buyer tags.

### 🔐 Authentication & User Profiles
- **Flexible Auth**: Powered by **Better Auth** supporting standard email/password authentication as well as **Google OAuth**.
- **Address Book**: Manage multiple shipping addresses with default address designation.
- **Order History & Tracking**: Real-time order tracking with granular status updates (`PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`).

### 💳 Secure Checkout & Payments
- **Multi-Step Checkout**: Frictionless checkout flow with dynamic tax, shipping calculation, and subtotal breakdown.
- **Razorpay Payment Gateway**: Seamless checkout overlay with cryptographic signature verification for secure transaction completion.

### ⚡ Developer & Data Ecosystem
- **Shopify Sync & Seeding**: Built-in CLI scripts to sync dynamic products and collections directly from Shopify Storefront.
- **Automated Testing Suite**: Component and unit testing configured using **Vitest** and **React Testing Library**.
- **Performance Analytics**: Integrated **Vercel Speed Insights** for monitoring web vitals.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Actions, API Routes) |
| **Frontend UI** | [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/) |
| **Database & ORM** | [MongoDB Atlas](https://www.mongodb.com/atlas) with [Prisma ORM 6](https://www.prisma.io/) |
| **Authentication** | [Better Auth](https://www.better-auth.com/) (OAuth & Credentials) |
| **Payments** | [Razorpay SDK](https://razorpay.com/) |
| **State Management** | [TanStack React Query v5](https://tanstack.com/query/latest) & React Context API |
| **Validation & Forms** | [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/) |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) |
| **Testing** | [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/) |

---

## 🚀 Getting Started

Follow these steps to set up and run Ellora on your local development environment.

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.17.0` or higher
- **npm** / **yarn** / **pnpm** / **bun**
- **MongoDB Database**: Local instance or a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/anirudhnegi2007/Ellora.git
   cd Ellora
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory (you can copy `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Fill in your database connection string and API keys (refer to the [Environment Setup](#-environment-variables) section below).

4. **Generate Prisma Client & Sync Database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **(Optional) Seed Database**:
   Populate your MongoDB database with sample categories, products, and variants (or sync from Shopify):
   ```bash
   npx prisma db seed
   ```

6. **Start the Development Server**:
   ```bash
   npm run dev
   ```

7. **Open Application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🔑 Environment Variables

The application relies on several environment variables defined in `.env`:

| Variable Name | Required | Description | Example / Default |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | Yes | MongoDB Atlas or local connection string | `mongodb+srv://user:pass@cluster.mongodb.net/ellora` |
| `BETTER_AUTH_SECRET` | Yes | Secret key used for signing session tokens | `random_32_byte_secret` |
| `BETTER_AUTH_URL` | Yes | Canonical base URL for your application | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth app client ID | `123456789-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth app client secret | `GOCSPX-your_google_secret` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Yes | Public key for Razorpay checkout | `rzp_test_xxxxxx` |
| `RAZORPAY_KEY_SECRET` | Yes | Secret key for Razorpay signature verification | `your_razorpay_secret` |
| `NEXT_PUBLIC_CURRENCY` | No | Currency code for payment transactions | `INR` |
| `SHOPIFY_STORE_DOMAIN` | Optional | Domain for Shopify Storefront API sync | `mock.shop` |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Optional | Shopify Storefront API public token | `your_shopify_token` |
| `SHOPIFY_API_VERSION` | Optional | Shopify API version | `2024-04` |

---

## 📁 Project Structure

```
Ellora/
├── prisma/
│   ├── schema.prisma          # Database schema models (Users, Products, Orders, Reviews, etc.)
│   └── seed.ts                # Database seeder (Shopify API & Mock data generator)
├── public/                    # Static assets & public media files
├── scripts/                   # Utility scripts for DB tests and API checks
│   ├── list-product-ids.ts
│   ├── test-db.ts
│   ├── test-order-create.ts
│   └── test-razorpay-api.ts
├── src/
│   ├── app/                   # Next.js 16 App Router
│   │   ├── api/               # Server API endpoints (auth, cart, orders, products, razorpay, reviews)
│   │   ├── cart/              # Cart view & management page
│   │   ├── checkout/          # Multi-step checkout & payment processing
│   │   ├── login/ & register/ # Auth pages
│   │   ├── orders/            # Order history & details page
│   │   ├── products/          # Catalog & product detail pages
│   │   ├── globals.css        # Global Tailwind CSS v4 setup
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── page.tsx           # Homepage banner & featured products
│   ├── components/            # UI components (Navbar, Footer, ProductCards, Modals, Forms)
│   ├── context/               # React Context providers (Cart Context, Theme Provider)
│   ├── features/              # Feature-based business logic & UI slices
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries (Prisma client instance, Better Auth setup)
│   ├── services/              # Third-party service integrations (Razorpay, Shopify API)
│   ├── types/                 # TypeScript type definitions
│   └── validations/           # Zod schema definitions for form & API validation
├── eslint.config.mjs          # ESLint configuration
├── next.config.ts             # Next.js configuration
├── postcss.config.mjs         # PostCSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies & build scripts
```

---

## 🗄️ Database Schema

Below is a summary of the core models managed via Prisma ORM:

```mermaid
erDiagram
    User ||--o{ Session : "has"
    User ||--o{ Account : "links"
    User ||--o{ Order : "places"
    User ||--o{ Review : "writes"
    User ||--o{ Address : "saves"
    
    Category ||--o{ Product : "contains"
    Product ||--o{ ProductVariant : "has"
    Product ||--o{ Review : "receives"
    Product ||--o{ OrderItem : "included in"
    
    Order ||--|{ OrderItem : "consists of"
```

- **User / Session / Account / Verification**: Authentication models managed by `better-auth`.
- **Category & Product & ProductVariant**: Product hierarchy, pricing, inventory stock, and image galleries.
- **Order & OrderItem**: Order tracking, item snapshots, shipping info, order state, and Razorpay transaction IDs.
- **Review**: Star ratings (1-5) and user review feedback per product.
- **Address**: User shipping address book entries with default flag selection.

---

## 🧪 Scripts & Testing

### Running Tests
Execute unit and component tests via **Vitest**:
```bash
npm run test
# or with UI runner
npx vitest --ui
```

### Other Useful Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs the Next.js development server at `localhost:3000` |
| `npm run build` | Builds the optimized production bundle |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint to check for code quality and syntax issues |
| `npx prisma generate` | Regenerates Prisma Client types based on `schema.prisma` |
| `npx prisma db push` | Syncs schema changes directly to MongoDB Atlas |
| `npx prisma db seed` | Executes the database seeding script |

---

## 🤝 Contributing

Contributions are always welcome!
1. Fork the project repository.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git checkout -b feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
