import { daysUntil, expiryStatus } from "@/lib/types";

const STATUS_COLOR: Record<string, string> = {
  expired: "bg-signal-danger",
  critical: "bg-signal-danger",
  warning: "bg-signal-warn",
  healthy: "bg-signal-ok",
};

/**
 * Renders time-to-expiry as a filled bar against a 180-day horizon, so the
 * whole inventory can be scanned for "who's close to the edge" at a glance
 * without reading a single date.
 */
export function ExpiryBar({ expiration }: { expiration: string }) {
  const days = daysUntil(expiration);
  const status = expiryStatus(expiration);
  const horizon = 180;
  const pct = Math.max(0, Math.min(100, (Math.max(days, 0) / horizon) * 100));

  return (
    <div className="flex w-28 flex-col gap-1" aria-hidden={false}>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-base-panel2">
        <div
          className={`h-full rounded-full ${STATUS_COLOR[status]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[11px] text-ink-muted">
        {days < 0 ? `${Math.abs(days)}d over` : `${days}d`}
      </span>
    </div>
  );
}
