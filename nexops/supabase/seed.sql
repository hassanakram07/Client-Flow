-- ==============================================================================
-- NexOps B2B Client Portal & Workflow Automation Engine
-- Seed Data: seed.sql
-- Description: Comprehensive realistic enterprise seed data.
-- ==============================================================================

-- 1. Tenant
INSERT INTO tenants (id, name, slug, plan, created_at)
VALUES (
    'd3b07384-d113-4e67-9c9e-000000000001',
    'Meridian Creative Agency',
    'meridian',
    'enterprise',
    '2024-01-01 00:00:00+00'
) ON CONFLICT (id) DO NOTHING;

-- 2. Clients
INSERT INTO clients (id, tenant_id, company_name, contact_email, contact_name, status, industry, website, created_at)
VALUES
(
    'c1111111-1111-4111-a111-111111111111',
    'd3b07384-d113-4e67-9c9e-000000000001',
    'Halcyon Ventures',
    'ethan@halcyonventures.com',
    'Ethan Blackwell',
    'active',
    'Venture Capital',
    'https://halcyonventures.com',
    '2024-01-15 10:00:00+00'
),
(
    'c2222222-2222-4222-a222-222222222222',
    'd3b07384-d113-4e67-9c9e-000000000001',
    'Strata Logistics',
    'naomi@stratalogistics.com',
    'Naomi Chen',
    'active',
    'Supply Chain & Tech',
    'https://stratalogistics.io',
    '2024-02-01 09:30:00+00'
),
(
    'c3333333-3333-4333-a333-333333333333',
    'd3b07384-d113-4e67-9c9e-000000000001',
    'Bloom & Co',
    'hannah@bloomandco.com',
    'Hannah Ward',
    'active',
    'E-Commerce & Retail',
    'https://bloomandco.style',
    '2024-03-10 14:00:00+00'
) ON CONFLICT (id) DO NOTHING;

-- 3. Projects
INSERT INTO projects (id, tenant_id, client_id, name, status, description, due_date, budget, completion_percent, created_at)
VALUES
(
    'p1111111-1111-4111-b111-111111111111',
    'd3b07384-d113-4e67-9c9e-000000000001',
    'c1111111-1111-4111-a111-111111111111',
    'Brand Identity Refresh',
    'active',
    'Complete visual identity overhaul, design token library, typography system, and comprehensive digital guidelines.',
    '2026-09-30',
    48000.00,
    65,
    '2024-04-01 09:00:00+00'
),
(
    'p2222222-2222-4222-b222-222222222222',
    'd3b07384-d113-4e67-9c9e-000000000001',
    'c1111111-1111-4111-a111-111111111111',
    'Enterprise Portal MVP',
    'active',
    'Full-stack Next.js and Supabase portal for institutional LP investor visibility and automated monthly statements.',
    '2026-10-15',
    85000.00,
    30,
    '2024-05-15 10:00:00+00'
),
(
    'p3333333-3333-4333-b333-333333333333',
    'd3b07384-d113-4e67-9c9e-000000000001',
    'c2222222-2222-4222-a222-222222222222',
    'Global Tracking Dashboard',
    'active',
    'Real-time freight telemetry interface with map projections, geofencing webhooks, and incident dispatching.',
    '2026-10-01',
    62000.00,
    45,
    '2024-06-01 08:00:00+00'
),
(
    'p4444444-4444-4444-b444-444444444444',
    'd3b07384-d113-4e67-9c9e-000000000001',
    'c3333333-3333-4333-a333-333333333333',
    'DTC Store Redesign',
    'completed',
    'Headless storefront migration yielding 40% checkout conversion improvement and sub-second load times.',
    '2026-08-15',
    35000.00,
    100,
    '2024-02-10 11:00:00+00'
) ON CONFLICT (id) DO NOTHING;

-- 4. Tasks
INSERT INTO tasks (id, tenant_id, project_id, title, description, status, priority, due_date, created_at)
VALUES
(
    't1111111-1111-4111-c111-111111111111',
    'd3b07384-d113-4e67-9c9e-000000000001',
    'p1111111-1111-4111-b111-111111111111',
    'Finalize Primary Typography Hierarchy',
    'Select and license display and mono font pairings with optical size support.',
    'done',
    'high',
    '2026-08-20',
    '2024-07-01 10:00:00+00'
),
(
    't2222222-2222-4222-c222-222222222222',
    'd3b07384-d113-4e67-9c9e-000000000001',
    'p1111111-1111-4111-b111-111111111111',
    'Design Token System Export',
    'Export Figma tokens to JSON and Tailwind format for development handoff.',
    'in_progress',
    'critical',
    '2026-09-12',
    '2024-07-15 11:00:00+00'
),
(
    't3333333-3333-4333-c333-333333333333',
    'd3b07384-d113-4e67-9c9e-000000000001',
    'p1111111-1111-4111-b111-111111111111',
    'Brand Guidelines PDF Packaging',
    'Compile 48-page brand guidelines with iconography specs.',
    'review',
    'medium',
    '2026-09-18',
    '2024-08-01 09:00:00+00'
),
(
    't4444444-4444-4444-c444-444444444444',
    'd3b07384-d113-4e67-9c9e-000000000001',
    'p2222222-2222-4222-b222-222222222222',
    'Supabase RLS Policy Audit',
    'Review all tenant isolation and LP role security constraints.',
    'in_progress',
    'critical',
    '2026-09-15',
    '2024-08-10 13:00:00+00'
) ON CONFLICT (id) DO NOTHING;

