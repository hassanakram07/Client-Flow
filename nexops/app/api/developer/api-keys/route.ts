import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { generateId } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get("tenantId") ?? "tenant_meridian";
  const keys = db.getApiKeys(tenantId);
  return NextResponse.json(keys);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tenantId = body.tenantId ?? "tenant_meridian";
    const name = body.name || "Untitled Integration Key";
    const scopes = body.scopes || ["projects:read"];
    
    // Generate simulated key
    const randSuffix = Math.random().toString(36).substring(2, 6);
    const keyPrefix = `nexops_live_${randSuffix}`;
    const rawSecret = `${keyPrefix}_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`;
    const secretMasked = `${keyPrefix}****************************${rawSecret.slice(-4)}`;

    const newKey = {
      id: generateId("key"),
      tenantId,
      name,
      keyPrefix,
      secretMasked,
      scopes,
      createdAt: new Date().toISOString(),
      revoked: false,
    };

    db.addApiKey(newKey);
    return NextResponse.json({ ...newKey, rawSecret }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, action } = await req.json();
    if (action === "revoke") {
      const updated = db.revokeApiKey(id);
      return NextResponse.json(updated);
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to update API key" }, { status: 500 });
  }
}
