import { getTranslations } from "next-intl/server";
import { HoneypotLink } from "./honeypot-link";

export async function SiteFooter() {
  const t = await getTranslations("joke");
  const lines = t.raw("lines") as string[];

  return (
    <footer className="border-t border-[color:var(--border)] py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 text-center text-xs text-[color:var(--muted)] md:flex-row">
        <span>built with next.js · yara-x · railway · no analytics</span>
        <HoneypotLink
          prompt={t("footerPrompt")}
          label={t("linkLabel")}
          hoverHint={t("hoverHint")}
          modalTitle={t("modalTitle")}
          lines={lines}
          closeLabel={t("closeLabel")}
        />
      </div>
    </footer>
  );
}
