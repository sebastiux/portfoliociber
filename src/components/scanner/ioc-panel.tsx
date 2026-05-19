"use client";

import { useState } from "react";

type Source = {
  source: string;
  verdict: "malicious" | "suspicious" | "clean" | "unknown";
  score?: number | null;
  url?: string | null;
  notes?: string | null;
};

type Report = {
  ioc: string;
  type: "ip" | "domain" | "url" | "hash";
  hashKind?: string;
  verdict: Source["verdict"];
  sources: Source[];
};

type Props = {
  labels: {
    iocLabel: string;
    iocPlaceholder: string;
    enrichButton: string;
    enriching: string;
    sources: string;
    verdict: string;
    noIocs: string;
    iocColumn: string;
    typeColumn: string;
    scoreLabel: string;
  };
};

const VERDICT_COLOR: Record<Source["verdict"], string> = {
  malicious: "text-[color:var(--critical)] border-[color:var(--critical)]",
  suspicious: "text-[color:var(--high)] border-[color:var(--high)]",
  clean: "text-[color:var(--low)] border-[color:var(--low)]",
  unknown: "text-[color:var(--muted)] border-[color:var(--border)]",
};

export function IocPanel({ labels }: Props) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    setReports(null);
    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const json = (await res.json()) as { ok?: boolean; reports?: Report[]; error?: string };
      if (!json.ok) {
        setError(json.error ?? "request failed");
      } else {
        setReports(json.reports ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="font-mono text-[11px] uppercase tracking-wider text-[color:var(--muted)]">
        {labels.iocLabel}
      </label>
      <textarea
        rows={6}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={labels.iocPlaceholder.replace(/\\n/g, "\n")}
        spellCheck={false}
        className="rounded-md border border-[color:var(--border)] bg-[color:var(--panel)] p-3 font-mono text-xs"
      />
      <button
        type="button"
        onClick={submit}
        disabled={busy || !input.trim()}
        className="self-start rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-black disabled:opacity-40"
      >
        {busy ? labels.enriching : labels.enrichButton}
      </button>
      {error && <p className="text-xs text-[color:var(--critical)]">{error}</p>}
      {reports && reports.length === 0 && (
        <p className="text-xs text-[color:var(--muted)]">{labels.noIocs}</p>
      )}
      {reports && reports.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-[color:var(--border)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[color:var(--panel)] font-mono text-[10px] uppercase tracking-wider text-[color:var(--muted)]">
              <tr>
                <th className="px-3 py-2">{labels.iocColumn}</th>
                <th className="px-3 py-2">{labels.typeColumn}</th>
                <th className="px-3 py-2">{labels.verdict}</th>
                <th className="px-3 py-2">{labels.sources}</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={`${r.type}:${r.ioc}`} className="border-t border-[color:var(--border)] align-top">
                  <td className="px-3 py-2 font-mono text-[11px]">{r.ioc}</td>
                  <td className="px-3 py-2 font-mono text-[10px] uppercase text-[color:var(--muted)]">
                    {r.hashKind ?? r.type}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block rounded-sm border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${VERDICT_COLOR[r.verdict]}`}
                    >
                      {r.verdict}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <ul className="space-y-1">
                      {r.sources.length === 0 && (
                        <li className="text-[color:var(--muted)]">—</li>
                      )}
                      {r.sources.map((s, i) => (
                        <li key={i} className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px]">{s.source}</span>
                          <span className={`rounded-sm border px-1 py-0.5 font-mono text-[10px] uppercase ${VERDICT_COLOR[s.verdict]}`}>
                            {s.verdict}
                          </span>
                          {typeof s.score === "number" && (
                            <span className="font-mono text-[10px] text-[color:var(--muted)]">
                              {labels.scoreLabel} {s.score}
                            </span>
                          )}
                          {s.notes && (
                            <span className="text-[11px] text-[color:var(--muted)]">{s.notes}</span>
                          )}
                          {s.url && (
                            <a href={s.url} target="_blank" rel="noreferrer" className="text-[11px]">
                              ↗
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
