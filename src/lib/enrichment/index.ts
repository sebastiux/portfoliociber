import "server-only";
import type { ParsedIoc } from "../ioc";
import { redisGetJson, redisSetJson } from "../redis";
import { lookupAbuseIpdb } from "./abuseipdb";
import { lookupMalwareBazaar } from "./malwarebazaar";
import { lookupUrlscan } from "./urlscan";
import { combineVerdict, type EnrichmentReport, type SourceReport } from "./types";

const CACHE_TTL = 60 * 60;

export async function enrichIoc(ioc: ParsedIoc): Promise<EnrichmentReport> {
  const cacheKey = `enrich:${ioc.type}:${ioc.value}`;
  const cached = await redisGetJson<EnrichmentReport>(cacheKey);
  if (cached) return cached;

  const lookups: Promise<SourceReport | null>[] = [];
  if (ioc.type === "ip") {
    lookups.push(lookupAbuseIpdb(ioc), lookupUrlscan(ioc));
  } else if (ioc.type === "domain" || ioc.type === "url") {
    lookups.push(lookupUrlscan(ioc));
  } else if (ioc.type === "hash") {
    lookups.push(lookupMalwareBazaar(ioc));
  }

  const results = await Promise.all(lookups);
  const sources = results.filter((r): r is SourceReport => r !== null);
  const verdict = combineVerdict(sources);

  const report: EnrichmentReport = {
    ioc: ioc.value,
    type: ioc.type,
    hashKind: ioc.hashKind,
    verdict,
    lastSeen: null,
    sources,
  };

  await redisSetJson(cacheKey, report, CACHE_TTL);
  return report;
}
