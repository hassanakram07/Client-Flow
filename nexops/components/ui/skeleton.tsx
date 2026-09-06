"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
}

export function Skeleton({ className, height = "h-4" }: { className?: string; height?: string }) {
  return <div className={cn("skeleton", height, "w-full rounded", className)} />;
}

export function SkeletonLines({ lines = 3, className }: SkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={i === lines - 1 ? "w-3/4" : "w-full"} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("card p-4 space-y-3", className)}>
      <Skeleton height="h-5" className="w-1/3" />
      <SkeletonLines lines={2} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden">
      <div className="flex gap-4 px-3 py-2 border-b border-[var(--border)]">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} height="h-3" className="flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-3 py-3 border-b border-[var(--border-subtle)]">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} height="h-4" className={cn("flex-1", j === 0 ? "w-2/5" : "")} />
          ))}
        </div>
      ))}
    </div>
  );
}
