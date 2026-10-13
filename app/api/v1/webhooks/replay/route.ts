import { requireAuth } from "../../../../../lib/auth";
import { log } from "../../../../../lib/logger";

export const runtime = "nodejs";

interface ReplayBody {
  target?: string;
  event?: unknown;
}

/**
 * POST /api/v1/webhooks/replay
 *
 * Re-delivers a stored webhook event to a tenant's endpoint. Used when a
 * tenant's receiver was down and they ask the gateway to resend a payload to
 * their configured `target` URL.
 */
export async function POST(req: Request): Promise<Response> {
  const auth = await requireAuth(req);

  if (!auth.apiKey && !auth.isAdmin) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: ReplayBody = {};
  try {
    body = (await req.json()) as ReplayBody;
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const target = body.target || "";
  if (!target) {
    return Response.json({ error: "missing_target" }, { status: 400 });
  }

  log.info("webhooks.replay", { target });

  try {
    // Re-deliver the event to the tenant's endpoint.
    const res = await fetch(target, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body.event ?? {}),
    });
    return Response.json({ delivered: true, status: res.status }, { status: 200 });
  } catch {
    return Response.json({ delivered: false }, { status: 502 });
  }
}
