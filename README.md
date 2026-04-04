# Friends Clothing POS

A simple clothing-store POS starter built with Next.js, Fastify, Prisma, and PostgreSQL.

## What is included

- Fast barcode-first POS flow
- Fully editable cart pricing, discount, and tax
- Inventory management with inline editing
- Fastify API with bill checkout and stock reduction
- Prisma schema for products, bills, and bill items
- Camera scanner component prepared for `html5-qrcode`

## Project structure

- `apps/web`: Next.js frontend
- `apps/api`: Fastify backend and Prisma schema

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Generate Prisma client:

```bash
npm run db:generate
```

4. Run database migrations:

```bash
npm run db:migrate
```

5. Start the API and web app in separate terminals:

```bash
npm run dev:api
npm run dev:web
```

## Deployment

### Railway

- Deploy `apps/api` as the service root directory
- Add a Railway PostgreSQL database
- Set `DATABASE_URL` from that database
- Build command:

```bash
npm install && npx prisma generate && npm run build
```

- Pre-deploy command:

```bash
npm run db:migrate:deploy
```

- Start command:

```bash
npm run start
```

### Vercel

- Deploy `apps/web` as the project root directory
- Set `NEXT_PUBLIC_API_URL` to the Railway API URL
- Redeploy after changing environment variables

## Main flows

- Scan or type a barcode
- Auto-add matched product to cart
- If not found, open a quick create-product modal
- Edit quantity, price, discount, and tax directly inside the cart
- Checkout once, then persist the bill and reduce stock

## Notes

- Variants are intentionally skipped in the first version to keep the system lean.
- The cart stays in the frontend with Zustand for responsiveness.
- Pricing rules are not hardcoded; values come from product data and cart edits.
