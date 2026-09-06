import {
  User, Tenant, Client, Project, Task, Document, DocumentComment,
  Invoice, Message, Workflow, WorkflowRun, AuditLog, Notification,
  DocumentVersion, ApiKey, WebhookEndpoint, SlaPolicy, SlaBreachItem, ClientHealthRecord,
} from "@/lib/types";

// ─── Tenant ───────────────────────────────────────────
const tenant: Tenant = {
  id: "tenant_meridian",
  name: "Meridian Creative Agency",
  slug: "meridian",
  plan: "pro",
  createdAt: "2024-01-15T09:00:00Z",
};

// ─── Users ────────────────────────────────────────────
const users: User[] = [
  {
    id: "user_admin_1",
    tenantId: "tenant_meridian",
    role: "admin",
    fullName: "Sophia Reyes",
    email: "sophia@meridianagency.com",
    avatarUrl: undefined,
    createdAt: "2024-01-15T09:00:00Z",
  },
  {
    id: "user_team_1",
    tenantId: "tenant_meridian",
    role: "team",
    fullName: "Marcus Webb",
    email: "marcus@meridianagency.com",
    createdAt: "2024-01-20T09:00:00Z",
  },
  {
    id: "user_team_2",
    tenantId: "tenant_meridian",
    role: "team",
    fullName: "Priya Nair",
    email: "priya@meridianagency.com",
    createdAt: "2024-02-01T09:00:00Z",
  },
  {
    id: "user_team_3",
    tenantId: "tenant_meridian",
    role: "team",
    fullName: "Daniel Torres",
    email: "daniel@meridianagency.com",
    createdAt: "2024-02-10T09:00:00Z",
  },
  {
    id: "user_client_halcyon",
    tenantId: "tenant_meridian",
    role: "client",
    fullName: "Ethan Blackwell",
    email: "ethan@halcyonventures.com",
    clientId: "client_halcyon",
    createdAt: "2024-02-15T09:00:00Z",
  },
  {
    id: "user_client_strata",
    tenantId: "tenant_meridian",
    role: "client",
    fullName: "Naomi Chen",
    email: "naomi@stratalogistics.com",
    clientId: "client_strata",
    createdAt: "2024-03-01T09:00:00Z",
  },
  {
    id: "user_client_bloom",
    tenantId: "tenant_meridian",
    role: "client",
    fullName: "James Okafor",
    email: "james@bloomandco.com",
    clientId: "client_bloom",
    createdAt: "2024-03-10T09:00:00Z",
  },
];

// ─── Clients ──────────────────────────────────────────
const clients: Client[] = [
  {
    id: "client_halcyon",
    tenantId: "tenant_meridian",
    companyName: "Halcyon Ventures",
    contactEmail: "ethan@halcyonventures.com",
    contactName: "Ethan Blackwell",
    status: "active",
    industry: "Venture Capital",
    website: "https://halcyonventures.com",
    createdAt: "2024-02-15T09:00:00Z",
  },
  {
    id: "client_strata",
    tenantId: "tenant_meridian",
    companyName: "Strata Logistics",
    contactEmail: "naomi@stratalogistics.com",
    contactName: "Naomi Chen",
    status: "active",
    industry: "Logistics & Supply Chain",
    website: "https://stratalogistics.com",
    createdAt: "2024-03-01T09:00:00Z",
  },
  {
    id: "client_bloom",
    tenantId: "tenant_meridian",
    companyName: "Bloom & Co",
    contactEmail: "james@bloomandco.com",
    contactName: "James Okafor",
    status: "active",
    industry: "Consumer Retail",
    website: "https://bloomandco.com",
    createdAt: "2024-03-10T09:00:00Z",
  },
];

// ─── Projects ─────────────────────────────────────────
const projects: Project[] = [
  {
    id: "proj_halcyon_brand",
    tenantId: "tenant_meridian",
    clientId: "client_halcyon",
    name: "Brand Identity Refresh",
    status: "active",
    description: "Full brand overhaul including logo, typography system, color palette, and brand guidelines document.",
    dueDate: "2026-10-15",
    budget: 28000,
    completionPercent: 62,
    createdAt: "2024-02-20T09:00:00Z",
  },
  {
    id: "proj_halcyon_web",
    tenantId: "tenant_meridian",
    clientId: "client_halcyon",
    name: "Investor Portal Redesign",
    status: "active",
    description: "Redesign of the investor-facing web portal with updated UX, data visualization components, and mobile responsiveness.",
    dueDate: "2026-11-30",
    budget: 52000,
    completionPercent: 28,
    createdAt: "2024-04-01T09:00:00Z",
  },
  {
    id: "proj_strata_ops",
    tenantId: "tenant_meridian",
    clientId: "client_strata",
    name: "Ops Dashboard MVP",
    status: "active",
    description: "Build an internal operations dashboard for real-time fleet tracking, route optimization display, and KPI reporting.",
    dueDate: "2026-09-30",
    budget: 74000,
    completionPercent: 85,
    createdAt: "2024-03-05T09:00:00Z",
  },
  {
    id: "proj_strata_mobile",
    tenantId: "tenant_meridian",
    clientId: "client_strata",
    name: "Driver Mobile App",
    status: "on_hold",
    description: "Native mobile application for delivery drivers with route navigation, proof of delivery, and real-time communication.",
    dueDate: "2027-02-28",
    budget: 96000,
    completionPercent: 15,
    createdAt: "2024-05-10T09:00:00Z",
  },
  {
    id: "proj_bloom_ecomm",
    tenantId: "tenant_meridian",
    clientId: "client_bloom",
    name: "E-commerce Platform Launch",
    status: "active",
    description: "Full e-commerce solution with product catalog, checkout flow, inventory management integration, and email marketing hooks.",
    dueDate: "2026-10-01",
    budget: 41000,
    completionPercent: 71,
    createdAt: "2024-03-15T09:00:00Z",
  },
  {
    id: "proj_bloom_campaign",
    tenantId: "tenant_meridian",
    clientId: "client_bloom",
    name: "Q4 Campaign Assets",
    status: "completed",
    description: "Design and production of all Q4 marketing campaign assets: digital ads, email templates, social content, and landing pages.",
    dueDate: "2026-08-31",
    budget: 18000,
    completionPercent: 100,
    createdAt: "2024-06-01T09:00:00Z",
  },
];

