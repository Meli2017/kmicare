import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

// GET - Fetch date-specific availability slots
// Par défaut : uniquement les dates à partir d'aujourd'hui (évite de charger 550+ entrées)
// Param ?admin=true : charger tout (pour l'admin seulement)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

    const slots = await db.dateAvailability.findMany({
      where: isAdmin ? undefined : { date: { gte: today } },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      // Limiter à 90 jours de disponibilités pour le public
      take: isAdmin ? undefined : 500,
    });
    return NextResponse.json(slots);
  } catch (error) {
    console.error('Fetch date availabilities error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new date-specific slot (admin only)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    if (session?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date, startTime, endTime, isActive = true } = body;

    if (!date || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const slot = await db.dateAvailability.create({
      data: { date, startTime, endTime, isActive },
    });
    return NextResponse.json(slot);
  } catch (error) {
    console.error('Create date availability error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update date-specific slot (admin only)
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    if (session?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing slot ID' }, { status: 400 });
    }

    const slot = await db.dateAvailability.update({
      where: { id },
      data: { isActive },
    });
    return NextResponse.json(slot);
  } catch (error) {
    console.error('Update date availability error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete date-specific slot (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    if (session?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing slot ID' }, { status: 400 });
    }

    await db.dateAvailability.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete date availability error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
