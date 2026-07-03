import "server-only";
import { fetch as undiciFetch } from "undici";
import { getBackendAgent, BACKEND_URL } from "./backend-agent";
import type {
  Certificate,
  CertificateListResponse,
  CertificateStats,
  CreateCertificateRequest,
  ListQueryParams,
} from "./types";

export class BackendError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "BackendError";
  }
}

async function backendFetch<T>(pathAndQuery: string, init?: { method?: string; body?: unknown }): Promise<T> {
  let res;
  try {
    res = await undiciFetch(`${BACKEND_URL}${pathAndQuery}`, {
      method: init?.method ?? "GET",
      headers: { "content-type": "application/json" },
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
      dispatcher: getBackendAgent(),
      // SSR pages want fresh data every render — the dashboard/list must
      // reflect the current inventory, not a stale build-time snapshot.
      // (This option is a no-op for undici but documents intent; caching is
      // controlled at the Next.js fetch call sites instead.)
    });
  } catch {
    throw new BackendError(503, `cannot reach backend at ${BACKEND_URL}`);
  }

  if (!res.ok) {
    let message = `backend responded with ${res.status}`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      // response wasn't JSON — keep the generic message
    }
    throw new BackendError(res.status, message);
  }

  return (await res.json()) as T;
}

function buildQuery(params: ListQueryParams): string {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  if (params.subject) qs.set("subject", params.subject);
  if (params.issuer) qs.set("issuer", params.issuer);
  if (params.expiring_within_days !== undefined) {
    qs.set("expiring_within_days", String(params.expiring_within_days));
  }
  if (params.sort_by) qs.set("sort_by", params.sort_by);
  if (params.sort_dir) qs.set("sort_dir", params.sort_dir);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export const backend = {
  listCertificates(params: ListQueryParams = {}): Promise<CertificateListResponse> {
    return backendFetch<CertificateListResponse>(`/certificates${buildQuery(params)}`);
  },
  getCertificate(id: string): Promise<Certificate> {
    return backendFetch<Certificate>(`/certificates/${encodeURIComponent(id)}`);
  },
  createCertificate(payload: CreateCertificateRequest): Promise<Certificate> {
    return backendFetch<Certificate>("/certificates", {
      method: "POST",
      body: payload,
    });
  },
  getStats(): Promise<CertificateStats> {
    return backendFetch<CertificateStats>("/certificates/stats");
  },
};
