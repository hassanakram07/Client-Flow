"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus, Search, ExternalLink,
  Pencil, Trash2, X,
  ChevronRight
} from "lucide-react";
import { Client, Project, Invoice } from "@/lib/types";
import {
  cn, formatCurrency, formatDate,
  clientStatusVariant, invoiceStatusVariant, invoiceStatusLabel,
} from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { SkeletonTable } from "@/components/ui/skeleton";

// ─── Schema ───────────────────────────────────────────
const clientSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  contactEmail: z.string().email("Please enter a valid business email"),
  industry: z.string().optional(),
  website: z.string().url("Must be a valid URL (e.g. https://company.com)").optional().or(z.literal("")),
});
type ClientForm = z.infer<typeof clientSchema>;

// ─── Client modal ─────────────────────────────────────
function ClientModal({
  client,
  onClose,
}: {
  client?: Client | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = !!client;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
    defaultValues: client
      ? {
          companyName: client.companyName,
          contactName: client.contactName,
          contactEmail: client.contactEmail,
          industry: client.industry ?? "",
          website: client.website ?? "",
        }
      : {},
  });

  const onSubmit = async (data: ClientForm) => {
    const url = isEdit ? `/api/clients/${client!.id}` : "/api/clients";
    const method = isEdit ? "PATCH" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    qc.invalidateQueries({ queryKey: ["clients"] });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-panel">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{isEdit ? "Edit Client Organization" : "Add Client Organization"}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enter organization metadata and primary contact point.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="field sm:col-span-2">
              <label className="label required">Company Name</label>
              <input className={cn("input", errors.companyName && "error")} placeholder="Acme Dynamics Inc." {...register("companyName")} />
              {errors.companyName && <p className="field-error">{errors.companyName.message}</p>}
            </div>
            <div className="field">
              <label className="label required">Primary Contact Name</label>
              <input className={cn("input", errors.contactName && "error")} placeholder="Jane Doe" {...register("contactName")} />
              {errors.contactName && <p className="field-error">{errors.contactName.message}</p>}
            </div>
            <div className="field">
              <label className="label required">Contact Email</label>
              <input type="email" className={cn("input", errors.contactEmail && "error")} placeholder="jane@company.com" {...register("contactEmail")} />
              {errors.contactEmail && <p className="field-error">{errors.contactEmail.message}</p>}
            </div>
            <div className="field">
              <label className="label">Industry / Sector</label>
              <input className="input" placeholder="Enterprise FinTech" {...register("industry")} />
            </div>
            <div className="field">
              <label className="label">Company Website</label>
              <input className={cn("input", errors.website && "error")} placeholder="https://company.com" {...register("website")} />
              {errors.website && <p className="field-error">{errors.website.message}</p>}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary text-xs">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary text-xs" id="btn-save-client">
              {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create Client Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Client Detail Drawer ─────────────────────────────
function ClientDrawer({
  client,
  onClose,
  onEdit,
  onDelete,
}: {
  client: Client;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects", { clientId: client.id }],
    queryFn: () => fetch(`/api/projects?clientId=${client.id}`).then(r => r.json()),
  });

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ["invoices", { clientId: client.id }],
    queryFn: () => fetch(`/api/invoices?clientId=${client.id}`).then(r => r.json()),
  });

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col animate-slide-in-right">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-3">
          <Avatar name={client.companyName} size="md" />
          <div>
            <h2 className="text-base font-bold text-slate-900">{client.companyName}</h2>
            <p className="text-xs text-slate-500">{client.industry ?? "Client Account"}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Contact Info Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Contact Information</p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Contact Person</span>
              <span className="font-medium text-slate-900">{client.contactName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Email</span>
              <a href={`mailto:${client.contactEmail}`} className="font-medium text-blue-600 hover:underline">
                {client.contactEmail}
              </a>
            </div>
            {client.website && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Website</span>
                <a href={client.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline inline-flex items-center gap-1">
                  <span>Visit site</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
              <span className="text-slate-500">Member Since</span>
              <span className="font-mono text-slate-700">{formatDate(client.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Engagements & Projects ({projects.length})
            </h3>
          </div>
          <div className="space-y-2">
            {projects.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No projects created yet</p>
            ) : (
              projects.map(p => (
                <div key={p.id} className="p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-900 truncate">{p.name}</span>
                    <StatusBadge variant={p.status === "active" ? "info" : "neutral"} label={p.status} />
                  </div>
                  <div className="progress-bar mt-2">
                    <div className="progress-bar-fill" style={{ width: `${p.completionPercent}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 font-mono">
                    <span>Due {formatDate(p.dueDate)}</span>
                    <span>{p.completionPercent}% Complete</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Invoices Section */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Invoices & Billing ({invoices.length})
          </h3>
          <div className="space-y-2">
            {invoices.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No invoices issued</p>
            ) : (
              invoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
                  <div>
                    <span className="font-mono font-bold text-xs text-slate-900">{inv.invoiceNumber}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Due {formatDate(inv.dueDate)}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-xs text-slate-900">{formatCurrency(inv.amount)}</span>
                    <div className="mt-1">
                      <StatusBadge variant={invoiceStatusVariant(inv.status)} label={invoiceStatusLabel(inv.status)} dot={false} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
        <button
          onClick={() => { if (confirm("Delete this client account?")) onDelete(); }}
          className="btn btn-ghost text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Account</span>
        </button>
        <button onClick={onEdit} className="btn btn-secondary text-xs">
          <Pencil className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main Clients Page ─────────────────────────────────
export default function ClientsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editClient, setEditClient] = useState<Client | null | undefined>(undefined);

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: () => fetch("/api/clients").then(r => r.json()),
  });

  const deleteClient = useMutation({
    mutationFn: (id: string) => fetch(`/api/clients/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      setSelectedClient(null);
    },
  });

  const filtered = clients.filter(c =>
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.contactEmail.toLowerCase().includes(search.toLowerCase()) ||
    (c.industry ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-[1500px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Client Accounts & Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise customer organizations, authorized points of contact, and active retainers.
          </p>
        </div>
        <button
          onClick={() => setEditClient(null)}
          className="btn btn-primary text-xs font-semibold shadow-xs"
          id="btn-add-client"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client Organization</span>
        </button>
      </div>

      {/* Filter & Metric Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className="input pl-9 text-xs"
            placeholder="Search by organization, contact, or industry…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="input-client-search"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="font-bold text-slate-900">{filtered.length}</span> of {clients.length} active client accounts
        </div>
      </div>

      {/* Clients Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Primary Contact</th>
                  <th>Industry / Sector</th>
                  <th>Account Status</th>
                  <th>Onboarded</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-xs text-slate-400 py-12">
                      No matching client organizations found
                    </td>
                  </tr>
                ) : (
                  filtered.map(c => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedClient(c)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={c.companyName} size="sm" />
                          <div>
                            <span className="font-bold text-xs text-slate-900 block leading-tight">{c.companyName}</span>
                            {c.website && (
                              <span className="text-[11px] text-slate-400 font-mono block leading-tight mt-0.5">{c.website.replace(/^https?:\/\//, '')}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="text-xs font-medium text-slate-900">{c.contactName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{c.contactEmail}</p>
                      </td>
                      <td>
                        <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          {c.industry ?? "General"}
                        </span>
                      </td>
                      <td>
                        <StatusBadge variant={clientStatusVariant(c.status)} label={c.status} />
                      </td>
                      <td className="font-mono text-xs text-slate-500">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedClient(c)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View Client Details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Drawer */}
      {selectedClient && (
        <ClientDrawer
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onEdit={() => {
            setEditClient(selectedClient);
            setSelectedClient(null);
          }}
          onDelete={() => deleteClient.mutate(selectedClient.id)}
        />
      )}

      {/* Edit / New Modal */}
      {editClient !== undefined && (
        <ClientModal
          client={editClient}
          onClose={() => setEditClient(undefined)}
        />
      )}
    </div>
  );
}
