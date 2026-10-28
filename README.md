# AdTech-SaaS-Software-PostgreSQL — AI-Powered Advertising Campaign Management Platform

> **Project:** AdTech-SaaS-Software-PostgreSQL  
> **Type:** Full-stack SaaS starter / campaign intelligence dashboard  
> **Status:** Development MVP with PostgreSQL-backed campaign APIs and demo data

## 1. Project Description

**AdTech-SaaS-Software-PostgreSQL** is a full-stack advertising technology platform starter designed to help teams monitor and manage digital advertising campaigns from a single dashboard. It provides a screenshot-inspired dark navy and teal interface with campaign performance summaries, budget progress, platform labels, campaign health indicators, and campaign management actions.

The project includes a Next.js web application, a Node.js/Express API, and a PostgreSQL database. Ten demo campaigns are supplied so the dashboard can be explored during development. The current metrics and seed records are illustrative demo data; live integrations with advertising networks are not included yet.

## 2. Key Features

### Campaign dashboard
- Dark navy and teal responsive dashboard UI.
- Sidebar navigation for campaign and advertising-management areas.
- KPI cards for spend, impressions, active campaigns, and average ROAS.
- Campaign table with status, campaign name, platform, date range, budget, key metrics, and health score.
- Platform badges, status indicators, and budget-spend progress bars.
- Search and table sorting.
- Select individual or multiple campaign rows.
- Pause/activate campaign status controls.
- Create-campaign modal.
- Export campaign data to CSV.
- Demo fallback values when the API is unavailable.

### Backend and database
- REST API built with Express and TypeScript.
- PostgreSQL persistence through the `pg` package.
- SQL schema and seed scripts.
- Ten demo campaign records with sample performance metrics.
- Campaign list, summary, create, status-update, and delete endpoints.
- Health endpoint for checking the API/database connection.
- Environment-based configuration using `.env` files.

### Important scope note
This is a development starter, not a production-ready advertising platform. Authentication, production-grade tenant authorization, subscription billing, and live Meta/Google Ads integrations are not implemented. Do not use demo metrics as real business reporting.

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js App Router, React, TypeScript |
| Styling / UI | Tailwind CSS, custom responsive CSS, icon-based dashboard UI |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL 16, SQL, `pg` connection pool |
| Validation | Zod |
| Charts / visualization dependency | Recharts |
| Local database runtime | Docker, Docker Compose |
| Package management | npm |
| Configuration | dotenv / environment variables |

## 4. Requirements

Install the following before running the project:

- **Node.js 20 or later** (npm is included with Node.js).
- **Docker Desktop** with Docker Compose, or a separately installed PostgreSQL 15+ server.
- A terminal such as Windows PowerShell or Command Prompt.

Check installations:

```powershell
node --version
npm --version
docker --version
docker compose version
```

## 5. How to Run the Project on Windows

Run commands in the folders shown below. Keep the API and frontend running in **separate terminal windows**.

### Step 1 — Extract the project

Extract the ZIP so the project root is:

```text
F:\nodejs\AdTech-SaaS-Software-PostgreSQL
```

The project root should contain `docker-compose.yml`, `README.md`, and the `apps` folder.

### Step 2 — Start PostgreSQL

Open PowerShell or CMD and move to the project root:

```powershell
cd F:\nodejs\AdTech-SaaS-Software-PostgreSQL
docker compose up -d db
docker ps
```

The container should be named `adpilot-postgres` and become healthy. The included Compose configuration uses these **development defaults**:

| Setting | Default |
|---|---|
| Database | `adpilot` |
| Username | `adpilot` |
| Password | `adpilot_dev_password` |
| Host port | `5432` |
| Container | `adpilot-postgres` |

These values are for local development only. Do not use them for a public or production deployment.

### Step 3 — Configure and initialize the API

Open a **first terminal** and run:

```powershell
cd F:\nodejs\AdTech-SaaS-Software-PostgreSQL\apps\api
Copy-Item .env.example .env
npm install
npm run db:setup
```

If using **Command Prompt (CMD)** instead of PowerShell, use this copy command:

```cmd
copy .env.example .env
```

The API `.env` should use the same credentials as the running PostgreSQL instance. The included example is:

```env
PORT=4001
DATABASE_URL=postgresql://adpilot:adpilot_dev_password@localhost:5432/adpilot
WEB_ORIGIN=http://localhost:3000
```

A successful setup prints a message similar to:

```text
Database schema is ready. Ten demo campaigns are seeded (safe to rerun).
```

Then start the API in that same terminal:

```powershell
npm run dev
```

API addresses:

