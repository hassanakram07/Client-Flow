"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus, Play, Pause, Trash2, X,
  Zap, ChevronDown, ChevronRight, ArrowRight,
  Activity, CheckCircle2, Eye, Terminal, Sparkles
} from "lucide-react";
import { Workflow, WorkflowTrigger, WorkflowAction, WorkflowRun } from "@/lib/types";
import { cn, formatDate, formatRelative } from "@/lib/utils";
import { SkeletonTable } from "@/components/ui/skeleton";

const TRIGGER_LABELS: Record<WorkflowTrigger, string> = {
  task_status_change:   "Task Status Changes",
  new_document_upload:  "Client Document Uploaded",
  invoice_overdue:      "Invoice Past Due Date",
  approval_given:       "Document Approved by Client",
  approval_denied:      "Document Rejected with Notes",
  sla_breach:           "SLA Response Timer Breached",
  new_message:          "New Portal Message Received",
  project_created:      "New Project Initialized",
  project_completed:    "Project Marked Completed",
};

const ACTION_LABELS: Record<WorkflowAction, string> = {
  notify_user:      "Send in-app push notification",
  create_task:      "Generate deliverable task",
  update_status:    "Update project lifecycle status",
  send_email:       "Dispatch transactional email",
  dispatch_webhook: "Trigger external webhook (n8n / Slack)",
};

const SAMPLE_PAYLOADS: Record<string, Record<string, unknown>> = {
  new_document_upload: {
    documentId: "doc_live_test",
    name: "Enterprise Brand Guidelines v2.pdf",
    projectId: "proj_halcyon_brand",
    uploadedBy: "Marcus Webb",
    sizeBytes: 4200000,
    approvalStatus: "pending",
  },
  invoice_overdue: {
    invoiceId: "inv_live_test",
    invoiceNumber: "INV-2026-0099",
    clientId: "client_bloom",
    amount: 14000,
    currency: "USD",
    daysOverdue: 5,
  },
  task_status_change: {
    taskId: "task_live_test",
    title: "Checkout funnel integration QA",
    projectId: "proj_bloom_ecomm",
    status: "blocked",
    previousStatus: "in_progress",
    assignedTo: "Marcus Webb",
  },
  approval_given: {
    documentId: "doc_001",
    name: "Logo Concepts v1",
    approvedBy: "Ethan Blackwell",
    clientOrg: "Halcyon Ventures",
  },
  sla_breach: {
    breachId: "sla_live_test",
    title: "Review turnaround SLA threshold breached",
    clientName: "Strata Real Estate",
    hoursOverdue: 6,
  },
};

const wfSchema = z.object({
  name: z.string().min(2, "Workflow name is required"),
  description: z.string().optional(),
  triggerType: z.string().min(1, "Please select an event trigger"),
  isActive: z.boolean(),
});
type WFForm = z.infer<typeof wfSchema>;

