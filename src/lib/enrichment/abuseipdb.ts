import "server-only";
import type { ParsedIoc } from "../ioc";
import type { SourceReport, Verdict } from "./types";

const ENDPOINT = "https://api.abuseipdb.com/api/v2/check";

type AbuseIpdbResponse = {
  data?: {
    ipAddress?: string;
    abuseConfidenceScore?: number;
    countryCode?: string;
    isp?: string;
    totalReports?: number;
    lastReportedAt?: string | null;
  };
};

export async function lookupAbuseIpdb(ioc: ParsedIoc): Promise<SourceReport | null> {
  if (ioc.type !== "ip") return null;
  const key = process.env.ABUSEIPDB_API_KEY;
  if (!key) return null;
  try {
    const url = `${ENDPOINT}?ipAddress=${encodeURIComponent(ioc.value)}&maxAgeInDays=90`;
    const res = await fetch(url, {
      headers: { Key: key, Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) {
      return { source: "AbuseIPDB", verdict: "unknown", notes: `HTTP ${res.status}` };
    }
    const json = (await res.json()) as AbuseIpdbResponse;
    const score = json.data?.abuseConfidenceScore ?? 0;
    let verdict: Verdict = "unknown";
    if (score >= 75) verdict = "malicious";
    else if (score >= 25) verdict = "suspicious";
    else if (typeof json.data?.totalReports === "number") verdict = "clean";
    return {
      source: "AbuseIPDB",
      verdict,
      score,
      url: `https://www.abuseipdb.com/check/${ioc.value}`,
      notes: [json.data?.countryCode, json.data?.isp, `${json.data?.totalReports ?? 0} reports`]
        .filter(Boolean)
        .join(" · "),
      raw: { lastReportedAt: json.data?.lastReportedAt ?? null },
    };
  } catch (err) {
    return {
      source: "AbuseIPDB",
      verdict: "unknown",
      notes: err instanceof Error ? err.message : "fetch failed",
    };
  }
}
