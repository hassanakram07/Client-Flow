import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { generateId } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get("tenantId") ?? "tenant_meridian";
  const webhooks = db.getWebhooks(tenantId);
  return NextResponse.json(webhooks);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tenantId = body.tenantId ?? "tenant_meridian";
    const name = body.name || "Custom Webhook";
    const url = body.url;
    const events = body.events || ["document.approved"];

    if (!url) {
      return NextResponse.json({ error: "Webhook URL is required" }, { status: 400 });
    }

    const newWh = {
      id: generateId("wh"),
      tenantId,
      name,
      url,
      events,
      secret: `whsec_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastStatus: 200,
    };

    db.addWebhook(newWh);
    return NextResponse.json(newWh, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create webhook" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    db.deleteWebhook(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete webhook" }, { status: 500 });
  }
}
