# Certificate Inventory App

This project has two parts:
- cert-service: the Rust backend API
- inventory-ui: the Next.js frontend


Then open .env.local and make sure the backend address and certificate path are correct for your setup.

> Note: .env and .env.local are local-only files. GitHub cannot see them, so you must create them yourself from the example files.

## 1. Start the backend

To start the backend, run:

```bash
cd cert-service
cargo run
```

The backend will run on http://localhost:8080.

## 2. Start the frontend

To start the frontend, run:

```bash
cd inventory-ui
npm run dev
```

Then open:
- http://localhost:3000

The app will open the inventory page.

## 3. Useful commands

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

## 4. Important note about .env files

Do not share or upload .env or .env.local files to GitHub.
They contain local settings such as:
- database connection details
- backend URLs
- certificate file paths

Use these example files instead:
- cert-service/.env.example
- inventory-ui/.env.local.example
