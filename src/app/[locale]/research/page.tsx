import { getTranslations, setRequestLocale } from "next-intl/server";
import { ResearchCard } from "@/components/research/research-card";
import { listResearch } from "@/lib/research/store";

export const dynamic = "force-dynamic";

export default async function ResearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "ru" ? "ru" : "en";
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "research" });

  const items = await listResearch(50);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t("title")}</h1>
        <p className="text-sm text-[color:var(--muted)]">{t("subtitle")}</p>
        <p className="font-mono text-[11px] text-[color:var(--muted)]">{t("disclaimer")}</p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[color:var(--border)] bg-[color:var(--panel)] p-6 text-sm text-[color:var(--muted)]">
          {t("empty")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {items.map((item) => (
            <ResearchCard
              key={item.id}
              item={item}
              locale={locale}
              readMoreLabel={t("readMore")}
              generatedLabel={t("generatedBy")}
              threatActorLabel={t("threatActor")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
