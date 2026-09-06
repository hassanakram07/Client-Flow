import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get("tenantId") ?? "tenant_meridian";
  const runs = db.getWorkflowRuns(tenantId);
  return NextResponse.json(runs);
}
