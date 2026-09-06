import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId") ?? "tenant_meridian";
  const clients = db.getClients(tenantId);
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { v4: uuidv4 } = await import("uuid");
    const client = {
      id: `client_${uuidv4().slice(0, 8)}`,
      tenantId: "tenant_meridian",
      companyName: body.companyName,
      contactEmail: body.contactEmail,
      contactName: body.contactName,
      status: "active" as const,
      industry: body.industry,
      website: body.website,
      createdAt: new Date().toISOString(),
    };
    db.addClient(client);
    return NextResponse.json(client, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
