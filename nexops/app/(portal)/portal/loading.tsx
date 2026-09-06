import { SkeletonCard } from "@/components/ui/skeleton";

export default function PortalLoading() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-7 w-48 rounded" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="kpi-card space-y-2">
            <div className="skeleton h-4 w-2/3 rounded" />
            <div className="skeleton h-6 w-1/2 rounded" />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
