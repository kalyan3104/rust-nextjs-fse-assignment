# inventory-ui

> Local environment note: create .env.local from .env.local.example before running the UI. The .env.local file is local-only and should not be committed to GitHub.

Next.js 14 (App Router) frontend for `cert-service` (FSE Assignment 1's Rust
API). Built for FSE Assignment 2.

## Requirements → implementation

| Requirement | Where |
|---|---|
| `/inventory` lists certificates (GET) | `src/app/inventory/page.tsx` |
| Click item → detail view | `src/app/inventory/[id]/page.tsx`, linked from `CertificateTable` |
| SSR | `page.tsx` files are server components with `export const dynamic = "force-dynamic"`, fetching directly from the backend on every request |
| Dashboard: total + expiring soon (30d) | `src/components/Dashboard.tsx`, backed by `GET /certificates/stats` |
| TLS to the API | `src/lib/backend-agent.ts` — server-side `undici.Agent` trusting the local dev CA |
| mTLS (bonus) | Same agent, optionally presents a client cert — see `cert-service/nginx/README.md` |
| SWR | `src/hooks/useCertificates.ts`, used by `InventoryExplorer` |
| Pagination + filtering | `Pagination.tsx`, `FilterBar.tsx`, backend `GET /certificates?page=&subject=&issuer=&expiring_within_days=` |
| Sorting + scalable list controls | `ListControls.tsx`, server-side `sort_by` / `sort_dir`, page size support | 
| Loading state and skeleton UI | `LoadingSkeleton.tsx`, client SWR loading states | 
| Reusable components | `StatCard`, `StatusBadge`, `ExpiryBar`, `CopyableField`, `CertificateTable`, `Pagination` |
| TypeScript strict mode | `tsconfig.json` (`"strict": true`, `noUncheckedIndexedAccess`) |

## Architecture note: why a proxy layer?

Two paths hit the backend:

1. **SSR pages** (`src/app/inventory/**/page.tsx`) call `src/lib/backend-client.ts`
   directly at render time — true server-side rendering, first paint already
   has data.
2. **Client-side interactivity** (filters, pagination) goes through
   `src/app/api/**/route.ts`, which proxies to the same backend client.

The browser never talks to the Rust backend directly. That means the
self-signed cert only needs to be trusted by the Node server process (one
`ca.crt` file), not by every visitor's browser — and it's how the mTLS client
certificate stays off the client bundle entirely (`backend-agent.ts` is
marked `server-only`).

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Edit `.env.local` — by default it assumes `cert-service/` and `inventory-ui/`
are sibling directories, matching how this codebase was structured:

```
BACKEND_URL=https://localhost:8443
BACKEND_CA_CERT_PATH=../cert-service/certs/ca.crt
```

Bring up the backend first (from `cert-service/`):

```bash
./scripts/generate-certs.sh
docker compose up --build
```

Then run the frontend:

```bash
npm run dev
```

Visit `http://localhost:3000` → redirects to `/inventory`.

## Scripts

```bash
npm run dev        # dev server, http://localhost:3000
npm run build       # production build
npm run start        # run the production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit (strict mode)
```

## Running fully containerized

```bash
# from cert-service/
./scripts/generate-certs.sh
docker compose up --build -d

# from inventory-ui/
docker compose up --build
```

The frontend container reaches the backend via
`https://host.docker.internal:8443` (nginx's published port) and mounts
`../cert-service/certs` read-only to trust the CA — see
`docker-compose.yml`.
