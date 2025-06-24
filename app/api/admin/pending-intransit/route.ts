import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const updates = await prisma.operatorProductUpdate.findMany({
      where: {
        dispatchStatus: {
          in: ['Pending', 'In Transit'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json({ success: true, updates });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 