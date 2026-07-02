"use client";

import type { SortDir, SortField } from "@/lib/types";

const SORT_FIELDS: Array<[SortField, string]> = [
  ["expiration", "Expiration"],
  ["created_at", "Created date"],
  ["subject", "Subject"],
  ["issuer", "Issuer"],
];

const SORT_DIRECTIONS: Array<[SortDir, string]> = [
  ["asc", "Ascending"],
  ["desc", "Descending"],
];

const PAGE_SIZES = [10, 20, 50, 100];

export function ListControls({
  sortBy,
  sortDir,
  pageSize,
  onChange,
}: {
  sortBy: SortField;
  sortDir: SortDir;
  pageSize: number;
  onChange: (next: { sortBy: SortField; sortDir: SortDir; pageSize: number }) => void;
}) {
  return (
    <section
      aria-label="Inventory controls"
      className="flex flex-col gap-3 border-b border-base-border bg-base-panel px-4 py-3 sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm text-ink">
          <span className="font-medium text-ink-muted">Sort by</span>
          <select
            value={sortBy}
            onChange={(event) =>
              onChange({ sortBy: event.target.value as SortField, sortDir, pageSize })
            }
            className="rounded-sm border border-base-border bg-base-bg px-2.5 py-1.5 text-sm text-ink"
          >
            {SORT_FIELDS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-ink">
          <span className="font-medium text-ink-muted">Sort direction</span>
          <select
            value={sortDir}
            onChange={(event) =>
              onChange({ sortBy, sortDir: event.target.value as SortDir, pageSize })
            }
            className="rounded-sm border border-base-border bg-base-bg px-2.5 py-1.5 text-sm text-ink"
          >
            {SORT_DIRECTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-ink">
          <span className="font-medium text-ink-muted">Page size</span>
          <select
            value={pageSize}
            onChange={(event) =>
              onChange({ sortBy, sortDir, pageSize: Number(event.target.value) })
            }
            className="rounded-sm border border-base-border bg-base-bg px-2.5 py-1.5 text-sm text-ink"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="text-sm text-ink-muted">
        Sort the inventory and fetch the requested page size from the backend.
      </div>
    </section>
  );
}
