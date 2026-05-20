import "server-only";
import { isConfigured } from "./grok-client";
import { generateResearch } from "./generator";
import { acquireDailyLock, getResearch, saveResearch, todayId } from "./store";

const CHECK_INTERVAL_MS = 60 * 60 * 1000;
const INITIAL_DELAY_MS = 30_000;

let started = false;

export type TickResult =
  | { status: "skipped"; reason: string }
  | { status: "exists" }
  | { status: "generated"; id: string }
  | { status: "error"; message: string };

export async function tick(): Promise<TickResult> {
  if (process.env.RESEARCH_AUTO_GENERATE === "false") {
    return { status: "skipped", reason: "disabled by env" };
  }
  if (!isConfigured()) {
    return { status: "skipped", reason: "no GROK_API_KEY" };
  }
  const id = todayId();
  const existing = await getResearch(id);
  if (existing) return { status: "exists" };

  const locked = await acquireDailyLock(id);
  if (!locked) return { status: "skipped", reason: "lock not acquired" };

  try {
    const item = await generateResearch(id);
    await saveResearch(item);
    return { status: "generated", id: item.id };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "unknown error",
    };
  }
}

function logResult(r: TickResult) {
  if (r.status === "generated") {
    console.log(`[research-scheduler] generated ${r.id}`);
  } else if (r.status === "error") {
    console.error(`[research-scheduler] error: ${r.message}`);
  }
}

export function startScheduler() {
  if (started) return;
  started = true;
  setTimeout(() => {
    void tick().then(logResult);
  }, INITIAL_DELAY_MS).unref?.();
  setInterval(() => {
    void tick().then(logResult);
  }, CHECK_INTERVAL_MS).unref?.();
}
