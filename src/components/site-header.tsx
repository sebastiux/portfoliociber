import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { LanguageSwitcher } from "./language-switcher";

export async function SiteHeader() {
  const locale = await getLocale();
  const t = await getTranslations("nav");
  const items: { href: string; label: string }[] = [
    { href: `/${locale}/research`, label: t("research") },
    { href: `/${locale}/detections`, label: t("detections") },
    { href: `/${locale}/scanner`, label: t("scanner") },
    { href: `/${locale}/about`, label: t("about") },
  ];

  return (
    <header className="border-b border-[color:var(--border)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href={`/${locale}`}
          className="font-mono text-sm tracking-tight text-[color:var(--accent)] no-underline"
        >
          portfoliociber<span className="text-[color:var(--muted)]">/</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {items.map((it) => (
            <Link key={it.href} href={it.href} className="text-[color:var(--foreground)] no-underline hover:text-[color:var(--accent)]">
              {it.label}
            </Link>
          ))}
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
