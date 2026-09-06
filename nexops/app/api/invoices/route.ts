import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId") ?? "tenant_meridian";
  const clientId = searchParams.get("clientId");
  const projectId = searchParams.get("projectId");
  let invoices = db.getInvoices(tenantId);
  if (clientId) invoices = invoices.filter(i => i.clientId === clientId);
  if (projectId) invoices = invoices.filter(i => i.projectId === projectId);
  return NextResponse.json(invoices);
}
