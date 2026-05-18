import "server-only";
import { compile, validate, type RuleMatch } from "@litko/yara-x";

export const SCAN_TIMEOUT_MS = 15_000;
export const MAX_BYTES = 10 * 1024 * 1024;

export type ScanMatch = {
  rule: string;
  namespace: string;
  tags: string[];
  meta: Record<string, unknown>;
  matches: { identifier: string; offset: number; length: number; data: string }[];
};

export type ScanResult = {
  durationMs: number;
  fileSize: number;
  sha256: string;
  matched: ScanMatch[];
};

export type CompileIssue = {
  code: string;
  message: string;
  line?: number;
  column?: number;
};

export type CompileOutcome =
  | { ok: true; warnings: CompileIssue[] }
  | { ok: false; errors: CompileIssue[]; warnings: CompileIssue[] };

export function validateRule(source: string): CompileOutcome {
  const result = validate(source);
  const warnings = result.warnings.map((w) => ({
    code: w.code,
    message: w.message,
    line: w.line,
    column: w.column,
  }));
  if (result.errors.length) {
    return {
      ok: false,
      warnings,
      errors: result.errors.map((e) => ({
        code: e.code,
        message: e.message,
        line: e.line,
        column: e.column,
      })),
    };
  }
  return { ok: true, warnings };
}

export async function scanBuffer(source: string, data: Buffer): Promise<ScanResult> {
  if (data.length > MAX_BYTES) {
    throw new Error(`File exceeds ${MAX_BYTES} bytes`);
  }
  const scanner = compile(source);
  scanner.setTimeout(SCAN_TIMEOUT_MS);

  const sha256 = await hashSha256(data);
  const started = process.hrtime.bigint();
  const raw = await scanner.scanAsync(data);
  const elapsed = Number(process.hrtime.bigint() - started) / 1e6;

  return {
    durationMs: elapsed,
    fileSize: data.length,
    sha256,
    matched: raw.map(serializeMatch),
  };
}

function serializeMatch(m: RuleMatch): ScanMatch {
  return {
    rule: m.ruleIdentifier,
    namespace: m.namespace,
    tags: m.tags,
    meta: (m.meta ?? {}) as Record<string, unknown>,
    matches: m.matches.map((md) => ({
      identifier: md.identifier,
      offset: md.offset,
      length: md.length,
      data: md.data,
    })),
  };
}

async function hashSha256(data: Buffer): Promise<string> {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(data).digest("hex");
}
