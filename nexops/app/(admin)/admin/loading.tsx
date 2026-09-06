import { SkeletonTable } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="skeleton h-7 w-56 rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="kpi-card space-y-2">
            <div className="skeleton h-4 w-1/2 rounded" />
            <div className="skeleton h-7 w-1/3 rounded" />
          </div>
        ))}
      </div>
      <div className="card overflow-hidden">
        <SkeletonTable rows={6} cols={4} />
      </div>
    </div>
  );
}
