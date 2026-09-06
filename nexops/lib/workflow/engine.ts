/**
 * NexOps Workflow Engine
 * Evaluates trigger/condition rules and executes action fan-out.
 * Designed to run in a Route Handler or Edge Function.
 */

import {
  Workflow, WorkflowCondition, WorkflowActionDef,
  WorkflowRun, WorkflowRunStatus, AuditLog,
} from "@/lib/types";
import { db } from "@/lib/db/store";
import { generateId } from "@/lib/utils";
import { dispatchWebhook } from "./n8n-adapter";

export interface WorkflowEvent {
  triggerType: Workflow["triggerType"];
  payload: Record<string, unknown>;
  actorId: string;
}

// ─── Condition evaluator ──────────────────────────────
function evaluateCondition(condition: WorkflowCondition, payload: Record<string, unknown>): boolean {
  const value = getNestedValue(payload, condition.field);
  switch (condition.operator) {
    case "equals":       return value == condition.value;
    case "not_equals":   return value != condition.value;
    case "contains":     return String(value).toLowerCase().includes(String(condition.value).toLowerCase());
    case "greater_than": return Number(value) > Number(condition.value);
    case "less_than":    return Number(value) < Number(condition.value);
    default: return true;
  }
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

function interpolate(template: string, payload: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, path) => {
    const val = getNestedValue(payload, path);
    return val !== undefined ? String(val) : `{{${path}}}`;
  });
}

// ─── Action executors ─────────────────────────────────
async function executeAction(
  action: WorkflowActionDef,
  payload: Record<string, unknown>,
  tenantId: string
): Promise<void> {
  switch (action.type) {
    case "notify_user": {
      const params = action.params as { userId?: string; role?: string; message: string; href?: string };
      const message = interpolate(params.message, payload);
      const usersToNotify = params.userId
        ? [db.getUserById(params.userId)].filter(Boolean)
        : db.getUsers(tenantId).filter(u => !params.role || u.role === params.role);
      for (const user of usersToNotify) {
        if (!user) continue;
        db.addNotification({
          id: generateId("notif"),
          tenantId,
          userId: user.id,
          type: "workflow_triggered",
          title: "Automated notification",
          body: message,
          href: params.href,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
      break;
    }
    case "create_task": {
      const params = action.params as { title: string; assigneeId?: string; priority?: string; projectId?: string };
      const title = interpolate(params.title, payload);
      db.addTask({
        id: generateId("task"),
        projectId: params.projectId ?? (payload.projectId as string) ?? "",
        tenantId,
        assigneeId: params.assigneeId,
        title,
        status: "todo",
        priority: (params.priority as "low" | "medium" | "high" | "critical") ?? "medium",
        createdAt: new Date().toISOString(),
      });
      break;
    }
    case "update_status": {
      // Generic status update — caller must pass resourceType + resourceId + newStatus
      break;
    }
    case "send_email": {
      // Stubbed — logs to console in dev, would call Resend in production
      const params = action.params as { template: string };
      console.log(`[Email stub] Would send template '${params.template}' with payload:`, payload);
      break;
    }
    case "dispatch_webhook": {
      await dispatchWebhook(
        action.params as { eventType: string; [k: string]: unknown },
        payload
      );
      break;
    }
  }
}

// ─── Main engine ──────────────────────────────────────
export async function processEvent(event: WorkflowEvent): Promise<WorkflowRun[]> {
  const tenantId = "tenant_meridian"; // In production, derived from event context
  const workflows = db.getWorkflows(tenantId).filter(
    wf => wf.isActive && wf.triggerType === event.triggerType
  );

  const runs: WorkflowRun[] = [];

  for (const workflow of workflows) {
    // Evaluate all conditions
    const allConditionsMet = workflow.conditions.every(condition =>
      evaluateCondition(condition, event.payload)
    );

    const status: WorkflowRunStatus = allConditionsMet ? "success" : "skipped";
    const run: WorkflowRun = {
      id: generateId("wfr"),
      workflowId: workflow.id,
      triggeredBy: event.actorId,
      status,
      payload: event.payload,
      ranAt: new Date().toISOString(),
    };

    if (allConditionsMet) {
      // Execute all actions in sequence
      for (const action of workflow.actions) {
        await executeAction(action, event.payload, tenantId);
      }
      run.result = { actionsExecuted: workflow.actions.length };
    }

    db.addWorkflowRun(run);

    // Write audit log entry
    const auditLog: AuditLog = {
      id: generateId("al"),
      tenantId,
      actorId: "system",
      action: `workflow.${status}`,
      resourceType: "workflow_run",
      resourceId: run.id,
      metadata: {
        workflowName: workflow.name,
        trigger: event.triggerType,
        conditionsMet: allConditionsMet,
      },
      createdAt: new Date().toISOString(),
    };
    db.addAuditLog(auditLog);
    runs.push(run);
  }

  return runs;
}
