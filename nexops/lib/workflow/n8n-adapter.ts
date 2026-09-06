/**
 * n8n Webhook Adapter
 * Dispatches workflow events to n8n via HTTP POST.
 * Gracefully no-ops if N8N_WEBHOOK_BASE_URL is not set.
 */

const N8N_BASE_URL = process.env.N8N_WEBHOOK_BASE_URL;

export interface WebhookParams {
  eventType: string;
  [key: string]: unknown;
}

export async function dispatchWebhook(
  params: WebhookParams,
  payload: Record<string, unknown>
): Promise<{ dispatched: boolean; error?: string }> {
  if (!N8N_BASE_URL) {
    console.log(
      `[n8n stub] N8N_WEBHOOK_BASE_URL not set. Would dispatch: ${params.eventType}`,
      { params, payload }
    );
    return { dispatched: false };
  }

  const url = `${N8N_BASE_URL}/${params.eventType}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-NexOps-Event": params.eventType,
        "X-NexOps-Timestamp": new Date().toISOString(),
      },
      body: JSON.stringify({
        event: params.eventType,
        params,
        payload,
        timestamp: new Date().toISOString(),
        source: "nexops",
      }),
      signal: AbortSignal.timeout(5000), // 5s timeout
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[n8n] Webhook failed: ${res.status} — ${text}`);
      return { dispatched: false, error: `HTTP ${res.status}` };
    }

    console.log(`[n8n] Dispatched ${params.eventType} successfully`);
    return { dispatched: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[n8n] Webhook error: ${message}`);
    return { dispatched: false, error: message };
  }
}
