import { NextResponse } from "next/server";
import { getDetection, loadSource } from "@/lib/detections";

export const runtime = "nodejs";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  const detection = getDetection(slug);
  if (!detection) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const source = await loadSource(detection);
  return NextResponse.json({ detection, source });
}
