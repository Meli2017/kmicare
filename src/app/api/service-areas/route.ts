import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { isAuthenticated } from '@/lib/session';

// ─── Helper auth ──────────────────────────────────────────────────────────────
async function requireAdmin() {
  const cookieStore = await cookies();
  if (!(await isAuthenticated(cookieStore))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

// ─── GET — public (lecture seule des zones actives) ───────────────────────────
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const activeOnly = url.searchParams.get('activeOnly') === 'true';
    const where = activeOnly ? { isActive: true } : {};

    let areas = await db.serviceArea.findMany({ where, orderBy: { order: 'asc' } });

    // Initialisation avec les valeurs par défaut si complètement vide
    if (areas.length === 0 && !activeOnly) {
      const defaultCities = ['Montréal', 'Laval', 'Longueuil', 'Brossard', 'Dollard-des-Ormeaux', 'Pointe-Claire', 'Kirkland'];
      for (let i = 0; i < defaultCities.length; i++) {
        await db.serviceArea.create({ data: { name: defaultCities[i], order: i, isActive: true } });
      }
      areas = await db.serviceArea.findMany({ where, orderBy: { order: 'asc' } });
    }

    return NextResponse.json(areas);
  } catch (error) {
    console.error('Erreur GET service-areas:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// ─── POST — admin uniquement ──────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { name, isActive = true } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Le nom de la zone est requis' }, { status: 400 });
    }

    const lastArea = await db.serviceArea.findFirst({ orderBy: { order: 'desc' } });
    const newOrder = lastArea ? lastArea.order + 1 : 0;

    const area = await db.serviceArea.create({
      data: { name: name.trim(), isActive, order: newOrder },
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

// ─── PUT — admin uniquement ───────────────────────────────────────────────────
export async function PUT(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, name, isActive, order } = body;

    if (!id) {
      return NextResponse.json({ error: "L'ID de la zone est requis" }, { status: 400 });
    }

    const dataToUpdate: Record<string, unknown> = {};
    if (name !== undefined) dataToUpdate.name = String(name).trim();
    if (isActive !== undefined) dataToUpdate.isActive = Boolean(isActive);
    if (order !== undefined) dataToUpdate.order = Number(order);

    const area = await db.serviceArea.update({ where: { id }, data: dataToUpdate });
    return NextResponse.json(area);
  } catch (error) {
    console.error('Erreur PUT service-areas:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// ─── DELETE — admin uniquement ────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "L'ID de la zone est requis" }, { status: 400 });
    }

    await db.serviceArea.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE service-areas:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
