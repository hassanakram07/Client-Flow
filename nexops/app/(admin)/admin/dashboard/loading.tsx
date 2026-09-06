import { SkeletonTable, SkeletonCard } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="skeleton h-6 w-48 rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[1,2,3,4,5].map(i => <div key={i} className="kpi-card"><div className="skeleton h-5 w-1/2 rounded" /><div className="skeleton h-7 w-1/3 rounded mt-2" /></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2 p-4"><div className="skeleton h-40 w-full rounded" /></div>
        <SkeletonCard />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card overflow-hidden"><SkeletonTable rows={5} cols={3} /></div>
        <SkeletonCard />
      </div>
    </div>
  );
}
