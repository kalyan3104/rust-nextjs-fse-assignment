export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="space-y-2 px-4 py-6">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[2.5fr_1.5fr_1fr_1fr_auto] items-center gap-4 rounded-lg bg-base-panel2 p-4 text-sm shadow-sm animate-pulse"
        >
          <div className="h-4 w-full rounded bg-base-bg" />
          <div className="h-4 w-4/5 rounded bg-base-bg" />
          <div className="h-4 w-3/4 rounded bg-base-bg" />
          <div className="h-4 w-2/3 rounded bg-base-bg" />
          <div className="h-4 w-1/2 rounded bg-base-bg" />
        </div>
      ))}
    </div>
  );
}
