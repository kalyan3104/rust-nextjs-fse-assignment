import Link from "next/link";
import type { Certificate } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";
import { ExpiryBar } from "./ExpiryBar";
import { truncateMiddle } from "@/lib/format";

export function CertificateTable({ items }: { items: Certificate[] }) {
  if (items.length === 0) {
    return (
      <div className="px-4 py-16 text-center text-sm text-ink-muted">
        No certificates match these filters.{" "}
        <span className="text-ink-faint">Try widening the search or clearing filters.</span>
      </div>
    );
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-base-border text-left text-xs uppercase tracking-wider text-ink-muted">
          <th className="px-4 py-2.5 font-medium">Subject</th>
          <th className="px-4 py-2.5 font-medium">Issuer</th>
          <th className="px-4 py-2.5 font-medium">Expires</th>
          <th className="px-4 py-2.5 font-medium">Time to expiry</th>
          <th className="px-4 py-2.5 font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        {items.map((cert) => (
          <tr
            key={cert.id}
            className="border-b border-base-borderMuted transition-colors hover:bg-base-panel2"
          >
            <td className="px-4 py-3">
              <Link
                href={`/inventory/${cert.id}`}
                className="font-mono text-ink hover:text-signal-accent hover:underline"
              >
                {truncateMiddle(cert.subject, 40)}
              </Link>
              {cert.san_entries.length > 0 ? (
                <div className="mt-0.5 text-xs text-ink-faint">
                  +{cert.san_entries.length} SAN{cert.san_entries.length === 1 ? "" : "s"}
                </div>
              ) : null}
            </td>
            <td className="px-4 py-3 text-ink-muted">{truncateMiddle(cert.issuer, 32)}</td>
            <td className="px-4 py-3 font-mono text-ink-muted">{formatDate(cert.expiration)}</td>
            <td className="px-4 py-3">
              <ExpiryBar expiration={cert.expiration} />
            </td>
            <td className="px-4 py-3">
              <StatusBadge expiration={cert.expiration} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
