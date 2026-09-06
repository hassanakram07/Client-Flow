"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Search, LayoutDashboard, Users, FolderOpen,
  UserSquare2, GitBranch, ScrollText, ShieldAlert,
  Code2, ExternalLink, Plus, Zap, ArrowRight,
  X, Sparkles
} from "lucide-react";
import { Client, Project } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Load clients and projects for fuzzy search
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: () => fetch("/api/clients").then(r => r.json()),
    enabled: open,
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => fetch("/api/projects").then(r => r.json()),
    enabled: open,
  });

  const navigationItems = useMemo(() => [
    { id: "nav-dash", label: "Executive Dashboard", category: "Navigation", href: "/admin/dashboard", icon: LayoutDashboard },
    { id: "nav-clients", label: "Clients Directory", category: "Navigation", href: "/admin/clients", icon: Users },
    { id: "nav-projects", label: "Projects & Kanban", category: "Navigation", href: "/admin/projects", icon: FolderOpen },
    { id: "nav-team", label: "Team & Personnel", category: "Navigation", href: "/admin/team", icon: UserSquare2 },
    { id: "nav-workflows", label: "Workflow Studio & Runs", category: "Navigation", href: "/admin/workflows", icon: GitBranch },
    { id: "nav-audit", label: "Audit Trail & Ledger", category: "Navigation", href: "/admin/audit-log", icon: ScrollText },
    { id: "nav-sla", label: "SLA & Operational Health", category: "Navigation", href: "/admin/sla", icon: ShieldAlert },
    { id: "nav-dev", label: "Developer & Webhook Platform", category: "Navigation", href: "/admin/developer", icon: Code2 },
    { id: "nav-portal", label: "Client Portal (External View)", category: "Navigation", href: "/portal/dashboard", icon: ExternalLink },
  ], []);

  const actionItems = useMemo(() => [
    { id: "act-new-client", label: "Initialize New Client Organization", category: "Actions", href: "/admin/clients", icon: Plus },
    { id: "act-new-project", label: "Create Enterprise Project Workspace", category: "Actions", href: "/admin/projects", icon: Plus },
    { id: "act-run-wf", label: "Simulate Live Automation Trigger", category: "Actions", href: "/admin/workflows", icon: Zap },
    { id: "act-api-key", label: "Generate Scoped API Integration Key", category: "Actions", href: "/admin/developer", icon: Sparkles },
  ], []);

  const clientItems = useMemo(() => clients.map(c => ({
    id: `client-${c.id}`,
    label: `${c.companyName} (${c.contactName})`,
    category: "Clients",
    href: "/admin/clients",
    icon: Users,
  })), [clients]);

  const projectItems = useMemo(() => projects.map(p => ({
    id: `project-${p.id}`,
    label: p.name,
    category: "Projects",
    href: "/admin/projects",
    icon: FolderOpen,
  })), [projects]);

  const allItems = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      return [...navigationItems, ...actionItems];
    }
    const combined = [...navigationItems, ...actionItems, ...clientItems, ...projectItems];
    return combined.filter(item =>
      item.label.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    );
  }, [query, navigationItems, actionItems, clientItems, projectItems]);

  const handleSelect = useCallback((href: string) => {
    onClose();
    router.push(href);
  }, [onClose, router]);

  // Keyboard navigation within the modal
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (allItems.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + allItems.length) % (allItems.length || 1));
      } else if (e.key === "Enter" && allItems[selectedIndex]) {
        e.preventDefault();
        handleSelect(allItems[selectedIndex].href);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, allItems, selectedIndex, handleSelect]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[540px] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, navigate, or search clients & projects..."
            className="w-full text-sm bg-transparent placeholder:text-slate-400 text-slate-900 outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setSelectedIndex(0);
              }}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-400 flex-shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-slate-100 flex-1">
          {allItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No commands or entities matching &quot;{query}&quot;
            </div>
          ) : (
            <div className="space-y-0.5">
              {allItems.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.href)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-all",
                      isSelected
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                        isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn(
                        "text-[10px] uppercase font-mono px-2 py-0.5 rounded tracking-wider",
                        isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      )}>
                        {item.category}
                      </span>
                      <ArrowRight className={cn(
                        "w-3.5 h-3.5",
                        isSelected ? "text-white" : "text-slate-300"
                      )} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">↑</kbd> <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">↓</kbd> navigate</span>
            <span><kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">↵</kbd> select</span>
          </div>
          <span className="font-mono text-slate-400">NexOps Command Hub</span>
        </div>
      </div>
    </div>
  );
}
