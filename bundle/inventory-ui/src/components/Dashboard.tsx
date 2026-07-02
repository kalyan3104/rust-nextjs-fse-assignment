import { backend } from "@/lib/backend-client";
import { StatCard } from "./StatCard";

export async function Dashboard() {
  const stats = await backend.getStats();

  return (
    <section
      aria-label="Inventory summary"
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
    >
      <StatCard label="Total certificates" value={stats.total} />
      <StatCard
        label={`Expiring within ${stats.expiring_soon_window_days}d`}
        value={stats.expiring_soon}
        tone={stats.expiring_soon > 0 ? "warn" : "default"}
        sublabel={stats.expiring_soon > 0 ? "needs renewal soon" : "nothing urgent"}
      />
      <StatCard
        label="Expired"
        value={stats.expired}
        tone={stats.expired > 0 ? "danger" : "default"}
        sublabel={stats.expired > 0 ? "rotate immediately" : "none outstanding"}
      />
    </section>
  );
}
