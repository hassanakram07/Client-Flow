"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Zap, LayoutDashboard, FolderOpen, FileText,
  Receipt, MessageSquare, Bell, LogOut, X,
  CheckCircle2, AlertCircle, Info, Clock,
} from "lucide-react";
import { cn, formatRelative } from "@/lib/utils";
import { useAuth } from "@/lib/auth/context";
import { Avatar } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Notification } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/portal/dashboard",  icon: LayoutDashboard, label: "Overview" },
  { href: "/portal/projects",   icon: FolderOpen,      label: "Projects & Tasks" },
  { href: "/portal/documents",  icon: FileText,        label: "Documents & Approvals" },
  { href: "/portal/invoices",   icon: Receipt,         label: "Invoices" },
  { href: "/portal/messages",   icon: MessageSquare,   label: "Messages" },
];

function NotifIcon({ type }: { type: Notification["type"] }) {
  const cls = "w-4 h-4";
  switch (type) {
    case "invoice_overdue":    return <AlertCircle className={cn(cls, "text-red-500")} />;
    case "document_uploaded":
    case "approval_requested": return <Clock className={cn(cls, "text-amber-500")} />;
    case "approval_done":      return <CheckCircle2 className={cn(cls, "text-emerald-500")} />;
    default:                   return <Info className={cn(cls, "text-blue-500")} />;
  }
}

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const qc = useQueryClient();
  const [showNotifs, setShowNotifs] = useState(false);

  const { data: notifData } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () =>
      user ? fetch(`/api/notifications?userId=${user.id}`).then(r => r.json()) : null,
    enabled: !!user,
    refetchInterval: 30000,
  });
  const unreadCount: number = notifData?.unreadCount ?? 0;
  const notifications: Notification[] = notifData?.notifications ?? [];

  const markAll = useMutation({
    mutationFn: () =>
      fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true, userId: user?.id }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", user?.id] }),
  });

  useEffect(() => {
    if (loading) return;
    if (!user) router.push("/login");
    else if (user.role !== "client") router.push("/admin/dashboard");
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Executive Top Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[60px] gap-6">
            
            {/* Brand Logo & Client Portal Tag */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link href="/portal/dashboard" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
                  <Zap className="w-4.5 h-4.5 fill-current text-white" strokeWidth={2} />
                </div>
                <div className="hidden sm:block">
                  <span className="text-sm font-bold text-slate-900 tracking-tight block leading-tight">NexOps</span>
                  <span className="text-[11px] font-medium text-slate-400 block leading-tight">Client Portal</span>
                </div>
              </Link>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 overflow-x-auto py-1">
              {NAV_ITEMS.map(item => {
                const active = pathname === item.href || (item.href !== "/portal/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                      active
                        ? "text-blue-700 bg-blue-50 border border-blue-200/60 shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-blue-600" : "text-slate-400")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions: Notifications & Profile */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Notification Center */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(s => !s)}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 animate-fade-up overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                      <span className="text-sm font-semibold text-slate-900">Notifications</span>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAll.mutate()}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                        <button onClick={() => setShowNotifs(false)} className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-80 divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-center text-slate-400 py-6">No notifications</p>
                      ) : notifications.map(n => (
                        <div
                          key={n.id}
                          className={cn(
                            "flex gap-3 px-4 py-3 hover:bg-slate-50 transition-colors",
                            !n.read && "bg-blue-50/40"
                          )}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            <NotifIcon type={n.type} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-xs leading-snug", !n.read ? "font-bold text-slate-900" : "text-slate-600")}>
                              {n.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                            <p className="text-[11px] text-slate-400 mt-1">{formatRelative(n.createdAt)}</p>
                          </div>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <Avatar name={user.fullName} size="sm" />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{user.fullName}</p>
                  <p className="text-[11px] font-medium text-slate-500 capitalize leading-tight">Client Executive</p>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Main Page Canvas */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
