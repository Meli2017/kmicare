import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

// GET - Fetch all blocked dates
export async function GET() {
  try {
    const blockedDates = await db.blockedDate.findMany({
      orderBy: { date: 'asc' },
    });
    
    return NextResponse.json(blockedDates);
  } catch (error) {
    console.error('Fetch blocked dates error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create blocked date (admin only)
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
    const { date, reason } = body;
    
    if (!date) {
      return NextResponse.json(
        { error: 'Missing date' },
        { status: 400 }
      );
    }
    
    const blockedDate = await db.blockedDate.create({
      data: {
        date,
        reason,
      },
    });
    
    return NextResponse.json(blockedDate);
  } catch (error) {
    console.error('Create blocked date error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete blocked date (admin only)
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
        { error: 'Missing blocked date ID' },
        { status: 400 }
      );
    }
    
    await db.blockedDate.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete blocked date error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
