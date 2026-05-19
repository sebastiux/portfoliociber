import { getTranslations } from "next-intl/server";
import { HoneypotLink } from "./honeypot-link";

export async function SiteFooter() {
  const joke = await getTranslations("joke");
  const footer = await getTranslations("footer");
  const common = await getTranslations("common");
  const lines = joke.raw("lines") as string[];

  return (
    <footer className="border-t border-[color:var(--border)] py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 text-center text-xs text-[color:var(--muted)] md:flex-row">
        <span>
          {footer("builtWith")} next.js · yara-x · railway · {footer("noAnalytics")}
        </span>
        <HoneypotLink
          prompt={joke("footerPrompt")}
          label={joke("linkLabel")}
          hoverHint={joke("hoverHint")}
          modalTitle={joke("modalTitle")}
          lines={lines}
          closeLabel={joke("closeLabel")}
          closeAriaLabel={common("close")}
        />
      </div>
    </footer>
  );
}
