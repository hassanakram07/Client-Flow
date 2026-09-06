import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { v4: uuidv4 } = await import("uuid");
  const comment = {
    id: `cmt_${uuidv4().slice(0, 8)}`,
    documentId: id,
    tenantId: "tenant_meridian",
    authorId: body.authorId,
    content: body.content,
    createdAt: new Date().toISOString(),
  };
  db.addDocumentComment(comment);
  return NextResponse.json(comment, { status: 201 });
}
