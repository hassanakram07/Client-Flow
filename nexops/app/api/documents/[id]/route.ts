import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = db.getDocumentById(id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const comments = db.getDocumentComments(id);
  const versions = db.getDocumentVersions(id);
  return NextResponse.json({ ...doc, comments, versions });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const updated = db.updateDocument(id, body);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}
