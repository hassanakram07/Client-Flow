"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Shield, CheckCircle2, X } from "lucide-react";
import { User } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";

const ROLE_LABELS = { admin: "Administrator", team: "Team Member", client: "Client Executive" };
const ROLE_VARIANTS = { admin: "info", team: "neutral", client: "success" } as const;
const ROLE_PERMS = {
  admin: ["Full platform administration", "Workflow automation builder", "Client onboarding & contracts", "Deliverable approval override", "Billing & invoice dispatch", "Enterprise security audit log"],
  team: ["Assigned project workspace access", "Task completion & status updates", "Document upload & versioning", "Client message thread replies", "Milestone timeline tracking"],
  client: ["Dedicated organization portal", "Document review & electronic sign-off", "Invoice settlement status", "Direct agency message channel", "Project milestone progress view"],
};

export default function TeamPage() {
  const [inviteModal, setInviteModal] = useState(false);

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () =>
      fetch("/api/clients")
        .then(() => [
          { id: "user_admin_1", tenantId: "tenant_meridian", role: "admin", fullName: "Sophia Reyes", email: "sophia@meridianagency.com", createdAt: "2024-01-15T09:00:00Z" },
          { id: "user_team_1", tenantId: "tenant_meridian", role: "team", fullName: "Marcus Webb", email: "marcus@meridianagency.com", createdAt: "2024-01-20T09:00:00Z" },
          { id: "user_team_2", tenantId: "tenant_meridian", role: "team", fullName: "Priya Nair", email: "priya@meridianagency.com", createdAt: "2024-02-01T09:00:00Z" },
          { id: "user_team_3", tenantId: "tenant_meridian", role: "team", fullName: "Daniel Torres", email: "daniel@meridianagency.com", createdAt: "2024-02-10T09:00:00Z" },
          { id: "user_client_halcyon", tenantId: "tenant_meridian", role: "client", fullName: "Ethan Blackwell", email: "ethan@halcyonventures.com", clientId: "client_halcyon", createdAt: "2024-02-15T09:00:00Z" },
          { id: "user_client_strata", tenantId: "tenant_meridian", role: "client", fullName: "Naomi Chen", email: "naomi@stratalogistics.com", clientId: "client_strata", createdAt: "2024-03-01T09:00:00Z" },
          { id: "user_client_bloom", tenantId: "tenant_meridian", role: "client", fullName: "James Okafor", email: "james@bloomandco.com", clientId: "client_bloom", createdAt: "2024-03-10T09:00:00Z" },
        ] as User[]),
    staleTime: Infinity,
  });

  const internalUsers = users.filter(u => u.role !== "client");
  const clientUsers = users.filter(u => u.role === "client");

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-[1500px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Team & Access Control</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage agency personnel roles, enterprise permissions, and client external portal seats.
          </p>
        </div>
        <button
          onClick={() => setInviteModal(true)}
          className="btn btn-primary text-xs font-semibold shadow-xs"
          id="btn-invite-member"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Role Permissions Matrix Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Access Control Matrix</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["admin", "team", "client"] as const).map(role => (
            <div key={role} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-xs text-slate-900">{ROLE_LABELS[role]}</span>
                </div>
                <StatusBadge variant={ROLE_VARIANTS[role]} label={role.toUpperCase()} dot={false} />
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                {ROLE_PERMS[role].map(perm => (
                  <li key={perm} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{perm}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Team Roster Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Agency Personnel Roster</h2>
            <p className="text-xs text-slate-500 mt-0.5">Active team members with access to internal operations</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {internalUsers.length} Internal Seats
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Work Email</th>
                <th>Assigned Role</th>
                <th>Joined Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {internalUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={u.fullName} size="sm" />
                      <span className="font-bold text-xs text-slate-900">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="font-mono text-xs text-slate-600">{u.email}</td>
                  <td>
                    <StatusBadge variant={ROLE_VARIANTS[u.role as "admin" | "team"]} label={ROLE_LABELS[u.role as "admin" | "team"]} dot={false} />
                  </td>
                  <td className="font-mono text-xs text-slate-500">{formatDate(u.createdAt)}</td>
                  <td>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">External Client Portal Contacts</h2>
            <p className="text-xs text-slate-500 mt-0.5">Authorized client representatives with portal sign-in credentials</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {clientUsers.length} Client Accounts
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client Representative</th>
                <th>Corporate Email</th>
                <th>Access Scope</th>
                <th>Added Date</th>
                <th>Portal Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={u.fullName} size="sm" />
                      <span className="font-bold text-xs text-slate-900">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="font-mono text-xs text-slate-600">{u.email}</td>
                  <td>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      Client Portal Restricted
                    </span>
                  </td>
                  <td className="font-mono text-xs text-slate-500">{formatDate(u.createdAt)}</td>
                  <td>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Enabled
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {inviteModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setInviteModal(false); }}>
          <div className="modal-panel">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Invite New Team Member</h2>
                <p className="text-xs text-slate-500 mt-0.5">Send an invitation email with workspace access credentials.</p>
              </div>
              <button onClick={() => setInviteModal(false)} className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-body space-y-4">
              <div className="field">
                <label className="label required">Full Name</label>
                <input className="input text-xs" placeholder="e.g. Alex Morgan" />
              </div>
              <div className="field">
                <label className="label required">Corporate Email</label>
                <input type="email" className="input text-xs" placeholder="alex@meridianagency.com" />
              </div>
              <div className="field">
                <label className="label required">Role & Permission Tier</label>
                <select className="input text-xs">
                  <option value="team">Team Member (Project execution)</option>
                  <option value="admin">Administrator (Full agency control)</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setInviteModal(false)} className="btn btn-secondary text-xs">Cancel</button>
              <button
                onClick={() => {
                  alert("Invitation sent successfully!");
                  setInviteModal(false);
                }}
                className="btn btn-primary text-xs"
              >
                Send Invite Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
