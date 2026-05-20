import Link from "next/link";
import type { ResearchSummary } from "@/lib/research/types";

type Props = {
  item: ResearchSummary;
  locale: "en" | "ru";
  readMoreLabel: string;
  generatedLabel: string;
  threatActorLabel: string;
};

export function ResearchCard({
  item,
  locale,
  readMoreLabel,
  generatedLabel,
  threatActorLabel,
}: Props) {
  const date = new Date(item.generatedAt);
  const dateStr = date.toISOString().slice(0, 10);
  return (
    <article className="flex flex-col gap-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--panel)] p-5">
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-medium">
          <Link
            href={`/${locale}/research/${item.id}`}
            className="text-[color:var(--foreground)] no-underline hover:text-[color:var(--accent)]"
          >
            {item.title[locale]}
          </Link>
        </h2>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-[color:var(--muted)]">
          {dateStr}
        </span>
      </header>
      <p className="text-sm text-[color:var(--muted)]">{item.summary[locale]}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[10px] text-[color:var(--muted)]">
        {item.threatActor && (
          <span>
            <span className="uppercase tracking-wider">{threatActorLabel}:</span>{" "}
            <span className="text-[color:var(--foreground)]">{item.threatActor}</span>
          </span>
        )}
        {item.mitreTechniques.slice(0, 6).map((tech) => (
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {item.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-sm border border-[color:var(--border)] px-1.5 py-0.5 font-mono text-[10px] text-[color:var(--muted)]"
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-[color:var(--muted)]">
            {generatedLabel} {item.model}
          </span>
          <Link
            href={`/${locale}/research/${item.id}`}
            className="rounded-md border border-[color:var(--border)] px-3 py-1 text-xs no-underline hover:border-[color:var(--accent)]"
          >
            {readMoreLabel} →
          </Link>
        </div>
      </div>
    </article>
  );
}
