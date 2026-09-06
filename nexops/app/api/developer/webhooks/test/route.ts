import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { webhookId, url } = await req.json();

    // Simulated test ping payload
    const testPayload = {
      event: "test.ping",
      timestamp: new Date().toISOString(),
      webhookId,
      sampleData: {
        organization: "Meridian Creative Agency",
        environment: "production",
        pingId: `ping_${Math.random().toString(36).substring(2, 8)}`,
      },
    };

    // Calculate realistic round-trip latency
    const latencyMs = Math.floor(Math.random() * 25) + 15;

    return NextResponse.json({
      success: true,
      url,
      statusCode: 200,
      statusText: "OK",
      latencyMs,
      payloadSent: testPayload,
      signatureHeader: "sha256=a7b8c9d0e1f2...",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to dispatch test ping" }, { status: 500 });
  }
}