function WorkflowCard({ workflow, onToggle, onDelete }: {
  workflow: Workflow;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs hover:border-slate-300 transition-all overflow-hidden">
      <div className="p-5 flex items-start gap-4">
        <button
          onClick={onToggle}
          className={cn(
            "p-2.5 rounded-lg transition-all flex-shrink-0 mt-0.5",
            workflow.isActive
              ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200"
              : "bg-slate-100 text-slate-400 hover:bg-slate-200 border border-slate-200"
          )}
          title={workflow.isActive ? "Deactivate workflow" : "Activate workflow"}
        >
          {workflow.isActive ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-slate-900">{workflow.name}</h3>
            <span className={cn(
              "text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-semibold",
              workflow.isActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-500 border border-slate-200"
            )}>
              {workflow.isActive ? "Live · Listening" : "Paused"}
            </span>
          </div>
          {workflow.description && (
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{workflow.description}</p>
          )}

          {/* Trigger → Action Summary Flow */}
          <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200/80 text-blue-700 font-medium">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>{TRIGGER_LABELS[workflow.triggerType] ?? workflow.triggerType}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
            <div className="flex items-center gap-1.5 flex-wrap">
              {workflow.actions.map((act, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium"
                >
                  {ACTION_LABELS[act.type] ?? act.type}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Inspect Conditions & Pipelines"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete workflow"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/60 space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Rule Evaluation Conditions ({workflow.conditions.length})
            </h4>
            {workflow.conditions.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No gating conditions. Fires unconditionally upon event trigger.</p>
            ) : (
              <div className="space-y-1.5">
                {workflow.conditions.map((cond, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-mono bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-blue-600 font-bold">{cond.field}</span>
                    <span className="text-slate-400">{cond.operator}</span>
                    <span className="text-slate-900 font-bold bg-slate-100 px-1.5 py-0.5 rounded">{String(cond.value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Downstream Action Pipelines ({workflow.actions.length})
            </h4>
            <div className="space-y-2">
              {workflow.actions.map((act, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800">{ACTION_LABELS[act.type] ?? act.type}</span>
                  </div>
                  {act.params && Object.keys(act.params).length > 0 && (
                    <span className="font-mono text-[11px] text-slate-400 truncate max-w-xs">
                      {JSON.stringify(act.params)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkflowsPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"rules" | "runs">("rules");
  const [showNew, setShowNew] = useState(false);
  const [simulateModal, setSimulateModal] = useState(false);
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);

  // Simulation Form State
  const [simTrigger, setSimTrigger] = useState<WorkflowTrigger>("new_document_upload");
  const [simPayloadStr, setSimPayloadStr] = useState<string>(
    JSON.stringify(SAMPLE_PAYLOADS.new_document_upload, null, 2)
  );
  const [simResult, setSimResult] = useState<{ count: number; runs: WorkflowRun[] } | null>(null);

  const { data: workflows = [], isLoading: loadingWorkflows } = useQuery<Workflow[]>({
    queryKey: ["workflows"],
    queryFn: () => fetch("/api/workflows").then(r => r.json()),
  });

  const { data: runs = [], isLoading: loadingRuns } = useQuery<WorkflowRun[]>({
    queryKey: ["workflow-runs"],
    queryFn: () => fetch("/api/workflows/runs").then(r => r.json()),
    refetchInterval: 10000,
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<WFForm>({
    resolver: zodResolver(wfSchema),
    defaultValues: { isActive: true, triggerType: "task_status_change" },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      fetch(`/api/workflows/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workflows"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/workflows/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workflows"] }),
  });

  const createMutation = useMutation({
    mutationFn: (data: WFForm) =>
      fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          conditions: [],
          actions: [{ type: "notify_user", params: { role: "admin", message: `Workflow trigger: ${data.name}` } }],
        }),
      }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workflows"] });
      setShowNew(false);
      reset();
    },
  });

  const simulateMutation = useMutation({
    mutationFn: async () => {
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(simPayloadStr);
      } catch {
        throw new Error("Invalid JSON in test payload");
      }
      const res = await fetch("/api/workflow/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          triggerType: simTrigger,
          payload: parsedPayload,
          actorId: "system_simulator",
        }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      setSimResult(data);
      qc.invalidateQueries({ queryKey: ["workflow-runs"] });
    },
  });

  const handleSimTriggerChange = (t: WorkflowTrigger) => {
    setSimTrigger(t);
    setSimPayloadStr(JSON.stringify(SAMPLE_PAYLOADS[t] || { sampleKey: "sampleValue" }, null, 2));
    setSimResult(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Workflow Studio & Automation
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Orchestration Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rule-based pipeline automations reacting to project milestones, deliverable sign-offs, and webhook relays.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSimResult(null);
              setSimulateModal(true);
            }}
            className="btn btn-secondary text-xs font-semibold"
          >
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>Simulate Event Trigger</span>
          </button>
          <button
            onClick={() => setShowNew(true)}
            className="btn btn-primary text-xs font-semibold"
            id="btn-new-workflow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Workflow</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs & Overview Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
          <button
            onClick={() => setActiveTab("rules")}
            className={cn(
              "px-4 py-1.5 rounded-md font-semibold transition-all",
              activeTab === "rules"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            Active Rules ({workflows.length})
          </button>
          <button
            onClick={() => setActiveTab("runs")}
            className={cn(
              "px-4 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5",
              activeTab === "runs"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>Execution Runs ({runs.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-500">
          <span>Active: <strong className="text-emerald-700">{workflows.filter(w => w.isActive).length}</strong></span>
          <span>Success SLA: <strong className="text-slate-900">99.8%</strong></span>
          <span>Webhook Dispatcher: <strong className="text-blue-700 font-mono">n8n / Slack</strong></span>
        </div>
      </div>

      {/* TAB 1: WORKFLOW RULES */}
      {activeTab === "rules" && (
        <div className="space-y-4">
          {loadingWorkflows ? (
            <div className="space-y-3"><SkeletonTable rows={3} cols={3} /></div>
          ) : workflows.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
              No workflows configured. Click &quot;New Workflow&quot; to initialize automation pipelines.
            </div>
          ) : (
            workflows.map((wf) => (
              <WorkflowCard
                key={wf.id}
                workflow={wf}
                onToggle={() => toggleMutation.mutate({ id: wf.id, isActive: !wf.isActive })}
                onDelete={() => deleteMutation.mutate(wf.id)}
              />
            ))
          )}
        </div>
      )}

      {/* TAB 2: EXECUTION RUNS OBSERVABILITY */}
      {activeTab === "runs" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Live Execution Runs & Trace History</h2>
              <p className="text-xs text-slate-500">Complete immutable record of all automated triggers and webhook dispatches.</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Auto-refresh active (10s)</span>
          </div>

          {loadingRuns ? (
            <div className="p-6"><SkeletonTable rows={5} cols={5} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-6 py-3">Run ID</th>
                    <th className="px-6 py-3">Event Trigger</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Dispatched Pipeline</th>
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {runs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                        No workflow runs recorded yet. Use &quot;Simulate Event Trigger&quot; to test.
                      </td>
                    </tr>
                  ) : (
                    runs.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-3.5 font-mono text-slate-500 font-semibold">{r.id}</td>
                        <td className="px-6 py-3.5 font-bold text-slate-900">
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-mono text-[11px]">
                            {String(r.payload?.triggerType || "task_status_change")}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={cn(
                            "text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold",
                            r.status === "success"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : r.status === "skipped"
                              ? "bg-slate-100 text-slate-600 border border-slate-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          )}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-600 font-medium">
                          {String(r.result?.workflowName ?? "Automated Orchestration Relay")}
                        </td>
                        <td className="px-6 py-3.5 font-mono text-slate-500 text-[11px]">
                          {formatRelative(r.ranAt)}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <button
                            onClick={() => setSelectedRun(r)}
                            className="btn btn-sm btn-secondary text-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Trace</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Trace Drawer Modal */}
      {selectedRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Execution Trace: {selectedRun.id}</h3>
              </div>
              <button onClick={() => setSelectedRun(null)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-700 uppercase">{selectedRun.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Executed At:</span>
                <span className="text-slate-900">{formatDate(selectedRun.ranAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Trigger Origin:</span>
                <span className="text-slate-900">{selectedRun.triggeredBy}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700">Event Input Payload:</span>
              <pre className="bg-slate-950 text-slate-100 p-3 rounded-xl text-[11px] font-mono overflow-x-auto">
                {JSON.stringify(selectedRun.payload, null, 2)}
              </pre>
            </div>

            {selectedRun.result && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700">Execution Diagnostics:</span>
                <pre className="bg-slate-950 text-slate-100 p-3 rounded-xl text-[11px] font-mono overflow-x-auto">
                  {JSON.stringify(selectedRun.result, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end">
              <button onClick={() => setSelectedRun(null)} className="btn btn-primary text-xs font-semibold">
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulator Modal */}
      {simulateModal && (
        <div className="modal-backdrop">
          <div className="modal-card max-w-xl">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="modal-title">Simulate Live Event Trigger</h3>
              </div>
              <button onClick={() => setSimulateModal(false)} className="modal-close"><X className="w-4 h-4" /></button>
            </div>

            <div className="modal-body space-y-4">
              <p className="text-xs text-slate-500">
                Trigger real-time workflow condition evaluation, push notification fan-out, and n8n webhook relay dispatch without altering production database state.
              </p>

              <div className="form-group">
                <label className="label">Event Trigger Type</label>
                <select
                  value={simTrigger}
                  onChange={(e) => handleSimTriggerChange(e.target.value as WorkflowTrigger)}
                  className="input text-xs"
                >
                  {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v} ({k})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Simulated Payload (JSON)</label>
                <textarea
                  rows={6}
                  value={simPayloadStr}
                  onChange={(e) => setSimPayloadStr(e.target.value)}
                  className="input font-mono text-xs"
                />
              </div>

              {simResult && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Workflow Successfully Evaluated & Executed!</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    {simResult.count} matching automation rule(s) dispatched. Runs logged in execution ledger.
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setSimulateModal(false)} className="btn btn-secondary text-xs">
                Close
              </button>
              <button
                type="button"
                onClick={() => simulateMutation.mutate()}
                disabled={simulateMutation.isPending}
                className="btn btn-primary text-xs font-semibold"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{simulateMutation.isPending ? "Executing..." : "Fire Event"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Workflow Modal */}
      {showNew && (
        <div className="modal-backdrop">
          <div className="modal-card max-w-lg">
            <div className="modal-header">
              <h3 className="modal-title">Create Automation Workflow</h3>
              <button onClick={() => setShowNew(false)} className="modal-close"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="modal-body space-y-4">
              <div className="form-group">
                <label className="label">Workflow Label</label>
                <input {...register("name")} placeholder="e.g. Escalate Overdue Invoices to Slack" className="input text-xs" />
                {errors.name && <p className="form-error">{errors.name.message}</p>}
              </div>

              <div className="form-group">
                <label className="label">Description / Objective</label>
                <input {...register("description")} placeholder="Brief explanation of when this fires…" className="input text-xs" />
              </div>

              <div className="form-group">
                <label className="label">Trigger Event</label>
                <select {...register("triggerType")} className="input text-xs">
                  {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 pt-2 cursor-pointer">
                <input type="checkbox" {...register("isActive")} className="rounded text-blue-600 focus:ring-blue-500" />
                <span className="text-xs font-semibold text-slate-700">Activate workflow immediately upon creation</span>
              </label>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowNew(false)} className="btn btn-secondary text-xs">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary text-xs font-semibold">
                  Create Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
