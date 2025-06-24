import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const recentDownloads = await prisma.reportDownload.findMany({
      orderBy: {
        downloadedAt: 'desc',
      },
      take: 5, // Get the 5 most recent downloads
    });
    return NextResponse.json({ success: true, recentDownloads });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    
  }
} 