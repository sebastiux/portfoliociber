"use client";

import { useState } from "react";

export function DetectionSource({ source, copyLabel, copiedLabel }: { source: string; copyLabel: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={copy}
        className="absolute right-2 top-2 rounded border border-[color:var(--border)] bg-[color:var(--background)] px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
      >
        {copied ? copiedLabel : copyLabel}
      </button>
      <pre className="overflow-x-auto rounded-md border border-[color:var(--border)] bg-[color:var(--panel)] p-4 text-xs leading-relaxed">
        <code>{source}</code>
      </pre>
    </div>
  );
}