// ─── Tasks ────────────────────────────────────────────
const tasks: Task[] = [
  // Brand Identity
  { id: "task_001", projectId: "proj_halcyon_brand", tenantId: "tenant_meridian", assigneeId: "user_team_1", title: "Logo concept exploration", status: "done", priority: "high", dueDate: "2026-08-10", createdAt: "2024-02-20T09:00:00Z" },
  { id: "task_002", projectId: "proj_halcyon_brand", tenantId: "tenant_meridian", assigneeId: "user_team_1", title: "Typography system definition", status: "done", priority: "medium", dueDate: "2026-08-20", createdAt: "2024-02-22T09:00:00Z" },
  { id: "task_003", projectId: "proj_halcyon_brand", tenantId: "tenant_meridian", assigneeId: "user_team_2", title: "Color palette finalization", status: "in_progress", priority: "high", dueDate: "2026-09-10", createdAt: "2024-03-01T09:00:00Z" },
  { id: "task_004", projectId: "proj_halcyon_brand", tenantId: "tenant_meridian", assigneeId: "user_team_2", title: "Brand guidelines document", status: "todo", priority: "medium", dueDate: "2026-10-01", createdAt: "2024-03-05T09:00:00Z" },
  // Investor Portal
  { id: "task_005", projectId: "proj_halcyon_web", tenantId: "tenant_meridian", assigneeId: "user_team_3", title: "UX audit & competitor research", status: "done", priority: "high", dueDate: "2026-07-15", createdAt: "2024-04-05T09:00:00Z" },
  { id: "task_006", projectId: "proj_halcyon_web", tenantId: "tenant_meridian", assigneeId: "user_team_3", title: "Wireframes — portfolio view", status: "review", priority: "high", dueDate: "2026-09-15", createdAt: "2024-04-10T09:00:00Z" },
  { id: "task_007", projectId: "proj_halcyon_web", tenantId: "tenant_meridian", assigneeId: "user_team_1", title: "Data visualization component design", status: "in_progress", priority: "critical", dueDate: "2026-09-20", createdAt: "2024-04-15T09:00:00Z" },
  // Ops Dashboard
  { id: "task_008", projectId: "proj_strata_ops", tenantId: "tenant_meridian", assigneeId: "user_team_2", title: "Fleet tracking map integration", status: "done", priority: "critical", dueDate: "2026-08-01", createdAt: "2024-03-10T09:00:00Z" },
  { id: "task_009", projectId: "proj_strata_ops", tenantId: "tenant_meridian", assigneeId: "user_team_3", title: "KPI reporting module", status: "done", priority: "high", dueDate: "2026-08-20", createdAt: "2024-03-15T09:00:00Z" },
  { id: "task_010", projectId: "proj_strata_ops", tenantId: "tenant_meridian", assigneeId: "user_team_2", title: "User acceptance testing", status: "in_progress", priority: "high", dueDate: "2026-09-25", createdAt: "2024-04-01T09:00:00Z" },
  { id: "task_011", projectId: "proj_strata_ops", tenantId: "tenant_meridian", assigneeId: "user_team_1", title: "Performance optimization pass", status: "todo", priority: "medium", dueDate: "2026-09-28", createdAt: "2024-04-05T09:00:00Z" },
  // E-commerce
  { id: "task_012", projectId: "proj_bloom_ecomm", tenantId: "tenant_meridian", assigneeId: "user_team_1", title: "Product catalog implementation", status: "done", priority: "critical", dueDate: "2026-08-15", createdAt: "2024-03-20T09:00:00Z" },
  { id: "task_013", projectId: "proj_bloom_ecomm", tenantId: "tenant_meridian", assigneeId: "user_team_2", title: "Checkout flow & payment integration", status: "done", priority: "critical", dueDate: "2026-08-30", createdAt: "2024-03-25T09:00:00Z" },
  { id: "task_014", projectId: "proj_bloom_ecomm", tenantId: "tenant_meridian", assigneeId: "user_team_3", title: "Inventory sync API", status: "in_progress", priority: "high", dueDate: "2026-09-20", createdAt: "2024-04-10T09:00:00Z" },
  { id: "task_015", projectId: "proj_bloom_ecomm", tenantId: "tenant_meridian", assigneeId: "user_team_1", title: "Email marketing hooks", status: "blocked", priority: "medium", dueDate: "2026-09-25", createdAt: "2024-04-15T09:00:00Z" },
];

