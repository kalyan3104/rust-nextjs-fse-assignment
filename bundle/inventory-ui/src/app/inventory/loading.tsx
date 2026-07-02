export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-6 w-48 animate-pulse rounded-sm bg-base-panel2" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-md bg-base-panel2" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-md bg-base-panel2" />
    </div>
  );
}
