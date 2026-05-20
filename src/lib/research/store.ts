import "server-only";
import { getRedis } from "../redis";
import type { GeneratedResearch, ResearchSummary } from "./types";

const KEY = (id: string) => `research:auto:${id}`;
const INDEX = "research:auto:index";
const LOCK = (id: string) => `research:lock:${id}`;

const memory = new Map<string, GeneratedResearch>();

export function todayId(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export async function saveResearch(item: GeneratedResearch): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(KEY(item.id), JSON.stringify(item));
    await redis.zadd(INDEX, new Date(item.generatedAt).getTime(), item.id);
    return;
  }
  memory.set(item.id, item);
}

export async function getResearch(id: string): Promise<GeneratedResearch | null> {
  const redis = getRedis();
  if (redis) {
    try {
      const raw = await redis.get(KEY(id));
      return raw ? (JSON.parse(raw) as GeneratedResearch) : null;
    } catch {
      return null;
    }
  }
  return memory.get(id) ?? null;
}

export async function listResearch(limit = 50): Promise<ResearchSummary[]> {
  const redis = getRedis();
  if (redis) {
    try {
      const ids = (await redis.zrevrange(INDEX, 0, limit - 1)) as string[];
      if (!ids.length) return [];
      const pipeline = redis.pipeline();
      for (const id of ids) pipeline.get(KEY(id));
      const results = await pipeline.exec();
      if (!results) return [];
      const out: ResearchSummary[] = [];
      for (const [err, raw] of results) {
        if (err || typeof raw !== "string") continue;
        try {
          const item = JSON.parse(raw) as GeneratedResearch;
          const { body: _body, ...summary } = item;
          void _body;
          out.push(summary);
        } catch {
          // ignore corrupt entry
        }
      }
      return out;
    } catch {
      return [];
    }
  }
  return Array.from(memory.values())
    .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))
    .slice(0, limit)
    .map(({ body: _body, ...rest }) => {
      void _body;
      return rest;
    });
}

/**
 * Distributed lock for the daily generation. Returns true if the caller
 * acquired the lock and should proceed to generate. The lock TTL covers
 * the worst-case generation duration; if the caller crashes mid-generation,
 * another replica can retry after expiry.
 */
export async function acquireDailyLock(id: string, ttlSeconds = 600): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return true;
  try {
    const res = await redis.set(LOCK(id), "1", "EX", ttlSeconds, "NX");
    return res === "OK";
  } catch {
    return false;
  }
}
