# Certificate Inventory App

This project has two parts:
- cert-service: the Rust backend API
- inventory-ui: the Next.js frontend

## 1. Create your local environment files

These files are for your own machine only. Do not upload them to GitHub.

### Backend
Run this in the cert-service folder:

```bash
cd cert-service
cp .env.example .env
```

Then open `.env` and set `DATABASE_URL` to your Supabase Postgres connection string.

Example:

```bash
DATABASE_URL=postgresql://postgres:PasswordKalyan_123@db.zlgpcgzdznwqsziuhaag.supabase.co:5432/postgres
```

### Frontend
Run this in the inventory-ui folder:

```bash
cd inventory-ui
cp .env.local.example .env.local
```

Then open `.env.local` and make sure the backend address matches the port your Rust service uses locally.

> Note: .env and .env.local are local-only files. GitHub cannot see them, so you must create them yourself from the example files.

## 2. Start the backend

To start the backend, run:

```bash
cd cert-service
cargo run
```

The backend will run on http://localhost:8081 by default in this setup.

## 3. Start the frontend

To start the frontend, run:

```bash
cd inventory-ui
npm run dev
```

Then open:
- http://localhost:3000

The app will open the inventory page.

## 4. Useful commands

### Backend
```bash
cd cert-service
cargo test
```

### Frontend
```bash
cd inventory-ui
npm run typecheck
npm run lint
```

## 5. Important note about .env files

Do not share or upload .env or .env.local files to GitHub.
They contain local settings such as:
- database connection details
- backend URLs
- certificate file paths

Use these example files instead:
- cert-service/.env.example
- inventory-ui/.env.local.example

## Recommended no-Docker setup

If you want the simplest cross-platform workflow for macOS and Windows:

1. Create a Supabase database and copy its `DATABASE_URL` into `cert-service/.env`.
2. Run the backend with `cargo run` from `cert-service/`.
3. Run the frontend with `npm install` once, then `npm run dev` from `inventory-ui/`.
4. Open `http://localhost:3000`.

No Docker, pgAdmin, or local Postgres install is required for that flow.
