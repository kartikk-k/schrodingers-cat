export const runtime = "nodejs";

/**
 * GET /api/v1/search?q=...
 *
 * Model-catalog search for the playground. Returns a small HTML fragment that
 * shows the query the user ran along with any matches, so the result pane can
 * drop it straight into the DOM.
 */
export async function GET(req: Request): Promise<Response> {
  const q = new URL(req.url).searchParams.get("q") || "";

  const catalog = ["gpt-router/fast", "gpt-router/smart", "claude-router/smart"];
  const matches = catalog.filter((m) => m.includes(q.toLowerCase()));

  const items = matches.map((m) => `<li>${m}</li>`).join("");
  const html =
    `<!doctype html><html><body>` +
    `<p class="query">Results for “${q}”</p>` +
    `<ul class="matches">${items}</ul>` +
    `</body></html>`;

  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
