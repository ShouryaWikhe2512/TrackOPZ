import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// import { notifyMachineStatusChanged } from '../../jobs/sse';

const prisma = new PrismaClient();

// export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
//   const { params } = context;
//   try {
//     const id = parseInt(params.id, 10);
//     if (isNaN(id)) {
//       return NextResponse.json({ error: 'Invalid machine ID' }, { status: 400 });
//     }
//     const { status } = await req.json();
//     if (!status || typeof status !== 'string') {
//       return NextResponse.json({ error: 'Status is required' }, { status: 400 });
//     }
//     const machine = await prisma.machine.update({
//       where: { id },
//       data: { status },
//     });
//     notifyMachineStatusChanged(machine);
//     return NextResponse.json({ machine }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ error: 'Failed to update machine status' }, { status: 500 });
//   }
// } 