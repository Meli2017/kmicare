import { NextResponse } from 'next/server';
import { initializeAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await initializeAdmin();
    return NextResponse.json({ success: true, message: 'Database initialized' });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
