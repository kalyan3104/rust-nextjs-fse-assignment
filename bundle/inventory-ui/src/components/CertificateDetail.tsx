import Link from "next/link";
import type { Certificate } from "@/lib/types";
import { formatDateTime, formatDaysLeft } from "@/lib/format";
import { daysUntil } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { CopyableField } from "./CopyableField";

export function CertificateDetail({ cert }: { cert: Certificate }) {
  const daysLeft = daysUntil(cert.expiration);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/inventory"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-signal-accent"
      >
        ← Back to inventory
      </Link>

      <div className="rounded-md border border-base-border bg-base-panel p-6 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="break-all font-mono text-xl font-semibold text-ink">
              {cert.subject}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">{formatDaysLeft(daysLeft)}</p>
          </div>
          <StatusBadge expiration={cert.expiration} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CopyableField label="Certificate ID" value={cert.id} />
          <CopyableField label="Serial" value={cert.serial ?? "—"} />
          <CopyableField label="Issuer" value={cert.issuer} />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wider text-ink-muted">
              Validity window
            </span>
            <div className="rounded-sm border border-base-border bg-base-bg px-3 py-2 font-mono text-sm text-ink">
              {formatDateTime(cert.not_before)} → {formatDateTime(cert.expiration)}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <span className="text-xs font-medium uppercase tracking-wider text-ink-muted">
            Subject Alternative Names ({cert.san_entries.length})
          </span>
          {cert.san_entries.length === 0 ? (
            <p className="mt-2 text-sm text-ink-faint">None recorded.</p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-2">
              {cert.san_entries.map((san) => (
                <li
                  key={san}
                  className="rounded-sm border border-base-border bg-base-bg px-2.5 py-1 font-mono text-xs text-ink-muted"
                >
                  {san}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 text-xs text-ink-faint">
          Recorded {formatDateTime(cert.created_at)}
        </div>
      </div>
    </div>
  );
}
