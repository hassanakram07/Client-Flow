# NexOps — B2B Client Portal & Workflow Automation Engine

> A high-performance multi-tenant B2B SaaS platform engineered for agencies and service businesses to manage client deliverables, approvals, invoices, and automated workflow orchestration with enterprise-grade precision.

---

## 🏛️ Architectural Overview

NexOps is built from the ground up to model real enterprise SaaS infrastructure:

- **Frontend**: Next.js 14 (App Router) in TypeScript strict mode.
- **Design System**: Dark-first palette built on custom CSS variables, zinc neutral scale, refined teal brand accents (`#0D9488`), and monospace data typography with `Geist Sans` and `IBM Plex Mono`.
- **Data & State**: TanStack Query (React Query v5) for optimistic updates and caching; Zustand for synchronized UI state.
- **Validation**: React Hook Form with Zod schemas for all forms and API route inputs.
- **Workflow Automation Engine**: Event-driven rules engine (`trigger → condition → action`) with support for n8n webhook fan-out, automated task generation, email dispatching, and immutable audit logs.
- **Database & Security**: In-memory relational store with seed data for instant zero-dependency local demos, coupled with complete Supabase migrations (`001_schema.sql`, `002_rls.sql`, `seed.sql`, and Edge Functions) ready for production deployment.

---

## 👥 Role-Based Access Matrix

| Role | Target User | Capabilities |
| :--- | :--- | :--- |
| **Admin** | Sophia Reyes (*Agency Owner*) | Full tenant control, client and project CRUD, team permissions, visual workflow builder, financial telemetry, audit logs. |
| **Team Member** | Marcus Webb, Priya Patel | Assigned task management, deliverables uploading, client communication, view client records. |
| **Client** | Ethan Blackwell (*Halcyon*), Naomi Chen (*Strata*) | Dedicated portal view: project milestones, document approval/rejection with signature flows, invoice review, project-scoped messaging. |

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001` if port 3000 is occupied).

### 3. Demo Credentials
The sign-in screen features 1-click credential quick-fill buttons:

- **Admin**: `sophia@meridianagency.com` / `demo1234`
- **Team**: `marcus@meridianagency.com` / `demo1234`
- **Client (Halcyon)**: `ethan@halcyonventures.com` / `demo1234`
- **Client (Strata)**: `naomi@stratalogistics.com` / `demo1234`

---

## 📁 Repository Structure

```
nexops/
├── app/
│   ├── (admin)/admin/            # Admin suite
│   │   ├── dashboard/            # KPI cards, project breakdown, activity
│   │   ├── clients/              # Client directory & detail side-panel
│   │   ├── projects/             # Kanban & list views, task management
│   │   ├── team/                 # Role permissions matrix & invites
│   │   ├── workflows/            # Visual workflow automation builder
│   │   └── audit-log/            # Immutable compliance audit log
│   ├── (portal)/portal/          # External client portal
│   │   ├── dashboard/            # Deliverable alerts & project overview
│   │   ├── projects/[id]/        # Milestones, deliverables, discussion
│   │   ├── documents/            # Document review & approve/reject modal
│   │   ├── invoices/             # Financial status & detail views
│   │   └── messages/             # Real-time project-scoped chat
│   ├── (auth)/login/             # Demo quick-fill sign-in
│   └── api/                      # RESTful route handlers with Zod validation
├── components/
│   ├── layout/                   # Collapsible sidebar, command palette (Cmd+K)
│   └── ui/                       # Status badges, avatars, skeletons, error boundaries
├── lib/
│   ├── auth/                     # Auth context, session cookie helpers
│   ├── db/store.ts               # Relational in-memory store with rich demo seed
│   ├── workflow/engine.ts        # Workflow evaluation & execution engine
│   └── types.ts                  # TypeScript domain models
├── supabase/
│   ├── migrations/               # 001_schema.sql & 002_rls.sql
│   ├── seed.sql                  # Production SQL seed data
│   └── functions/                # Deno Edge Function (workflow-dispatcher)
└── middleware.ts                 # Route guards & role redirection
```

---

## 🔒 Security & Row-Level Security (RLS)

- Strict multi-tenant isolation enforced via `tenant_id = auth_tenant_id()` on all tables.
- Client role policies ensure external users can never query cross-client records or unassigned projects.
- `audit_logs` table features an immutable append-only policy with no `UPDATE` or `DELETE` permissions granted.

---

## ⚡ Production Verification

To verify TypeScript types and production build integrity:
```bash
npm run build
```
