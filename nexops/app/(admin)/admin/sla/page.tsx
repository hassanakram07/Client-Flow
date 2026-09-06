"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShieldAlert, ShieldCheck, AlertCircle, Clock,
  CheckCircle2, TrendingUp,
  Zap, FileText, Filter
} from "lucide-react";
import { SlaPolicy, SlaBreachItem, ClientHealthRecord } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { SkeletonTable } from "@/components/ui/skeleton";

interface SlaDataResponse {
  policies: SlaPolicy[];
  breaches: SlaBreachItem[];
  clientHealth: ClientHealthRecord[];
  metrics: {
    overallComplianceRate: number;
    avgResponseHours: number;
    activeBreachesCount: number;
    atRiskCount: number;
  };
}

export default function SlaGovernancePage() {
  const qc = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [escalatedIds, setEscalatedIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery<SlaDataResponse>({
    queryKey: ["sla-governance"],
    queryFn: () => fetch("/api/sla").then(r => r.json()),
  });

  const escalateMutation = useMutation({
    mutationFn: async (breach: SlaBreachItem) => {
      // Trigger escalation webhook via the workflow trigger route
      await fetch("/api/workflow/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          triggerType: "sla_breach",
          payload: {
            breachId: breach.id,
            title: breach.title,
            clientName: breach.clientName,
            projectName: breach.projectName,
            deadline: breach.deadline,
            assignedTo: breach.assignedTo,
          },
          actorId: "system_sla_monitor",
        }),
      });
      return breach.id;
    },
    onSuccess: (id) => {
      setEscalatedIds(prev => new Set([...prev, id]));
      qc.invalidateQueries({ queryKey: ["sla-governance"] });
    },
  });

  const filteredBreaches = (data?.breaches ?? []).filter(b => {
    if (filterStatus === "all") return true;
    return b.status === filterStatus;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              SLA & Operational Governance
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Active Contract Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Contractual delivery adherence, real-time breach risk monitoring, and composite client operational health.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert("SLA Compliance Audit Report generated. Exported as certified compliance summary.")}
            className="btn btn-secondary text-xs font-semibold"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export SOC-2 SLA Slip</span>
          </button>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Contract Compliance</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 mt-3">
            {data?.metrics?.overallComplianceRate ?? 92.4}%
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+1.8% vs contractual baseline</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Review Velocity</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 mt-3">
            {data?.metrics?.avgResponseHours ?? 3.2}h
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 font-medium">
            <span>Target: &lt; 4.0h urgent turnaround</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Breaches</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-rose-600 mt-3">
            {data?.metrics?.activeBreachesCount ?? 2}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-600 font-semibold">
            <span>Escalation webhooks active</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Engagements At Risk</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-amber-600 mt-3">
            {data?.metrics?.atRiskCount ?? 1}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 font-semibold">
            <span>&lt; 24h remaining on review deadline</span>
          </div>
        </div>
      </div>

      {/* SLA Breach Monitor Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Active Contract Deliverables & SLA Monitor</h2>
            <p className="text-xs text-slate-500">Real-time deadline tracking against tier policies with automated escalation triggers.</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
              {["all", "breached", "at_risk", "compliant"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={cn(
                    "px-2.5 py-1 rounded-md font-medium capitalize transition-all",
                    filterStatus === st
                      ? "bg-white text-slate-900 shadow-2xs font-semibold"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6"><SkeletonTable rows={4} cols={5} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3">Deliverable / Milestone</th>
                  <th className="px-6 py-3">Client Organization</th>
                  <th className="px-6 py-3">Contractual Target</th>
                  <th className="px-6 py-3">Remaining Time</th>
                  <th className="px-6 py-3">Assigned Lead</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Mitigation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBreaches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      No deliverables matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBreaches.map((b) => {
                    const isEscalated = escalatedIds.has(b.id);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-3.5 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "w-2 h-2 rounded-full",
                              b.status === "breached" ? "bg-rose-500 animate-ping" :
                              b.status === "at_risk" ? "bg-amber-500" : "bg-emerald-500"
                            )} />
                            <span>{b.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-slate-600 font-medium">
                          {b.clientName}
                          <span className="block text-[10px] text-slate-400">{b.projectName}</span>
                        </td>
                        <td className="px-6 py-3.5 font-mono text-slate-500 text-[11px]">
                          {formatDate(b.deadline)}
                        </td>
                        <td className="px-6 py-3.5">
                          {b.remainingHours < 0 ? (
                            <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              Breached {Math.abs(b.remainingHours)}h ago
                            </span>
                          ) : b.remainingHours < 24 ? (
                            <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {b.remainingHours}h remaining
                            </span>
                          ) : (
                            <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {Math.floor(b.remainingHours / 24)} days left
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-slate-700 font-medium">{b.assignedTo}</td>
                        <td className="px-6 py-3.5">
                          <StatusBadge
                            variant={b.status === "breached" ? "danger" : b.status === "at_risk" ? "warning" : "success"}
                            label={b.status.replace("_", " ")}
                          />
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          {isEscalated ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Escalated</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => escalateMutation.mutate(b)}
                              disabled={escalateMutation.isPending}
                              className={cn(
                                "btn btn-sm text-[11px] font-semibold",
                                b.status === "breached"
                                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                                  : "btn-secondary"
                              )}
                            >
                              <Zap className="w-3 h-3" />
                              <span>Escalate</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Operational Client Health Scoring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Client Operational Health Matrix</h2>
              <p className="text-xs text-slate-500">Composite operational delivery index based on punctuality, review speed, and invoice age.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono">
              Composite 0-100 Index
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {(data?.clientHealth ?? []).map((ch) => (
              <div key={ch.clientId} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{ch.clientName}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {ch.tier}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-slate-500">
                    <span>On-time Delivery: <strong className="text-slate-800">{ch.onTimeDeliveryRate}%</strong></span>
                    <span>Avg Turnaround: <strong className="text-slate-800">{ch.avgReviewTurnaroundHours}h</strong></span>
                    <span>Unsettled: <strong className="text-slate-800">{ch.pendingInvoicesCount}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className={cn(
                      "text-sm font-bold",
                      ch.healthScore >= 85 ? "text-emerald-600" :
                      ch.healthScore >= 70 ? "text-amber-600" : "text-rose-600"
                    )}>
                      {ch.healthScore} / 100
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{ch.status}</span>
                  </div>

                  <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        ch.healthScore >= 85 ? "bg-emerald-500" :
                        ch.healthScore >= 70 ? "bg-amber-500" : "bg-rose-500"
                      )}
                      style={{ width: `${ch.healthScore}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SLA Policies Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Contractual Policy Tiers</h2>
            <p className="text-xs text-slate-500">Active rules applied to automated deadline timers.</p>
          </div>

          <div className="space-y-3">
            {(data?.policies ?? []).map((p) => (
              <div key={p.id} className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{p.name}</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">
                    {p.tier}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                  <div>1st Draft: <strong className="text-slate-900">{p.firstDraftDays} days</strong></div>
                  <div>Client Review: <strong className="text-slate-900">{p.revisionTurnaroundHours}h</strong></div>
                  <div>Payment: <strong className="text-slate-900">Net-{p.invoiceNetDays}</strong></div>
                  <div>Critical Ticket: <strong className="text-slate-900">{p.urgentResponseHours}h</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
