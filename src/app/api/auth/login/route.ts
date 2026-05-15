import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/auth';
import { createSessionToken, SESSION_COOKIE } from '@/lib/session';
import { cookies } from 'next/headers';
import { checkRateLimitDB, resetRateLimitDB, cleanupExpiredRateLimits } from '@/lib/rateLimit';

// ─── Rate Limiter — anti brute-force (Base de données) ────────────
const MAX_ATTEMPTS = 5;          // max failures before block
const WINDOW_MS = 15 * 60 * 1000; // 15 min sliding window
const BLOCK_MS = 15 * 60 * 1000;  // 15 min block after too many failures

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimitKey = `login:${ip}`;

  // Lance un nettoyage en arrière-plan sans bloquer la requête
  cleanupExpiredRateLimits().catch(() => {});

  // 1. Check rate limit BEFORE touching DB for auth
  const { allowed, retryAfterSec, remaining } = await checkRateLimitDB(
    rateLimitKey,
    MAX_ATTEMPTS,
    WINDOW_MS,
    BLOCK_MS
  );

  if (!allowed) {
    const minutes = Math.ceil((retryAfterSec || BLOCK_MS / 1000) / 60);
    return NextResponse.json(
      { error: `Trop de tentatives. Réessayez dans ${minutes} minute(s).` },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSec || 900) },
      }
    );
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body?.username || !body?.password) {
      return NextResponse.json(
        { error: 'Identifiant et mot de passe requis.' },
        { status: 400 }
      );
    }

    const { username, password } = body;

    // 2. Authenticate against DB
    const isValid = await authenticateAdmin(username, password);

    if (!isValid) {
      return NextResponse.json(
        {
          error: 'Identifiants incorrects.',
          ...(remaining > 0 && { attemptsLeft: remaining }),
        },
        { status: 401 }
      );
    }

    // 3. Success → reset rate limit, issue signed token
    await resetRateLimitDB(rateLimitKey);

    const token = await createSessionToken(username);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24h
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne.' },
      { status: 500 }
    );
  }
}
