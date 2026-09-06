"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/context";
import { Project, Task, Document, Message, User } from "@/lib/types";
import {
  ArrowLeft, FolderOpen,
  FileText, MessageSquare, Send, Download, Check, X,
  Calendar, CheckSquare
} from "lucide-react";
import {
  cn, formatDate, formatFileSize, formatRelative,
  projectStatusVariant, projectStatusLabel,
  taskStatusVariant, taskStatusLabel,
  documentApprovalVariant, documentApprovalLabel,
} from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { SkeletonCard } from "@/components/ui/skeleton";

type EnrichedMessage = Message & { author?: User | null };

export default function PortalProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = params?.id;
  const { user } = useAuth();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<"tasks" | "documents" | "discussion">("tasks");
  const [messageContent, setMessageContent] = useState("");
  const [approvalModalDoc, setApprovalModalDoc] = useState<Document | null>(null);

  const { data: project, isLoading: lp } = useQuery<Project>({
    queryKey: ["project", projectId],
    queryFn: () => fetch(`/api/projects/${projectId}`).then(r => {
      if (!r.ok) throw new Error("Project not found");
      return r.json();
    }),
    enabled: !!projectId,
  });

  const { data: tasks = [], isLoading: lt } = useQuery<Task[]>({
    queryKey: ["tasks", { projectId }],
    queryFn: () => fetch(`/api/tasks?projectId=${projectId}`).then(r => r.json()),
    enabled: !!projectId,
  });

  const { data: documents = [], isLoading: ld } = useQuery<Document[]>({
    queryKey: ["documents", { projectId }],
    queryFn: () => fetch(`/api/documents?projectId=${projectId}`).then(r => r.json()),
    enabled: !!projectId,
  });

  const { data: messages = [], isLoading: lm } = useQuery<EnrichedMessage[]>({
    queryKey: ["messages", projectId],
    queryFn: () => fetch(`/api/messages?projectId=${projectId}`).then(r => r.json()),
    enabled: !!projectId,
    refetchInterval: 5000,
  });

  const approveDocMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      fetch(`/api/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalStatus: status }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents", { projectId }] });
      qc.invalidateQueries({ queryKey: ["documents"] });
      setApprovalModalDoc(null);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: () =>
      fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, authorId: user!.id, content: messageContent }),
      }),
    onSuccess: () => {
      setMessageContent("");
      qc.invalidateQueries({ queryKey: ["messages", projectId] });
    },
  });

  if (lp) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="skeleton h-6 w-32 rounded" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4 max-w-lg mx-auto">
        <FolderOpen className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Project Not Found</h2>
        <p className="text-xs text-slate-500">The requested engagement could not be found or your account does not have access permissions.</p>
        <Link href="/portal/projects" className="btn btn-secondary text-xs">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Projects</span>
        </Link>
      </div>
    );
  }

  const doneTasks = tasks.filter(t => t.status === "done").length;
  const pendingDocs = documents.filter(d => d.approvalStatus === "pending").length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back Link */}
      <div>
        <Link
          href="/portal/projects"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* Project Overview Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{project.name}</h1>
              <StatusBadge variant={projectStatusVariant(project.status)} label={projectStatusLabel(project.status)} />
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2 font-mono">
              <Calendar className="w-4 h-4 text-slate-400" />
              Target Completion: {formatDate(project.dueDate)}
            </p>
          </div>
        </div>

        {project.description && (
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            {project.description}
          </p>
        )}

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs font-mono text-slate-500">
            <span>Overall Milestone Completion</span>
            <span className="font-bold text-slate-800">{project.completionPercent}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${project.completionPercent}%` }} />
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Milestones Done</p>
            <p className="text-lg font-bold text-slate-900 font-mono mt-0.5">
              {doneTasks} <span className="text-xs font-normal text-slate-400">/ {tasks.length}</span>
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Deliverables</p>
            <p className="text-lg font-bold text-slate-900 font-mono mt-0.5">{documents.length}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pending Approvals</p>
            <p className={cn(
              "text-lg font-bold font-mono mt-0.5",
              pendingDocs > 0 ? "text-amber-700 font-bold" : "text-slate-900"
            )}>
              {pendingDocs}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex border-b border-slate-200 gap-8">
          <button
            onClick={() => setActiveTab("tasks")}
            className={cn(
              "pb-3 text-xs font-semibold transition-all border-b-2 -mb-px flex items-center gap-2",
              activeTab === "tasks"
                ? "border-blue-600 text-blue-700 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-900"
            )}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Milestones & Tasks ({tasks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={cn(
              "pb-3 text-xs font-semibold transition-all border-b-2 -mb-px flex items-center gap-2",
              activeTab === "documents"
                ? "border-blue-600 text-blue-700 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-900"
            )}
          >
            <FileText className="w-4 h-4" />
            <span>Deliverables & Sign-Offs ({documents.length})</span>
            {pendingDocs > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">
                {pendingDocs} Pending
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("discussion")}
            className={cn(
              "pb-3 text-xs font-semibold transition-all border-b-2 -mb-px flex items-center gap-2",
              activeTab === "discussion"
                ? "border-blue-600 text-blue-700 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-900"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Project Communication ({messages.length})</span>
          </button>
        </div>

        {/* Tab 1: Tasks */}
        {activeTab === "tasks" && (
          <div className="mt-6 space-y-3">
            {lt ? (
              <SkeletonCard />
            ) : tasks.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-400">
                No milestone tasks scheduled yet.
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-xs overflow-hidden">
                {tasks.map(t => (
                  <div key={t.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <StatusBadge variant={taskStatusVariant(t.status)} label="" dot />
                      <div>
                        <p className={cn("text-xs font-semibold", t.status === "done" ? "line-through text-slate-400" : "text-slate-900")}>
                          {t.title}
                        </p>
                        {t.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{t.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={cn(
                        "text-[11px] font-semibold px-2 py-0.5 rounded-md",
                        t.priority === "high" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-slate-100 text-slate-600"
                      )}>
                        {t.priority}
                      </span>
                      {t.dueDate && (
                        <span className="text-xs font-mono text-slate-400">
                          {formatDate(t.dueDate)}
                        </span>
                      )}
                      <StatusBadge variant={taskStatusVariant(t.status)} label={taskStatusLabel(t.status)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Documents & Deliverables Approval */}
        {activeTab === "documents" && (
          <div className="mt-6 space-y-4">
            {ld ? (
              <SkeletonCard />
            ) : documents.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-400">
                No deliverables uploaded yet.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {documents.map(doc => (
                  <div key={doc.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          <h4 className="text-xs font-bold text-slate-900">{doc.name}</h4>
                        </div>
                        <StatusBadge variant={documentApprovalVariant(doc.approvalStatus)} label={documentApprovalLabel(doc.approvalStatus)} dot={false} />
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-semibold">v{doc.version}</span>
                        <span>{formatFileSize(doc.sizeBytes)}</span>
                        <span>{formatRelative(doc.createdAt)}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <a
                        href={doc.storagePath}
                        download
                        className="btn btn-secondary btn-sm text-xs font-semibold"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>Download</span>
                      </a>
                      {doc.approvalStatus === "pending" ? (
                        <button
                          onClick={() => setApprovalModalDoc(doc)}
                          className="btn btn-primary btn-sm text-xs font-semibold shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Review & Sign Off</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setApprovalModalDoc(doc)}
                          className="btn btn-ghost btn-sm text-xs text-slate-500 hover:text-slate-900"
                        >
                          <span>Review Status</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Project Discussion */}
        {activeTab === "discussion" && (
          <div className="mt-6 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <span className="text-xs font-bold text-slate-900">Encrypted Communication Stream</span>
              <span className="text-xs font-mono text-slate-400">{messages.length} messages</span>
            </div>

            <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto">
              {lm ? (
                <SkeletonCard />
              ) : messages.length === 0 ? (
                <p className="text-xs text-center text-slate-400 py-12">No messages in this thread. Say hello to your agency team.</p>
              ) : (
                messages.map(msg => {
                  const isOwn = msg.authorId === user?.id;
                  const authorName = msg.author?.fullName ?? "Colleague";
                  return (
                    <div key={msg.id} className={cn("flex gap-3", isOwn ? "flex-row-reverse" : "flex-row")}>
                      <Avatar name={authorName} size="sm" className="flex-shrink-0 mt-0.5" />
                      <div className={cn("max-w-[80%] space-y-1", isOwn ? "items-end flex flex-col" : "items-start flex flex-col")}>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-slate-900">{authorName}</span>
                          <span className="text-slate-400 text-[11px] font-mono">{formatRelative(msg.createdAt)}</span>
                        </div>
                        <div className={cn(
                          "px-4 py-2.5 rounded-2xl text-xs leading-relaxed",
                          isOwn
                            ? "bg-blue-600 text-white rounded-tr-xs shadow-xs"
                            : "bg-slate-100 text-slate-900 rounded-tl-xs"
                        )}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
              <input
                className="input flex-1 text-xs"
                placeholder="Type a message to your agency team… (Press Enter to send)"
                value={messageContent}
                onChange={e => setMessageContent(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey && messageContent.trim()) {
                    e.preventDefault();
                    sendMessageMutation.mutate();
                  }
                }}
              />
              <button
                onClick={() => messageContent.trim() && sendMessageMutation.mutate()}
                disabled={!messageContent.trim() || sendMessageMutation.isPending}
                className="btn btn-primary text-xs font-semibold px-4"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Deliverable Review & Approval Modal */}
      {approvalModalDoc && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setApprovalModalDoc(null); }}>
          <div className="modal-panel">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Executive Deliverable Sign-Off</h2>
                <p className="text-xs text-slate-500 mt-0.5">Approve this deliverable or request revisions with feedback.</p>
              </div>
              <button onClick={() => setApprovalModalDoc(null)} className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-body space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{approvalModalDoc.name}</span>
                  <StatusBadge variant={documentApprovalVariant(approvalModalDoc.approvalStatus)} label={documentApprovalLabel(approvalModalDoc.approvalStatus)} />
                </div>
                <p className="text-[11px] font-mono text-slate-500">
                  Version {approvalModalDoc.version} · {formatFileSize(approvalModalDoc.sizeBytes)} · Uploaded {formatDate(approvalModalDoc.createdAt)}
                </p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                By approving this deliverable, you confirm that the presented deliverables meet your organization&apos;s quality standards and authorize the agency team to proceed to the subsequent milestone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => approveDocMutation.mutate({ id: approvalModalDoc.id, status: "rejected" })}
                disabled={approveDocMutation.isPending}
                className="btn btn-danger text-xs font-semibold"
              >
                <X className="w-3.5 h-3.5" />
                <span>Request Revisions</span>
              </button>
              <button
                onClick={() => approveDocMutation.mutate({ id: approvalModalDoc.id, status: "approved" })}
                disabled={approveDocMutation.isPending}
                className="btn btn-primary text-xs font-semibold"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve & Sign Off</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
