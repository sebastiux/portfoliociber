import "server-only";
import type { ParsedIoc } from "../ioc";
import type { SourceReport, Verdict } from "./types";

const ENDPOINT = "https://urlscan.io/api/v1/search/";

type UrlscanHit = {
  task?: { time?: string; url?: string };
  page?: { url?: string; domain?: string; ip?: string };
  verdicts?: { overall?: { malicious?: boolean; score?: number } };
  result?: string;
};

type UrlscanResponse = {
  total?: number;
  results?: UrlscanHit[];
};

function buildQuery(ioc: ParsedIoc): string | null {
  switch (ioc.type) {
    case "domain":
      return `domain:${ioc.value}`;
    case "ip":
      return `page.ip:${ioc.value}`;
    case "url":
      return `page.url:"${ioc.value.replace(/"/g, "")}"`;
    default:
      return null;
  }
}

export async function lookupUrlscan(ioc: ParsedIoc): Promise<SourceReport | null> {
  const q = buildQuery(ioc);
  if (!q) return null;
  const url = `${ENDPOINT}?q=${encodeURIComponent(q)}&size=5`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) {
      return {
        source: "urlscan.io",
        verdict: "unknown",
        notes: `HTTP ${res.status}`,
      };
    }
    const json = (await res.json()) as UrlscanResponse;
    const hits = json.results ?? [];
    if (!hits.length) {
      return { source: "urlscan.io", verdict: "unknown", notes: "no results" };
    }
    let verdict: Verdict = "clean";
    let score: number | undefined;
    let lastUrl: string | undefined;
    for (const h of hits) {
      const v = h.verdicts?.overall;
      if (v?.malicious) {
        verdict = "malicious";
        score = typeof v.score === "number" ? v.score : score;
      }
      lastUrl = h.result ?? lastUrl;
    }
    return {
      source: "urlscan.io",
      verdict,
      score: score ?? null,
      url: lastUrl ?? null,
      notes: `${hits.length} scan(s)`,
    };
  } catch (err) {
    return {
      source: "urlscan.io",
      verdict: "unknown",
      notes: err instanceof Error ? err.message : "fetch failed",
    };
  }
}
