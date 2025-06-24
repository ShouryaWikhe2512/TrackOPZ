import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, OperatorProductUpdate } from '@prisma/client';
import ExcelJS from 'exceljs';

const prisma = new PrismaClient();

// Helper to get date ranges
const getDateRange = (reportType: string) => {
  const now = new Date();
  const startDate = new Date(now);
  const endDate = new Date(now);

  if (reportType === 'daily') {
    startDate.setHours(0, 0, 0, 0);
  } else if (reportType === 'weekly') {
    startDate.setDate(now.getDate() - now.getDay());
    startDate.setHours(0, 0, 0, 0);
  } else if (reportType === 'monthly') {
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
  }
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate };
};

// Main GET handler
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reportType = searchParams.get('reportType') || 'daily';
  const filter = searchParams.get('filter') || 'Date Wise';

  // --- Unsupported Filters ---
  if (['Machine Wise', 'Department Wise'].includes(filter)) {
    return NextResponse.json(
      { success: false, error: `Report type "${filter}" is not supported yet.` },
      { status: 400 }
    );
  }

  try {
    const { startDate, endDate } = getDateRange(reportType);
    const whereClause = { createdAt: { gte: startDate, lte: endDate } };

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${filter} Report`);
    let totalCost = 0;
    
    // --- Dynamic Report Generation ---
    switch (filter) {
      case 'Product Wise':
        const productData = await prisma.operatorProductUpdate.groupBy({
          by: ['product'],
          where: whereClause,
          _sum: { dispatchedCost: true },
          _count: { id: true },
        });
        worksheet.columns = [
          { header: 'Product', key: 'product', width: 30 },
          { header: 'Items Dispatched', key: 'count', width: 20 },
          { header: 'Total Cost', key: 'cost', width: 20, style: { numFmt: '"₹"#,##0.00' } },
        ];
        productData.forEach(p => worksheet.addRow({ product: p.product, count: p._count.id, cost: p._sum.dispatchedCost }));
        totalCost = productData.reduce((acc, p) => acc + (p._sum.dispatchedCost || 0), 0);
        break;
      
      case 'Status Wise':
        const statusData = await prisma.operatorProductUpdate.groupBy({
          by: ['dispatchStatus'],
          where: whereClause,
          _sum: { dispatchedCost: true },
          _count: { id: true },
        });
        worksheet.columns = [
            { header: 'Dispatch Status', key: 'status', width: 30 },
            { header: 'Item Count', key: 'count', width: 20 },
            { header: 'Total Cost', key: 'cost', width: 20, style: { numFmt: '"₹"#,##0.00' } },
        ];
        statusData.forEach(s => worksheet.addRow({ status: s.dispatchStatus, count: s._count.id, cost: s._sum.dispatchedCost }));
        totalCost = statusData.reduce((acc, s) => acc + (s._sum.dispatchedCost || 0), 0);
        break;
        
      case 'Operator Wise':
         const operatorData = await prisma.operatorProductUpdate.findMany({
            where: whereClause,
            include: { operator: true }
        });
        const groupedByOperator = operatorData.reduce((acc, item) => {
            const key = item.operator.username || `Operator #${item.operatorId}`;
            if (!acc[key]) acc[key] = { items: 0, cost: 0 };
            acc[key].items += 1;
            acc[key].cost += item.dispatchedCost;
            return acc;
        }, {} as Record<string, { items: number, cost: number }>);
        worksheet.columns = [
            { header: 'Operator', key: 'operator', width: 30 },
            { header: 'Items Processed', key: 'items', width: 20 },
            { header: 'Total Value', key: 'cost', width: 20, style: { numFmt: '"₹"#,##0.00' } },
        ];
        Object.entries(groupedByOperator).forEach(([operator, data]) => worksheet.addRow({ operator, ...data }));
        totalCost = operatorData.reduce((acc, op) => acc + op.dispatchedCost, 0);
        break;

      default: // Date Wise (flat list)
        const dateData = await prisma.operatorProductUpdate.findMany({ where: whereClause, orderBy: { createdAt: 'desc' } });
        worksheet.columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Product', key: 'product', width: 30 },
          { header: 'Status', key: 'dispatchStatus', width: 20 },
          { header: 'Cost', key: 'dispatchedCost', width: 15, style: { numFmt: '"₹"#,##0.00' } },
          { header: 'Date', key: 'createdAt', width: 25, style: { numFmt: 'yyyy-mm-dd hh:mm:ss' } },
        ];
        worksheet.addRows(dateData);
        totalCost = dateData.reduce((acc, item) => acc + item.dispatchedCost, 0);
    }
    
    // Add Total Row
    worksheet.addRow([]);
    const totalRow = worksheet.addRow(['', 'Total Cost:', totalCost]);
    totalRow.getCell('B').font = { bold: true };
    totalRow.getCell('C').font = { bold: true };
    totalRow.getCell('C').style = { numFmt: '"₹"#,##0.00' };

    // Log and Send File
    const reportName = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} ${filter} Report`;
    await prisma.reportDownload.create({ data: { reportName } });

    const buffer = await workbook.xlsx.writeBuffer();
    const headers = new Headers({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${reportName.replace(/ /g, '_')}.xlsx"`,
    });

    return new NextResponse(buffer, { status: 200, headers });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
} 