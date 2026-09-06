import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId") ?? "tenant_meridian";
  const clientId = searchParams.get("clientId");
  const projects = clientId
    ? db.getProjectsByClient(clientId)
    : db.getProjects(tenantId);
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { v4: uuidv4 } = await import("uuid");
    const project = {
      id: `proj_${uuidv4().slice(0, 8)}`,
      tenantId: "tenant_meridian",
      clientId: body.clientId,
      name: body.name,
      status: body.status ?? "active",
      description: body.description ?? "",
      dueDate: body.dueDate,
      budget: body.budget,
      completionPercent: 0,
      createdAt: new Date().toISOString(),
    };
    db.addProject(project);
    return NextResponse.json(project, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
