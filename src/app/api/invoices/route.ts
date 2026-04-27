import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

// GET - Fetch all invoices (admin only)
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
    
    const invoices = await db.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        booking: true
      }
    });
    
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Fetch invoices error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new invoice
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
    const { bookingId, clientName, clientEmail, issueDate, notes, items } = body;
    
    if (!bookingId || !clientName || !clientEmail || !issueDate || !items || !items.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calcul du total
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.amount * (item.quantity || 1)), 0);

    // Génération du numéro de facture
    const datePart = issueDate.replace(/-/g, '');
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let suffix = '';
    for (let i = 0; i < 4; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const invoiceNumber = `INV-${datePart}-${suffix}`;

    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        bookingId,
        clientName,
        clientEmail,
        totalAmount,
        issueDate,
        notes: notes || null,
        status: 'generated',
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            amount: parseFloat(item.amount),
            quantity: parseInt(item.quantity) || 1
          }))
        }
      },
      include: {
        items: true
      }
    });
    
    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
