import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const activeOnly = url.searchParams.get('activeOnly') === 'true';

    // Construire les conditions de filtre
    const where = activeOnly ? { isActive: true } : {};

    let areas = await db.serviceArea.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    // Initialisation avec les valeurs par défaut si vide
    if (areas.length === 0 && !activeOnly) {
      const defaultCities = ['Montréal', 'Laval', 'Longueuil', 'Brossard', 'Dollard-des-Ormeaux', 'Pointe-Claire', 'Kirkland'];
      
      // On insère les villes par défaut une par une
      for (let i = 0; i < defaultCities.length; i++) {
        await db.serviceArea.create({
          data: {
            name: defaultCities[i],
            order: i,
            isActive: true,
          }
        });
      }
      
      // On récupère à nouveau après l'initialisation
      areas = await db.serviceArea.findMany({
        where,
        orderBy: { order: 'asc' },
      });
    }

    return NextResponse.json(areas);
  } catch (error) {
    console.error('Erreur GET service-areas:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, isActive = true } = body;

    if (!name) {
      return NextResponse.json({ error: 'Le nom de la zone est requis' }, { status: 400 });
    }

    // Récupérer l'ordre max pour placer à la fin
    const lastArea = await db.serviceArea.findFirst({
      orderBy: { order: 'desc' },
    });
    
    const newOrder = lastArea ? lastArea.order + 1 : 0;

    const area = await db.serviceArea.create({
      data: {
        name,
        isActive,
        order: newOrder,
      },
    });

    return NextResponse.json(area);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Cette zone existe déjà' }, { status: 400 });
    }
    console.error('Erreur POST service-areas:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, isActive, order } = body;

    if (!id) {
      return NextResponse.json({ error: 'L\'ID de la zone est requis' }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (isActive !== undefined) dataToUpdate.isActive = isActive;
    if (order !== undefined) dataToUpdate.order = order;

    const area = await db.serviceArea.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(area);
  } catch (error) {
    console.error('Erreur PUT service-areas:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'L\'ID de la zone est requis' }, { status: 400 });
    }

    await db.serviceArea.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE service-areas:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
