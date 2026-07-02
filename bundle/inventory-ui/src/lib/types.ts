export interface Certificate {
  id: string;
  subject: string;
  issuer: string;
  expiration: string; // ISO 8601
  not_before: string | null;
  serial: string | null;
  created_at: string;
  san_entries: string[];
}

export interface CertificateListResponse {
  items: Certificate[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CertificateStats {
  total: number;
  expiring_soon: number;
  expiring_soon_window_days: number;
  expired: number;
}

export interface ApiErrorBody {
  error: string;
}

export interface CreateCertificateRequest {
  subject?: string;
  issuer?: string;
  expiration?: string;
  not_before?: string | null;
  serial?: string | null;
  san_entries?: string[];
  pem?: string;
}

export type SortField = "expiration" | "created_at" | "subject" | "issuer";
export type SortDir = "asc" | "desc";

export interface ListQueryParams {
  page?: number;
  page_size?: number;
  subject?: string;
  issuer?: string;
  expiring_within_days?: number;
  sort_by?: SortField;
  sort_dir?: SortDir;
}

/** Derived, UI-only status bucket for a certificate's expiry. */
export type ExpiryStatus = "expired" | "critical" | "warning" | "healthy";

export function expiryStatus(expirationIso: string, now: Date = new Date()): ExpiryStatus {
  const daysLeft = daysUntil(expirationIso, now);
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 7) return "critical";
  if (daysLeft <= 30) return "warning";
  return "healthy";
}

export function daysUntil(iso: string, now: Date = new Date()): number {
  const diffMs = new Date(iso).getTime() - now.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
