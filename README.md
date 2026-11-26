# SOS-Call Functional Demo

This repository contains a complete local demonstration of an optional donation flow:

- a mock e-commerce shop;
- a React donation widget shown during checkout;
- a NestJS/Prisma API;
- PostgreSQL;
- a React administration dashboard.

The demo is provided for testing and presentation only. Its payment-result endpoint is simulated and must not be used as production payment proof.

## Architecture and local URLs

| Component | Location | Local URL |
|---|---|---|
| Demo shop | `SOS_CALL/demo-shop` | http://localhost:5175 |
| Donation widget | `SOS_CALL/sos-call-widget` | http://localhost:5174 |
| Administration dashboard | `SOS_CALL/sos-call-service/dashboard` | http://localhost:5173 |
| REST API | `SOS_CALL/sos-call-service/backend` | http://localhost:3001/api/v1 |
| Swagger API documentation | `SOS_CALL/sos-call-service/backend` | http://localhost:3001/docs |
| PostgreSQL | Docker Compose | `localhost:5433` |

All monetary values use integer Tunisian dinar millimes in the API and database. For example, `368000` is `368.000 TND`.

## Requirements

Install the following before starting:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) with Docker Compose.
- [Node.js](https://nodejs.org/) 20.19 or newer. Node.js 22 LTS is recommended.
- npm, included with Node.js.
- Git if you have not already downloaded the repository.

Keep Docker Desktop running throughout the test.

## Quick start on Windows

Run the commands in PowerShell from the repository root:

```powershell
cd C:\Users\TizOo\Desktop\SOS_CALL_FUNCTIONAL_DEMO
```

If your repository is elsewhere, open a PowerShell terminal at the folder that contains `SOS_CALL/` and use that folder as the repository root instead.

### 1. Start PostgreSQL

```powershell
cd SOS_CALL
docker compose up -d
docker compose ps
```

PostgreSQL will be available on port `5433`. The Docker volume persists local data between restarts.

### 2. Configure and start the API

Open a second PowerShell terminal:

```powershell
cd C:\Users\TizOo\Desktop\SOS_CALL_FUNCTIONAL_DEMO\SOS_CALL\sos-call-service\backend
Copy-Item .env.example .env
npm ci
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run start:dev
```

Leave this terminal open. Wait until NestJS reports that it is listening on port `3001`.

The `.env` file is created locally and points the API to the Docker database:

```dotenv
DATABASE_URL="postgresql://sos_admin:sos_password@localhost:5433/sos_call?schema=public"
PORT=3001
```

Do not commit `.env`; it is ignored by Git.

### 3. Start the donation widget

Open a third PowerShell terminal:

```powershell
cd C:\Users\TizOo\Desktop\SOS_CALL_FUNCTIONAL_DEMO\SOS_CALL\sos-call-widget
Copy-Item .env.example .env.local
npm ci
npm run dev
```

The widget uses http://localhost:3001/api/v1 by default and must remain on port `5174`.

### 4. Start the dashboard

Open a fourth PowerShell terminal:

```powershell
cd C:\Users\TizOo\Desktop\SOS_CALL_FUNCTIONAL_DEMO\SOS_CALL\sos-call-service\dashboard
npm ci
npm run dev
```

The dashboard uses port `5173`.

### 5. Start the demo shop

Open a fifth PowerShell terminal:

```powershell
cd C:\Users\TizOo\Desktop\SOS_CALL_FUNCTIONAL_DEMO\SOS_CALL\demo-shop
npm ci
npm run dev
```

The demo shop uses port `5175`.

## Test the complete flow

Keep the database, API, widget, dashboard, and shop terminals running.

1. Open the demo shop: http://localhost:5175
2. Open the dashboard in another tab: http://localhost:5173
3. In the shop, click **Buy now**.
4. The widget will open inside the shop and request a suggested contribution.
5. Test either outcome:
   - Choose **No thanks, continue without donating** to close the widget without creating a donation.
   - Choose a contribution and adjust it if desired, then click **Yes, I want to contribute**.

After accepting a contribution:

1. The shop opens a simulated PSP checkout page.
2. Click **Confirm payment** to mark the donation `CONFIRMED`.
3. Open or refresh the dashboard. It polls every three seconds and should show the contribution in total collected and confirmed donations.
4. Repeat the flow and click **Deny payment** to create a `FAILED` donation. It will not be included in dashboard totals or confirmed donations.

## Verify the services

Use these URLs to check each service:

- Shop: http://localhost:5175
- Widget: http://localhost:5174
- Dashboard: http://localhost:5173
- API base: http://localhost:3001/api/v1
- Swagger: http://localhost:3001/docs
- Dashboard API: http://localhost:3001/api/v1/dashboard/overview

The database container should also be running:

```powershell
cd C:\Users\TizOo\Desktop\SOS_CALL_FUNCTIONAL_DEMO\SOS_CALL
docker compose ps
```

## Run tests

The backend includes unit and end-to-end Jest configuration. PostgreSQL must be running before backend tests.

```powershell
cd C:\Users\TizOo\Desktop\SOS_CALL_FUNCTIONAL_DEMO\SOS_CALL\sos-call-service\backend
npm test
npm run test:e2e
npm run lint
npm run build
```

Build and lint checks are also available for the frontend applications:

```powershell
cd C:\Users\TizOo\Desktop\SOS_CALL_FUNCTIONAL_DEMO\SOS_CALL\sos-call-widget
npm run lint
npm run build
```

```powershell
cd C:\Users\TizOo\Desktop\SOS_CALL_FUNCTIONAL_DEMO\SOS_CALL\sos-call-service\dashboard
npm run lint
npm run build
```

## Reset the local demo

To remove all demo donations and merchants and recreate the database from migrations:

```powershell
cd C:\Users\TizOo\Desktop\SOS_CALL_FUNCTIONAL_DEMO\SOS_CALL
docker compose down -v
docker compose up -d
```

Then repeat the Prisma migration and seed steps:

```powershell
cd sos-call-service\backend
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run start:dev
```

`docker compose down -v` deletes the PostgreSQL volume and therefore all local demo data.

## Stop the demo

Stop each Vite/Nest terminal with `Ctrl+C`.

To stop and remove the database container while keeping its data:

```powershell
cd C:\Users\TizOo\Desktop\SOS_CALL_FUNCTIONAL_DEMO\SOS_CALL
docker compose down
```

To stop only the container with Docker Compose while preserving it:

```powershell
docker compose stop
```

## Troubleshooting

### Port already in use

The solution expects these ports:

```text
3001 - API
5173 - dashboard
5174 - widget
5175 - demo shop
5433 - PostgreSQL
```

Stop the process using the conflicting port, or change the corresponding Vite/API configuration consistently. The widget iframe and shop origin restrictions also depend on the configured localhost URLs.

### Dashboard cannot connect

Confirm that the backend terminal is running and that http://localhost:3001/api/v1/dashboard/overview returns JSON. A dashboard connection error usually means the API is not running or `DATABASE_URL` is incorrect.

### Widget cannot calculate or create a donation

Confirm that:

- PostgreSQL is running;
- the API is running on port `3001`;
- `SOS_CALL/sos-call-service/backend/.env` contains the expected `DATABASE_URL`;
- the seed command reported `Demo merchant ready: demo-shop`.

You can recreate the seed with:

```powershell
cd C:\Users\TizOo\Desktop\SOS_CALL_FUNCTIONAL_DEMO\SOS_CALL\sos-call-service\backend
npm run seed
```

### Prisma cannot connect to the database

Check Docker:

```powershell
docker compose -f C:\Users\TizOo\Desktop\SOS_CALL_FUNCTIONAL_DEMO\SOS_CALL\docker-compose.yml ps
docker compose -f C:\Users\TizOo\Desktop\SOS_CALL_FUNCTIONAL_DEMO\SOS_CALL\docker-compose.yml logs postgres
```

Make sure port `5433` is not already in use and that Docker Desktop is running.

## Demo behavior and security boundary

- Orders below or equal to `7000` millimes (`7.000 TND`) do not receive a donation suggestion.
- The widget can accept a custom positive donation amount.
- Accepted contributions are stored with `PENDING` status.
- Confirmed contributions are the only donations counted by the dashboard.
- Repeated payment callbacks are protected by a conditional `PENDING` update.

The `/api/v1/donations/:id/payment-result` route is intentionally browser-accessible for this simulation. In a real implementation, payment confirmation must come from an authenticated, signed, server-to-server PSP webhook. A browser redirect or button must never be treated as proof of payment.