// ─── Documents ────────────────────────────────────────
const documents: Document[] = [
  {
    id: "doc_001",
    projectId: "proj_halcyon_brand",
    tenantId: "tenant_meridian",
    name: "Logo Concepts v1",
    version: 1,
    storagePath: "meridian/proj_halcyon_brand/logo-concepts-v1.pdf",
    mimeType: "application/pdf",
    sizeBytes: 4200000,
    approvalStatus: "approved",
    uploadedBy: "user_team_1",
    description: "Initial logo concept directions — 3 routes explored.",
    createdAt: "2026-08-12T14:00:00Z",
  },
  {
    id: "doc_002",
    projectId: "proj_halcyon_brand",
    tenantId: "tenant_meridian",
    name: "Logo Concepts v2",
    version: 2,
    storagePath: "meridian/proj_halcyon_brand/logo-concepts-v2.pdf",
    mimeType: "application/pdf",
    sizeBytes: 5100000,
    approvalStatus: "pending",
    uploadedBy: "user_team_1",
    description: "Refined logo concepts based on client feedback from v1.",
    createdAt: "2026-09-01T10:30:00Z",
  },
  {
    id: "doc_003",
    projectId: "proj_halcyon_web",
    tenantId: "tenant_meridian",
    name: "Wireframes — Portfolio View",
    version: 1,
    storagePath: "meridian/proj_halcyon_web/wireframes-portfolio-v1.fig",
    mimeType: "application/octet-stream",
    sizeBytes: 2800000,
    approvalStatus: "pending",
    uploadedBy: "user_team_3",
    description: "Low-fidelity wireframes for the portfolio and fund performance screens.",
    createdAt: "2026-09-03T09:15:00Z",
  },
  {
    id: "doc_004",
    projectId: "proj_strata_ops",
    tenantId: "tenant_meridian",
    name: "Dashboard Technical Spec",
    version: 1,
    storagePath: "meridian/proj_strata_ops/tech-spec-v1.pdf",
    mimeType: "application/pdf",
    sizeBytes: 1900000,
    approvalStatus: "approved",
    uploadedBy: "user_team_2",
    description: "Full technical specification for the Ops Dashboard MVP.",
    createdAt: "2026-07-20T11:00:00Z",
  },
  {
    id: "doc_005",
    projectId: "proj_bloom_ecomm",
    tenantId: "tenant_meridian",
    name: "Product Catalog Design",
    version: 1,
    storagePath: "meridian/proj_bloom_ecomm/product-catalog-designs.pdf",
    mimeType: "application/pdf",
    sizeBytes: 7300000,
    approvalStatus: "approved",
    uploadedBy: "user_team_1",
    description: "Final product catalog page designs including mobile views.",
    createdAt: "2026-08-05T13:00:00Z",
  },
  {
    id: "doc_006",
    projectId: "proj_bloom_ecomm",
    tenantId: "tenant_meridian",
    name: "Checkout Flow Prototype",
    version: 1,
    storagePath: "meridian/proj_bloom_ecomm/checkout-prototype.fig",
    mimeType: "application/octet-stream",
    sizeBytes: 3600000,
    approvalStatus: "rejected",
    uploadedBy: "user_team_2",
    description: "Interactive Figma prototype for checkout — requires revision per client feedback.",
    createdAt: "2026-08-25T16:00:00Z",
  },
];

const documentVersions: DocumentVersion[] = [
  {
    id: "dv_001_v1",
    documentId: "doc_001",
    version: 1,
    storagePath: "meridian/proj_halcyon_brand/logo-concepts-v1.pdf",
    uploadedBy: "user_team_1",
    createdAt: "2026-08-12T14:00:00Z",
  },
  {
    id: "dv_002_v1",
    documentId: "doc_002",
    version: 1,
    storagePath: "meridian/proj_halcyon_brand/logo-concepts-v1.pdf",
    uploadedBy: "user_team_1",
    createdAt: "2026-08-12T14:00:00Z",
  },
  {
    id: "dv_002_v2",
    documentId: "doc_002",
    version: 2,
    storagePath: "meridian/proj_halcyon_brand/logo-concepts-v2.pdf",
    uploadedBy: "user_team_1",
    createdAt: "2026-09-01T10:30:00Z",
  },
];

const documentComments: DocumentComment[] = [
  {
    id: "cmt_001",
    documentId: "doc_001",
    tenantId: "tenant_meridian",
    authorId: "user_client_halcyon",
    content: "Love routes 1 and 3. Route 2 feels too geometric for our brand. Can we explore a softer version of route 3?",
    createdAt: "2026-08-13T10:00:00Z",
  },
  {
    id: "cmt_002",
    documentId: "doc_001",
    tenantId: "tenant_meridian",
    authorId: "user_team_1",
    content: "Noted! We'll develop route 3 further with softer curves and test both light/dark variants. Uploading v2 by end of week.",
    createdAt: "2026-08-13T11:30:00Z",
  },
  {
    id: "cmt_003",
    documentId: "doc_006",
    tenantId: "tenant_meridian",
    authorId: "user_client_bloom",
    content: "The guest checkout flow needs to be more prominent. Users shouldn't be forced to create an account. Please revise.",
    createdAt: "2026-08-26T09:00:00Z",
  },
];

// ─── Invoices ─────────────────────────────────────────
const invoices: Invoice[] = [
  {
    id: "inv_001",
    projectId: "proj_halcyon_brand",
    tenantId: "tenant_meridian",
    clientId: "client_halcyon",
    invoiceNumber: "INV-2026-0041",
    amount: 14000,
    currency: "USD",
    status: "paid",
    dueDate: "2026-08-01",
    paidAt: "2026-07-28T14:00:00Z",
    lineItems: [
      { id: "li_001a", description: "Brand discovery & strategy", quantity: 1, unitPrice: 5000, total: 5000 },
      { id: "li_001b", description: "Logo design — Phase 1 (3 concepts)", quantity: 1, unitPrice: 9000, total: 9000 },
    ],
    createdAt: "2026-07-01T09:00:00Z",
  },
  {
    id: "inv_002",
    projectId: "proj_halcyon_brand",
    tenantId: "tenant_meridian",
    clientId: "client_halcyon",
    invoiceNumber: "INV-2026-0052",
    amount: 14000,
    currency: "USD",
    status: "sent",
    dueDate: "2026-09-15",
    lineItems: [
      { id: "li_002a", description: "Logo design — Phase 2 (refinement)", quantity: 1, unitPrice: 6000, total: 6000 },
      { id: "li_002b", description: "Typography system", quantity: 1, unitPrice: 8000, total: 8000 },
    ],
    createdAt: "2026-08-15T09:00:00Z",
  },
  {
    id: "inv_003",
    projectId: "proj_strata_ops",
    tenantId: "tenant_meridian",
    clientId: "client_strata",
    invoiceNumber: "INV-2026-0038",
    amount: 37000,
    currency: "USD",
    status: "overdue",
    dueDate: "2026-08-20",
    lineItems: [
      { id: "li_003a", description: "Dashboard development — milestone 1", quantity: 1, unitPrice: 20000, total: 20000 },
      { id: "li_003b", description: "Fleet tracking integration", quantity: 1, unitPrice: 17000, total: 17000 },
    ],
    createdAt: "2026-07-20T09:00:00Z",
  },
  {
    id: "inv_004",
    projectId: "proj_bloom_ecomm",
    tenantId: "tenant_meridian",
    clientId: "client_bloom",
    invoiceNumber: "INV-2026-0047",
    amount: 20500,
    currency: "USD",
    status: "paid",
    dueDate: "2026-08-10",
    paidAt: "2026-08-08T11:00:00Z",
    lineItems: [
      { id: "li_004a", description: "E-commerce platform setup", quantity: 1, unitPrice: 8500, total: 8500 },
      { id: "li_004b", description: "Product catalog development", quantity: 1, unitPrice: 7000, total: 7000 },
      { id: "li_004c", description: "Checkout flow implementation", quantity: 1, unitPrice: 5000, total: 5000 },
    ],
    createdAt: "2026-07-10T09:00:00Z",
  },
  {
    id: "inv_005",
    projectId: "proj_bloom_campaign",
    tenantId: "tenant_meridian",
    clientId: "client_bloom",
    invoiceNumber: "INV-2026-0055",
    amount: 18000,
    currency: "USD",
    status: "sent",
    dueDate: "2026-09-20",
    lineItems: [
      { id: "li_005a", description: "Q4 campaign strategy & copywriting", quantity: 1, unitPrice: 4000, total: 4000 },
      { id: "li_005b", description: "Digital ad production (12 formats)", quantity: 12, unitPrice: 500, total: 6000 },
      { id: "li_005c", description: "Email templates (6 variants)", quantity: 6, unitPrice: 800, total: 4800 },
      { id: "li_005d", description: "Landing page design & dev", quantity: 1, unitPrice: 3200, total: 3200 },
    ],
    createdAt: "2026-08-25T09:00:00Z",
  },
];

