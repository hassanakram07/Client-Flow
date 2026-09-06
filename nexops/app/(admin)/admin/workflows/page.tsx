"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus, Play, Pause, Trash2, X,
  Zap, ChevronDown, ChevronRight, ArrowRight
} from "lucide-react";
import { Workflow, WorkflowTrigger, WorkflowAction } from "@/lib/types";
import { cn } from "@/lib/utils";

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
      <div
        className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className={cn(
          "w-3 h-3 rounded-full flex-shrink-0 ring-4",
          workflow.isActive
            ? "bg-emerald-500 ring-emerald-100"
            : "bg-slate-400 ring-slate-100"
        )} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-bold text-slate-900 leading-tight">{workflow.name}</h3>
            <span className={cn(
              "text-[11px] font-semibold px-2 py-0.5 rounded-full border",
              workflow.isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
            )}>
              {workflow.isActive ? "Active Automation" : "Paused"}
            </span>
          </div>
          {workflow.description && (
            <p className="text-xs text-slate-500 truncate mt-1">{workflow.description}</p>
          )}
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
            <span className="bg-slate-100 font-medium px-2.5 py-1 rounded-md text-slate-700">
              {TRIGGER_LABELS[workflow.triggerType] ?? workflow.triggerType}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="bg-blue-50 font-semibold px-2.5 py-1 rounded-md text-blue-700 border border-blue-200/60">
              {workflow.actions.length} {workflow.actions.length === 1 ? "Action" : "Actions"}
            </span>
          </div>
          
          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <button
              onClick={onToggle}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                workflow.isActive
                  ? "text-amber-600 hover:bg-amber-50"
                  : "text-emerald-600 hover:bg-emerald-50"
              )}
              title={workflow.isActive ? "Pause workflow" : "Activate workflow"}
            >
              {workflow.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => { if (confirm("Delete this workflow?")) onDelete(); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete workflow"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 p-6 bg-slate-50/50 space-y-6">
          {/* Step 1: Trigger */}
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">1. Event Trigger</p>
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  {TRIGGER_LABELS[workflow.triggerType] ?? workflow.triggerType}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">Event hook: {workflow.triggerType}</span>
              </div>
            </div>
          </div>

          {/* Step 2: Conditional Evaluation */}
          {workflow.conditions.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">2. Evaluation Conditions</p>
              <div className="space-y-1.5">
                {workflow.conditions.map((cond, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-mono bg-white px-3 py-2 rounded-lg border border-slate-200 text-slate-700">
                    <span className="text-blue-600 font-bold">IF</span>
                    <span className="font-semibold text-slate-900">{cond.field}</span>
                    <span className="text-slate-400">{cond.operator}</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-bold">{String(cond.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Executed Actions */}
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">3. Automated Actions Pipeline</p>
            <div className="space-y-2">
              {workflow.actions.map((act, i) => (
                <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0 border border-blue-200">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <span className="font-bold text-slate-900 block leading-tight">
                      {ACTION_LABELS[act.type] ?? act.type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono truncate block mt-0.5">
                      {JSON.stringify(act.params)}
                    </span>
                  </div>
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
  const [showNew, setShowNew] = useState(false);

  const { data: workflows = [], isLoading } = useQuery<Workflow[]>({
    queryKey: ["workflows"],
    queryFn: () => fetch("/api/workflows").then(r => r.json()),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      fetch(`/api/workflows/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workflows"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/workflows/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workflows"] }),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<WFForm>({
    resolver: zodResolver(wfSchema),
    defaultValues: { isActive: true, triggerType: "approval_given" },
  });

  const onSubmit = async (data: WFForm) => {
    await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        triggerType: data.triggerType,
        isActive: data.isActive,
        conditions: [],
        actions: [{ id: "act_1", type: "notify_user" as WorkflowAction, params: { message: `Automated event triggered by ${data.name}` } }],
      }),
    });
    qc.invalidateQueries({ queryKey: ["workflows"] });
    reset();
    setShowNew(false);
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-[1500px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Workflow Automation Engine</h1>
          <p className="text-sm text-slate-500 mt-1">
            Orchestrate rule-based triggers, automatic client notifications, and SLA milestone escalations.
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="btn btn-primary text-xs font-semibold shadow-xs"
          id="btn-create-workflow"
        >
          <Plus className="w-4 h-4" />
          <span>New Automation Workflow</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Total Workflows</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{workflows.length}</span>
          <p className="text-xs text-slate-500 mt-1">Active orchestration rules</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Enabled Automations</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">
            {workflows.filter(w => w.isActive).length}
          </span>
          <p className="text-xs text-slate-500 mt-1">Listening to live system events</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Execution Success</span>
          <span className="text-2xl font-bold text-blue-600 mt-1 block">99.8%</span>
          <p className="text-xs text-slate-500 mt-1">SLA guarantee on webhook dispatch</p>
        </div>
      </div>

      {/* Workflows List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3"><div className="skeleton h-20 rounded-xl" /><div className="skeleton h-20 rounded-xl" /></div>
        ) : workflows.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
            No workflows created yet. Click &quot;New Automation Workflow&quot; to get started.
          </div>
        ) : (
          workflows.map(wf => (
            <WorkflowCard
              key={wf.id}
              workflow={wf}
              onToggle={() => toggleMutation.mutate({ id: wf.id, isActive: !wf.isActive })}
              onDelete={() => deleteMutation.mutate(wf.id)}
            />
          ))
        )}
      </div>

      {/* New Workflow Modal */}
      {showNew && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowNew(false); }}>
          <div className="modal-panel">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Create Automation Workflow</h2>
                <p className="text-xs text-slate-500 mt-0.5">Define trigger conditions and subsequent action pipelines.</p>
              </div>
              <button onClick={() => setShowNew(false)} className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body space-y-4">
                <div className="field">
                  <label className="label required">Workflow Name</label>
                  <input className={cn("input text-xs", errors.name && "error")} placeholder="e.g. Notify Account Manager on Deliverable Approval" {...register("name")} />
                  {errors.name && <p className="field-error">{errors.name.message}</p>}
                </div>
                <div className="field">
                  <label className="label">Description / Objective</label>
                  <input className="input text-xs" placeholder="Brief explanation of when this fires…" {...register("description")} />
                </div>
                <div className="field">
                  <label className="label required">Trigger Event</label>
                  <select className="input text-xs" {...register("triggerType")}>
                    {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" id="isActive" className="rounded text-blue-600 focus:ring-blue-500" {...register("isActive")} />
                  <label htmlFor="isActive" className="text-xs font-semibold text-slate-700">Activate workflow immediately upon creation</label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowNew(false)} className="btn btn-secondary text-xs">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary text-xs" id="btn-save-workflow">
                  {isSubmitting ? "Creating…" : "Create Workflow"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
