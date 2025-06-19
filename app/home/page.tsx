import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/operator-login");

  let phone = null;
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    phone = decoded.phone;
  } catch {
    redirect("/operator-login");
  }

  let profileImage: string | null = null;
  let username: string | null = null;
  if (phone) {
    const prisma = new PrismaClient();
    const operator = await prisma.operator.findUnique({ where: { phone } });
    profileImage = operator?.profileImage || null;
    username = operator?.username || null;
    await prisma.$disconnect();
  }

  return <HomeClient profileImage={profileImage} username={username} />;
}
