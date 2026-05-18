"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ScanMatch = {
  rule: string;
  namespace: string;
  tags: string[];
  meta: Record<string, unknown>;
  matches: { identifier: string; offset: number; length: number; data: string }[];
};

type ScanResponse =
  | {
      ok: true;
      compile: { ok: true; warnings: { code: string; message: string; line?: number }[] };
      result: { durationMs: number; fileSize: number; sha256: string; matched: ScanMatch[] };
    }
  | {
      ok: false;
      compile: { ok: false; errors: { code: string; message: string; line?: number; column?: number }[]; warnings: { code: string; message: string }[] };
    }
  | { ok: false; error: string };

type Preset = { slug: string; name: string; source: string };

type Props = {
  presets: { slug: string; name: string }[];
  labels: {
    presetLabel: string;
    presetCustom: string;
    ruleLabel: string;
    ruleHint: string;
    uploadLabel: string;
    uploadHint: string;
    scanButton: string;
    scanning: string;
    results: string;
    noMatches: string;
    matchedRules: string;
    duration: string;
    fileSize: string;
    sha256: string;
    compileErrors: string;
    rateLimit: string;
    privacy: string;
  };
  initialRuleSlug?: string;
};

const MAX_BYTES = 10 * 1024 * 1024;

export function FileScanPanel({ presets, labels, initialRuleSlug }: Props) {
  const [presetSlug, setPresetSlug] = useState<string>(initialRuleSlug ?? "");
  const [rule, setRule] = useState<string>(DEFAULT_RULE);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [response, setResponse] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef<Map<string, Preset>>(new Map());

  const loadPreset = useCallback(async (slug: string) => {
    if (!slug) return;
    const cached = cache.current.get(slug);
    if (cached) {
      setRule(cached.source);
      return;
    }
    const res = await fetch(`/api/detections/${slug}`);
    if (!res.ok) return;
    const json = (await res.json()) as { detection: { name: string }; source: string };
    cache.current.set(slug, { slug, name: json.detection.name, source: json.source });
    setRule(json.source);
  }, []);

  useEffect(() => {
    if (initialRuleSlug) {
      setPresetSlug(initialRuleSlug);
      loadPreset(initialRuleSlug);
    }
  }, [initialRuleSlug, loadPreset]);

  function onPresetChange(slug: string) {
    setPresetSlug(slug);
    if (slug) loadPreset(slug);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (f && f.size > MAX_BYTES) {
      setError(`File exceeds ${MAX_BYTES} bytes`);
      setFile(null);
      return;
    }
    setError(null);
    setFile(f);
  }

  async function submit() {
    if (!file) {
      setError("Select a file");
      return;
    }
    setBusy(true);
    setError(null);
    setResponse(null);
    try {
      const form = new FormData();
      form.set("rule", rule);
      form.set("file", file);
      const res = await fetch("/api/scan", { method: "POST", body: form });
      const json = (await res.json()) as ScanResponse;
      setResponse(json);
      if (res.status === 429) setError(labels.rateLimit);
    } catch (err) {
      setError(err instanceof Error ? err.message : "scan failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-[color:var(--muted)]">{labels.privacy}</p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-2">
          <label className="font-mono text-[11px] uppercase tracking-wider text-[color:var(--muted)]">
            {labels.presetLabel}
          </label>
          <select
            value={presetSlug}
            onChange={(e) => onPresetChange(e.target.value)}
            className="rounded-md border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2 text-sm"
          >
            <option value="">{labels.presetCustom}</option>
            {presets.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>

          <label className="mt-3 font-mono text-[11px] uppercase tracking-wider text-[color:var(--muted)]">
            {labels.uploadLabel}
          </label>
          <input
            type="file"
            onChange={onFileChange}
            className="rounded-md border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2 text-xs file:mr-3 file:rounded file:border-0 file:bg-[color:var(--accent)] file:px-2 file:py-1 file:text-xs file:text-black"
          />
          <span className="text-[11px] text-[color:var(--muted)]">{labels.uploadHint}</span>
          {file && (
            <span className="font-mono text-[11px] text-[color:var(--muted)]">
              {file.name} · {file.size} B
            </span>
          )}
          <button
            type="button"
            onClick={submit}
            disabled={busy || !file}
            className="mt-3 rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-black disabled:opacity-40"
          >
            {busy ? labels.scanning : labels.scanButton}
          </button>
          {error && <p className="text-xs text-[color:var(--critical)]">{error}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-mono text-[11px] uppercase tracking-wider text-[color:var(--muted)]">
            {labels.ruleLabel}
          </label>
          <textarea
            value={rule}
            onChange={(e) => setRule(e.target.value)}
            rows={18}
            spellCheck={false}
            className="rounded-md border border-[color:var(--border)] bg-[color:var(--panel)] p-3 font-mono text-xs leading-relaxed"
          />
          <span className="text-[11px] text-[color:var(--muted)]">{labels.ruleHint}</span>
        </div>
      </div>

      {response && (
        <div className="flex flex-col gap-4 rounded-lg border border-[color:var(--border)] bg-[color:var(--panel)] p-4">
          <h2 className="font-mono text-xs uppercase tracking-wider text-[color:var(--muted)]">
            {labels.results}
          </h2>
          <ScanRender response={response} labels={labels} />
        </div>
      )}
    </div>
  );
}

function ScanRender({ response, labels }: { response: ScanResponse; labels: Props["labels"] }) {
  if ("ok" in response && response.ok === false && "compile" in response) {
    return (
      <div>
        <div className="font-mono text-xs uppercase tracking-wider text-[color:var(--critical)]">
          {labels.compileErrors}
        </div>
        <ul className="mt-2 space-y-1 font-mono text-xs">
          {response.compile.errors.map((e, i) => (
            <li key={i} className="text-[color:var(--critical)]">
              [{e.code}] line {e.line ?? "?"}: {e.message}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if ("ok" in response && response.ok === false) {
    return <p className="text-xs text-[color:var(--critical)]">{response.error}</p>;
  }
  if ("ok" in response && response.ok === true) {
    const r = response.result;
    return (
      <div className="flex flex-col gap-3">
        <dl className="grid grid-cols-3 gap-3 font-mono text-xs">
          <Stat label={labels.duration} value={`${r.durationMs.toFixed(2)} ms`} />
          <Stat label={labels.fileSize} value={`${r.fileSize} B`} />
          <Stat label={labels.sha256} value={r.sha256} mono mono-trunc />
        </dl>
        {r.matched.length === 0 && (
          <p className="text-xs text-[color:var(--muted)]">{labels.noMatches}</p>
        )}
        {r.matched.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="font-mono text-[11px] uppercase tracking-wider text-[color:var(--muted)]">
              {labels.matchedRules} ({r.matched.length})
            </div>
            {r.matched.map((m) => (
              <div key={m.rule} className="rounded border border-[color:var(--border)] bg-[color:var(--background)] p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-mono text-sm text-[color:var(--accent)]">{m.rule}</span>
                  <span className="font-mono text-[10px] text-[color:var(--muted)]">{m.namespace}</span>
                  {m.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-sm border border-[color:var(--border)] px-1.5 py-0.5 font-mono text-[10px] text-[color:var(--muted)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <ul className="space-y-1 font-mono text-[11px]">
                  {m.matches.map((md, i) => (
                    <li key={i} className="flex flex-wrap gap-x-3 text-[color:var(--muted)]">
                      <span className="text-[color:var(--low)]">{md.identifier}</span>
                      <span>
                        @ <span className="text-[color:var(--foreground)]">0x{md.offset.toString(16)}</span>
                      </span>
                      <span>len {md.length}</span>
                      <span className="text-[color:var(--foreground)]">{hexPreview(md.data)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  return null;
}

function hexPreview(data: string): string {
  const bytes = Array.from(data).slice(0, 24);
  return bytes
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
    .join(" ");
}

type StatProps = {
  label: string;
  value: string;
  mono?: boolean;
  "mono-trunc"?: boolean;
};

function Stat(props: StatProps) {
  return (
    <div>
      <dt className="uppercase tracking-wider text-[color:var(--muted)]">{props.label}</dt>
      <dd className={`mt-1 ${props["mono-trunc"] ? "truncate" : ""}`} title={props.value}>
        {props.value}
      </dd>
    </div>
  );
}

const DEFAULT_RULE = `rule My_First_Rule
{
    meta:
        author      = "you"
        description = "Match plaintext markers in any file"

    strings:
        $a = "password" ascii nocase
        $b = "secret"   ascii nocase

    condition:
        any of them
}
`;