- Health check: http://localhost:4001/health
- Campaign API: http://localhost:4001/api/campaigns

Keep this terminal open.

### Step 4 — Configure and start the frontend

Open a **second terminal** and run:

```powershell
cd F:\nodejs\AdTech-SaaS-Software-PostgreSQL\apps\web
Copy-Item .env.example .env.local
npm install
npm run dev
```

For CMD, use `copy .env.example .env.local` instead of `Copy-Item`.

Keep the frontend terminal open and visit:

**http://localhost:3000**

### Step 5 — Stop the project

Press `Ctrl+C` in the frontend and API terminals. To stop the database container while preserving its data, run from the project root:

```powershell
docker compose stop db
```

Start it again later with `docker compose up -d db`.

## 6. Environment Configuration

### API — `apps/api/.env`

```env
PORT=4001
DATABASE_URL=postgresql://adpilot:adpilot_dev_password@localhost:5432/adpilot
WEB_ORIGIN=http://localhost:3000
```

### Web — `apps/web/.env.local`

Copy `apps/web/.env.example` to `.env.local` and retain its configured API URL. The frontend uses the API at `http://localhost:4001` by default.

**If you already have a PostgreSQL Docker volume:** PostgreSQL initialization variables only create the initial database/user when the data directory is initialized for the first time. Updating `docker-compose.yml` or copying a new `.env` does not change the password stored inside an existing database. If authentication fails, confirm the actual role/password for the existing database and update `apps/api/.env` to match. Do **not** run `docker compose down -v` unless you intentionally want to permanently remove the database volume and its data.

## 7. Project Structure

```text
AdTech-SaaS-Software-PostgreSQL/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── db.ts
│   │   │   ├── index.ts
│   │   │   ├── setup-db.ts
│   │   │   └── routes/
│   │   │       └── campaigns.ts
│   │   ├── sql/
│   │   │   ├── schema.sql
│   │   │   └── seed.sql
│   │   ├── .env.example
│   │   └── package.json
│   └── web/
│       ├── app/
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   └── page.tsx
│       ├── .env.example
│       └── package.json
├── docker-compose.yml
└── README.md
```

## 8. API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | API and database health check |
| `GET` | `/api/campaigns` | List campaigns |
| `GET` | `/api/campaigns/summary` | Retrieve campaign summary KPIs |
| `POST` | `/api/campaigns` | Create a campaign |
| `PATCH` | `/api/campaigns/:id/status` | Update campaign status |
| `DELETE` | `/api/campaigns/:id` | Delete a campaign |

Example campaign creation payload:

```json
{
  "name": "Winter Sale",
  "platform": "Meta",
  "objective": "Conversions",
  "daily_budget": 75,
  "status": "active"
}
```

## 9. Database Setup and Demo Data

Running `npm run db:setup` from `apps/api` applies `sql/schema.sql` and `sql/seed.sql`. The schema includes organizations, users, ad accounts, campaigns, daily metrics, and subscriptions. The seed script supplies ten demo campaigns with sample performance metrics and is designed to be safe to rerun.

## 10. Troubleshooting

### `npm` says it cannot find `package.json`
Run commands from the correct app directory:
- API commands: `F:\nodejs\AdTech-SaaS-Software-PostgreSQL\apps\api`
- Web commands: `F:\nodejs\AdTech-SaaS-Software-PostgreSQL\apps\web`

### `password authentication failed`
Check `apps/api/.env` and verify that the username, password, database, host, and port match the **existing** PostgreSQL instance. Test the actual connection before rerunning `npm run db:setup`. A successful `docker exec ... psql` test using one password does not prove that a different username/password combination is valid.

### Port `5432` is already in use
Another PostgreSQL server/container may already be using port `5432`. Check with `docker ps` and inspect local PostgreSQL services before changing ports.

### Port `3000` or `4001` is already in use
Stop the other process using that port or configure the app to use an available port and update the corresponding environment settings.

### Frontend loads but the API is unavailable
Confirm the database is healthy, the API terminal is still running, and `http://localhost:4001/health` responds. The dashboard may show illustrative demo values when the API is unavailable.

## 11. Recommended Next Steps Before Production

1. Add secure authentication and session/token management.
2. Enforce organization-scoped authorization for every endpoint and database query.
3. Integrate advertising platforms using their official APIs and OAuth flows.
4. Add secrets management, rate limiting, audit logs, and security testing.
5. Implement billing, background jobs, retries, observability, and automated tests.
6. Define metric attribution, currency, and timezone rules before using campaign metrics for business decisions.

---

**License / usage:** This repository is provided as a development starter. Add your preferred license and production deployment policies before distributing or deploying it commercially.
