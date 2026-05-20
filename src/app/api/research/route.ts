import { NextResponse } from "next/server";
import { listResearch } from "@/lib/research/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const items = await listResearch(50);
  return NextResponse.json({ items });
}
