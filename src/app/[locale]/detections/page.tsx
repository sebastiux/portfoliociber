import { getLocale, getTranslations } from "next-intl/server";
import { DetectionCard } from "@/components/detection-card";
import { DetectionSource } from "@/components/detection-source";
import { listDetections, loadSource, type DetectionType, type Detection } from "@/lib/detections";

export const dynamic = "force-static";

type Props = { searchParams: Promise<{ type?: string }> };

export default async function DetectionsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const tab: DetectionType = sp.type === "kql" ? "kql" : "yara";
  const locale = (await getLocale()) as "en" | "ru";
  const t = await getTranslations("detections");
  const tc = await getTranslations("common");

  const detections = listDetections(tab);
  const sources = await Promise.all(
    detections.map(async (d) => [d, await loadSource(d)] as const),
  );

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t("title")}</h1>
        <p className="text-sm text-[color:var(--muted)]">{t("subtitle")}</p>
      </header>

      <nav className="flex gap-2 border-b border-[color:var(--border)] text-sm">
        <TabLink locale={locale} active={tab === "yara"} value="yara" label={t("tabYara")} />
        <TabLink locale={locale} active={tab === "kql"} value="kql" label={t("tabKql")} />
      </nav>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {detections.map((d) => (
          <DetectionCard
            key={d.id}
            detection={d}
            locale={locale}
            severityLabel={t(`severity.${d.severity}`)}
            testRuleLabel={t("testRule")}
            techniquesLabel={t("techniques")}
          />
        ))}
      </div>

      <section className="flex flex-col gap-6">
        {sources.map(([d, source]: readonly [Detection, string]) => (
          <article key={d.id} id={d.slug} className="flex flex-col gap-3">
            <h2 className="font-mono text-sm text-[color:var(--muted)]">
              {d.type.toUpperCase()} · {d.slug}
            </h2>
            <DetectionSource source={source} copyLabel={tc("copy")} copiedLabel={tc("copied")} />
          </article>
        ))}
      </section>
    </div>
  );
}

function TabLink({
  locale,
  active,
  value,
  label,
}: {
  locale: string;
  active: boolean;
  value: string;
  label: string;
}) {
  return (
    <a
      href={`/${locale}/detections?type=${value}`}
      className={`-mb-px border-b-2 px-3 py-2 no-underline ${
        active
          ? "border-[color:var(--accent)] text-[color:var(--foreground)]"
          : "border-transparent text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
      }`}
    >
      {label}
    </a>
  );
}
