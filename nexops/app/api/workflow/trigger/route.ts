import { NextRequest, NextResponse } from "next/server";
import { processEvent } from "@/lib/workflow/engine";

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();
    if (!event.triggerType || !event.payload) {
      return NextResponse.json({ error: "triggerType and payload are required" }, { status: 400 });
    }
    const runs = await processEvent({
      triggerType: event.triggerType,
      payload: event.payload,
      actorId: event.actorId ?? "system",
    });
    return NextResponse.json({ runs, count: runs.length });
  } catch (err) {
    console.error("[workflow/trigger]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
