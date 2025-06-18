"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ResetPasswordClient from "./ResetPasswordClient";
export const dynamic = "force-dynamic";
export default function Page() {
  return <ResetPasswordClient />;
}
