import type { IocType } from "../ioc";

export type Verdict = "malicious" | "suspicious" | "clean" | "unknown";

export type SourceReport = {
  source: string;
  verdict: Verdict;
  score?: number | null;
  url?: string | null;
  raw?: Record<string, unknown> | null;
  notes?: string | null;
};

export type EnrichmentReport = {
  ioc: string;
  type: IocType;
  hashKind?: string;
  verdict: Verdict;
  lastSeen?: string | null;
  sources: SourceReport[];
};

export function combineVerdict(reports: SourceReport[]): Verdict {
  if (reports.some((r) => r.verdict === "malicious")) return "malicious";
  if (reports.some((r) => r.verdict === "suspicious")) return "suspicious";
  if (reports.some((r) => r.verdict === "clean")) return "clean";
  return "unknown";
}
