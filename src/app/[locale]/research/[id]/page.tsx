import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownView } from "@/components/research/markdown-view";
import { getDetection } from "@/lib/detections";
import { getResearch } from "@/lib/research/store";

export const dynamic = "force-dynamic";

export default async function ResearchDetail({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  const locale = rawLocale === "ru" ? "ru" : "en";
  setRequestLocale(locale);

  const item = await getResearch(id);
  if (!item) notFound();

  const t = await getTranslations({ locale, namespace: "research" });

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-[color:var(--muted)]">
          <Link href={`/${locale}/research`} className="no-underline hover:text-[color:var(--accent)]">
            ← {t("backToList")}
          </Link>
          <span>·</span>
          <span>{new Date(item.generatedAt).toISOString().slice(0, 10)}</span>
          <span>·</span>
          <span>{t("generatedBy")} {item.model}</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-4xl">{item.title[locale]}</h1>
        <p className="text-sm text-[color:var(--muted)]">{item.summary[locale]}</p>
      </header>

      <aside className="rounded-md border border-[color:var(--accent)] bg-[color:var(--panel)] p-4 text-xs text-[color:var(--muted)]">
        {t("disclaimer")}
      </aside>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[3fr_1fr]">
        <div>
          <MarkdownView source={item.body[locale]} />
        </div>
        <div className="flex flex-col gap-5">
          {item.threatActor && (
            <Sidebar label={t("threatActor")}>
              <div className="font-mono text-sm text-[color:var(--foreground)]">
                {item.threatActor}
              </div>
            </Sidebar>
          )}
          {item.mitreTechniques.length > 0 && (
            <Sidebar label={t("mitre")}>
              <ul className="flex flex-wrap gap-2 font-mono text-[11px]">
                {item.mitreTechniques.map((tech) => (
                  <li key={tech}>
                    <a
                      href={`https://attack.mitre.org/techniques/${tech.replace(".", "/")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-sm border border-[color:var(--border)] px-1.5 py-0.5 text-[color:var(--foreground)] no-underline hover:border-[color:var(--accent)]"
                    >
                      {tech}
                    </a>
                  </li>
                ))}
              </ul>
            </Sidebar>
          )}
          {item.relatedDetections.length > 0 && (
            <Sidebar label={t("relatedDetections")}>
              <ul className="flex flex-col gap-2 font-mono text-[11px]">
                {item.relatedDetections.map((slug) => {
                  const det = getDetection(slug);
                  if (!det) return null;
                  return (
                    <li key={slug}>
                      <Link
                        href={`/${locale}/detections?type=${det.type}#${slug}`}
                        className="text-[color:var(--low)]"
                      >
                        [{det.type.toUpperCase()}] {det.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Sidebar>
          )}
          {item.references.length > 0 && (
            <Sidebar label={t("references")}>
              <ul className="flex flex-col gap-2 text-[11px]">
                {item.references.map((url) => (
                  <li key={url} className="break-words">
                    <a href={url} target="_blank" rel="noreferrer">
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </Sidebar>
          )}
          {item.tags.length > 0 && (
            <Sidebar label={t("tags")}>
              <ul className="flex flex-wrap gap-2 font-mono text-[10px]">
                {item.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-sm border border-[color:var(--border)] px-1.5 py-0.5 text-[color:var(--muted)]"
                  >
                    #{tag}
                  </li>
                ))}
              </ul>
            </Sidebar>
          )}
        </div>
      </div>
    </article>
  );
}

function Sidebar({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-[color:var(--border)] bg-[color:var(--panel)] p-3">
      <h3 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[color:var(--muted)]">
        {label}
      </h3>
      {children}
    </div>
  );
}
