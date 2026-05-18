import Link from "next/link";
import { SeverityBadge } from "./severity-badge";
import type { Detection } from "@/lib/detections";

type Props = {
  detection: Detection;
  locale: "en" | "ru";
  severityLabel: string;
  testRuleLabel: string;
  techniquesLabel: string;
};

export function DetectionCard({
  detection,
  locale,
  severityLabel,
  testRuleLabel,
  techniquesLabel,
}: Props) {
  return (
    <article className="flex flex-col gap-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--panel)] p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-medium">{detection.name}</h3>
          <div className="mt-1 font-mono text-[11px] text-[color:var(--muted)]">
            {detection.type.toUpperCase()} · {detection.slug}
          </div>
        </div>
        <SeverityBadge severity={detection.severity} label={severityLabel} />
      </header>
      <p className="text-sm text-[color:var(--muted)]">{detection.description[locale]}</p>
      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-[color:var(--muted)]">
        <span className="uppercase tracking-wider">{techniquesLabel}:</span>
        {detection.mitreTechniques.map((tech) => (
          <a
            key={tech}
            href={`https://attack.mitre.org/techniques/${tech.replace(".", "/")}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-sm border border-[color:var(--border)] px-1.5 py-0.5 text-[color:var(--foreground)] no-underline hover:border-[color:var(--accent)]"
          >
            {tech}
          </a>
        ))}
      </div>
      {detection.type === "yara" && (
        <Link
          href={`/${locale}/scanner?rule=${detection.slug}`}
          className="self-start rounded-md border border-[color:var(--border)] px-3 py-1.5 text-xs no-underline hover:border-[color:var(--accent)]"
        >
          {testRuleLabel} →
        </Link>
      )}
    </article>
  );
}
