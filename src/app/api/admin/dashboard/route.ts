import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

// GET - Fetch all admin dashboard data in a single request
// Replaces 6 separate API calls with 1 parallelised query
export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    if (session?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];

    // 6 queries in parallel — but only 1 HTTP request / 1 Node.js process
    const [
      blockedDates,
      bookings,
      invoices,
      testimonials,
      socialLinks,
      dateAvailabilities,
      serviceAreas,
    ] = await Promise.all([
      db.blockedDate.findMany({ orderBy: { date: 'asc' } }),
      db.booking.findMany({ orderBy: { createdAt: 'desc' }, include: { invoices: true } }),
      db.invoice.findMany({ orderBy: { createdAt: 'desc' }, include: { items: true, booking: true } }),
      db.testimonial.findMany({ orderBy: { order: 'asc' } }),
      db.socialLink.findMany({ orderBy: { order: 'asc' } }),
      db.dateAvailability.findMany({
        where: { date: { gte: today } },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      }),
      db.serviceArea.findMany({ orderBy: { order: 'asc' } }),
    ]);

    return NextResponse.json({
      blockedDates,
      bookings,
      invoices,
      testimonials,
      socialLinks,
      dateAvailabilities,
      serviceAreas,
    });
  } catch (error) {
    console.error('Admin dashboard fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
