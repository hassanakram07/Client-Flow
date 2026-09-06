import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isAfter, isBefore, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date formatting ──────────────────────────────────
export function formatDate(date: string | Date, fmt = "MMM d, yyyy") {
  return format(typeof date === "string" ? parseISO(date) : date, fmt);
}

export function formatDateTime(date: string | Date) {
  return format(typeof date === "string" ? parseISO(date) : date, "MMM d, yyyy 'at' h:mm a");
}

export function formatRelative(date: string | Date) {
  return formatDistanceToNow(
    typeof date === "string" ? parseISO(date) : date,
    { addSuffix: true }
  );
}

export function isOverdue(dueDate: string) {
  return isBefore(parseISO(dueDate), new Date());
}

export function isDueSoon(dueDate: string, withinDays = 7) {
  const due = parseISO(dueDate);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + withinDays);
  return isAfter(due, new Date()) && isBefore(due, cutoff);
}

// ─── Number formatting ────────────────────────────────
export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Status utilities ─────────────────────────────────
export type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral";

export function projectStatusVariant(status: string): StatusVariant {
  switch (status) {
    case "active": return "success";
    case "on_hold": return "warning";
    case "completed": return "neutral";
    case "cancelled": return "danger";
    default: return "neutral";
  }
}

export function taskStatusVariant(status: string): StatusVariant {
  switch (status) {
    case "done": return "success";
    case "in_progress": return "info";
    case "review": return "warning";
    case "blocked": return "danger";
    case "todo": return "neutral";
    default: return "neutral";
  }
}

export function invoiceStatusVariant(status: string): StatusVariant {
  switch (status) {
    case "paid": return "success";
    case "sent": return "info";
    case "draft": return "neutral";
    case "overdue": return "danger";
    case "cancelled": return "neutral";
    default: return "neutral";
  }
}

export function documentApprovalVariant(status: string): StatusVariant {
  switch (status) {
    case "approved": return "success";
    case "pending": return "warning";
    case "rejected": return "danger";
    case "not_required": return "neutral";
    default: return "neutral";
  }
}

export function taskPriorityVariant(priority: string): StatusVariant {
  switch (priority) {
    case "critical": return "danger";
    case "high": return "warning";
    case "medium": return "info";
    case "low": return "neutral";
    default: return "neutral";
  }
}

export function clientStatusVariant(status: string): StatusVariant {
  switch (status) {
    case "active": return "success";
    case "inactive": return "warning";
    case "churned": return "danger";
    default: return "neutral";
  }
}

// ─── Label helpers ────────────────────────────────────
export function projectStatusLabel(status: string) {
  return { active: "Active", on_hold: "On Hold", completed: "Completed", cancelled: "Cancelled" }[status] ?? status;
}
export function taskStatusLabel(status: string) {
  return { todo: "To Do", in_progress: "In Progress", review: "Review", done: "Done", blocked: "Blocked" }[status] ?? status;
}
export function invoiceStatusLabel(status: string) {
  return { draft: "Draft", sent: "Sent", paid: "Paid", overdue: "Overdue", cancelled: "Cancelled" }[status] ?? status;
}
export function documentApprovalLabel(status: string) {
  return { pending: "Awaiting Approval", approved: "Approved", rejected: "Rejected", not_required: "N/A" }[status] ?? status;
}
export function taskPriorityLabel(status: string) {
  return { critical: "Critical", high: "High", medium: "Medium", low: "Low" }[status] ?? status;
}

// ─── Misc ─────────────────────────────────────────────
export function truncate(str: string, maxLen: number) {
  return str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;
}

export function generateId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
