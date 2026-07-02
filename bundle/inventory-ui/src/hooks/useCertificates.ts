"use client";

import useSWR from "swr";
import { swrFetcher } from "@/lib/swr-fetcher";
import type { CertificateListResponse, ListQueryParams } from "@/lib/types";

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

export function useCertificates(
  params: ListQueryParams,
  fallbackData?: CertificateListResponse
) {
  const key = `/api/certificates${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<CertificateListResponse>(
    key,
    swrFetcher,
    {
      fallbackData,
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return { data, error, isLoading, mutate };
}
