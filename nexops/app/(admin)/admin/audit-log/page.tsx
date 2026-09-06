"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ShieldCheck } from "lucide-react";
import { AuditLog, User } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { SkeletonTable } from "@/components/ui/skeleton";

type EnrichedLog = AuditLog & { actor?: User | null };

const ACTION_COLORS: Record<string, string> = {
  "document.approved":   "bg-emerald-50 text-emerald-700 border-emerald-200",
  "document.rejected":   "bg-rose-50 text-rose-700 border-rose-200",
  "invoice.sent":        "bg-blue-50 text-blue-700 border-blue-200",
  "workflow.triggered":  "bg-indigo-50 text-indigo-700 border-indigo-200",
  "workflow.success":    "bg-emerald-50 text-emerald-700 border-emerald-200",
  "task.status_changed": "bg-amber-50 text-amber-700 border-amber-200",
};

export default function AuditLogPage() {
  const [search, setSearch] = useState("");

  const { data: logs = [], isLoading } = useQuery<EnrichedLog[]>({
    queryKey: ["audit-logs"],
    queryFn: () => fetch("/api/audit-logs").then(r => r.json()),
  });

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.resourceType.toLowerCase().includes(search.toLowerCase()) ||
    (l.actor?.fullName ?? "system").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-[1500px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Enterprise Compliance & Audit Trail</h1>
          <p className="text-sm text-slate-500 mt-1">
            Cryptographically sealed operational audit events for SOC-2 compliance and security forensics.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Immutable Ledger Active (UTC)</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className="input pl-9 text-xs"
            placeholder="Search audit trail by actor, action, or resource…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Showing {filtered.length} log events
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={8} cols={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp (UTC)</th>
                  <th>Actor / Origin</th>
                  <th>Event Action</th>
                  <th>Target Resource</th>
                  <th>State Differential</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-xs text-slate-400 py-12">
                      No matching audit records found
                    </td>
                  </tr>
                ) : (
                  filtered.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="font-mono text-xs text-slate-500 whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {log.actor ? (
                            <>
                              <Avatar name={log.actor.fullName} size="xs" />
                              <span className="text-xs font-semibold text-slate-900">{log.actor.fullName}</span>
                            </>
                          ) : (
                            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              System Orchestrator
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={cn(
                          "inline-block text-xs font-mono font-semibold px-2 py-0.5 rounded-md border",
                          ACTION_COLORS[log.action] ?? "bg-slate-100 text-slate-700 border-slate-200"
                        )}>
                          {log.action}
                        </span>
                      </td>
                      <td className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-800">{log.resourceType}</span>
                        <span className="text-slate-400 font-mono ml-1.5 text-[11px]">#{log.resourceId.slice(-6)}</span>
                      </td>
                      <td className="max-w-xs">
                        {log.diff ? (
                          <div className="space-y-1">
                            {Object.entries(log.diff).map(([field, change]) => (
                              <div key={field} className="text-[11px] font-mono flex items-center gap-1.5 text-slate-600">
                                <span className="text-slate-400">{field}:</span>
                                <span className="line-through text-red-500 bg-red-50 px-1 rounded">{String(change.before ?? "null")}</span>
                                <span>→</span>
                                <span className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded">{String(change.after ?? "null")}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs font-mono">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
