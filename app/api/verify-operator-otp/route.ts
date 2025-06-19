import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { phone, otp } = await req.json();

  // 1. Find operator by phone
  const operator = await prisma.operator.findUnique({ where: { phone } });
  if (!operator) {
    return NextResponse.json({ success: false, error: 'Invalid phone or OTP' }, { status: 401 });
  }

  // 2. Find valid OTP for operator
  const otpRecord = await prisma.operatorOTP.findFirst({
    where: {
      operatorId: operator.id,
      code: otp,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otpRecord) {
    return NextResponse.json({ success: false, error: 'Invalid or expired OTP' }, { status: 401 });
  }

  // 3. Mark OTP as used
  await prisma.operatorOTP.update({
    where: { id: otpRecord.id },
    data: { used: true },
  });

  // 4. Check if first time
  if (operator.username && operator.profileImage) {
    return NextResponse.json({ success: true, firstTime: false, username: operator.username, profileImage: operator.profileImage });
  } else {
    return NextResponse.json({ success: true, firstTime: true });
  }
} 