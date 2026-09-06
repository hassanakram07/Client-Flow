"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  KeyRound, Globe, Copy,
  Check, Trash2, Send,
  CheckCircle2, X
} from "lucide-react";
import { ApiKey, WebhookEndpoint } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { SkeletonTable, SkeletonCard } from "@/components/ui/skeleton";

const apiKeySchema = z.object({
  name: z.string().min(2, "Key name is required"),
  scopes: z.array(z.string()).min(1, "Select at least one permission scope"),
});
type ApiKeyFormValues = z.infer<typeof apiKeySchema>;

const webhookSchema = z.object({
  name: z.string().min(2, "Webhook label is required"),
  url: z.string().url("Must be a valid HTTPS webhook URL"),
  events: z.array(z.string()).min(1, "Select at least one subscribed event"),
});
type WebhookFormValues = z.infer<typeof webhookSchema>;

interface TestPingResult {
  success: boolean;
  url: string;
  statusCode: number;
  statusText: string;
  latencyMs: number;
  payloadSent: Record<string, unknown>;
  signatureHeader: string;
  timestamp: string;
}

const AVAILABLE_SCOPES = [
  { id: "projects:read", label: "projects:read", desc: "Query active project engagements and milestones" },
  { id: "tasks:write", label: "tasks:write", desc: "Update task statuses and create deliverables" },
  { id: "documents:sign", label: "documents:sign", desc: "Execute electronic sign-offs and approvals" },
  { id: "billing:read", label: "billing:read", desc: "Export billing statements and line items" },
  { id: "workflows:execute", label: "workflows:execute", desc: "Trigger external webhook orchestrations" },
];

const AVAILABLE_EVENTS = [
  { id: "document.approved", label: "document.approved" },
  { id: "document.rejected", label: "document.rejected" },
  { id: "invoice.overdue", label: "invoice.overdue" },
  { id: "task.status_changed", label: "task.status_changed" },
  { id: "sla.breached", label: "sla.breached" },
];

