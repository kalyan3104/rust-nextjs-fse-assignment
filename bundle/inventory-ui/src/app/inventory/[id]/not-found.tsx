import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="font-mono text-lg font-semibold text-ink">Certificate not found</h1>
      <p className="mt-2 text-sm text-ink-muted">
        That ID doesn&apos;t match anything in the inventory.
      </p>
      <Link
        href="/inventory"
        className="mt-4 inline-block text-sm text-signal-accent hover:underline"
      >
        Back to inventory
      </Link>
    </div>
  );
}
