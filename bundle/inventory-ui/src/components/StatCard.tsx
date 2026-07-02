import clsx from "clsx";

export function StatCard({
  label,
  value,
  tone = "default",
  sublabel,
}: {
  label: string;
  value: number | string;
  tone?: "default" | "warn" | "danger" | "ok";
  sublabel?: string;
}) {
  const toneClass = {
    default: "text-ink",
    warn: "text-signal-warn",
    danger: "text-signal-danger",
    ok: "text-signal-ok",
  }[tone];

  return (
    <div className="rounded-md border border-base-border bg-base-panel px-5 py-4 shadow-panel">
      <div className="text-xs font-medium uppercase tracking-wider text-ink-muted">
        {label}
      </div>
      <div className={clsx("mt-2 font-mono text-3xl font-semibold", toneClass)}>
        {value}
      </div>
      {sublabel ? (
        <div className="mt-1 text-xs text-ink-faint">{sublabel}</div>
      ) : null}
    </div>
  );
}
