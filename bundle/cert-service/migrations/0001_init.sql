-- Required for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject     TEXT NOT NULL,
    issuer      TEXT NOT NULL,
    expiration  TIMESTAMPTZ NOT NULL,
    not_before  TIMESTAMPTZ,
    serial      TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SAN entries stored in a secondary table (one-to-many)
CREATE TABLE IF NOT EXISTS san_entries (
    id             BIGSERIAL PRIMARY KEY,
    certificate_id UUID NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
    value          TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_san_entries_certificate_id ON san_entries (certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificates_expiration ON certificates (expiration);