export default function DeveloperPlatformPage() {
  const qc = useQueryClient();
  const [keyModal, setKeyModal] = useState(false);
  const [webhookModal, setWebhookModal] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<{ name: string; rawSecret: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [testResult, setTestResult] = useState<TestPingResult | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<"curl" | "node" | "python">("curl");

  // Load API Keys
  const { data: apiKeys = [], isLoading: loadingKeys } = useQuery<ApiKey[]>({
    queryKey: ["developer-api-keys"],
    queryFn: () => fetch("/api/developer/api-keys").then(r => r.json()),
  });

  // Load Webhooks
  const { data: webhooks = [], isLoading: loadingWebhooks } = useQuery<WebhookEndpoint[]>({
    queryKey: ["developer-webhooks"],
    queryFn: () => fetch("/api/developer/webhooks").then(r => r.json()),
  });

  // Key form
  const {
    register: regKey,
    handleSubmit: submitKey,
    reset: resetKey,
    formState: { errors: keyErrors },
  } = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: { name: "", scopes: ["projects:read", "tasks:write"] },
  });

  // Webhook form
  const {
    register: regWh,
    handleSubmit: submitWh,
    reset: resetWh,
    formState: { errors: whErrors },
  } = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookSchema),
    defaultValues: { name: "", url: "https://api.example.com/webhook", events: ["document.approved", "invoice.overdue"] },
  });

  const createKeyMutation = useMutation({
    mutationFn: async (values: ApiKeyFormValues) => {
      const res = await fetch("/api/developer/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      return res.json();
    },
    onSuccess: (data) => {
      setNewlyCreatedKey({ name: data.name, rawSecret: data.rawSecret });
      qc.invalidateQueries({ queryKey: ["developer-api-keys"] });
      setKeyModal(false);
      resetKey();
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch("/api/developer/api-keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "revoke" }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["developer-api-keys"] }),
  });

  const createWebhookMutation = useMutation({
    mutationFn: async (values: WebhookFormValues) => {
      const res = await fetch("/api/developer/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["developer-webhooks"] });
      setWebhookModal(false);
      resetWh();
    },
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch("/api/developer/webhooks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["developer-webhooks"] }),
  });

  const testPingMutation = useMutation({
    mutationFn: async (wh: WebhookEndpoint) => {
      const res = await fetch("/api/developer/webhooks/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookId: wh.id, url: wh.url }),
      });
      return res.json();
    },
    onSuccess: (data) => setTestResult(data),
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const codeSnippets = {
    curl: `curl -X GET "https://api.nexops.internal/v1/projects" \\
  -H "Authorization: Bearer nexops_live_z7f9..." \\
  -H "Content-Type: application/json"`,
    node: `import { NexOpsClient } from "@nexops/sdk";

const client = new NexOpsClient({
  apiKey: process.env.NEXOPS_API_KEY,
});

const projects = await client.projects.list({ status: "active" });
console.log(projects);`,
    python: `import requests

headers = {
    "Authorization": "Bearer nexops_live_z7f9...",
    "Content-Type": "application/json"
}

response = requests.get("https://api.nexops.internal/v1/projects", headers=headers)
print(response.json())`,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Developer Platform & APIs
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              v1.4 Production SDK
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Programmatic ingestion, scoped API keys, and outbound real-time webhook endpoints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setKeyModal(true)}
            className="btn btn-primary text-xs font-semibold"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Generate API Key</span>
          </button>
          <button
            onClick={() => setWebhookModal(true)}
            className="btn btn-secondary text-xs font-semibold"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Register Webhook</span>
          </button>
        </div>
      </div>

      {/* Secret Banner on Key Creation */}
      {newlyCreatedKey && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-900">
                API Key Created: {newlyCreatedKey.name}
              </span>
            </div>
            <p className="text-[11px] text-emerald-700">
              Copy this secret now. For security purposes, it will never be displayed again.
            </p>
            <div className="font-mono text-xs bg-white px-3 py-1.5 rounded-lg border border-emerald-200 text-slate-800 break-all select-all mt-2">
              {newlyCreatedKey.rawSecret}
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(newlyCreatedKey.rawSecret)}
            className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex-shrink-0"
          >
            {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey ? "Copied" : "Copy Secret"}</span>
          </button>
        </div>
      )}

      {/* API Keys Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Active API Keys</h2>
            <p className="text-xs text-slate-500">Bearer tokens used by external servers, CI/CD, and custom scripts.</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 font-mono">
            {apiKeys.filter(k => !k.revoked).length} Active
          </span>
        </div>

        {loadingKeys ? (
          <div className="p-6"><SkeletonTable rows={3} cols={5} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3">Key Label</th>
                  <th className="px-6 py-3">Token Mask</th>
                  <th className="px-6 py-3">Authorized Scopes</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3">Last Activity</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {apiKeys.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <KeyRound className={cn("w-3.5 h-3.5", k.revoked ? "text-slate-400" : "text-indigo-600")} />
                        <span className={k.revoked ? "line-through text-slate-400" : ""}>{k.name}</span>
                        {k.revoked && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                            Revoked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[11px] text-slate-500">{k.secretMasked}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {k.scopes.map((s) => (
                          <span key={s} className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-500 text-[11px]">{formatDate(k.createdAt)}</td>
                    <td className="px-6 py-3.5 font-mono text-slate-500 text-[11px]">
                      {k.lastUsedAt ? formatDate(k.lastUsedAt) : "Never used"}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {!k.revoked && (
                        <button
                          onClick={() => {
                            if (confirm(`Revoke API key "${k.name}"? Applications using this token will fail immediately.`)) {
                              revokeKeyMutation.mutate(k.id);
                            }
                          }}
                          className="btn btn-sm btn-danger text-[11px] font-semibold"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Webhooks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Outbound Webhook Endpoints</h2>
            <p className="text-xs text-slate-500">NexOps delivers signed JSON payloads over HTTPS upon event execution.</p>
          </div>
        </div>

        {loadingWebhooks ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><SkeletonCard /><SkeletonCard /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {webhooks.map((wh) => (
              <div key={wh.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <h3 className="text-xs font-bold text-slate-900 truncate">{wh.name}</h3>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                        Active
                      </span>
                    </div>
                    <p className="font-mono text-xs text-slate-500 truncate" title={wh.url}>{wh.url}</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => testPingMutation.mutate(wh)}
                      disabled={testPingMutation.isPending}
                      className="btn btn-sm btn-secondary text-xs font-semibold"
                      title="Dispatch real-time test event"
                    >
                      <Send className="w-3 h-3" />
                      <span>Test Ping</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove webhook "${wh.name}"?`)) deleteWebhookMutation.mutate(wh.id);
                      }}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {wh.events.map((ev) => (
                    <span key={ev} className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">
                      {ev}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Secret: {wh.secret.slice(0, 10)}...</span>
                  <span>Last status: <strong className="text-emerald-600">{wh.lastStatus ?? 200} OK</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Test Ping Diagnostic Modal */}
      {testResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Webhook Test Dispatch Succeeded</h3>
              </div>
              <button onClick={() => setTestResult(null)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="text-slate-900 font-bold truncate max-w-xs">{testResult.url}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Response Code:</span>
                <span className="text-emerald-700 font-bold">{testResult.statusCode} {testResult.statusText}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Round-Trip Latency:</span>
                <span className="text-slate-900 font-bold">{testResult.latencyMs}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Signature:</span>
                <span className="text-slate-900 truncate max-w-xs">{testResult.signatureHeader}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700">Simulated Payload Sent:</span>
              <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl text-[11px] font-mono overflow-x-auto">
                {JSON.stringify(testResult.payloadSent, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setTestResult(null)} className="btn btn-primary text-xs font-semibold">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Snippets Platform */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">API Documentation & Code Samples</h2>
            <p className="text-xs text-slate-500">Direct integration examples with authenticated bearer headers.</p>
          </div>

          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
            {(["curl", "node", "python"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCodeTab(tab)}
                className={cn(
                  "px-3 py-1 rounded-md font-medium uppercase transition-all text-[11px]",
                  activeCodeTab === tab
                    ? "bg-white text-blue-600 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <pre className="bg-slate-950 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
            {codeSnippets[activeCodeTab]}
          </pre>
          <button
            onClick={() => copyToClipboard(codeSnippets[activeCodeTab])}
            className="absolute right-3 top-3 btn btn-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px]"
          >
            <Copy className="w-3 h-3" />
            <span>Copy Code</span>
          </button>
        </div>
      </div>

      {/* Create Key Modal */}
      {keyModal && (
        <div className="modal-backdrop">
          <div className="modal-card max-w-lg">
            <div className="modal-header">
              <h3 className="modal-title">Generate Enterprise API Key</h3>
              <button onClick={() => setKeyModal(false)} className="modal-close"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={submitKey((d) => createKeyMutation.mutate(d))} className="modal-body space-y-4">
              <div className="form-group">
                <label className="label">Key Description / Name</label>
                <input
                  {...regKey("name")}
                  placeholder="e.g. Zapier Ingestion Production Key"
                  className="input"
                />
                {keyErrors.name && <p className="form-error">{keyErrors.name.message}</p>}
              </div>

              <div className="form-group">
                <label className="label">Permission Scopes</label>
                <div className="space-y-2 mt-1">
                  {AVAILABLE_SCOPES.map((sc) => (
                    <label key={sc.id} className="flex items-start gap-2.5 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        value={sc.id}
                        {...regKey("scopes")}
                        className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-900 block">{sc.label}</span>
                        <span className="text-[11px] text-slate-500">{sc.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
                {keyErrors.scopes && <p className="form-error">{keyErrors.scopes.message}</p>}
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setKeyModal(false)} className="btn btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={createKeyMutation.isPending} className="btn btn-primary text-xs font-semibold">
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Webhook Modal */}
      {webhookModal && (
        <div className="modal-backdrop">
          <div className="modal-card max-w-lg">
            <div className="modal-header">
              <h3 className="modal-title">Register Outbound Webhook</h3>
              <button onClick={() => setWebhookModal(false)} className="modal-close"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={submitWh((d) => createWebhookMutation.mutate(d))} className="modal-body space-y-4">
              <div className="form-group">
                <label className="label">Webhook Name</label>
                <input
                  {...regWh("name")}
                  placeholder="e.g. n8n Approval Webhook"
                  className="input"
                />
                {whErrors.name && <p className="form-error">{whErrors.name.message}</p>}
              </div>

              <div className="form-group">
                <label className="label">Endpoint URL (HTTPS Required)</label>
                <input
                  {...regWh("url")}
                  placeholder="https://api.yourcompany.com/webhooks/nexops"
                  className="input font-mono text-xs"
                />
                {whErrors.url && <p className="form-error">{whErrors.url.message}</p>}
              </div>

              <div className="form-group">
                <label className="label">Subscribed Events</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {AVAILABLE_EVENTS.map((ev) => (
                    <label key={ev.id} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        value={ev.id}
                        {...regWh("events")}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-mono text-xs text-slate-800">{ev.label}</span>
                    </label>
                  ))}
                </div>
                {whErrors.events && <p className="form-error">{whErrors.events.message}</p>}
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setWebhookModal(false)} className="btn btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={createWebhookMutation.isPending} className="btn btn-primary text-xs font-semibold">
                  Register Endpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
