import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const tenantId = searchParams.get("tenantId") ?? "tenant_meridian";
  const tasks = projectId ? db.getTasksByProject(projectId) : db.getTasks(tenantId);
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { v4: uuidv4 } = await import("uuid");
  const task = {
    id: `task_${uuidv4().slice(0, 8)}`,
    projectId: body.projectId,
    tenantId: "tenant_meridian",
    assigneeId: body.assigneeId,
    title: body.title,
    description: body.description,
    status: body.status ?? "todo",
    priority: body.priority ?? "medium",
    dueDate: body.dueDate,
    createdAt: new Date().toISOString(),
  };
  db.addTask(task);
  return NextResponse.json(task, { status: 201 });
}
