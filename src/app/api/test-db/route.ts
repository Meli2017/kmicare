import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Test simple : compter les admins dans la base de données
    const adminCount = await db.admin.count();
    const bookingCount = await db.booking.count();
    const slotCount = await db.availabilitySlot.count();

    return NextResponse.json({
      status: '✅ Connexion réussie !',
      database: 'u214268980_kmicaredb',
      tables: {
        admins: adminCount,
        bookings: bookingCount,
        availabilitySlots: slotCount,
      },
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        status: '❌ Connexion échouée',
        error: err.message,
      },
      { status: 500 }
    );
  }
}
