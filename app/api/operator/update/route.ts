import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { operatorId, product, processSteps, dispatchStatus, dispatchedCost } = await req.json();

    if (!operatorId || !product || !processSteps || !dispatchStatus) {
      return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }

    // Always create the product update record
    const update = await prisma.operatorProductUpdate.create({
      data: {
        operatorId,
        product,
        processSteps,
        dispatchStatus,
        dispatchedCost: dispatchedCost || 0,
      },
    });

    // If dispatched, update the daily stats
    if (dispatchStatus === 'Dispatched') {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to the start of the day

      const cost = dispatchedCost || 0;

      await prisma.dailyDispatchStats.upsert({
        where: { date: today },
        update: {
          totalAmount: { increment: cost },
          totalCount: { increment: 1 },
        },
        create: {
          date: today,
          totalAmount: cost,
          totalCount: 1,
        },
      });
    }

    return NextResponse.json({ success: true, update });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 