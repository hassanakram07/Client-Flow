// ==============================================================================
// NexOps Supabase Edge Function: workflow-dispatcher
// Triggered by Postgres Database Webhooks (INSERT/UPDATE on tasks, documents, invoices)
// Dispatches matching workflows to n8n webhook pipelines and executes actions
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: Record<string, unknown>;
  old_record?: Record<string, unknown>;
}

serve(async (req: Request) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const payload: WebhookPayload = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const n8nWebhookBaseUrl = Deno.env.get("N8N_WEBHOOK_BASE_URL");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Map table event to workflow trigger type
    let triggerType: string | null = null;
    if (payload.table === "tasks" && payload.type === "UPDATE") {
      if (payload.record.status !== payload.old_record?.status) {
        triggerType = "task_status_change";
      }
    } else if (payload.table === "documents" && payload.type === "INSERT") {
      triggerType = "new_document_upload";
    } else if (payload.table === "documents" && payload.type === "UPDATE") {
      if (payload.record.approval_status === "approved" && payload.old_record?.approval_status !== "approved") {
        triggerType = "approval_given";
      } else if (payload.record.approval_status === "rejected" && payload.old_record?.approval_status !== "rejected") {
        triggerType = "approval_denied";
      }
    } else if (payload.table === "invoices" && payload.record.status === "overdue") {
      triggerType = "invoice_overdue";
    }

    if (!triggerType) {
      return new Response(JSON.stringify({ message: "No matching workflow trigger" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const tenantId = payload.record.tenant_id as string;

    // Query active workflows for this trigger
    const { data: workflows, error: wfError } = await supabase
      .from("workflows")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("trigger_type", triggerType)
      .eq("is_active", true);

    if (wfError || !workflows || workflows.length === 0) {
      return new Response(JSON.stringify({ message: "No active workflows configured", triggerType }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const executionResults = [];

interface WorkflowCondition {
  field: string;
  operator: string;
  value: unknown;
}

interface WorkflowRecord {
  id: string;
  conditions?: WorkflowCondition[];
  actions?: Array<{ type: string; params?: Record<string, unknown> }>;
}

    for (const wf of (workflows as unknown as WorkflowRecord[])) {
      // Evaluate conditions
      const conditions = wf.conditions || [];
      const matches = conditions.every((cond: WorkflowCondition) => {
        const val = payload.record[cond.field];
        if (cond.operator === "equals") return val === cond.value;
        if (cond.operator === "not_equals") return val !== cond.value;
        return true;
      });

      if (!matches) {
        await supabase.from("workflow_runs").insert({
          workflow_id: wf.id,
          triggered_by: "edge_function",
          status: "skipped",
          payload: payload.record,
          result: { reason: "Conditions not met" },
        });
        continue;
      }

      // Execute actions
      let n8nDispatched = false;
      for (const action of (wf.actions || [])) {
        if (action.type === "dispatch_webhook" && n8nWebhookBaseUrl) {
          try {
            const endpoint = action.params?.endpoint || "default";
            await fetch(`${n8nWebhookBaseUrl}/${endpoint}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                event: triggerType,
                workflowId: wf.id,
                record: payload.record,
                timestamp: new Date().toISOString(),
              }),
            });
            n8nDispatched = true;
          } catch (err) {
            console.error("Failed to dispatch to n8n:", err);
          }
        }
      }

      // Log workflow execution
      const runRecord = {
        workflow_id: wf.id,
        triggered_by: "edge_function",
        status: "success",
        payload: payload.record,
        result: {
          n8nDispatched,
          actionsCount: wf.actions?.length || 0,
          executedAt: new Date().toISOString(),
        },
      };

      await supabase.from("workflow_runs").insert(runRecord);
      executionResults.push({ workflowId: wf.id, status: "success" });
    }

    return new Response(JSON.stringify({ success: true, executions: executionResults }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
