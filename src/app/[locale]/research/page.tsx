import { getLocale, getTranslations } from "next-intl/server";

export default async function ResearchPage() {
  const locale = await getLocale();
  const t = await getTranslations("nav");
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">{t("research")}</h1>
      <p className="text-sm text-[color:var(--muted)]">
        {locale === "ru"
          ? "Раздел в подготовке. Ниже появятся отчёты по LockBit, RedLine и IAB-аналитике."
          : "Section coming soon — LockBit, RedLine, and IAB market reports will land here."}
      </p>
    </div>
  );
}
