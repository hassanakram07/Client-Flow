import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId") ?? "tenant_meridian";
  const workflows = db.getWorkflows(tenantId);
  return NextResponse.json(workflows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { v4: uuidv4 } = await import("uuid");
  const workflow = {
    id: `wf_${uuidv4().slice(0, 8)}`,
    tenantId: "tenant_meridian",
    name: body.name,
    description: body.description,
    triggerType: body.triggerType,
    conditions: body.conditions ?? [],
    actions: body.actions ?? [],
    isActive: body.isActive ?? true,
    createdAt: new Date().toISOString(),
  };
  db.addWorkflow(workflow);
  return NextResponse.json(workflow, { status: 201 });
}
