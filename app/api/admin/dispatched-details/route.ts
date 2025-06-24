import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to the start of the day

    let stats = await prisma.dailyDispatchStats.findUnique({
      where: { date: today },
    });

    // If no stats for today, return zeroed stats
    if (!stats) {
      stats = {
        id: 0,
        date: today,
        totalAmount: 0,
        totalCount: 0,
      };
    }

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 