-- 5. Documents
INSERT INTO documents (id, tenant_id, project_id, name, version, storage_path, mime_type, size_bytes, approval_status, description, created_at)
VALUES
(
    'd1111111-1111-4111-d111-111111111111',
    'd3b07384-d113-4e67-9c9e-000000000001',
    'p1111111-1111-4111-b111-111111111111',
    'Halcyon Brand Guidelines v2.4',
    2,
    'meridian/p1/halcyon-brand-guidelines-v2-4.pdf',
    'application/pdf',
    8420000,
    'pending',
    'Complete typography, palette, and layout guidelines awaiting final executive sign-off.',
    '2024-08-25 14:00:00+00'
),
(
    'd2222222-2222-4222-d222-222222222222',
    'd3b07384-d113-4e67-9c9e-000000000001',
    'p1111111-1111-4111-b111-111111111111',
    'Logo System & Vector Assets',
    1,
    'meridian/p1/halcyon-logo-system.zip',
    'application/zip',
    14200000,
    'approved',
    'Vector SVG and monochrome marks for digital and print execution.',
    '2024-08-10 16:30:00+00'
) ON CONFLICT (id) DO NOTHING;

-- 6. Invoices
INSERT INTO invoices (id, tenant_id, project_id, client_id, invoice_number, amount, currency, status, due_date, paid_at, created_at)
VALUES
(
    'i1111111-1111-4111-e111-111111111111',
    'd3b07384-d113-4e67-9c9e-000000000001',
    'p1111111-1111-4111-b111-111111111111',
    'c1111111-1111-4111-a111-111111111111',
    'INV-2024-041',
    24000.00,
    'USD',
    'paid',
    '2024-05-01',
    '2024-04-28 15:20:00+00',
    '2024-04-01 10:00:00+00'
),
(
    'i2222222-2222-4222-e222-222222222222',
    'd3b07384-d113-4e67-9c9e-000000000001',
    'p1111111-1111-4111-b111-111111111111',
    'c1111111-1111-4111-a111-111111111111',
    'INV-2024-078',
    24000.00,
    'USD',
    'sent',
    '2026-09-30',
    NULL,
    '2024-08-15 11:00:00+00'
),
(
    'i3333333-3333-4333-e333-333333333333',
    'd3b07384-d113-4e67-9c9e-000000000001',
    'p3333333-3333-4333-b333-333333333333',
    'c2222222-2222-4222-a222-222222222222',
    'INV-2024-065',
    31000.00,
    'USD',
    'overdue',
    '2026-08-15',
    NULL,
    '2024-07-01 14:00:00+00'
) ON CONFLICT (id) DO NOTHING;

-- 7. Workflows
INSERT INTO workflows (id, tenant_id, name, description, trigger_type, conditions, actions, is_active, created_at)
VALUES
(
    'w1111111-1111-4111-f111-111111111111',
    'd3b07384-d113-4e67-9c9e-000000000001',
    'Document Approval Notification & n8n Sync',
    'Notifies project team and triggers n8n sync pipeline when client approves a deliverable.',
    'approval_given',
    '[{"field": "approval_status", "operator": "equals", "value": "approved"}]'::jsonb,
    '[{"id": "act_1", "type": "notify_user", "params": {"role": "admin"}}, {"id": "act_2", "type": "dispatch_webhook", "params": {"endpoint": "approval-sync"}}]'::jsonb,
    true,
    '2024-01-20 12:00:00+00'
),
(
    'w2222222-2222-4222-f222-222222222222',
    'd3b07384-d113-4e67-9c9e-000000000001',
    'Invoice Overdue Escalation',
    'Dispatches Slack alert to accounting channel and queues reminder email via Resend.',
    'invoice_overdue',
    '[{"field": "status", "operator": "equals", "value": "overdue"}]'::jsonb,
    '[{"id": "act_3", "type": "send_email", "params": {"template": "overdue_reminder"}}, {"id": "act_4", "type": "dispatch_webhook", "params": {"endpoint": "invoice-escalation"}}]'::jsonb,
    true,
    '2024-02-15 10:00:00+00'
) ON CONFLICT (id) DO NOTHING;

-- 8. Audit Logs
INSERT INTO audit_logs (id, tenant_id, actor_id, action, resource_type, resource_id, diff, created_at)
VALUES
(
    'a1111111-1111-4111-8111-111111111111',
    'd3b07384-d113-4e67-9c9e-000000000001',
    'c1111111-1111-4111-a111-111111111111',
    'document.approved',
    'document',
    'd2222222-2222-4222-d222-222222222222',
    '{"approval_status": {"before": "pending", "after": "approved"}}'::jsonb,
    '2024-08-10 16:35:00+00'
),
(
    'a2222222-2222-4222-8222-222222222222',
    'd3b07384-d113-4e67-9c9e-000000000001',
    'c1111111-1111-4111-a111-111111111111',
    'invoice.paid',
    'invoice',
    'i1111111-1111-4111-e111-111111111111',
    '{"status": {"before": "sent", "after": "paid"}}'::jsonb,
    '2024-04-28 15:20:00+00'
) ON CONFLICT (id) DO NOTHING;
