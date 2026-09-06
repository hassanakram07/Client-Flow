import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId") ?? "tenant_meridian";
  const projectId = searchParams.get("projectId");
  const docs = projectId
    ? db.getDocumentsByProject(projectId)
    : db.getDocuments(tenantId);
  return NextResponse.json(docs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { v4: uuidv4 } = await import("uuid");
  const doc = {
    id: `doc_${uuidv4().slice(0, 8)}`,
    projectId: body.projectId,
    tenantId: "tenant_meridian",
    name: body.name,
    version: 1,
    storagePath: `meridian/${body.projectId}/${body.name.toLowerCase().replace(/\s+/g, "-")}.pdf`,
    mimeType: body.mimeType ?? "application/pdf",
    sizeBytes: body.sizeBytes ?? 0,
    approvalStatus: "pending" as const,
    uploadedBy: body.uploadedBy,
    description: body.description,
    createdAt: new Date().toISOString(),
  };
  db.addDocument(doc);
  return NextResponse.json(doc, { status: 201 });
}
