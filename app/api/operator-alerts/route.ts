import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get unread alert count for a specific operator
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const operatorId = searchParams.get('operatorId');

  if (!operatorId) {
    return NextResponse.json({ error: 'Operator ID is required' }, { status: 400 });
  }

  try {
    const unreadCount = await prisma.operatorAlertStatus.count({
      where: {
        operatorId: parseInt(operatorId, 10),
        read: false,
      },
    });
    return NextResponse.json({ success: true, unreadCount });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch unread count' }, { status: 500 });
  }
}

// Mark alerts as read for a specific operator
export async function POST(req: NextRequest) {
  const { operatorId } = await req.json();

  if (!operatorId) {
    return NextResponse.json({ error: 'Operator ID is required' }, { status: 400 });
  }

  try {
    await prisma.operatorAlertStatus.updateMany({
      where: {
        operatorId: parseInt(operatorId, 10),
        read: false,
      },
      data: {
        read: true,
      },
    });
    return NextResponse.json({ success: true, message: 'Alerts marked as read.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to mark alerts as read' }, { status: 500 });
  }
} 