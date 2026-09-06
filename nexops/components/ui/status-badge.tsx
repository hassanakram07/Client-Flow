"use client";

import { cn } from "@/lib/utils";
import type { StatusVariant } from "@/lib/utils";

interface StatusBadgeProps {
  variant: StatusVariant;
  label: string;
  dot?: boolean;
  className?: string;
}

const DOT_COLORS: Record<StatusVariant, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger:  "bg-rose-500",
  info:    "bg-blue-500",
  neutral: "bg-slate-400",
};

export function StatusBadge({ variant, label, dot = true, className }: StatusBadgeProps) {
  if (!label) {
    return (
      <span className={cn("inline-flex items-center justify-center p-1 rounded-full", className)}>
        <span className={cn("w-2 h-2 rounded-full", DOT_COLORS[variant])} />
      </span>
    );
  }

  return (
    <span className={cn("status-badge font-medium", variant, className)}>
      {dot && (
        <span className={cn("inline-block w-1.5 h-1.5 rounded-full flex-shrink-0", DOT_COLORS[variant])} />
      )}
      <span>{label}</span>
    </span>
  );
}
