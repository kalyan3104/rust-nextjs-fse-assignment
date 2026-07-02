import { Dashboard } from "@/components/Dashboard";
import { InventoryExplorer } from "@/components/InventoryExplorer";
import { backend } from "@/lib/backend-client";

// Server-side rendered on every request (Requirement 1: SSR). The dashboard
// and first page of results are fully rendered before they hit the wire;
// client-side interactivity (filters/pagination) takes over from there.
export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const initialList = await backend.listCertificates({
    page: 1,
    page_size: 20,
    sort_by: "expiration",
    sort_dir: "asc",
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-ink">Certificate inventory</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Server-rendered on every request, live-filtered from here on.
        </p>
      </div>

      <Dashboard />

      <InventoryExplorer initialData={initialList} />
    </div>
  );
}
