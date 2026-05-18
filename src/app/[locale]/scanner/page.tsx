import { getTranslations } from "next-intl/server";
import { FileScanPanel } from "@/components/scanner/file-scan-panel";
import { IocPanel } from "@/components/scanner/ioc-panel";
import { ScannerTabs } from "@/components/scanner/scanner-tabs";
import { listDetections } from "@/lib/detections";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ rule?: string }> };

export default async function ScannerPage({ searchParams }: Props) {
  const sp = await searchParams;
  const t = await getTranslations("scanner");

  const presets = listDetections("yara").map((d) => ({ slug: d.slug, name: d.name }));

  const fileLabels = {
    presetLabel: t("presetLabel"),
    presetCustom: t("presetCustom"),
    ruleLabel: t("ruleLabel"),
    ruleHint: t("ruleHint"),
    uploadLabel: t("uploadLabel"),
    uploadHint: t("uploadHint"),
    scanButton: t("scanButton"),
    scanning: t("scanning"),
    results: t("results"),
    noMatches: t("noMatches"),
    matchedRules: t("matchedRules"),
    duration: t("duration"),
    fileSize: t("fileSize"),
    sha256: t("sha256"),
    compileErrors: t("compileErrors"),
    rateLimit: t("rateLimit"),
    privacy: t("privacy"),
  };

  const iocLabels = {
    iocLabel: t("iocLabel"),
    iocPlaceholder: t("iocPlaceholder"),
    enrichButton: t("enrichButton"),
    enriching: t("enriching"),
    sources: t("sources"),
    verdict: t("verdict"),
    noIocs: t("noIocs"),
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t("title")}</h1>
        <p className="text-sm text-[color:var(--muted)]">{t("subtitle")}</p>
        <p className="font-mono text-[11px] text-[color:var(--muted)]">{t("rateLimit")}</p>
      </header>

      <ScannerTabs
        fileLabel={t("tabFile")}
        iocLabel={t("tabIoc")}
        fileTab={<FileScanPanel presets={presets} labels={fileLabels} initialRuleSlug={sp.rule} />}
        iocTab={<IocPanel labels={iocLabels} />}
      />
    </div>
  );
}
