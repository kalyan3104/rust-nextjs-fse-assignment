import clsx from "clsx";
import { expiryStatus } from "@/lib/types";

const LABEL: Record<string, string> = {
  expired: "Expired",
  critical: "Critical",
  warning: "Expiring soon",
  healthy: "Healthy",
};

const STYLE: Record<string, string> = {
  expired: "bg-signal-danger/15 text-signal-danger border-signal-danger/30",
  critical: "bg-signal-danger/15 text-signal-danger border-signal-danger/30",
  warning: "bg-signal-warn/15 text-signal-warn border-signal-warn/30",
  healthy: "bg-signal-ok/15 text-signal-ok border-signal-ok/30",
};

export function StatusBadge({ expiration }: { expiration: string }) {
  const status = expiryStatus(expiration);
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium",
        STYLE[status]
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABEL[status]}
    </span>
  );
}