// ─── Messages ─────────────────────────────────────────
const messages: Message[] = [
  { id: "msg_001", projectId: "proj_halcyon_brand", tenantId: "tenant_meridian", authorId: "user_admin_1", content: "Welcome to the Brand Identity Refresh project! We've set up this thread for all project communications. Feel free to drop questions or feedback here.", createdAt: "2026-02-20T10:00:00Z" },
  { id: "msg_002", projectId: "proj_halcyon_brand", tenantId: "tenant_meridian", authorId: "user_client_halcyon", content: "Thanks Sophia! Quick question — will we be reviewing concepts in a live call or async via this portal?", createdAt: "2026-02-20T14:30:00Z" },
  { id: "msg_003", projectId: "proj_halcyon_brand", tenantId: "tenant_meridian", authorId: "user_admin_1", content: "We'll do both — we'll upload concepts here for async review, then schedule a 45-min call to walk through the final direction. Sound good?", createdAt: "2026-02-20T15:00:00Z" },
  { id: "msg_004", projectId: "proj_halcyon_brand", tenantId: "tenant_meridian", authorId: "user_client_halcyon", content: "Perfect. Looking forward to seeing the first concepts.", createdAt: "2026-02-20T15:10:00Z" },
  { id: "msg_005", projectId: "proj_strata_ops", tenantId: "tenant_meridian", authorId: "user_team_2", content: "Naomi — heads up that the fleet tracking map is now live in the staging environment. Sharing the link with you separately. Please check on Chrome/Firefox.", createdAt: "2026-08-02T11:00:00Z" },
  { id: "msg_006", projectId: "proj_strata_ops", tenantId: "tenant_meridian", authorId: "user_client_strata", content: "Looks great! One issue — the route labels are overlapping on the city view zoom level. Can we fix that before UAT?", createdAt: "2026-08-02T16:00:00Z" },
  { id: "msg_007", projectId: "proj_bloom_ecomm", tenantId: "tenant_meridian", authorId: "user_team_1", content: "James — the guest checkout revision is now in progress. We're prioritizing it this sprint. New prototype ready by Thursday.", createdAt: "2026-08-27T09:30:00Z" },
  { id: "msg_008", projectId: "proj_bloom_ecomm", tenantId: "tenant_meridian", authorId: "user_client_bloom", content: "Thanks! Also flagging — the mobile cart experience needs a sticky CTA button. Easy fix?", createdAt: "2026-08-27T10:00:00Z" },
];

// ─── Workflows ────────────────────────────────────────
const workflows: Workflow[] = [
  {
    id: "wf_001",
    tenantId: "tenant_meridian",
    name: "Invoice Overdue Alert",
    description: "When an invoice passes its due date, notify the admin and create a follow-up task.",
    triggerType: "invoice_overdue",
    conditions: [],
    actions: [
      { id: "wfa_001a", type: "notify_user", params: { userId: "user_admin_1", message: "Invoice {{invoice.invoiceNumber}} is overdue." } },
      { id: "wfa_001b", type: "create_task", params: { title: "Follow up on overdue invoice {{invoice.invoiceNumber}}", assigneeId: "user_admin_1", priority: "high" } },
    ],
    isActive: true,
    createdAt: "2024-03-01T09:00:00Z",
  },
  {
    id: "wf_002",
    tenantId: "tenant_meridian",
    name: "Document Approval Requested",
    description: "When a document awaiting approval is uploaded, notify the client with a link to review.",
    triggerType: "new_document_upload",
    conditions: [
      { field: "document.approvalStatus", operator: "equals", value: "pending" },
    ],
    actions: [
      { id: "wfa_002a", type: "notify_user", params: { role: "client", message: "A new document requires your approval: {{document.name}}" } },
      { id: "wfa_002b", type: "send_email", params: { template: "document_approval_request" } },
    ],
    isActive: true,
    createdAt: "2024-03-05T09:00:00Z",
  },
  {
    id: "wf_003",
    tenantId: "tenant_meridian",
    name: "Task Blocked — Escalate to Admin",
    description: "When a task is marked as blocked, notify the admin and ping the n8n Slack integration.",
    triggerType: "task_status_change",
    conditions: [
      { field: "task.status", operator: "equals", value: "blocked" },
    ],
    actions: [
      { id: "wfa_003a", type: "notify_user", params: { userId: "user_admin_1", message: "Task '{{task.title}}' is blocked. Immediate attention required." } },
      { id: "wfa_003b", type: "dispatch_webhook", params: { eventType: "task_blocked", channel: "ops-alerts" } },
    ],
    isActive: true,
    createdAt: "2024-03-10T09:00:00Z",
  },
];

