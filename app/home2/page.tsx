import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import MobileInterface from "./MobileInterface";

export default function Home2Page() {
  const token = cookies().get("token")?.value;

  let username = "Manager";
  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      username = decoded.email || "Manager";
    } catch {
      username = "Manager";
    }
  }

  return <MobileInterface username={username} />;
}
