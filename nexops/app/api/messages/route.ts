import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });
  const messages = db.getMessagesByProject(projectId);
  // Join author info
  const enriched = messages.map(msg => ({
    ...msg,
    author: db.getUserById(msg.authorId),
  }));
  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { v4: uuidv4 } = await import("uuid");
  const message = {
    id: `msg_${uuidv4().slice(0, 8)}`,
    projectId: body.projectId,
    tenantId: "tenant_meridian",
    authorId: body.authorId,
    content: body.content,
    createdAt: new Date().toISOString(),
  };
  db.addMessage(message);
  return NextResponse.json(message, { status: 201 });
}
