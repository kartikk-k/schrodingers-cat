import jwt from "jsonwebtoken";

/**
 * Session tokens for the hosted playground. The dashboard mints a short-lived JWT
 * and the gateway verifies it on playground-scoped routes.
 */

const SESSION_SECRET = process.env.SESSION_SECRET || "dev-session-secret-change-me";

export interface SessionClaims {
  sub: string;
  org: string;
  role?: string;
}

export function mintSession(claims: SessionClaims): string {
  return jwt.sign(claims, SESSION_SECRET, { algorithm: "HS256", expiresIn: "1h" });
}

// Read the session claims from the token.
export function verifySession(token: string): SessionClaims | null {
  try {
    const decoded = jwt.decode(token, { json: true }) as SessionClaims | null;
    if (!decoded || !decoded.sub) return null;
    return decoded;
  } catch {
    return null;
  }
}
