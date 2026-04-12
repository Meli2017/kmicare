import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { sendBookingNotification, sendStatusUpdateEmail } from '@/lib/email';

// GET - Fetch all bookings (admin only)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    
    if (session?.value !== 'authenticated') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const bookings = await db.booking.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─── Génération du numéro de demande ───────────────────────────────────────
// Format : KMI-YYYYMMDD-XXXX (ex: KMI-20260412-A3F9)
// Caractères sans ambiguïté : pas de 0/O, 1/I
function generateBookingNumber(date: string): string {
  const datePart = date.replace(/-/g, ''); // "20260412"
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KMI-${datePart}-${suffix}`;
}

// POST - Create new booking (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { service, serviceName, date, time, address, customerName, email, phone, notes, recaptchaToken } = body;
    
    if (!service || !serviceName || !date || !time || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Vérification reCAPTCHA v3
    if (recaptchaToken && process.env.RECAPTCHA_SECRET_KEY) {
      try {
        const recaptchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
        });
        const recaptchaData = await recaptchaRes.json();

        if (!recaptchaData.success || recaptchaData.score < 0.1) {
          console.log('reCAPTCHA blocked:', recaptchaData);
          return NextResponse.json(
            { error: 'Verification anti-bot echouee. Veuillez reessayer.' },
            { status: 403 }
          );
        }
        console.log('reCAPTCHA score:', recaptchaData.score);
      } catch (err) {
        console.error('reCAPTCHA verification error:', err);
        // Continuer sans bloquer en cas d'erreur de vérification
      }
    }

    // Générer un numéro unique (réessaie en cas de collision rare)
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
        time,
        address,
        customerName,
        email,
        phone,
        notes,
        status: 'pending',
      },
    });
    
    // Envoyer l'email de notification
    await sendBookingNotification({
      bookingNumber,
      service: serviceName || service,
      date,
      time,
      address,
      customerName,
      email,
      phone,
      notes,
    }).catch(err => console.error('Email notification failed:', err));
    
    return NextResponse.json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update booking status (admin only)
export async function PUT(request: NextRequest) {
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
    const { id, status } = body;
    
    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const booking = await db.booking.update({
      where: { id },
      data: { status },
    });
    
    // Envoyer un email au client si son email est renseigné et si le statut est confirmé ou annulé
    if (booking.email && (status === 'confirmed' || status === 'cancelled' || status === 'completed')) {
      await sendStatusUpdateEmail(booking.email, status, {
        bookingNumber: booking.bookingNumber || undefined,
        service: booking.serviceName || booking.service,
        date: booking.date,
        time: booking.time,
        address: booking.address,
        customerName: booking.customerName || undefined,
      }).catch(err => console.error('Status email failed:', err));
    }
    
    return NextResponse.json(booking);
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a booking (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    if (session?.value !== 'authenticated') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing booking ID' },
        { status: 400 }
      );
    }

    await db.booking.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
