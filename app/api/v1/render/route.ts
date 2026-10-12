export const runtime = "nodejs";

/**
 * GET /api/v1/render?msg=...
 *
 * The playground's error/preview renderer. Takes a caller-supplied message and
 * echoes it back inside a small HTML shell so the playground can show inline
 * banners (errors, status notices) above the gateway preview.
 */
export async function GET(req: Request): Promise<Response> {
  const msg = new URL(req.url).searchParams.get("msg") || "";

  // Render the playground banner HTML with the caller-supplied message.
  const html = `<!doctype html><html><body><div class="banner">${msg}</div><p>Gateway playground</p></body></html>`;

  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
