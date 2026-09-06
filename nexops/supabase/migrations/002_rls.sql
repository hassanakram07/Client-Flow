-- ==============================================================================
-- NexOps B2B Client Portal & Workflow Automation Engine
-- Migration: 002_rls.sql
-- Description: Multi-tenant Row Level Security (RLS) policies for all roles.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Helper Functions
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION auth_tenant_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid,
    (SELECT tenant_id FROM users WHERE id = auth.uid())
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::jsonb ->> 'role',
    (SELECT role FROM users WHERE id = auth.uid())
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_client_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb ->> 'client_id')::uuid,
    (SELECT client_id FROM users WHERE id = auth.uid())
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 2. Enable RLS on All Tables
-- ------------------------------------------------------------------------------
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 3. Tenants Policies
-- ------------------------------------------------------------------------------
CREATE POLICY tenants_select ON tenants
    FOR SELECT USING (id = auth_tenant_id());

CREATE POLICY tenants_admin_all ON tenants
    FOR ALL USING (id = auth_tenant_id() AND auth_user_role() = 'admin');

-- ------------------------------------------------------------------------------
-- 4. Clients Policies
-- ------------------------------------------------------------------------------
CREATE POLICY clients_admin_team_all ON clients
    FOR ALL USING (tenant_id = auth_tenant_id() AND auth_user_role() IN ('admin', 'team'));

CREATE POLICY clients_client_select ON clients
    FOR SELECT USING (tenant_id = auth_tenant_id() AND id = auth_client_id());

-- ------------------------------------------------------------------------------
-- 5. Users Policies
-- ------------------------------------------------------------------------------
CREATE POLICY users_tenant_select ON users
    FOR SELECT USING (tenant_id = auth_tenant_id());

CREATE POLICY users_admin_all ON users
    FOR ALL USING (tenant_id = auth_tenant_id() AND auth_user_role() = 'admin');

CREATE POLICY users_self_update ON users
    FOR UPDATE USING (id = auth.uid());

-- ------------------------------------------------------------------------------
-- 6. Projects Policies
-- ------------------------------------------------------------------------------
CREATE POLICY projects_admin_team_all ON projects
    FOR ALL USING (tenant_id = auth_tenant_id() AND auth_user_role() IN ('admin', 'team'));

CREATE POLICY projects_client_select ON projects
    FOR SELECT USING (
        tenant_id = auth_tenant_id() AND
        auth_user_role() = 'client' AND
        client_id = auth_client_id()
    );

-- ------------------------------------------------------------------------------
-- 7. Tasks Policies
-- ------------------------------------------------------------------------------
CREATE POLICY tasks_admin_team_all ON tasks
    FOR ALL USING (tenant_id = auth_tenant_id() AND auth_user_role() IN ('admin', 'team'));

CREATE POLICY tasks_client_select ON tasks
    FOR SELECT USING (
        tenant_id = auth_tenant_id() AND
        auth_user_role() = 'client' AND
        project_id IN (SELECT id FROM projects WHERE client_id = auth_client_id())
    );

-- ------------------------------------------------------------------------------
-- 8. Documents & Comments Policies
-- ------------------------------------------------------------------------------
CREATE POLICY documents_admin_team_all ON documents
    FOR ALL USING (tenant_id = auth_tenant_id() AND auth_user_role() IN ('admin', 'team'));

CREATE POLICY documents_client_select ON documents
    FOR SELECT USING (
        tenant_id = auth_tenant_id() AND
        auth_user_role() = 'client' AND
        project_id IN (SELECT id FROM projects WHERE client_id = auth_client_id())
    );

CREATE POLICY documents_client_approval_update ON documents
    FOR UPDATE USING (
        tenant_id = auth_tenant_id() AND
        auth_user_role() = 'client' AND
        project_id IN (SELECT id FROM projects WHERE client_id = auth_client_id())
    )
    WITH CHECK (
        approval_status IN ('approved', 'rejected')
    );

