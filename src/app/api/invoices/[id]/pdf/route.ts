import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { isAuthenticated } from '@/lib/session';
import { generateInvoicePDF } from '@/lib/pdf';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    
    if (!(await isAuthenticated(cookieStore))) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const resolvedParams = await Promise.resolve(params);
    const invoiceId = resolvedParams.id;
    
    if (!invoiceId) {
      return new NextResponse('Missing invoice ID', { status: 400 });
    }
    
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: true,
        booking: true
      }
    });

    if (!invoice) {
      return new NextResponse('Invoice not found', { status: 404 });
    }

    const pdfBytes = await generateInvoicePDF(invoice, invoice.clientName);

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Facture_KMI_${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Generate PDF error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
