import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

const SESSION_COOKIE = 'admin_session';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24h

// ─── HMAC-SHA256 helpers (Web Crypto — no external deps) ─────────────────────

function getSecret(): string {
  return process.env.SESSION_SECRET || 'fallback-dev-secret-change-in-production';
}

async function hmacSign(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return Buffer.from(sig).toString('base64url');
}

async function hmacVerify(payload: string, signature: string, secret: string): Promise<boolean> {
  const expected = await hmacSign(payload, secret);
  // Constant-time comparison to prevent timing attacks
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

// ─── Token format: base64url(payload).signature ───────────────────────────────

interface SessionPayload {
  sub: string;   // subject (admin username)
  iat: number;   // issued at (ms)
  exp: number;   // expires at (ms)
}

export async function createSessionToken(username: string): Promise<string> {
  const payload: SessionPayload = {
    sub: username,
    iat: Date.now(),
    exp: Date.now() + SESSION_DURATION_MS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = await hmacSign(payloadB64, getSecret());
  return `${payloadB64}.${signature}`;
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return null;

    const valid = await hmacVerify(payloadB64, signature, getSecret());
    if (!valid) return null;

    const payload: SessionPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    if (!payload.exp || payload.exp < Date.now()) return null; // expired

    return payload;
  } catch {
    return null;
  }
}

// ─── Cookie-level helpers ─────────────────────────────────────────────────────

/**
 * Returns the verified session payload, or null if missing/invalid/expired.
 * Use this in every API route that requires admin authentication.
 */
export async function verifySession(cookieStore: ReadonlyRequestCookies): Promise<SessionPayload | null> {
  const cookie = cookieStore.get(SESSION_COOKIE);
  if (!cookie?.value) return null;
  return verifySessionToken(cookie.value);
}

/**
 * Returns true if the request has a valid admin session.
 */
export async function isAuthenticated(cookieStore: ReadonlyRequestCookies): Promise<boolean> {
  const session = await verifySession(cookieStore);
  return session !== null;
}

export { SESSION_COOKIE };
