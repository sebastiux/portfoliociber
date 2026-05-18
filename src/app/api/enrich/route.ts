import { NextResponse } from "next/server";
import { z } from "zod";
import { enrichIoc } from "@/lib/enrichment";
import { parseIocs } from "@/lib/ioc";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const BodySchema = z.object({
  input: z.string().min(1).max(8_000),
});

export async function POST(req: Request) {
  const ip = clientIpFromHeaders(req.headers);
  const rl = await rateLimit(`enrich:${ip}`, 30, 60 * 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate limited", resetAt: rl.resetAt },
      { status: 429 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const iocs = parseIocs(parsed.data.input).slice(0, 25);
  if (!iocs.length) {
    return NextResponse.json({ ok: true, reports: [] });
  }

  const reports = await Promise.all(iocs.map((i) => enrichIoc(i)));
  return NextResponse.json(
    { ok: true, reports },
    { headers: { "X-RateLimit-Remaining": String(rl.remaining) } },
  );
}
