"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useCertificates } from "@/hooks/useCertificates";
import { CertificateTable } from "./CertificateTable";
import { Pagination } from "./Pagination";
import { FilterBar, type Filters } from "./FilterBar";
import { ListControls } from "./ListControls";
import { LoadingSkeleton } from "./LoadingSkeleton";
import type { CertificateListResponse, SortDir, SortField } from "@/lib/types";

const DEFAULT_SORT_BY: SortField = "expiration";
const DEFAULT_SORT_DIR: SortDir = "asc";
const DEFAULT_PAGE_SIZE = 20;

export function InventoryExplorer({
  initialData,
}: {
  initialData: CertificateListResponse;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState<SortField>(DEFAULT_SORT_BY);
  const [sortDir, setSortDir] = useState<SortDir>(DEFAULT_SORT_DIR);
  const [filters, setFilters] = useState<Filters>({
    subject: "",
    issuer: "",
    expiringWithinDays: "",
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    subject: "",
    issuer: "",
    expiration: "",
    serial: "",
    sanEntries: "",
  });

  const queryParams = useMemo(
    () => ({
      page,
      page_size: pageSize,
      subject: filters.subject || undefined,
      issuer: filters.issuer || undefined,
      expiring_within_days: filters.expiringWithinDays
        ? Number(filters.expiringWithinDays)
        : undefined,
      sort_by: sortBy,
      sort_dir: sortDir,
    }),
    [page, pageSize, filters.issuer, filters.expiringWithinDays, filters.subject, sortBy, sortDir]
  );

  const { data, error, isLoading, mutate } = useCertificates(
    queryParams,
    page === 1 &&
      pageSize === DEFAULT_PAGE_SIZE &&
      sortBy === DEFAULT_SORT_BY &&
      sortDir === DEFAULT_SORT_DIR &&
      !filters.subject &&
      !filters.issuer &&
      !filters.expiringWithinDays
      ? initialData
      : undefined
  );

  function applyFilters(next: Filters) {
    setFilters(next);
    setPage(1);
  }

  function handleListControlsChange(next: {
    sortBy: SortField;
    sortDir: SortDir;
    pageSize: number;
  }) {
    setSortBy(next.sortBy);
    setSortDir(next.sortDir);
    setPageSize(next.pageSize);
    setPage(1);
  }

  function resetCreateForm() {
    setFormValues({
      subject: "",
      issuer: "",
      expiration: "",
      serial: "",
      sanEntries: "",
    });
  }

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const response = await fetch("/api/certificates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subject: formValues.subject.trim() || undefined,
          issuer: formValues.issuer.trim() || undefined,
          expiration: formValues.expiration
            ? new Date(`${formValues.expiration}T00:00:00`).toISOString()
            : undefined,
          serial: formValues.serial.trim() || undefined,
          san_entries: formValues.sanEntries
            .split(/\n|,/)
            .map((entry) => entry.trim())
            .filter(Boolean),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Failed to create certificate");
      }

      setFormSuccess("Certificate created");
      setIsCreateOpen(false);
      resetCreateForm();
      await mutate();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create certificate");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-md border border-base-border bg-base-panel shadow-panel">
      <div className="flex flex-col gap-3 border-b border-base-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-ink-muted">
          Manage certificates and add new ones from here.
        </div>
        <button
          type="button"
          onClick={() => {
            setIsCreateOpen((value) => !value);
            setFormError(null);
            setFormSuccess(null);
          }}
          className="rounded-md bg-signal-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-signal-accent/90 focus-visible:ring-2 focus-visible:ring-signal-accent/60"
        >
          {isCreateOpen ? "Cancel" : "+ Add Certificate"}
        </button>
      </div>

      {isCreateOpen ? (
        <form onSubmit={handleCreateSubmit} className="grid gap-3 border-b border-base-border bg-base-50/60 p-4 md:grid-cols-2">
          <label className="text-sm text-ink">
            <span className="mb-1 block">Subject</span>
            <input
              value={formValues.subject}
              onChange={(event) => setFormValues((current) => ({ ...current, subject: event.target.value }))}
              className="w-full rounded-md border border-base-border bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:border-signal-accent focus:outline-none focus:ring-2 focus:ring-signal-accent/30"
              placeholder="CN=example.com"
              required
            />
          </label>
          <label className="text-sm text-ink">
            <span className="mb-1 block">Issuer</span>
            <input
              value={formValues.issuer}
              onChange={(event) => setFormValues((current) => ({ ...current, issuer: event.target.value }))}
              className="w-full rounded-md border border-base-border bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:border-signal-accent focus:outline-none focus:ring-2 focus:ring-signal-accent/30"
              placeholder="Example CA"
              required
            />
          </label>
          <label className="text-sm text-ink">
            <span className="mb-1 block">Expiration</span>
            <input
              type="date"
              value={formValues.expiration}
              onChange={(event) => setFormValues((current) => ({ ...current, expiration: event.target.value }))}
              className="w-full rounded-md border border-base-border bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:border-signal-accent focus:outline-none focus:ring-2 focus:ring-signal-accent/30"
              required
            />
          </label>
          <label className="text-sm text-ink">
            <span className="mb-1 block">Serial (optional)</span>
            <input
              value={formValues.serial}
              onChange={(event) => setFormValues((current) => ({ ...current, serial: event.target.value }))}
              className="w-full rounded-md border border-base-border bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:border-signal-accent focus:outline-none focus:ring-2 focus:ring-signal-accent/30"
              placeholder="Optional"
            />
          </label>
          <label className="text-sm text-ink md:col-span-2">
            <span className="mb-1 block">SAN entries (optional, comma or newline separated)</span>
            <textarea
              value={formValues.sanEntries}
              onChange={(event) => setFormValues((current) => ({ ...current, sanEntries: event.target.value }))}
              className="min-h-24 w-full rounded-md border border-base-border bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:border-signal-accent focus:outline-none focus:ring-2 focus:ring-signal-accent/30"
              placeholder="www.example.com\napi.example.com"
            />
          </label>
          <div className="flex items-center gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-signal-success px-3 py-2 text-sm font-medium text-white transition hover:bg-signal-success/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating…" : "+ Create certificate"}
            </button>
            {formError ? <span className="text-sm text-signal-danger">{formError}</span> : null}
            {formSuccess ? <span className="text-sm text-signal-success">{formSuccess}</span> : null}
          </div>
        </form>
      ) : null}

      <ListControls
        sortBy={sortBy}
        sortDir={sortDir}
        pageSize={pageSize}
        onChange={handleListControlsChange}
      />
      <FilterBar initial={filters} onApply={applyFilters} />

      {error ? (
        <div className="px-4 py-8 text-center text-sm text-signal-danger">
          Couldn&apos;t reach the backend: {error.message}
        </div>
      ) : (
        <div className="relative">
          {isLoading && !data ? (
            <LoadingSkeleton rows={pageSize >= 50 ? 8 : 5} />
          ) : (
            <>
              <div className={isLoading ? "opacity-70 transition-opacity" : ""}>
                <CertificateTable items={data?.items ?? []} />
              </div>
              <Pagination
                page={data?.page ?? page}
                totalPages={data?.total_pages ?? 1}
                onChange={setPage}
              />
              {isLoading && data ? (
                <div className="px-4 py-3 text-sm text-ink-muted">
                  Updating inventory with your latest selection…
                </div>
              ) : null}
            </>
          )}
        </div>
      )}
    </div>
  );
}
