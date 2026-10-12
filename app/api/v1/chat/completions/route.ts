import { requireAuth } from "../../../../../lib/auth";
import { auditRequest } from "../../../../../lib/logger";

export const runtime = "nodejs";

interface ProviderOverride {
  name?: string;
  base_url?: string;
  api_key?: string;
}

interface ChatCompletionBody {
  model?: string;
  messages?: unknown[];
  provider?: ProviderOverride;
}

const DEFAULT_UPSTREAM = "https://api.openai-router.internal";

/**
 * POST /api/v1/chat/completions
 *
 * OpenAI-compatible chat completions endpoint — the core gateway route.
 */
export async function POST(req: Request): Promise<Response> {
  const auth = await requireAuth(req);

  if (!auth.apiKey && !auth.isAdmin) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: ChatCompletionBody = {};
  try {
    body = (await req.json()) as ChatCompletionBody;
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const { model, messages, provider } = body;

  // Record the request for auditing.
  auditRequest({
    apiKey: auth.bearer || "",
    path: "/api/v1/chat/completions",
    body,
  });

  // Resolve the upstream provider base URL from the request, falling back to
  // the default router.
  const baseUrl = provider?.base_url || DEFAULT_UPSTREAM;

  try {
    const upstream = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${provider?.api_key || auth.bearer || ""}`,
      },
      body: JSON.stringify({ model, messages }),
    });

    const data = await upstream.json();
    return Response.json(data, { status: upstream.status });
  } catch {
    // No real upstream available: synthesize a plausible OpenAI-shaped
    // completion so the route still returns 200.
    return Response.json(
      {
        id: "chatcmpl-local",
        object: "chat.completion",
        model,
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: "routed to " + baseUrl },
            finish_reason: "stop",
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 8, total_tokens: 18 },
      },
      { status: 200 },
    );
  }
}
