import { NextResponse } from 'next/server';
import { initializeAdmin } from '@/lib/auth';
import { cookies } from 'next/headers';
import { isAuthenticated } from '@/lib/session';

export async function GET() {
  // Protégé : uniquement accessible à un admin déjà connecté
  const cookieStore = await cookies();
  if (!(await isAuthenticated(cookieStore))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initializeAdmin();
    return NextResponse.json({ success: true, message: 'Database initialized' });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
