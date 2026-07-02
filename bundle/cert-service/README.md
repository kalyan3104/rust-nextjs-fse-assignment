# cert-service

> Local environment note: create .env from .env.example before running the service. The .env file is local-only and should not be committed to GitHub.

A Rust microservice for storing and retrieving X.509 certificate metadata,
backed by PostgreSQL, structured as a layered application (config /
handlers / services / repository / middleware) rather than one flat file.

## Architecture

```
src/
├── main.rs                          # bootstrap: config, logging, DB pool, graceful shutdown
├── config.rs                        # AppConfig, loaded once from env
├── routes.rs                        # router assembly + middleware + Swagger UI
├── openapi.rs                       # utoipa OpenAPI doc aggregation
├── error.rs                         # AppError -> HTTP response mapping
├── models.rs                        # request/response/row DTOs (+ OpenAPI schemas)
├── cert_parser.rs                   # X.509 PEM parsing
├── middleware/
│   ├── mod.rs
│   └── request_id.rs                 # per-request UUID, propagated via x-request-id
├── handlers/                         # thin HTTP layer: parse request -> call service -> respond
│   ├── mod.rs
│   ├── health.rs
│   └── certificates/
│       ├── mod.rs
│       ├── create.rs                 # POST /certificates
│       └── get.rs                    # GET /certificates/:id
├── services/                         # business logic, independent of HTTP/Axum
│   ├── mod.rs
│   └── certificate_service.rs        # PEM-vs-explicit-field resolution, validation
└── db.rs                             # repository layer: raw SQL only, no business rules
```

The flow for a request is: **handler** (HTTP concerns only) → **service**
(business rules: "what does this request mean") → **repository** (SQL only).
This keeps each layer independently testable and means swapping the HTTP
framework or the database layer later doesn't ripple through business logic.

## Stack

- **Framework:** Axum (async, Tokio + Hyper)
- **Database:** PostgreSQL via SQLx
- **Certificate parsing:** `x509-parser`
- **API docs:** `utoipa` + Swagger UI, served at `/docs`
- **Observability:** `tracing`, with `LOG_FORMAT=json` for structured logs and a
  `x-request-id` header attached/propagated on every request for correlation
- **Container:** multi-stage Dockerfile, non-root user, slim runtime image

> Note on SQLx: this project uses `query_as` with runtime query execution
> rather than the `query!`/`query_as!` compile-time macros, so `docker build`
> doesn't need a live database connection. To switch to fully
> compile-time-checked queries, run `cargo sqlx prepare` against a running
> database and swap to the `!`-suffixed macros — see the SQLx docs on
> offline mode.

## Endpoints

| Method | Path                  | Description                                  |
|--------|-----------------------|-----------------------------------------------|
| GET    | `/health`             | Liveness check (also pings the DB)            |
| POST   | `/certificates`       | Create a certificate record                   |
| GET    | `/certificates/:id`   | Fetch a certificate record by UUID            |
| GET    | `/docs`               | Swagger UI (interactive API explorer)         |
| GET    | `/api-docs/openapi.json` | Raw OpenAPI spec                          |

### POST /certificates

Explicit fields:

```json
{
  "subject": "CN=example.com",
  "issuer": "CN=Example CA",
  "expiration": "2027-01-01T00:00:00Z",
  "not_before": "2026-01-01T00:00:00Z",
  "serial": "01:02:03",
  "san_entries": ["example.com", "www.example.com"]
}
```

...or a raw PEM, parsed server-side:

```json
{
  "pem": "-----BEGIN CERTIFICATE-----\nMIIDTDCC...\n-----END CERTIFICATE-----"
}
```

Explicit fields always win over values derived from `pem`.

### GET /certificates/:id

Returns the same shape, or `404` with `{"error": "certificate not found"}`.

## Database schema

```
certificates
  id          UUID PRIMARY KEY
  subject     TEXT
  issuer      TEXT
  expiration  TIMESTAMPTZ
  not_before  TIMESTAMPTZ
  serial      TEXT
  created_at  TIMESTAMPTZ

san_entries
  id              BIGSERIAL PRIMARY KEY
  certificate_id  UUID REFERENCES certificates(id) ON DELETE CASCADE
  value           TEXT
```

SAN entries live in a secondary table (one row per SAN) rather than an array
column, so they're easy to index and query individually. Migrations live in
`migrations/` and run automatically on startup.

## Running with Docker Compose (recommended)

```bash
docker compose up --build
```

API at `http://localhost:8080`, interactive docs at `http://localhost:8080/docs`.

```bash
curl -X POST http://localhost:8080/certificates \
  -H "Content-Type: application/json" \
  -d '{
        "subject": "CN=example.com",
        "issuer": "CN=Example CA",
        "expiration": "2027-01-01T00:00:00Z",
        "san_entries": ["example.com", "www.example.com"]
      }'

curl http://localhost:8080/certificates/<id-from-above>
```

## Running locally without Docker

1. Start PostgreSQL and create a database.
2. Copy `.env.example` to `.env` and adjust `DATABASE_URL`.
3. `cargo run` — migrations run automatically on startup.

## Tests

```bash
cargo test
```

Unit + integration tests cover the certificate parser (using a bundled
self-signed fixture at `tests/fixtures/test_cert.pem`) and validation logic
in `services::certificate_service`.

## Container security notes

- Multi-stage build: only the compiled binary + migrations ship in the final
  image, no toolchain or source.
- Runtime base is `debian:bookworm-slim`.
- Runs as a dedicated non-root `appuser`.
- `.dockerignore` excludes `target/`, `.env`, and dev-only files from the
  build context.




- you can use this .env:

DATABASE_URL=postgres://certuser:certpass@localhost:5432/certdb
BIND_ADDR=0.0.0.0:8081
LOG_FORMAT=pretty
RUST_LOG=cert_service=info,tower_http=info
DB_MAX_CONNECTIONS=10