CREATE POLICY document_comments_tenant_select ON document_comments
    FOR SELECT USING (tenant_id = auth_tenant_id());

CREATE POLICY document_comments_insert ON document_comments
    FOR INSERT WITH CHECK (
        tenant_id = auth_tenant_id() AND
        author_id = auth.uid()
    );

-- ------------------------------------------------------------------------------
-- 9. Invoices Policies
-- ------------------------------------------------------------------------------
CREATE POLICY invoices_admin_all ON invoices
    FOR ALL USING (tenant_id = auth_tenant_id() AND auth_user_role() = 'admin');

CREATE POLICY invoices_team_select ON invoices
    FOR SELECT USING (tenant_id = auth_tenant_id() AND auth_user_role() = 'team');

CREATE POLICY invoices_client_select ON invoices
    FOR SELECT USING (
        tenant_id = auth_tenant_id() AND
        auth_user_role() = 'client' AND
        client_id = auth_client_id()
    );

CREATE POLICY invoice_items_select ON invoice_line_items
    FOR SELECT USING (
        invoice_id IN (SELECT id FROM invoices WHERE tenant_id = auth_tenant_id())
    );

-- ------------------------------------------------------------------------------
-- 10. Messages Policies
-- ------------------------------------------------------------------------------
CREATE POLICY messages_admin_team_all ON messages
    FOR ALL USING (tenant_id = auth_tenant_id() AND auth_user_role() IN ('admin', 'team'));

CREATE POLICY messages_client_select ON messages
    FOR SELECT USING (
        tenant_id = auth_tenant_id() AND
        auth_user_role() = 'client' AND
        project_id IN (SELECT id FROM projects WHERE client_id = auth_client_id())
    );

CREATE POLICY messages_client_insert ON messages
    FOR INSERT WITH CHECK (
        tenant_id = auth_tenant_id() AND
        author_id = auth.uid() AND
        project_id IN (SELECT id FROM projects WHERE client_id = auth_client_id())
    );

-- ------------------------------------------------------------------------------
-- 11. Workflows & Automation Policies
-- ------------------------------------------------------------------------------
CREATE POLICY workflows_admin_all ON workflows
    FOR ALL USING (tenant_id = auth_tenant_id() AND auth_user_role() = 'admin');

CREATE POLICY workflows_team_select ON workflows
    FOR SELECT USING (tenant_id = auth_tenant_id() AND auth_user_role() = 'team');

CREATE POLICY workflow_runs_admin_team ON workflow_runs
    FOR SELECT USING (
        workflow_id IN (SELECT id FROM workflows WHERE tenant_id = auth_tenant_id())
    );

-- ------------------------------------------------------------------------------
-- 12. Audit Logs (Strictly Immutable Compliance Policy)
-- ------------------------------------------------------------------------------
CREATE POLICY audit_logs_select ON audit_logs
    FOR SELECT USING (tenant_id = auth_tenant_id() AND auth_user_role() IN ('admin', 'team'));

CREATE POLICY audit_logs_insert ON audit_logs
    FOR INSERT WITH CHECK (tenant_id = auth_tenant_id());

-- Disallow UPDATE and DELETE on audit logs for everyone (immutable compliance)
-- Note: By not providing UPDATE/DELETE policies, postgres denies them by default under RLS.

-- ------------------------------------------------------------------------------
-- 13. Notifications Policies
-- ------------------------------------------------------------------------------
CREATE POLICY notifications_user_select ON notifications
    FOR SELECT USING (tenant_id = auth_tenant_id() AND user_id = auth.uid());

CREATE POLICY notifications_user_update ON notifications
    FOR UPDATE USING (tenant_id = auth_tenant_id() AND user_id = auth.uid())
    WITH CHECK (tenant_id = auth_tenant_id() AND user_id = auth.uid());

CREATE POLICY notifications_system_insert ON notifications
    FOR INSERT WITH CHECK (tenant_id = auth_tenant_id());
