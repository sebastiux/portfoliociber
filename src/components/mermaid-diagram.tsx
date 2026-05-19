"use client";

import { useEffect, useId, useRef, useState } from "react";

type Props = {
  chart: string;
  caption?: string;
};

export function MermaidDiagram({ chart, caption }: Props) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        securityLevel: "strict",
        fontFamily: "var(--font-mono), ui-monospace, SFMono-Regular, monospace",
        themeVariables: {
          background: "#111114",
          primaryColor: "#18181b",
          primaryTextColor: "#e4e4e7",
          primaryBorderColor: "#3f3f46",
          lineColor: "#71717a",
          secondaryColor: "#1f1f23",
          tertiaryColor: "#0f0f12",
          textColor: "#e4e4e7",
          actorBkg: "#18181b",
          actorBorder: "#52525b",
          actorTextColor: "#e4e4e7",
          signalColor: "#e4e4e7",
          signalTextColor: "#e4e4e7",
          labelBoxBkgColor: "#27272a",
          labelBoxBorderColor: "#52525b",
          noteBkgColor: "#1f1f23",
          noteTextColor: "#fde68a",
          noteBorderColor: "#f59e0b",
        },
      });
      try {
        const { svg } = await mermaid.render(`m${id}`, chart);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "render failed");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  return (
    <figure className="flex flex-col gap-2">
      <div className="overflow-x-auto rounded-lg border border-[color:var(--border)] bg-[color:var(--panel)] p-4">
        {error ? (
          <pre className="text-xs text-[color:var(--critical)]">{error}</pre>
        ) : (
          <div ref={containerRef} className="[&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full" />
        )}
      </div>
      {caption && (
        <figcaption className="text-center text-xs text-[color:var(--muted)]">{caption}</figcaption>
      )}
    </figure>
  );
}