// ─── Workflow Runs ────────────────────────────────────
const workflowRuns: WorkflowRun[] = [
  {
    id: "wfr_001",
    workflowId: "wf_001",
    triggeredBy: "system",
    status: "success",
    payload: { invoiceId: "inv_003", invoiceNumber: "INV-2026-0038" },
    result: { tasksCreated: 1, notificationsSent: 1 },
    ranAt: "2026-08-21T00:01:00Z",
  },
  {
    id: "wfr_002",
    workflowId: "wf_002",
    triggeredBy: "user_team_3",
    status: "success",
    payload: { documentId: "doc_003", documentName: "Wireframes — Portfolio View" },
    result: { notificationsSent: 1, emailsSent: 1 },
    ranAt: "2026-09-03T09:16:00Z",
  },
  {
    id: "wfr_003",
    workflowId: "wf_003",
    triggeredBy: "user_team_1",
    status: "success",
    payload: { taskId: "task_015", taskTitle: "Email marketing hooks" },
    result: { notificationsSent: 1, webhookDispatched: true },
    ranAt: "2026-09-04T14:30:00Z",
  },
  {
    id: "wfr_004",
    workflowId: "wf_002",
    triggeredBy: "user_team_1",
    status: "success",
    payload: { documentId: "doc_002", documentName: "Logo Concepts v2" },
    result: { notificationsSent: 1, emailsSent: 1 },
    ranAt: "2026-09-01T10:31:00Z",
  },
];

// ─── Audit Logs ───────────────────────────────────────
const auditLogs: AuditLog[] = [
  {
    id: "al_001",
    tenantId: "tenant_meridian",
    actorId: "user_admin_1",
    action: "client.created",
    resourceType: "client",
    resourceId: "client_bloom",
    createdAt: "2026-03-10T09:00:00Z",
  },
  {
    id: "al_002",
    tenantId: "tenant_meridian",
    actorId: "user_team_1",
    action: "document.uploaded",
    resourceType: "document",
    resourceId: "doc_002",
    metadata: { version: 2, fileName: "logo-concepts-v2.pdf" },
    createdAt: "2026-09-01T10:30:00Z",
  },
  {
    id: "al_003",
    tenantId: "tenant_meridian",
    actorId: "user_client_halcyon",
    action: "document.approved",
    resourceType: "document",
    resourceId: "doc_001",
    diff: { approvalStatus: { before: "pending", after: "approved" } },
    createdAt: "2026-08-13T10:05:00Z",
  },
  {
    id: "al_004",
    tenantId: "tenant_meridian",
    actorId: "system",
    action: "workflow.triggered",
    resourceType: "workflow_run",
    resourceId: "wfr_001",
    metadata: { workflowName: "Invoice Overdue Alert", trigger: "invoice_overdue" },
    createdAt: "2026-08-21T00:01:00Z",
  },
  {
    id: "al_005",
    tenantId: "tenant_meridian",
    actorId: "user_team_1",
    action: "task.status_changed",
    resourceType: "task",
    resourceId: "task_015",
    diff: { status: { before: "in_progress", after: "blocked" } },
    createdAt: "2026-09-04T14:29:00Z",
  },
  {
    id: "al_006",
    tenantId: "tenant_meridian",
    actorId: "user_client_bloom",
    action: "document.rejected",
    resourceType: "document",
    resourceId: "doc_006",
    diff: { approvalStatus: { before: "pending", after: "rejected" } },
    metadata: { reason: "Guest checkout flow needs revision" },
    createdAt: "2026-08-26T09:01:00Z",
  },
  {
    id: "al_007",
    tenantId: "tenant_meridian",
    actorId: "user_admin_1",
    action: "invoice.sent",
    resourceType: "invoice",
    resourceId: "inv_005",
    diff: { status: { before: "draft", after: "sent" } },
    createdAt: "2026-08-25T09:05:00Z",
  },
  {
    id: "al_008",
    tenantId: "tenant_meridian",
    actorId: "user_admin_1",
    action: "workflow.created",
    resourceType: "workflow",
    resourceId: "wf_003",
    createdAt: "2026-03-10T09:05:00Z",
  },
  {
    id: "al_009",
    tenantId: "tenant_meridian",
    actorId: "user_team_2",
    action: "task.status_changed",
    resourceType: "task",
    resourceId: "task_010",
    diff: { status: { before: "todo", after: "in_progress" } },
    createdAt: "2026-09-05T09:00:00Z",
  },
  {
    id: "al_010",
    tenantId: "tenant_meridian",
    actorId: "user_admin_1",
    action: "project.created",
    resourceType: "project",
    resourceId: "proj_halcyon_web",
    createdAt: "2026-04-01T09:00:00Z",
  },
];

