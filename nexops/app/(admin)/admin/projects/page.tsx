"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus, Search, X, ChevronRight,
  LayoutGrid, List
} from "lucide-react";
import { Project, Client } from "@/lib/types";
import {
  cn, formatDate, formatCurrency, projectStatusVariant, projectStatusLabel,
} from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { SkeletonTable } from "@/components/ui/skeleton";

const projectSchema = z.object({
  name: z.string().min(2, "Project name is required"),
  clientId: z.string().min(1, "Please select an authorized client"),
  status: z.enum(["active", "on_hold", "completed", "cancelled"]),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Target completion date is required"),
  budget: z.coerce.number().positive("Budget must be a positive number").optional(),
});
type ProjectForm = z.infer<typeof projectSchema>;

function ProjectModal({ project, clients, onClose }: {
  project?: Project | null;
  clients: Client[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = !!project;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? { name: project.name, clientId: project.clientId, status: project.status, description: project.description, dueDate: project.dueDate, budget: project.budget }
      : { status: "active" },
  });

  const onSubmit = async (data: ProjectForm) => {
    const url = isEdit ? `/api/projects/${project!.id}` : "/api/projects";
    await fetch(url, { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    qc.invalidateQueries({ queryKey: ["projects"] });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-panel">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{isEdit ? "Edit Project Engagement" : "Initiate New Project"}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Assign client organization, milestone deadline, and budget.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="field sm:col-span-2">
              <label className="label required">Project Name</label>
              <input className={cn("input", errors.name && "error")} placeholder="e.g. Brand Identity Refresh & Digital Launch" {...register("name")} />
              {errors.name && <p className="field-error">{errors.name.message}</p>}
            </div>
            <div className="field">
              <label className="label required">Client Organization</label>
              <select className={cn("input", errors.clientId && "error")} {...register("clientId")}>
                <option value="">Select client…</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
              </select>
              {errors.clientId && <p className="field-error">{errors.clientId.message}</p>}
            </div>
            <div className="field">
              <label className="label required">Lifecycle Status</label>
              <select className="input" {...register("status")}>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="field">
              <label className="label required">Target Delivery Date</label>
              <input type="date" className={cn("input", errors.dueDate && "error")} {...register("dueDate")} />
              {errors.dueDate && <p className="field-error">{errors.dueDate.message}</p>}
            </div>
            <div className="field">
              <label className="label">Allocated Budget (USD)</label>
              <input type="number" className="input" placeholder="75000" {...register("budget")} />
            </div>
            <div className="field sm:col-span-2">
              <label className="label">Scope & Description</label>
              <textarea className="input" rows={3} placeholder="Describe deliverable scope, milestones, and client objectives…" {...register("description")} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary text-xs">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary text-xs" id="btn-save-project">
              {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const KANBAN_STATUSES = ["active", "on_hold", "completed", "cancelled"] as const;

function KanbanColumn({
  status, projects, clients, onProjectClick,
}: { status: string; projects: Project[]; clients: Client[]; onProjectClick: (p: Project) => void }) {
  const items = projects.filter(p => p.status === status);
  return (
    <div className="flex-1 min-w-[260px] bg-slate-100/70 p-3 rounded-xl border border-slate-200/80 flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <StatusBadge variant={projectStatusVariant(status)} label={projectStatusLabel(status)} />
          <span className="text-xs font-mono font-bold text-slate-500">({items.length})</span>
        </div>
      </div>
      <div className="space-y-3 flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="h-24 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">
            No projects
          </div>
        ) : (
          items.map(p => {
            const client = clients.find(c => c.id === p.clientId);
            return (
              <div
                key={p.id}
                onClick={() => onProjectClick(p)}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">{p.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">{client?.companyName ?? "Direct Client"}</p>
                </div>
                {p.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{p.description}</p>
                )}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1">
                    <span>Progress</span>
                    <span className="font-bold text-slate-800">{p.completionPercent}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${p.completionPercent}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                  <span>Due {formatDate(p.dueDate)}</span>
                  {p.budget && <span className="font-bold text-slate-700">{formatCurrency(p.budget)}</span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [modalProject, setModalProject] = useState<Project | null | undefined>(undefined);

  const { data: projects = [], isLoading: lp } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => fetch("/api/projects").then(r => r.json()),
  });
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: () => fetch("/api/clients").then(r => r.json()),
  });

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      clients.find(c => c.id === p.clientId)?.companyName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = selectedStatus === "all" || p.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-[1500px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Project Portfolio & Milestones</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track engagement deliverables, milestone approvals, and delivery timelines.
          </p>
        </div>
        <button
          onClick={() => setModalProject(null)}
          className="btn btn-primary text-xs font-semibold shadow-xs"
          id="btn-add-project"
        >
          <Plus className="w-4 h-4" />
          <span>New Project Engagement</span>
        </button>
      </div>

      {/* Filter & View Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              className="input pl-9 text-xs"
              placeholder="Search projects by name or client…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input text-xs w-36"
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-lg">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all",
              viewMode === "list" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500 hover:text-slate-900"
            )}
          >
            <List className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all",
              viewMode === "kanban" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500 hover:text-slate-900"
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>
        </div>
      </div>

      {/* Content: List or Kanban */}
      {viewMode === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_STATUSES.map(s => (
            <KanbanColumn
              key={s}
              status={s}
              projects={filtered}
              clients={clients}
              onProjectClick={p => setModalProject(p)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          {lp ? (
            <SkeletonTable rows={5} cols={6} />
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Client Organization</th>
                    <th>Status</th>
                    <th>Delivery Progress</th>
                    <th>Due Date</th>
                    <th>Budget</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-xs text-slate-400 py-12">
                        No projects found matching the criteria
                      </td>
                    </tr>
                  ) : (
                    filtered.map(p => {
                      const client = clients.find(c => c.id === p.clientId);
                      return (
                        <tr
                          key={p.id}
                          onClick={() => setModalProject(p)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                        >
                          <td>
                            <span className="font-bold text-xs text-slate-900 block leading-tight">{p.name}</span>
                            {p.description && (
                              <span className="text-[11px] text-slate-400 truncate max-w-xs block mt-0.5">{p.description}</span>
                            )}
                          </td>
                          <td>
                            <span className="font-medium text-xs text-slate-800">{client?.companyName ?? "—"}</span>
                          </td>
                          <td>
                            <StatusBadge variant={projectStatusVariant(p.status)} label={projectStatusLabel(p.status)} />
                          </td>
                          <td className="w-44">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1 text-slate-500">
                              <span>Milestones</span>
                              <span className="font-bold text-slate-800">{p.completionPercent}%</span>
                            </div>
                            <div className="progress-bar">
                              <div className="progress-bar-fill" style={{ width: `${p.completionPercent}%` }} />
                            </div>
                          </td>
                          <td className="font-mono text-xs text-slate-600">
                            {formatDate(p.dueDate)}
                          </td>
                          <td className="font-mono text-xs font-semibold text-slate-800">
                            {p.budget ? formatCurrency(p.budget) : "—"}
                          </td>
                          <td className="text-right" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => setModalProject(p)}
                              className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
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
      )}

      {/* Edit / New Modal */}
      {modalProject !== undefined && (
        <ProjectModal
          project={modalProject}
          clients={clients}
          onClose={() => setModalProject(undefined)}
        />
      )}
    </div>
  );
}
