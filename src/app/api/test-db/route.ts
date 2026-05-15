import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { isAuthenticated } from '@/lib/session';

// Route interne — uniquement accessible en développement
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const cookieStore = await cookies();
  if (!(await isAuthenticated(cookieStore))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const adminCount = await db.admin.count();
    const bookingCount = await db.booking.count();
    const slotCount = await db.availabilitySlot.count();

    return NextResponse.json({
      status: '✅ Connexion réussie !',
      tables: { admins: adminCount, bookings: bookingCount, availabilitySlots: slotCount },
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ status: '❌ Connexion échouée', error: err.message }, { status: 500 });
  }
}
