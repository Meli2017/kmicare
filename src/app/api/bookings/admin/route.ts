import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

// Génération du numéro de demande
function generateBookingNumber(date: string): string {
  const datePart = date.replace(/-/g, '');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KMI-${datePart}-${suffix}`;
}

// POST - Create new booking (admin only)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    
    if (session?.value !== 'authenticated') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { service, serviceName, date, endDate, time, endTime, address, customerName, email, phone } = body;
    
    if (!service || !serviceName || !date || !time || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Générer un numéro unique
    let bookingNumber = generateBookingNumber(date);
    let attempts = 0;
    while (attempts < 5) {
      const existing = await db.booking.findUnique({ where: { bookingNumber } });
      if (!existing) break;
      bookingNumber = generateBookingNumber(date);
      attempts++;
    }
    
    const booking = await db.booking.create({
      data: {
        bookingNumber,
        service,
        serviceName,
        date,
        endDate: endDate || null,
        time,
        endTime: endTime || null,
        address,
        customerName: customerName || null,
        email: email || null,
        phone: phone || null,
        status: 'confirmed', // Admin bookings are confirmed by default
        source: 'admin',
        notes: null // Left empty by default for admin
      },
    });
    
    return NextResponse.json(booking);
  } catch (error) {
    console.error('Create admin booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
