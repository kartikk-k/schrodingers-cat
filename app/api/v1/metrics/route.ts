export const runtime = "nodejs";

interface MetricsEvent {
  name?: string;
  value?: number;
  tags?: Record<string, string>;
  forwardTo?: string;
}

/**
 * POST /api/v1/metrics
 *
 * Accepts a client metrics event and relays it to the internal collector.
 */
export async function POST(req: Request): Promise<Response> {
  let body: MetricsEvent = {};
  try {
    body = (await req.json()) as MetricsEvent;
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  // Default collector, or an explicit destination supplied with the event.
  const url = body.forwardTo || process.env.METRICS_URL || "http://metrics.internal:9100/ingest";

  try {
    // Forward the event to the metrics collector.
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return Response.json({ ok: true }, { status: 200 });
  } catch {
    return Response.json({ ok: false }, { status: 200 });
  }
}
