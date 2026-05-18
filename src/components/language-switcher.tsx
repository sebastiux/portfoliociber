"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(target: string) {
    if (target === locale) return;
    const segments = pathname.split("/");
    if (routing.locales.includes(segments[1] as (typeof routing.locales)[number])) {
      segments[1] = target;
    } else {
      segments.splice(1, 0, target);
    }
    router.push(segments.join("/") || `/${target}`);
  }

  return (
    <div className="flex items-center gap-1 font-mono text-xs text-[color:var(--muted)]">
      {routing.locales.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => switchTo(l)}
            className={
              l === locale
                ? "text-[color:var(--accent)]"
                : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
            }
          >
            {l.toUpperCase()}
          </button>
          {i < routing.locales.length - 1 && <span>·</span>}
        </span>
      ))}
    </div>
  );
}
