export type Role = "admin" | "team" | "client";
export type ProjectStatus = "active" | "on_hold" | "completed" | "cancelled";
export type TaskStatus = "todo" | "in_progress" | "review" | "done" | "blocked";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type DocumentApprovalStatus = "pending" | "approved" | "rejected" | "not_required";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
export type ClientStatus = "active" | "inactive" | "churned";
export type WorkflowTrigger =
  | "task_status_change"
  | "new_document_upload"
  | "invoice_overdue"
  | "approval_given"
  | "approval_denied"
  | "sla_breach"
  | "new_message"
  | "project_created"
  | "project_completed";
export type WorkflowAction =
  | "notify_user"
  | "create_task"
  | "update_status"
  | "send_email"
  | "dispatch_webhook";
export type WorkflowRunStatus = "success" | "failure" | "skipped";
export type NotificationType =
  | "task_assigned"
  | "document_uploaded"
  | "invoice_overdue"
  | "approval_requested"
  | "approval_done"
  | "message_received"
  | "workflow_triggered"
  | "project_update";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: "starter" | "pro" | "enterprise";
  createdAt: string;
}

export interface User {
  id: string;
  tenantId: string;
  role: Role;
  fullName: string;
  email: string;
  avatarUrl?: string;
  clientId?: string; // set if role === "client"
  createdAt: string;
}

export interface Client {
  id: string;
  tenantId: string;
  companyName: string;
  contactEmail: string;
  contactName: string;
  status: ClientStatus;
  industry?: string;
  website?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  tenantId: string;
  clientId: string;
  name: string;
  status: ProjectStatus;
  description: string;
  dueDate: string;
  budget?: number;
  completionPercent: number;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  tenantId: string;
  assigneeId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdAt: string;
}

export interface Document {
  id: string;
  projectId: string;
  tenantId: string;
  name: string;
  version: number;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  approvalStatus: DocumentApprovalStatus;
  uploadedBy: string;
  description?: string;
  createdAt: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  storagePath: string;
  uploadedBy: string;
  createdAt: string;
}

export interface DocumentComment {
  id: string;
  documentId: string;
  tenantId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  projectId: string;
  tenantId: string;
  clientId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  dueDate: string;
  paidAt?: string;
  lineItems: InvoiceLineItem[];
  notes?: string;
  createdAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Message {
  id: string;
  projectId: string;
  tenantId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Workflow {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  triggerType: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowActionDef[];
  isActive: boolean;
  createdAt: string;
}

export interface WorkflowCondition {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than";
  value: string | number | boolean;
}

export interface WorkflowActionDef {
  id: string;
  type: WorkflowAction;
  params: Record<string, unknown>;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  triggeredBy: string;
  status: WorkflowRunStatus;
  payload: Record<string, unknown>;
  result?: Record<string, unknown>;
  ranAt: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  diff?: Record<string, { before: unknown; after: unknown }>;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Notification {
  id: string;
  tenantId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  createdAt: string;
}

// ─── Joined/computed types ────────────────────────────
export interface ProjectWithClient extends Project {
  client: Client;
}

export interface TaskWithAssignee extends Task {
  assignee?: User;
}

export interface InvoiceWithProject extends Invoice {
  project: Project;
  client: Client;
}

export interface AuditLogWithActor extends AuditLog {
  actor: User;
}

export interface WorkflowRunWithWorkflow extends WorkflowRun {
  workflow: Workflow;
}
