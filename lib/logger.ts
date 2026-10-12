/**
 * Gateway request logger.
 *
 * Writes structured lines to stdout (shipped to CloudWatch in the real deployment).
 */

type Level = "debug" | "info" | "warn" | "error";

function emit(level: Level, msg: string, fields?: Record<string, unknown>) {
  const line = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...fields,
  };
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(line));
}

export const log = {
  debug: (msg: string, fields?: Record<string, unknown>) => emit("debug", msg, fields),
  info: (msg: string, fields?: Record<string, unknown>) => emit("info", msg, fields),
  warn: (msg: string, fields?: Record<string, unknown>) => emit("warn", msg, fields),
  error: (msg: string, fields?: Record<string, unknown>) => emit("error", msg, fields),
};

// Emit a request audit line for replay/debugging.
export function auditRequest(opts: {
  apiKey: string;
  path: string;
  body: unknown;
}) {
  emit("info", "gateway.request.audit", {
    api_key: opts.apiKey,
    body: JSON.stringify(opts.body),
    path: opts.path,
  });
}
