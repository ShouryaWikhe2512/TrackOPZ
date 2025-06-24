import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const dispatchedItems = await prisma.operatorProductUpdate.findMany({
      where: {
        dispatchStatus: 'Dispatched',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate summary statistics
    const totalCost = dispatchedItems.reduce((sum, item) => sum + item.dispatchedCost, 0);
    const totalCount = dispatchedItems.length;
    const lastDispatchDate = dispatchedItems.length > 0 ? dispatchedItems[0].createdAt : null;

    // Map to the format expected by the frontend (assuming quantity is 1 for each record)
    const formattedItems = dispatchedItems.map(item => ({
      id: item.id,
      product: item.product,
      quantity: 1, // Assuming each update is for one item
      cost: item.dispatchedCost,
      date: item.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      items: formattedItems,
      summary: {
        totalCost,
        totalDispatched: totalCount,
        lastDispatchDate,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 