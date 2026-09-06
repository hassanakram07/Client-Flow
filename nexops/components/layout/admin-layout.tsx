"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Zap, LayoutDashboard, Users, FolderOpen, UserSquare2,
  GitBranch, ScrollText, Bell, Search, ChevronLeft,
  ChevronRight, LogOut, X, CheckCircle2,
  AlertCircle, Info, Clock, ExternalLink,
} from "lucide-react";
import { cn, formatRelative } from "@/lib/utils";
import { useAuth } from "@/lib/auth/context";
import { Avatar } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Notification } from "@/lib/types";

const NAV_GROUPS = [
  {
    title: "Core Operations",
    items: [
      { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/admin/clients",   icon: Users,            label: "Clients" },
      { href: "/admin/projects",  icon: FolderOpen,       label: "Projects" },
      { href: "/admin/team",      icon: UserSquare2,      label: "Team" },
    ],
  },
  {
    title: "Automation & Compliance",
    items: [
      { href: "/admin/workflows", icon: GitBranch,        label: "Workflows" },
      { href: "/admin/audit-log", icon: ScrollText,       label: "Audit Log" },
    ],
  },
];

function NotifIcon({ type }: { type: Notification["type"] }) {
  const cls = "w-4 h-4";
  switch (type) {
    case "invoice_overdue":   return <AlertCircle className={cn(cls, "text-red-500")} />;
    case "approval_requested":
    case "document_uploaded": return <Clock className={cn(cls, "text-amber-500")} />;
    case "approval_done":     return <CheckCircle2 className={cn(cls, "text-emerald-500")} />;
    default:                  return <Info className={cn(cls, "text-blue-500")} />;
  }
}

function NotificationDropdown({ userId, onClose }: { userId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () =>
      fetch(`/api/notifications?userId=${userId}`).then(r => r.json()),
    refetchInterval: 15000,
  });

  const markAll = useMutation({
    mutationFn: () =>
      fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true, userId }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", userId] }),
  });

  const notifications: Notification[] = data?.notifications ?? [];
  const unread = data?.unreadCount ?? 0;

  return (
    <div className="absolute right-0 top-full mt-2 w-84 bg-white border border-slate-200 rounded-xl shadow-xl z-50 animate-fade-up overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">Notifications</span>
          {unread > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-bold leading-none">
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button
              onClick={() => markAll.mutate()}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="overflow-y-auto max-h-80 divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No notifications</p>
        ) : (
          notifications.map(n => (
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
                <p className={cn("text-xs leading-snug", n.read ? "text-slate-600" : "text-slate-900 font-semibold")}>
                  {n.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                <p className="text-[11px] text-slate-400 mt-1">{formatRelative(n.createdAt)}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const { data: notifData } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () =>
      user ? fetch(`/api/notifications?userId=${user.id}`).then(r => r.json()) : null,
    enabled: !!user,
    refetchInterval: 30000,
  });
  const unreadCount: number = notifData?.unreadCount ?? 0;

  useEffect(() => {
    if (loading) return;
    if (!user) router.push("/login");
    else if (user.role === "client") router.push("/portal/dashboard");
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-200 flex-shrink-0 select-none",
          collapsed ? "w-16" : "w-[240px]"
        )}
      >
        {/* Brand Header */}
        <div className={cn("flex items-center h-[60px] px-4 border-b border-slate-100", collapsed && "justify-center px-0")}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 flex-shrink-0">
              <Zap className="w-4.5 h-4.5 fill-current text-white" strokeWidth={2} />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="text-sm font-bold text-slate-900 tracking-tight block leading-tight">NexOps</span>
                <span className="text-[11px] font-medium text-slate-400 block leading-tight truncate">Meridian Agency HQ</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation items grouped */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {NAV_GROUPS.map(group => (
            <div key={group.title} className="space-y-1">
              {!collapsed && (
                <p className="px-2 pb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {group.title}
                </p>
              )}
              {group.items.map(item => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      active
                        ? "bg-blue-50 text-blue-700 font-semibold shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80",
                      collapsed && "justify-center px-0 py-2.5"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className={cn("w-4.5 h-4.5 flex-shrink-0", active ? "text-blue-600" : "text-slate-400")} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Workspace info & Collapse toggle */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          {!collapsed && (
            <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-500 flex items-center justify-between">
              <span className="font-medium text-slate-700">Enterprise Plan</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">Active</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors",
              collapsed && "justify-center px-0"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse menu</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex-shrink-0 h-[60px] border-b border-slate-200 bg-white flex items-center px-6 gap-4">
          {/* Global Search Bar */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clients, projects, tasks…"
              className="w-full pl-9 pr-12 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              id="input-global-search"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border border-slate-200 bg-white text-slate-400">
              ⌘K
            </kbd>
          </div>

          <div className="flex-1" />

          {/* Quick External Portal Link */}
          <Link
            href="/portal/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors px-2 py-1 rounded-md hover:bg-slate-50"
            title="Preview Client View"
          >
            <span>Client Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(s => !s)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
              aria-label="Notifications"
              id="btn-notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {showNotifs && user && (
              <NotificationDropdown
                userId={user.id}
                onClose={() => setShowNotifs(false)}
              />
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <Avatar name={user.fullName} size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">{user.fullName}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-[11px] font-medium text-slate-500 capitalize leading-tight">{user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
              aria-label="Sign out"
              id="btn-logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
