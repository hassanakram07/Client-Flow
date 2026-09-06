"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  FolderOpen, FileText, Receipt, Clock,
  CheckCircle2, AlertCircle, TrendingUp,
  ArrowRight, FileCheck
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { Project, Document, Invoice, Notification } from "@/lib/types";
import {
  cn, formatCurrency, formatDate, formatRelative,
  projectStatusVariant, projectStatusLabel,
  documentApprovalVariant, documentApprovalLabel,
} from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { SkeletonCard } from "@/components/ui/skeleton";

export default function PortalDashboardPage() {
  const { user } = useAuth();
  const clientId = user?.clientId;

  const { data: projects = [], isLoading: lp } = useQuery<Project[]>({
    queryKey: ["projects", { clientId }],
    queryFn: () => fetch(`/api/projects?clientId=${clientId}`).then(r => r.json()),
    enabled: !!clientId,
  });

  const { data: documents = [], isLoading: ld } = useQuery<Document[]>({
    queryKey: ["documents"],
    queryFn: () => fetch("/api/documents").then(r => r.json()),
    enabled: !!clientId,
    select: docs => docs.filter(d =>
      projects.some(p => p.id === d.projectId)
    ),
  });

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ["invoices", { clientId }],
    queryFn: () => fetch(`/api/invoices?clientId=${clientId}`).then(r => r.json()),
    enabled: !!clientId,
  });

  const { data: notifData } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => fetch(`/api/notifications?userId=${user!.id}`).then(r => r.json()),
    enabled: !!user,
  });
  const notifications: Notification[] = notifData?.notifications ?? [];
  const unread = notifications.filter(n => !n.read);

  const pendingDocs = documents.filter(d => d.approvalStatus === "pending");
  const overdueInvoices = invoices.filter(i => i.status === "overdue");

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.fullName.split(" ")[0]}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review deliverable sign-offs, milestone progression, and billing statements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
            Client Portal Verified
          </span>
        </div>
      </div>

      {/* Actionable Executive Alert Banners */}
      {(pendingDocs.length > 0 || overdueInvoices.length > 0) && (
        <div className="space-y-3">
          {pendingDocs.length > 0 && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-950">
                    {pendingDocs.length} Deliverable{pendingDocs.length > 1 ? "s" : ""} Awaiting Executive Sign-Off
                  </p>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Your review and sign-off is required to proceed to the next milestone sprint.
                  </p>
                </div>
              </div>
              <Link
                href="/portal/documents"
                className="btn btn-sm bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold shadow-xs flex-shrink-0"
              >
                Review Deliverables →
              </Link>
            </div>
          )}

          {overdueInvoices.length > 0 && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-red-950">
                    {overdueInvoices.length} Outstanding Billing Statement
                  </p>
                  <p className="text-xs text-red-800 mt-0.5">
                    Payment is past scheduled settlement terms. Please remit payment or contact your account lead.
                  </p>
                </div>
              </div>
              <Link
                href="/portal/invoices"
                className="btn btn-sm bg-white hover:bg-red-100 text-red-900 border border-red-300 text-xs font-semibold shadow-xs flex-shrink-0"
              >
                View Invoices →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Active Projects",
            value: projects.filter(p => p.status === "active").length,
            icon: FolderOpen,
            bg: "bg-blue-50 text-blue-600 border border-blue-100",
          },
          {
            label: "Pending Approvals",
            value: pendingDocs.length,
            icon: FileCheck,
            bg: pendingDocs.length > 0 ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-slate-50 text-slate-600 border border-slate-200",
          },
          {
            label: "Billed Outstanding",
            value: formatCurrency(invoices.filter(i => i.status !== "paid" && i.status !== "cancelled").reduce((s, i) => s + i.amount, 0)),
            icon: Receipt,
            bg: "bg-indigo-50 text-indigo-600 border border-indigo-100",
          },
          {
            label: "Total Settled",
            value: formatCurrency(invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0)),
            icon: TrendingUp,
            bg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
          },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{stat.label}</span>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", stat.bg)}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 mt-3">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Active Projects Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Your Active Engagements</h2>
          <Link href="/portal/projects" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            View all projects →
          </Link>
        </div>

        {lp ? (
          <div className="grid sm:grid-cols-2 gap-4"><SkeletonCard /><SkeletonCard /></div>
        ) : projects.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
            No engagements active at this moment.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {projects.map(p => (
              <Link
                key={p.id}
                href={`/portal/projects/${p.id}`}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:shadow-md hover:border-slate-300 transition-all block group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Target Completion: {formatDate(p.dueDate)}</p>
                    </div>
                    <StatusBadge variant={projectStatusVariant(p.status)} label={projectStatusLabel(p.status)} />
                  </div>

                  {p.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{p.description}</p>
                  )}

                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-1.5 text-slate-500">
                      <span>Milestone Completion</span>
                      <span className="font-bold text-slate-800">{p.completionPercent}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${p.completionPercent}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-blue-600 font-semibold">
                    <span>Open Project Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Deliverables & Real-Time Updates Split */}
      <div className="grid sm:grid-cols-2 gap-6">

        {/* Recent Deliverables */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Deliverables & Files</h3>
            <Link href="/portal/documents" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {ld ? (
              <div className="p-4"><SkeletonCard /></div>
            ) : documents.slice(0, 4).length === 0 ? (
              <p className="text-xs text-center text-slate-400 py-8">No documents uploaded yet</p>
            ) : (
              documents.slice(0, 4).map(doc => (
                <div key={doc.id} className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 transition-colors">
                  <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{doc.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{formatRelative(doc.createdAt)}</p>
                  </div>
                  <StatusBadge variant={documentApprovalVariant(doc.approvalStatus)} label={documentApprovalLabel(doc.approvalStatus)} dot={false} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity & Notifications */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Workspace Activity</h3>
            {unread.length > 0 && (
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                {unread.length} new
              </span>
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {notifications.slice(0, 4).length === 0 ? (
              <p className="text-xs text-center text-slate-400 py-8">No notifications</p>
            ) : (
              notifications.slice(0, 4).map(n => (
                <div key={n.id} className="flex gap-3 px-6 py-3 hover:bg-slate-50 transition-colors">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 line-clamp-1">{n.body}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{formatRelative(n.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
