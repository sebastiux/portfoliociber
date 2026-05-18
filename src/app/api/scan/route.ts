import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { MAX_BYTES, scanBuffer, validateRule } from "@/lib/yara-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ALLOWED_OPS = new Set(["validate", "scan"]);

const BodySchema = z.object({
  op: z.enum(["validate", "scan"]),
  rule: z.string().min(1).max(64 * 1024),
});

export async function POST(req: Request) {
  const ct = req.headers.get("content-type") ?? "";

  if (ct.includes("application/json")) {
    const body = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success || parsed.data.op !== "validate") {
      return NextResponse.json({ error: "invalid request" }, { status: 400 });
    }
    const outcome = validateRule(parsed.data.rule);
    return NextResponse.json(outcome);
  }

  if (!ct.includes("multipart/form-data")) {
    return NextResponse.json({ error: "expected multipart/form-data" }, { status: 415 });
  }

  const ip = clientIpFromHeaders(req.headers);
  const rl = await rateLimit(`scan:${ip}`, 10, 60 * 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate limited", resetAt: rl.resetAt },
      { status: 429, headers: { "Retry-After": Math.ceil((rl.resetAt - Date.now()) / 1000).toString() } },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid form payload" }, { status: 400 });
  }

  const opField = form.get("op");
  const op = typeof opField === "string" ? opField : "scan";
  if (!ALLOWED_OPS.has(op)) {
    return NextResponse.json({ error: "invalid op" }, { status: 400 });
  }

  const ruleField = form.get("rule");
  if (typeof ruleField !== "string" || !ruleField.trim()) {
    return NextResponse.json({ error: "missing rule" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "missing file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: `file exceeds ${MAX_BYTES} bytes` }, { status: 413 });
  }

  const validation = validateRule(ruleField);
  if (!validation.ok) {
    return NextResponse.json({ ok: false, compile: validation }, { status: 422 });
  }

  let buffer: Buffer;
  try {
    const ab = await file.arrayBuffer();
    buffer = Buffer.from(ab);
  } catch {
    return NextResponse.json({ error: "could not read file" }, { status: 400 });
  }

  try {
    const result = await scanBuffer(ruleField, buffer);
    return NextResponse.json(
      { ok: true, compile: validation, result },
      { headers: { "X-RateLimit-Remaining": String(rl.remaining) } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "scan failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  } finally {
    // Encourage GC; buffer goes out of scope here.
    buffer.fill(0);
  }
}