// ─── Notifications ────────────────────────────────────
const notifications: Notification[] = [
  {
    id: "notif_001",
    tenantId: "tenant_meridian",
    userId: "user_admin_1",
    type: "invoice_overdue",
    title: "Invoice overdue",
    body: "INV-2026-0038 from Strata Logistics is 16 days overdue.",
    href: "/admin/invoices/inv_003",
    read: false,
    createdAt: "2026-09-05T09:00:00Z",
  },
  {
    id: "notif_002",
    tenantId: "tenant_meridian",
    userId: "user_admin_1",
    type: "approval_requested",
    title: "Approval requested",
    body: "Ethan Blackwell needs to review 'Logo Concepts v2'.",
    href: "/admin/projects/proj_halcyon_brand/documents",
    read: false,
    createdAt: "2026-09-01T10:31:00Z",
  },
  {
    id: "notif_003",
    tenantId: "tenant_meridian",
    userId: "user_admin_1",
    type: "task_assigned",
    title: "Task blocked",
    body: "'Email marketing hooks' was marked as blocked by Marcus Webb.",
    href: "/admin/projects/proj_bloom_ecomm/tasks",
    read: true,
    createdAt: "2026-09-04T14:30:00Z",
  },
  {
    id: "notif_004",
    tenantId: "tenant_meridian",
    userId: "user_client_halcyon",
    type: "document_uploaded",
    title: "New document awaiting approval",
    body: "Meridian uploaded 'Logo Concepts v2' — please review and approve.",
    href: "/portal/documents/doc_002",
    read: false,
    createdAt: "2026-09-01T10:32:00Z",
  },
  {
    id: "notif_005",
    tenantId: "tenant_meridian",
    userId: "user_client_strata",
    type: "document_uploaded",
    title: "New document available",
    body: "'Wireframes — Portfolio View' has been shared with you for review.",
    href: "/portal/documents/doc_003",
    read: false,
    createdAt: "2026-09-03T09:16:00Z",
  },
];

// ─── Developer & SLA Seeds ─────────────────────────────
const apiKeys: ApiKey[] = [
  {
    id: "key_001",
    tenantId: "tenant_meridian",
    name: "Zapier Ingestion Pipeline",
    keyPrefix: "nexops_live_z7f9",
    secretMasked: "nexops_live_z7f9****************************4a12",
    scopes: ["projects:read", "tasks:write", "documents:sign"],
    createdAt: "2026-06-12T10:00:00Z",
    lastUsedAt: "2026-09-06T04:22:18Z",
    revoked: false,
  },
  {
    id: "key_002",
    tenantId: "tenant_meridian",
    name: "n8n Webhook Automator",
    keyPrefix: "nexops_live_w83m",
    secretMasked: "nexops_live_w83m****************************9e31",
    scopes: ["workflows:execute", "audit:read", "billing:read"],
    createdAt: "2026-07-01T14:15:00Z",
    lastUsedAt: "2026-09-05T18:40:02Z",
    revoked: false,
  },
  {
    id: "key_003",
    tenantId: "tenant_meridian",
    name: "Legacy Mobile App Sync",
    keyPrefix: "nexops_live_p29x",
    secretMasked: "nexops_live_p29x****************************77b0",
    scopes: ["projects:read"],
    createdAt: "2025-11-20T08:30:00Z",
    revoked: true,
  },
];

const webhookEndpoints: WebhookEndpoint[] = [
  {
    id: "wh_001",
    tenantId: "tenant_meridian",
    name: "Production Slack Alert Bot",
    url: "https://hooks.slack.com/services/T04A/B09K/8f74a9b2",
    events: ["document.approved", "invoice.overdue", "sla.breached"],
    secret: "whsec_98f4a2109e84b7a1",
    isActive: true,
    createdAt: "2026-04-10T11:00:00Z",
    lastFiredAt: "2026-09-05T16:22:00Z",
    lastStatus: 200,
  },
  {
    id: "wh_002",
    tenantId: "tenant_meridian",
    name: "n8n Enterprise Operations Engine",
    url: "https://automation.meridianagency.internal/webhook/nexops-ingress",
    events: ["task.status_changed", "document.uploaded", "workflow.triggered"],
    secret: "whsec_33c87e1a90f23b12",
    isActive: true,
    createdAt: "2026-05-18T09:30:00Z",
    lastFiredAt: "2026-09-06T02:11:00Z",
    lastStatus: 200,
  },
];

const slaPolicies: SlaPolicy[] = [
  {
    id: "sla_enterprise",
    tenantId: "tenant_meridian",
    tier: "enterprise",
    name: "Enterprise Dedicated Tier",
    firstDraftDays: 3,
    revisionTurnaroundHours: 24,
    invoiceNetDays: 30,
    urgentResponseHours: 2,
  },
  {
    id: "sla_mid_market",
    tenantId: "tenant_meridian",
    tier: "mid_market",
    name: "Growth Agency Standard",
    firstDraftDays: 5,
    revisionTurnaroundHours: 48,
    invoiceNetDays: 30,
    urgentResponseHours: 6,
  },
  {
    id: "sla_standard",
    tenantId: "tenant_meridian",
    tier: "standard",
    name: "Foundation Tier",
    firstDraftDays: 7,
    revisionTurnaroundHours: 72,
    invoiceNetDays: 15,
    urgentResponseHours: 12,
  },
];

// ─── Store ────────────────────────────────────────────
// Simple in-memory store with deep-clone helpers

