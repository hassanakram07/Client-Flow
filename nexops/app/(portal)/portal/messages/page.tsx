"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/context";
import { Project, Message, User } from "@/lib/types";
import { Send, ChevronRight } from "lucide-react";
import { cn, formatRelative } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { SkeletonCard } from "@/components/ui/skeleton";

type EnrichedMessage = Message & { author?: User | null };

function MessageThread({ project }: { project: Project }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [content, setContent] = useState("");

  const { data: messages = [], isLoading } = useQuery<EnrichedMessage[]>({
    queryKey: ["messages", project.id],
    queryFn: () => fetch(`/api/messages?projectId=${project.id}`).then(r => r.json()),
    refetchInterval: 5000,
  });

  const sendMessage = useMutation({
    mutationFn: () =>
      fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, authorId: user!.id, content }),
      }),
    onSuccess: () => {
      setContent("");
      qc.invalidateQueries({ queryKey: ["messages", project.id] });
    },
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col h-[600px]">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{project.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">Direct channel with your assigned agency account team</p>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-full">
          {messages.length} messages
        </span>
      </div>

      {/* Message stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoading ? (
          <SkeletonCard />
        ) : messages.length === 0 ? (
          <p className="text-xs text-center text-slate-400 py-16">
            No messages exchanged yet in this project channel. Send a note below to start collaborating.
          </p>
        ) : (
          messages.map(msg => {
            const isOwn = msg.authorId === user?.id;
            const authorName = msg.author?.fullName ?? "Colleague";
            return (
              <div key={msg.id} className={cn("flex gap-3", isOwn ? "flex-row-reverse" : "flex-row")}>
                <Avatar name={authorName} size="sm" className="flex-shrink-0 mt-0.5" />
                <div className={cn("max-w-[75%] space-y-1", isOwn ? "items-end flex flex-col" : "items-start flex flex-col")}>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-900">{authorName}</span>
                    <span className="text-[11px] font-mono text-slate-400">{formatRelative(msg.createdAt)}</span>
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

      {/* Message input bar */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
        <input
          className="input flex-1 text-xs"
          placeholder="Type your message to the agency team… (Press Enter to send)"
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey && content.trim()) {
              e.preventDefault();
              sendMessage.mutate();
            }
          }}
        />
        <button
          onClick={() => content.trim() && sendMessage.mutate()}
          disabled={!content.trim() || sendMessage.isPending}
          className="btn btn-primary text-xs font-semibold px-4 shadow-xs"
          aria-label="Send message"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}

export default function PortalMessagesPage() {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["projects", { clientId: user?.clientId }],
    queryFn: () => fetch(`/api/projects?clientId=${user!.clientId}`).then(r => r.json()),
    enabled: !!user?.clientId,
  });

  const activeProject = projects.find(p => p.id === selectedProject) ?? projects[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Project Communication Channels</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time collaboration stream with your dedicated Meridian account managers and design leads.
          </p>
        </div>
      </div>

      {isLoading ? (
        <SkeletonCard />
      ) : projects.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
          No projects available for messaging.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Project channels selector */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2 h-fit">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2">Project Channels</p>
            <div className="space-y-1">
              {projects.map(p => {
                const isCurrent = (activeProject?.id ?? projects[0]?.id) === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProject(p.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-lg text-left text-xs transition-all",
                      isCurrent
                        ? "bg-blue-50 text-blue-900 font-bold border border-blue-200 shadow-xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold truncate">{p.name}</p>
                      <p className="text-[11px] text-slate-400 font-normal mt-0.5">{p.status}</p>
                    </div>
                    <ChevronRight className={cn("w-4 h-4 flex-shrink-0", isCurrent ? "text-blue-600" : "text-slate-300")} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active project message thread */}
          <div className="md:col-span-2">
            {activeProject ? (
              <MessageThread project={activeProject} />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
