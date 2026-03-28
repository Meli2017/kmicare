import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body; // Expected: [{ id: "...", order: 0 }, { id: "...", order: 1 }]

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Format invalide' }, { status: 400 });
    }

    // Utiliser une transaction pour mettre à jour tous les ordres en même temps
    await db.$transaction(
      items.map((item: { id: string, order: number }) => 
        db.serviceArea.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur reorder service-areas:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
