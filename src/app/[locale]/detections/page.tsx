import { getTranslations, setRequestLocale } from "next-intl/server";
import { DetectionCard } from "@/components/detection-card";
import { DetectionSource } from "@/components/detection-source";
import { DetectionsTabs } from "@/components/detections-tabs";
import { listDetections, loadSource, type Detection } from "@/lib/detections";

export const dynamic = "force-static";

export default async function DetectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "ru" ? "ru" : "en";
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "detections" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const yaraList = listDetections("yara");
  const kqlList = listDetections("kql");

  const [yaraSources, kqlSources] = await Promise.all([
    Promise.all(yaraList.map(async (d) => [d, await loadSource(d)] as const)),
    Promise.all(kqlList.map(async (d) => [d, await loadSource(d)] as const)),
  ]);

  const renderGroup = (sources: ReadonlyArray<readonly [Detection, string]>) => (
    <div className="mt-6 flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {sources.map(([d]) => (
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
        {sources.map(([d, source]) => (
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

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t("title")}</h1>
        <p className="text-sm text-[color:var(--muted)]">{t("subtitle")}</p>
      </header>

      <DetectionsTabs
        yaraTabLabel={t("tabYara")}
        kqlTabLabel={t("tabKql")}
        yaraCount={yaraList.length}
        kqlCount={kqlList.length}
        yaraContent={renderGroup(yaraSources)}
        kqlContent={renderGroup(kqlSources)}
      />
    </div>
  );
}
