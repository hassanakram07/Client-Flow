import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get("tenantId") ?? "tenant_meridian";
  const policies = db.getSlaPolicies(tenantId);
  const breaches = db.getSlaBreaches(tenantId);
  const clientHealth = db.getClientHealthRecords(tenantId);

  return NextResponse.json({
    policies,
    breaches,
    clientHealth,
    metrics: {
      overallComplianceRate: 92.4,
      avgResponseHours: 3.2,
      activeBreachesCount: breaches.filter(b => b.status === "breached").length,
      atRiskCount: breaches.filter(b => b.status === "at_risk").length,
    },
  });
}
