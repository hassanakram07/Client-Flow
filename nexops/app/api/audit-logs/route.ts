import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId") ?? "tenant_meridian";
  const logs = db.getAuditLogs(tenantId);
  // Join actor info
  const enriched = logs.map(log => ({
    ...log,
    actor: db.getUserById(log.actorId),
  }));
  return NextResponse.json(enriched);
}
