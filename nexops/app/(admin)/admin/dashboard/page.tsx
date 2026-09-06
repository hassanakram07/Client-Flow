"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Users, FolderOpen, AlertCircle,
  TrendingUp, CheckCircle2,
  ArrowUpRight, ArrowDownRight, Plus, ExternalLink,
  Activity
} from "lucide-react";
import {
  AreaChart, Area,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import {
  cn, formatCurrency, formatRelative,
  taskStatusVariant,
  projectStatusLabel, taskStatusLabel
} from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { SkeletonCard, SkeletonTable } from "@/components/ui/skeleton";
import { Client, Project, Task, Invoice, AuditLog, User } from "@/lib/types";

// ─── Executive KPI Card ──────────────────────────────────
function KpiCard({
  label,
  value,
  delta,
  deltaType = "positive",
  icon: Icon,
  iconBg,
  iconColor,
  loading,
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: "positive" | "negative" | "neutral";
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 shadow-xs", iconBg)}>
          <Icon className={cn("w-4.5 h-4.5", iconColor)} />
        </div>
      </div>
      <div className="mt-3">
        {loading ? (
          <div className="skeleton h-8 w-24 rounded my-1" />
        ) : (
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
            {value}
          </div>
        )}
        {delta && (
          <div className="flex items-center gap-1.5 mt-2.5">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
                deltaType === "positive" && "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
                deltaType === "negative" && "bg-rose-50 text-rose-700 border border-rose-200/60",
                deltaType === "neutral"  && "bg-slate-100 text-slate-600 border border-slate-200"
              )}
            >
              {deltaType === "positive" && <ArrowUpRight className="w-3 h-3" />}
              {deltaType === "negative" && <ArrowDownRight className="w-3 h-3" />}
              {delta}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Activity item ─────────────────────────────────────
function ActivityItem({ log, users }: { log: AuditLog & { actor?: User | null }; users: User[] }) {
  const actor = log.actor ?? users.find(u => u.id === log.actorId);
  const actionLabel = log.action.replace(/\./g, " ").replace(/_/g, " ");

  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <Avatar name={actor?.fullName ?? "System"} size="sm" className="flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-900 leading-snug">
          <span className="font-semibold text-slate-900">{actor?.fullName ?? "System Automator"}</span>{" "}
          <span className="text-slate-600 capitalize">{actionLabel}</span>
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{formatRelative(log.createdAt)}</p>
      </div>
    </div>
  );
}

const DONUT_COLORS = ["#2563eb", "#f59e0b", "#10b981", "#ef4444"];

const MONTHLY_REVENUE = [
  { month: "Apr", revenue: 42000, target: 40000 },
  { month: "May", revenue: 56000, target: 45000 },
  { month: "Jun", revenue: 48000, target: 50000 },
  { month: "Jul", revenue: 71000, target: 60000 },
  { month: "Aug", revenue: 89000, target: 70000 },
  { month: "Sep", revenue: 67000, target: 65000 },
];

export default function AdminDashboardPage() {
  const { data: clients = [], isLoading: lc } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: () => fetch("/api/clients").then(r => r.json()),
  });
  const { data: projects = [], isLoading: lp } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => fetch("/api/projects").then(r => r.json()),
  });
  const { data: tasks = [], isLoading: lt } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => fetch("/api/tasks").then(r => r.json()),
  });
  const { data: invoices = [], isLoading: li } = useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: () => fetch("/api/invoices").then(r => r.json()),
  });
  const { data: auditLogs = [], isLoading: la } = useQuery<(AuditLog & { actor?: User | null })[]>({
    queryKey: ["audit-logs"],
    queryFn: () => fetch("/api/audit-logs").then(r => r.json()),
  });

  const loading = lc || lp || lt || li;

  const activeProjects = projects.filter(p => p.status === "active").length;
  const openTasks = tasks.filter(t => t.status !== "done").length;
  const overdueInvoices = invoices.filter(i => i.status === "overdue").length;
  const totalRevenue = invoices
    .filter(i => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);

  // Status breakdown
  const statusBreakdown = ["active", "on_hold", "completed", "cancelled"].map((s, idx) => ({
    name: projectStatusLabel(s),
    value: projects.filter(p => p.status === s).length,
    color: DONUT_COLORS[idx % DONUT_COLORS.length],
  })).filter(d => d.value > 0);

  const recentTasks = tasks
    .filter(t => t.status !== "done")
    .slice(0, 5)
    .map(t => ({
      ...t,
      project: projects.find(p => p.id === t.projectId) ?? null,
    }));

  const recentLogs = auditLogs.slice(0, 6);

  const upcomingProjects = projects
    .filter(p => p.status === "active")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4)
    .map(p => ({
      ...p,
      client: clients.find(c => c.id === p.clientId),
    }));

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-[1500px] mx-auto">
      {/* Executive Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Executive Operations Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time client portfolio health, workflow execution, and cashflow status for Meridian Agency.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/admin/clients"
            className="btn btn-secondary text-xs font-semibold shadow-xs"
          >
            <Users className="w-4 h-4 text-slate-500" />
            <span>Manage Clients</span>
          </Link>
          <Link
            href="/admin/projects"
            className="btn btn-primary text-xs font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Active Clients"
          value={clients.filter(c => c.status === "active").length}
          delta="+100% vs prev quarter"
          deltaType="positive"
          icon={Users}
          iconBg="bg-blue-50 text-blue-600 border border-blue-100"
          iconColor="text-blue-600"
          loading={loading}
        />
        <KpiCard
          label="Active Engagements"
          value={activeProjects}
          delta="3 on track · 1 review"
          deltaType="neutral"
          icon={FolderOpen}
          iconBg="bg-indigo-50 text-indigo-600 border border-indigo-100"
          iconColor="text-indigo-600"
          loading={loading}
        />
        <KpiCard
          label="Deliverable Tasks"
          value={openTasks}
          delta="2 critical priority"
          deltaType="negative"
          icon={CheckCircle2}
          iconBg="bg-amber-50 text-amber-600 border border-amber-100"
          iconColor="text-amber-600"
          loading={loading}
        />
        <KpiCard
          label="Overdue Invoices"
          value={overdueInvoices}
          delta={overdueInvoices > 0 ? "Requires collection" : "Zero arrears"}
          deltaType={overdueInvoices > 0 ? "negative" : "positive"}
          icon={AlertCircle}
          iconBg="bg-rose-50 text-rose-600 border border-rose-100"
          iconColor="text-rose-600"
          loading={loading}
        />
        <KpiCard
          label="Settled Revenue"
          value={formatCurrency(totalRevenue)}
          delta="+24.5% vs target"
          deltaType="positive"
          icon={TrendingUp}
          iconBg="bg-emerald-50 text-emerald-600 border border-emerald-100"
          iconColor="text-emerald-600"
          loading={loading}
        />
      </div>

      {/* Analytics & Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Performance Chart */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs lg:col-span-2 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Revenue Performance</h2>
              <p className="text-xs text-slate-500 mt-0.5">Trailing 6-month agency revenue vs target</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                <span className="text-slate-600">Actual Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                <span className="text-slate-400">Target</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={MONTHLY_REVENUE} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.75rem",
                    boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.1)",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                  formatter={(v) => [formatCurrency(Number(v)), "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status Donut Chart */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Project Status Ratio</h2>
            <p className="text-xs text-slate-500 mt-0.5">Breakdown by current lifecycle stage</p>
          </div>
          <div className="p-6 flex flex-col items-center justify-center">
            {loading ? (
              <div className="skeleton h-32 w-32 rounded-full" />
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="w-full space-y-2 mt-2 pt-2 border-t border-slate-100">
              {statusBreakdown.map(s => {
                const total = projects.length || 1;
                const pct = Math.round((s.value / total) * 100);
                return (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="font-medium text-slate-700">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-semibold text-slate-900">{s.value}</span>
                      <span className="text-slate-400">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tables & Action Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Open Priority Tasks */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Active Deliverable Tasks</h2>
              <p className="text-xs text-slate-500 mt-0.5">Assigned work currently in progress</p>
            </div>
            <Link href="/admin/projects" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <span>View all projects</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <SkeletonTable rows={4} cols={3} />
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Task & Project</th>
                    <th>Status</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTasks.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center text-xs text-slate-400 py-8">
                        All tasks completed
                      </td>
                    </tr>
                  ) : (
                    recentTasks.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="max-w-xs">
                          <p className="font-medium text-xs text-slate-900 truncate">{t.title}</p>
                          {t.project && (
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{t.project.name}</p>
                          )}
                        </td>
                        <td>
                          <StatusBadge variant={taskStatusVariant(t.status)} label={taskStatusLabel(t.status)} />
                        </td>
                        <td>
                          <span className={cn(
                            "text-xs font-semibold px-2 py-0.5 rounded-md",
                            t.priority === "critical" ? "bg-red-50 text-red-700 border border-red-200" :
                            t.priority === "high"     ? "bg-amber-50 text-amber-700 border border-amber-200" :
                            "bg-slate-100 text-slate-600"
                          )}>
                            {t.priority}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming Project Milestones */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Delivery Milestones</h2>
              <p className="text-xs text-slate-500 mt-0.5">Upcoming engagement completion dates</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-6"><SkeletonCard /></div>
            ) : upcomingProjects.length === 0 ? (
              <p className="text-xs text-center text-slate-400 py-8">No active milestones</p>
            ) : (
              upcomingProjects.map(p => (
                <div key={p.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/70 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{p.client?.companyName ?? "Corporate Client"}</p>
                  </div>
                  <div className="text-right flex-shrink-0 w-36">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-slate-400 text-[11px]">Due {new Date(p.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      <span className="font-mono font-bold text-slate-800 text-[11px]">{p.completionPercent}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${p.completionPercent}%` }} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Audit Activity Stream */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Audit Trail & Security Stream</h2>
          </div>
          <Link href="/admin/audit-log" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            View full log →
          </Link>
        </div>
        <div className="p-6">
          {la ? (
            <SkeletonCard />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              {recentLogs.map(log => (
                <ActivityItem key={log.id} log={log} users={[]} />
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
