"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/context";
import { Document, DocumentComment, Project } from "@/lib/types";
import {
  FileText, CheckCircle2, ChevronDown,
  ChevronRight, Download, MessageSquare, Send,
  Check, X
} from "lucide-react";
import {
  cn, formatFileSize, formatRelative,
  documentApprovalVariant, documentApprovalLabel,
} from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { SkeletonCard } from "@/components/ui/skeleton";

type EnrichedDocComment = DocumentComment & { author?: { fullName?: string } };

export default function PortalDocumentsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const clientId = user?.clientId;

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects", { clientId }],
    queryFn: () => fetch(`/api/projects?clientId=${clientId}`).then(r => r.json()),
    enabled: !!clientId,
  });

  const projectIds = projects.map(p => p.id);

  const { data: allDocs = [], isLoading } = useQuery<Document[]>({
    queryKey: ["documents"],
    queryFn: () => fetch("/api/documents").then(r => r.json()),
    select: docs => docs.filter(d => projectIds.includes(d.projectId)),
    enabled: projectIds.length > 0,
  });

  const { data: docDetail } = useQuery({
    queryKey: ["document", expanded],
    queryFn: () => fetch(`/api/documents/${expanded}`).then(r => r.json()),
    enabled: !!expanded,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      fetch(`/api/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalStatus: status }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      qc.invalidateQueries({ queryKey: ["document", expanded] });
    },
  });

  const sendComment = async (documentId: string) => {
    if (!commentText.trim() || !user) return;
    setSubmittingComment(true);
    await fetch(`/api/documents/${documentId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorId: user.id, content: commentText }),
    });
    setCommentText("");
    qc.invalidateQueries({ queryKey: ["document", documentId] });
    setSubmittingComment(false);
  };

  const pendingCount = allDocs.filter(d => d.approvalStatus === "pending").length;
  const approvedCount = allDocs.filter(d => d.approvalStatus === "approved").length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Deliverables & Document Exchange</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review design mockups, strategy decks, and contracts with electronic sign-off.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 ? (
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
              {pendingCount} Awaiting Sign-Off
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              All Deliverables Approved
            </span>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Total Files</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{allDocs.length}</span>
          <p className="text-xs text-slate-500 mt-1">Stored securely in project vault</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Pending Sign-Off</span>
          <span className={cn("text-2xl font-bold mt-1 block", pendingCount > 0 ? "text-amber-600" : "text-slate-900")}>
            {pendingCount}
          </span>
          <p className="text-xs text-slate-500 mt-1">Action required by your team</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Signed Off & Approved</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">{approvedCount}</span>
          <p className="text-xs text-slate-500 mt-1">Milestones unlocked for delivery</p>
        </div>
      </div>

      {/* Documents List grouped by project */}
      {isLoading ? (
        <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>
      ) : allDocs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
          No documents uploaded yet.
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map(project => {
            const docs = allDocs.filter(d => d.projectId === project.id);
            if (docs.length === 0) return null;
            return (
              <div key={project.id} className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{project.name}</h3>
                  <span className="text-xs font-mono text-slate-500">{docs.length} assets</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {docs.map(doc => {
                    const isOpen = expanded === doc.id;
                    return (
                      <div key={doc.id}>
                        <div
                          className="flex items-center justify-between p-5 hover:bg-slate-50/70 transition-colors cursor-pointer gap-4"
                          onClick={() => setExpanded(isOpen ? null : doc.id)}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 truncate">{doc.name}</p>
                              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-0.5">
                                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">v{doc.version}</span>
                                <span>{formatFileSize(doc.sizeBytes)}</span>
                                <span>{formatRelative(doc.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
                            <StatusBadge variant={documentApprovalVariant(doc.approvalStatus)} label={documentApprovalLabel(doc.approvalStatus)} dot={false} />
                            
                            <a
                              href={doc.storagePath}
                              download
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              title="Download Asset"
                            >
                              <Download className="w-4 h-4" />
                            </a>

                            {doc.approvalStatus === "pending" && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => approveMutation.mutate({ id: doc.id, status: "approved" })}
                                  disabled={approveMutation.isPending}
                                  className="btn btn-primary btn-sm text-xs font-semibold shadow-xs"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Sign Off</span>
                                </button>
                                <button
                                  onClick={() => approveMutation.mutate({ id: doc.id, status: "rejected" })}
                                  disabled={approveMutation.isPending}
                                  className="btn btn-danger btn-sm text-xs font-semibold"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Revise</span>
                                </button>
                              </div>
                            )}

                            <button
                              onClick={() => setExpanded(isOpen ? null : doc.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Collapsible Feedback & Revision Stream */}
                        {isOpen && (
                          <div className="border-t border-slate-100 bg-slate-50/60 p-6 space-y-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                              <MessageSquare className="w-4 h-4 text-blue-600" />
                              <span>Feedback & Revision Notes</span>
                            </div>

                            <div className="space-y-3">
                              {docDetail?.comments?.length === 0 ? (
                                <p className="text-xs text-slate-400 py-3">No comments or revision notes yet on this asset.</p>
                              ) : (
                                (docDetail?.comments as EnrichedDocComment[])?.map((c: EnrichedDocComment) => (
                                  <div key={c.id} className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-slate-900">{c.author?.fullName ?? "Collaborator"}</span>
                                      <span className="text-[11px] font-mono text-slate-400">{formatRelative(c.createdAt)}</span>
                                    </div>
                                    <p className="text-slate-700 leading-relaxed">{c.content}</p>
                                  </div>
                                ))
                              )}
                            </div>

                            <div className="flex gap-2 pt-2">
                              <input
                                className="input flex-1 text-xs"
                                placeholder="Add revision notes or feedback for the creative team…"
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === "Enter" && !e.shiftKey && commentText.trim()) {
                                    e.preventDefault();
                                    sendComment(doc.id);
                                  }
                                }}
                              />
                              <button
                                onClick={() => sendComment(doc.id)}
                                disabled={submittingComment || !commentText.trim()}
                                className="btn btn-primary text-xs font-semibold"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Post Note</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
