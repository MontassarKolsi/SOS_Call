# SOS-Call functional demo

This keeps the existing NestJS + Prisma + PostgreSQL backend, React dashboard and React widget. A tiny static demo shop was added in `demo-shop/`.

## Flow
1. Shop (port 5175) → Buy now opens the widget in an iframe (port 5174).
2. Widget requests a quote from `POST /api/v1/donations/quote` and creates a `PENDING` donation with `POST /api/v1/donations` only after the visitor accepts.
3. Widget sends the new donation ID to the shop using `postMessage`. The shop navigates to its second page, a simulated PSP.
4. Confirm/deny calls `POST /api/v1/donations/:id/payment-result`. Only `CONFIRMED` donations are counted in the dashboard.

## Run locally (Windows PowerShell)
Prerequisites: Node.js 20.19+ (or compatible with Vite 8), npm and Docker Desktop.

### 1. Database
From the repository root: `docker compose up -d`. PostgreSQL is exposed on port 5433.

### 2. Backend
```powershell
cd sos-call-service/backend
npm install
Copy-Item .env.example .env
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run start:dev
```
API: `http://localhost:3001/api/v1`; Swagger: `http://localhost:3001/docs`.

### 3. Widget
In another terminal:
```powershell
cd sos-call-widget
npm install
# optional: copy .env.example to .env.local
npm run dev
```

### 4. Dashboard
In another terminal:
```powershell
cd sos-call-service/dashboard
npm install
npm run dev
```

### 5. Demo shop
In another terminal:
```powershell
cd demo-shop
npm install
npm run dev
```
Open `http://localhost:5175` and `http://localhost:5173`.

## Try both outcomes
- Click **Buy now**. Choose **No thanks, continue without donating** to return to the shop without creating a donation, or choose a contribution and click **Yes, I want to contribute**.
- On the simulated PSP page, click **Confirm payment**. The donation appears in the dashboard after its next refresh (within 3 seconds).
- Repeat and click **Deny payment**. It is marked `FAILED` and excluded from totals and the confirmed donations table.

## Integration contract
A merchant needs to display the widget at checkout and provide the order amount + merchant slug. After the widget emits `SOS_DONATION_SELECTED`, the merchant carries the donation ID alongside its own payment flow. Its normal server-side payment confirmation should then be sent to the SOS backend as a verified PSP webhook in a production integration. No separate SOS-specific merchant API is needed if the PSP can notify SOS directly and the merchant/PSP can include the donation ID as metadata.

**Important:** `/payment-result` is intentionally public and simulated for this presentation only. Do not deploy this demo endpoint as a real payment confirmation mechanism. In production, replace it with a signed, authenticated PSP webhook, validate the payment reference and amount, and make the webhook idempotent. A browser redirect or client-side button is not proof of payment.

## Money representation
API/database amounts are integer millimes; the UI displays TND. Suggested amount is 2.5% for orders above 7 TND. It rounds upward to the next 5 TND when the extra amount is below 2.5 TND; otherwise it rounds upward to the next 1 TND (for example, 9.2 TND becomes 10 TND). The demo merchant is seeded as `demo-shop`.
