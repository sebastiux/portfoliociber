import { getLocale, getTranslations } from "next-intl/server";

export default async function AboutPage() {
  const locale = await getLocale();
  const t = await getTranslations("nav");
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">{t("about")}</h1>
      <p className="text-sm text-[color:var(--muted)]">
        {locale === "ru"
          ? "Раздел дополняется. Здесь будет биография, опыт работы и контакты."
          : "Section coming soon — bio, work history, and contact details will land here."}
      </p>
    </div>
  );
}
