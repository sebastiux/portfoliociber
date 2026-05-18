import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const redis = getRedis();
  let redisStatus: "ok" | "disabled" | "error" = redis ? "ok" : "disabled";
  if (redis) {
    try {
      await redis.ping();
    } catch {
      redisStatus = "error";
    }
  }
  return NextResponse.json({
    status: "ok",
    redis: redisStatus,
    yara: "loaded",
    uptime: process.uptime(),
  });
}
