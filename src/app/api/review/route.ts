import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Validate a review token (called by the review page server component)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token manquant' }, { status: 400 });
  }

  const record = await db.testimonialToken.findUnique({ where: { token } });

  if (!record) {
    return NextResponse.json({ valid: false, reason: 'invalid' });
  }

  if (record.isUsed) {
    return NextResponse.json({ valid: false, reason: 'used' });
  }

  if (new Date() > record.expiresAt) {
    return NextResponse.json({ valid: false, reason: 'expired' });
  }

  return NextResponse.json({
    valid: true,
    customerName: record.customerName || '',
  });
}

// POST - Submit a testimonial using a valid token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, customerName, message, rating } = body;

    if (!token || !customerName || !message || !rating) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Note invalide (1-5)' }, { status: 400 });
    }

    if (message.trim().length < 10) {
      return NextResponse.json({ error: 'Témoignage trop court' }, { status: 400 });
    }

    // Validate token
    const record = await db.testimonialToken.findUnique({ where: { token } });

    if (!record) {
      return NextResponse.json({ error: 'Lien invalide.' }, { status: 404 });
    }
    if (record.isUsed) {
      return NextResponse.json({ error: 'Ce lien a déjà été utilisé.' }, { status: 409 });
    }
    if (new Date() > record.expiresAt) {
      return NextResponse.json({ error: 'Ce lien a expiré.' }, { status: 410 });
    }

    // Create testimonial (isActive = false, needs admin approval)
    await db.testimonial.create({
      data: {
        customerName: customerName.trim(),
        message: message.trim(),
        rating: Math.round(rating),
        isActive: false,
        source: 'client',
        order: 0,
      },
    });

    // Mark token as used
    await db.testimonialToken.update({
      where: { token },
      data: { isUsed: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
