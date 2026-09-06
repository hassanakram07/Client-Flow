"use client";

import { cn } from "@/lib/utils";
import { getUserInitials } from "@/lib/auth/helpers";

interface AvatarProps {
  name: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  xs: "w-6 h-6 text-xs",
  sm: "w-7 h-7 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
};

const COLORS = [
  "bg-blue-100 text-blue-700 border border-blue-200/80",
  "bg-indigo-100 text-indigo-700 border border-indigo-200/80",
  "bg-emerald-100 text-emerald-700 border border-emerald-200/80",
  "bg-violet-100 text-violet-700 border border-violet-200/80",
  "bg-amber-100 text-amber-800 border border-amber-200/80",
  "bg-rose-100 text-rose-700 border border-rose-200/80",
];

function getColorIndex(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return Math.abs(hash) % COLORS.length;
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const color = COLORS[getColorIndex(name || "User")];
  return (
    <div
      className={cn(
        "rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center font-sans font-semibold tracking-tight shadow-2xs",
        SIZE_CLASSES[size],
        color,
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="no-select select-none">{getUserInitials(name || "U")}</span>
      )}
    </div>
  );
}

export function AvatarGroup({
  users,
  max = 3,
  size = "sm",
}: {
  users: { name: string; src?: string }[];
  max?: number;
  size?: "xs" | "sm" | "md";
}) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;
  return (
    <div className="flex -space-x-1.5 items-center">
      {visible.map((u, i) => (
        <Avatar
          key={i}
          name={u.name}
          src={u.src}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            "rounded-full flex items-center justify-center font-sans text-xs font-semibold ring-2 ring-white",
            "bg-slate-100 text-slate-600 border border-slate-200",
            SIZE_CLASSES[size]
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