type StoreData = {
  tenant: Tenant;
  users: User[];
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  documents: Document[];
  documentVersions: DocumentVersion[];
  documentComments: DocumentComment[];
  invoices: Invoice[];
  messages: Message[];
  workflows: Workflow[];
  workflowRuns: WorkflowRun[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  apiKeys: ApiKey[];
  webhookEndpoints: WebhookEndpoint[];
  slaPolicies: SlaPolicy[];
};

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

class InMemoryStore {
  private data: StoreData = {
    tenant: clone(tenant),
    users: clone(users),
    clients: clone(clients),
    projects: clone(projects),
    tasks: clone(tasks),
    documents: clone(documents),
    documentVersions: clone(documentVersions),
    documentComments: clone(documentComments),
    invoices: clone(invoices),
    messages: clone(messages),
    workflows: clone(workflows),
    workflowRuns: clone(workflowRuns),
    auditLogs: clone(auditLogs),
    notifications: clone(notifications),
    apiKeys: clone(apiKeys),
    webhookEndpoints: clone(webhookEndpoints),
    slaPolicies: clone(slaPolicies),
  };

  // Tenant
  getTenant() { return clone(this.data.tenant); }

  // Users
  getUsers(tenantId: string) {
    return clone(this.data.users.filter(u => u.tenantId === tenantId));
  }
  getUserById(id: string) {
    return clone(this.data.users.find(u => u.id === id) ?? null);
  }
  getUserByEmail(email: string) {
    return clone(this.data.users.find(u => u.email === email) ?? null);
  }
  updateUser(id: string, patch: Partial<User>) {
    const i = this.data.users.findIndex(u => u.id === id);
    if (i === -1) return null;
    this.data.users[i] = { ...this.data.users[i], ...patch };
    return clone(this.data.users[i]);
  }
  addUser(user: User) {
    this.data.users.push(clone(user));
    return clone(user);
  }
  deleteUser(id: string) {
    this.data.users = this.data.users.filter(u => u.id !== id);
  }

  // Clients
  getClients(tenantId: string) {
    return clone(this.data.clients.filter(c => c.tenantId === tenantId));
  }
  getClientById(id: string) {
    return clone(this.data.clients.find(c => c.id === id) ?? null);
  }
  addClient(client: Client) {
    this.data.clients.push(clone(client));
    return clone(client);
  }
  updateClient(id: string, patch: Partial<Client>) {
    const i = this.data.clients.findIndex(c => c.id === id);
    if (i === -1) return null;
    this.data.clients[i] = { ...this.data.clients[i], ...patch };
    return clone(this.data.clients[i]);
  }
  deleteClient(id: string) {
    this.data.clients = this.data.clients.filter(c => c.id !== id);
  }

  // Projects
  getProjects(tenantId: string) {
    return clone(this.data.projects.filter(p => p.tenantId === tenantId));
  }
  getProjectsByClient(clientId: string) {
    return clone(this.data.projects.filter(p => p.clientId === clientId));
  }
  getProjectById(id: string) {
    return clone(this.data.projects.find(p => p.id === id) ?? null);
  }
  addProject(project: Project) {
    this.data.projects.push(clone(project));
    return clone(project);
  }
  updateProject(id: string, patch: Partial<Project>) {
    const i = this.data.projects.findIndex(p => p.id === id);
    if (i === -1) return null;
    this.data.projects[i] = { ...this.data.projects[i], ...patch };
    return clone(this.data.projects[i]);
  }
  deleteProject(id: string) {
    this.data.projects = this.data.projects.filter(p => p.id !== id);
  }

  // Tasks
  getTasks(tenantId: string) {
    return clone(this.data.tasks.filter(t => t.tenantId === tenantId));
  }
  getTasksByProject(projectId: string) {
    return clone(this.data.tasks.filter(t => t.projectId === projectId));
  }
  getTaskById(id: string) {
    return clone(this.data.tasks.find(t => t.id === id) ?? null);
  }
  addTask(task: Task) {
    this.data.tasks.push(clone(task));
    return clone(task);
  }
  updateTask(id: string, patch: Partial<Task>) {
    const i = this.data.tasks.findIndex(t => t.id === id);
    if (i === -1) return null;
    this.data.tasks[i] = { ...this.data.tasks[i], ...patch };
    return clone(this.data.tasks[i]);
  }
  deleteTask(id: string) {
    this.data.tasks = this.data.tasks.filter(t => t.id !== id);
  }

  // Documents
  getDocuments(tenantId: string) {
    return clone(this.data.documents.filter(d => d.tenantId === tenantId));
  }
  getDocumentsByProject(projectId: string) {
    return clone(this.data.documents.filter(d => d.projectId === projectId));
  }
  getDocumentById(id: string) {
    return clone(this.data.documents.find(d => d.id === id) ?? null);
  }
  getDocumentVersions(documentId: string) {
    return clone(this.data.documentVersions.filter(dv => dv.documentId === documentId));
  }
  getDocumentComments(documentId: string) {
    return clone(this.data.documentComments.filter(dc => dc.documentId === documentId));
  }
  addDocument(doc: Document) {
    this.data.documents.push(clone(doc));
    return clone(doc);
  }
  updateDocument(id: string, patch: Partial<Document>) {
    const i = this.data.documents.findIndex(d => d.id === id);
    if (i === -1) return null;
    this.data.documents[i] = { ...this.data.documents[i], ...patch };
    return clone(this.data.documents[i]);
  }
  addDocumentComment(comment: DocumentComment) {
    this.data.documentComments.push(clone(comment));
    return clone(comment);
  }

  // Invoices
  getInvoices(tenantId: string) {
    return clone(this.data.invoices.filter(i => i.tenantId === tenantId));
  }
  getInvoicesByClient(clientId: string) {
    return clone(this.data.invoices.filter(i => i.clientId === clientId));
  }
  getInvoicesByProject(projectId: string) {
    return clone(this.data.invoices.filter(i => i.projectId === projectId));
  }
  getInvoiceById(id: string) {
    return clone(this.data.invoices.find(i => i.id === id) ?? null);
  }
  addInvoice(invoice: Invoice) {
    this.data.invoices.push(clone(invoice));
    return clone(invoice);
  }
  updateInvoice(id: string, patch: Partial<Invoice>) {
    const i = this.data.invoices.findIndex(inv => inv.id === id);
    if (i === -1) return null;
    this.data.invoices[i] = { ...this.data.invoices[i], ...patch };
    return clone(this.data.invoices[i]);
  }

  // Messages
  getMessagesByProject(projectId: string) {
    return clone(this.data.messages.filter(m => m.projectId === projectId));
  }
  addMessage(msg: Message) {
    this.data.messages.push(clone(msg));
    return clone(msg);
  }

  // Workflows
  getWorkflows(tenantId: string) {
    return clone(this.data.workflows.filter(w => w.tenantId === tenantId));
  }
  getWorkflowById(id: string) {
    return clone(this.data.workflows.find(w => w.id === id) ?? null);
  }
  addWorkflow(wf: Workflow) {
    this.data.workflows.push(clone(wf));
    return clone(wf);
  }
  updateWorkflow(id: string, patch: Partial<Workflow>) {
    const i = this.data.workflows.findIndex(w => w.id === id);
    if (i === -1) return null;
    this.data.workflows[i] = { ...this.data.workflows[i], ...patch };
    return clone(this.data.workflows[i]);
  }
  deleteWorkflow(id: string) {
    this.data.workflows = this.data.workflows.filter(w => w.id !== id);
  }

  // Workflow Runs
  getWorkflowRuns(tenantId: string) {
    return clone(
      this.data.workflowRuns.filter(r => {
        const wf = this.data.workflows.find(w => w.id === r.workflowId);
        return wf?.tenantId === tenantId;
      })
    );
  }
  addWorkflowRun(run: WorkflowRun) {
    this.data.workflowRuns.push(clone(run));
    return clone(run);
  }

  // Audit Logs
  getAuditLogs(tenantId: string) {
    return clone(
      this.data.auditLogs
        .filter(l => l.tenantId === tenantId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );
  }
  addAuditLog(log: AuditLog) {
    this.data.auditLogs.push(clone(log));
    return clone(log);
  }

  // Notifications
  getNotifications(userId: string) {
    return clone(
      this.data.notifications
        .filter(n => n.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );
  }
  getUnreadCount(userId: string) {
    return this.data.notifications.filter(n => n.userId === userId && !n.read).length;
  }
  markRead(id: string) {
    const n = this.data.notifications.find(n => n.id === id);
    if (n) n.read = true;
  }
  markAllRead(userId: string) {
    this.data.notifications.filter(n => n.userId === userId).forEach(n => { n.read = true; });
  }
  addNotification(notif: Notification) {
    this.data.notifications.unshift(clone(notif));
    return clone(notif);
  }

  // Developer Platform — API Keys
  getApiKeys(tenantId: string) {
    return clone(this.data.apiKeys.filter(k => k.tenantId === tenantId));
  }
  addApiKey(key: ApiKey) {
    this.data.apiKeys.unshift(clone(key));
    return clone(key);
  }
  revokeApiKey(id: string) {
    const k = this.data.apiKeys.find(key => key.id === id);
    if (k) k.revoked = true;
    return clone(k ?? null);
  }

  // Developer Platform — Webhooks
  getWebhooks(tenantId: string) {
    return clone(this.data.webhookEndpoints.filter(w => w.tenantId === tenantId));
  }
  addWebhook(wh: WebhookEndpoint) {
    this.data.webhookEndpoints.unshift(clone(wh));
    return clone(wh);
  }
  deleteWebhook(id: string) {
    this.data.webhookEndpoints = this.data.webhookEndpoints.filter(w => w.id !== id);
  }
  updateWebhook(id: string, patch: Partial<WebhookEndpoint>) {
    const i = this.data.webhookEndpoints.findIndex(w => w.id === id);
    if (i !== -1) {
      this.data.webhookEndpoints[i] = { ...this.data.webhookEndpoints[i], ...patch };
      return clone(this.data.webhookEndpoints[i]);
    }
    return null;
  }

  // Enterprise SLA & Client Health
  getSlaPolicies(tenantId: string) {
    return clone(this.data.slaPolicies.filter(p => p.tenantId === tenantId));
  }
  getSlaBreaches(tenantId: string): SlaBreachItem[] {
    if (!tenantId) return [];
    return [
      {
        id: "sla_b_1",
        entityType: "task",
        title: "Checkout funnel integration QA",
        clientName: "Bloom & Wild Co",
        projectName: "E-Commerce Re-platforming",
        deadline: "2026-09-05T18:00:00Z",
        remainingHours: -14,
        status: "breached",
        assignedTo: "Marcus Webb",
      },
      {
        id: "sla_b_2",
        entityType: "document",
        title: "Wireframes — Portfolio View (Client Review)",
        clientName: "Strata Real Estate",
        projectName: "Investor Portal Redesign",
        deadline: "2026-09-06T18:00:00Z",
        remainingHours: 10,
        status: "at_risk",
        assignedTo: "Sophia Reyes",
      },
      {
        id: "sla_b_3",
        entityType: "invoice",
        title: "Invoice INV-2026-0042 Net-30 Settlement",
        clientName: "Bloom & Wild Co",
        projectName: "E-Commerce Re-platforming",
        deadline: "2026-08-20T23:59:59Z",
        remainingHours: -380,
        status: "breached",
        assignedTo: "Sophia Reyes",
      },
      {
        id: "sla_b_4",
        entityType: "task",
        title: "Brand guidelines document completion",
        clientName: "Halcyon Ventures",
        projectName: "Brand Identity Refresh",
        deadline: "2026-10-01T17:00:00Z",
        remainingHours: 610,
        status: "compliant",
        assignedTo: "Priya Nair",
      },
    ];
  }
  getClientHealthRecords(tenantId: string): ClientHealthRecord[] {
    if (!tenantId) return [];
    return [
      {
        clientId: "client_halcyon",
        clientName: "Halcyon Ventures",
        healthScore: 94,
        tier: "enterprise",
        onTimeDeliveryRate: 98,
        avgReviewTurnaroundHours: 18,
        pendingInvoicesCount: 1,
        status: "healthy",
      },
      {
        clientId: "client_bloom",
        clientName: "Bloom & Wild Co",
        healthScore: 64,
        tier: "mid_market",
        onTimeDeliveryRate: 72,
        avgReviewTurnaroundHours: 62,
        pendingInvoicesCount: 1,
        status: "critical",
      },
      {
        clientId: "client_strata",
        clientName: "Strata Real Estate",
        healthScore: 86,
        tier: "enterprise",
        onTimeDeliveryRate: 89,
        avgReviewTurnaroundHours: 28,
        pendingInvoicesCount: 0,
        status: "healthy",
      },
      {
        clientId: "client_nexus",
        clientName: "Nexus Health Systems",
        healthScore: 78,
        tier: "standard",
        onTimeDeliveryRate: 82,
        avgReviewTurnaroundHours: 44,
        pendingInvoicesCount: 0,
        status: "attention",
      },
    ];
  }
}

// Singleton — persists across server restarts in Next.js dev HMR
declare global {
  var __nexopsStore: InMemoryStore | undefined;
}

export const db = global.__nexopsStore ?? new InMemoryStore();
if (process.env.NODE_ENV !== "production") global.__nexopsStore = db;
