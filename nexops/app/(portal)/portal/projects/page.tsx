"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/context";
import { Project, Task, Document } from "@/lib/types";
import { ArrowRight } from "lucide-react";
import {
  cn, formatDate, projectStatusVariant, projectStatusLabel,
} from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { SkeletonCard } from "@/components/ui/skeleton";

export default function PortalProjectsPage() {
  const { user } = useAuth();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["projects", { clientId: user?.clientId }],
    queryFn: () => fetch(`/api/projects?clientId=${user!.clientId}`).then(r => r.json()),
    enabled: !!user?.clientId,
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Project Portfolios & Engagements</h1>
        <p className="text-sm text-slate-500 mt-1">
          Detailed sprint milestones, deliverable sign-offs, and communication threads.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
          No projects found for your organization.
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(p => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["tasks", { projectId: project.id }],
    queryFn: () => fetch(`/api/tasks?projectId=${project.id}`).then(r => r.json()),
  });
  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["documents", { projectId: project.id }],
    queryFn: () => fetch(`/api/documents?projectId=${project.id}`).then(r => r.json()),
  });

  const doneTasks = tasks.filter(t => t.status === "done").length;
  const pendingDocs = documents.filter(d => d.approvalStatus === "pending").length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:shadow-md hover:border-slate-300 transition-all">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <Link
              href={`/portal/projects/${project.id}`}
              className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors inline-flex items-center gap-2"
            >
              <span>{project.name}</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Target Delivery: {formatDate(project.dueDate)}
            </p>
          </div>
          <StatusBadge variant={projectStatusVariant(project.status)} label={projectStatusLabel(project.status)} />
        </div>

        {project.description && (
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{project.description}</p>
        )}

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs font-mono text-slate-500">
            <span>Overall Completion</span>
            <span className="font-bold text-slate-800">{project.completionPercent}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${project.completionPercent}%` }} />
          </div>
        </div>

        {/* Deliverable Metrics */}
        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Milestones Done</p>
            <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
              {doneTasks} <span className="text-xs font-normal text-slate-400">/ {tasks.length}</span>
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Documents</p>
            <p className="text-base font-bold text-slate-900 font-mono mt-0.5">{documents.length}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pending Approval</p>
            <p className={cn(
              "text-base font-bold font-mono mt-0.5",
              pendingDocs > 0 ? "text-amber-700" : "text-slate-900"
            )}>
              {pendingDocs}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
