import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { broadcastJob } from './stream';
import { broadcastProduct } from '../products/stream';
import { broadcastProductCount } from '../product-count/stream';

const prisma = new PrismaClient();

// GET: Fetch all jobs with machine and product info
export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        machine: true,
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ jobs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

// POST: Add a new job
export async function POST(req: NextRequest) {
  try {
    const { machine, product, state, stage } = await req.json();
    if (!machine || !product || !state || !stage) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    // Find or create machine
    let dbMachine = await prisma.machine.findFirst({ where: { name: machine } });
    if (!dbMachine) {
      dbMachine = await prisma.machine.create({ data: { name: machine, status: state } });
    } else {
      // Optionally update status
      await prisma.machine.update({ where: { id: dbMachine.id }, data: { status: state } });
    }
    // Find or create product (case-insensitive, trimmed)
    let dbProduct = await prisma.product.findFirst({
      where: { name: { equals: product.trim(), mode: 'insensitive' } }
    });
    if (!dbProduct) {
      dbProduct = await prisma.product.create({ data: { name: product.trim() } });
    }
    // Create job
    const job = await prisma.job.create({
      data: {
        machineId: dbMachine.id,
        productId: dbProduct.id,
        state,
        stage,
      },
      include: { machine: true, product: true },
    });
    broadcastJob(job);
    // Fetch the product with its latest job and broadcast for real-time product list
    const productWithLatestJob = await prisma.product.findUnique({
      where: { id: dbProduct.id },
      include: {
        jobs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    if (productWithLatestJob) {
      const updatedProduct = {
        id: productWithLatestJob.id,
        name: productWithLatestJob.name,
        process: productWithLatestJob.jobs[0]?.stage || '',
        status: productWithLatestJob.jobs[0]?.state || '',
      };
      broadcastProduct(updatedProduct);
    }
    // After broadcasting product, also broadcast product count if state is 'ON' and machine is 'CNC Finished'
    if (state === 'ON' && machine === 'CNC Finished') {
      const cncMachine = await prisma.machine.findFirst({
        where: { name: 'CNC Finished' },
        select: { id: true },
      });

      if (cncMachine) {
        const count = await prisma.job.count({
          where: {
            productId: dbProduct.id,
            machineId: cncMachine.id,
            state: 'ON',
          },
        });

        const productCount = {
          id: dbProduct.id,
          name: dbProduct.name,
          count: count,
          status: 'ON',
        };
        broadcastProductCount(productCount);
      }
    }
    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add job' }, { status: 500 });
  }
} 