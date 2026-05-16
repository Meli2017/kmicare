import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { isAuthenticated } from '@/lib/session';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    
    if (!(await isAuthenticated(cookieStore))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const resolvedParams = await Promise.resolve(params);
    const invoiceId = resolvedParams.id;
    
    if (!invoiceId) {
      return NextResponse.json({ error: 'Missing invoice ID' }, { status: 400 });
    }
    
    // Check if invoice exists
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId }
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Delete invoice (Cascade will handle InvoiceItem if configured in Prisma, 
    // but Prisma relation `onDelete: Cascade` handles it automatically for InvoiceItem)
    await db.invoice.delete({
      where: { id: invoiceId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete invoice error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
