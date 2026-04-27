import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { sendInvoiceEmail } from '@/lib/email';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    
    if (session?.value !== 'authenticated') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Attendre la résolution des params pour Next.js 15+
    const resolvedParams = await Promise.resolve(params);
    const invoiceId = resolvedParams.id;
    
    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Missing invoice ID' },
        { status: 400 }
      );
    }
    
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: true
      }
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Envoi de l'email
    const emailSent = await sendInvoiceEmail(
      invoice.clientEmail,
      invoice.clientName,
      invoice
    );

    if (emailSent) {
      // Mettre à jour le statut
      const updatedInvoice = await db.invoice.update({
        where: { id: invoiceId },
        data: { status: 'sent' },
        include: { items: true }
      });
      return NextResponse.json(updatedInvoice);
    } else {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Send invoice error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
