"use client";

export default function InventoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-md border border-signal-danger/30 bg-signal-danger/10 p-6">
      <h2 className="font-semibold text-signal-danger">Couldn&apos;t load the inventory</h2>
      <p className="mt-2 text-sm text-ink-muted">{error.message}</p>
      <p className="mt-2 text-xs text-ink-faint">
        If this is a TLS error, confirm cert-service is running behind nginx on
        BACKEND_URL, and that BACKEND_CA_CERT_PATH in .env.local points at the
        generated ca.crt.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-sm border border-base-border px-3 py-1.5 text-xs font-medium text-ink hover:bg-base-panel2"
      >
        Try again
      </button>
    </div>
  );
}
