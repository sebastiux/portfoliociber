import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function Home() {
  const locale = await getLocale();
  const t = await getTranslations("home");

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-6">
        <div className="font-mono text-xs text-[color:var(--muted)]">
          {locale === "ru" ? "tlp:clear · публичный портфель" : "tlp:clear · public portfolio"}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
          {t("tagline")}
        </h1>
        <p className="max-w-2xl text-[color:var(--muted)]">{t("intro")}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/${locale}/scanner`}
            className="rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-black no-underline"
          >
            {t("ctaScanner")}
          </Link>
          <Link
            href={`/${locale}/detections`}
            className="rounded-md border border-[color:var(--border)] px-4 py-2 text-sm no-underline hover:border-[color:var(--accent)]"
          >
            {t("ctaDetections")}
          </Link>
          <Link
            href={`/${locale}/research`}
            className="rounded-md border border-[color:var(--border)] px-4 py-2 text-sm no-underline hover:border-[color:var(--accent)]"
          >
            {t("ctaResearch")}
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--panel)] p-5">
          <div className="mb-3 font-mono text-xs uppercase tracking-wide text-[color:var(--muted)]">
            {t("languages")}
          </div>
          <ul className="space-y-1 text-sm">
            <li>ES — {locale === "ru" ? "родной" : "native"}</li>
            <li>EN — C1</li>
            <li>IT — B2</li>
            <li>RU — B1</li>
          </ul>
        </div>
        <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--panel)] p-5">
          <div className="mb-3 font-mono text-xs uppercase tracking-wide text-[color:var(--muted)]">
            {t("stack")}
          </div>
          <ul className="space-y-1 text-sm">
            <li>YARA-X · KQL · Sigma</li>
            <li>Microsoft Sentinel · M365 Defender</li>
            <li>Python · TypeScript · Rust</li>
            <li>Next.js 16 · PostgreSQL · Redis</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
