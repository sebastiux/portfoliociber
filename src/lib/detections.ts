import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type DetectionType = "yara" | "kql";
export type Severity = "info" | "low" | "medium" | "high" | "critical";

export type Detection = {
  id: string;
  slug: string;
  type: DetectionType;
  name: string;
  description: { en: string; ru: string };
  severity: Severity;
  mitreTechniques: string[];
  references: string[];
  filename: string;
};

const ROOT = join(process.cwd(), "content", "detections");

const REGISTRY: Detection[] = [
  {
    id: "yara-redline-stealer-strings",
    slug: "redline-stealer-strings",
    type: "yara",
    name: "RedLine Stealer — embedded strings",
    description: {
      en: "Detects unpacked RedLine Stealer binaries via a fingerprint of internal class names and protocol strings observed across builds 2022–2024.",
      ru: "Обнаруживает распакованные образцы RedLine Stealer по характерным именам классов и протокольным строкам, наблюдаемым в сборках 2022–2024 годов.",
    },
    severity: "high",
    mitreTechniques: ["T1555.003", "T1005", "T1041"],
    references: ["https://malpedia.caad.fkie.fraunhofer.de/details/win.redline_stealer"],
    filename: "yara/redline_stealer_strings.yar",
  },
  {
    id: "yara-gootloader-js-obfuscation",
    slug: "gootloader-js-obfuscation",
    type: "yara",
    name: "GootLoader — JS obfuscation pattern",
    description: {
      en: "Flags GootLoader-style JavaScript droppers using long concatenated string arrays combined with sleep primitives and HTTP marker tokens.",
      ru: "Помечает JavaScript-дропперы семейства GootLoader: длинные конкатенированные строковые массивы, примитивы задержки и характерные HTTP-маркеры.",
    },
    severity: "high",
    mitreTechniques: ["T1059.007", "T1027", "T1105"],
    references: ["https://www.mandiant.com/resources/blog/tracking-evolution-gootloader-operations"],
    filename: "yara/gootloader_js_obfuscation.yar",
  },
  {
    id: "yara-lockbit-ransomware-config",
    slug: "lockbit-ransomware-config",
    type: "yara",
    name: "LockBit 3.0/4.0 — configuration heuristic",
    description: {
      en: "Heuristic for LockBit 3.0 and 4.0 ransomware binaries based on note filenames, configuration strings, and Windows cryptography API imports.",
      ru: "Эвристика для образцов LockBit 3.0 и 4.0: имена записок о выкупе, строки конфигурации и обращения к Windows Cryptography API.",
    },
    severity: "critical",
    mitreTechniques: ["T1486", "T1490", "T1083"],
    references: ["https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-075a"],
    filename: "yara/lockbit_ransomware_config.yar",
  },
  {
    id: "yara-generic-vba-downloader",
    slug: "generic-vba-downloader",
    type: "yara",
    name: "Generic VBA downloader",
    description: {
      en: "Detects Office documents that combine an auto-open macro trigger with at least one network primitive and one shell-execution primitive.",
      ru: "Обнаруживает офисные документы, в которых триггер автозапуска макроса сочетается с сетевым примитивом и вызовом командной оболочки.",
    },
    severity: "medium",
    mitreTechniques: ["T1059.005", "T1566.001", "T1105"],
    references: [],
    filename: "yara/generic_vba_downloader.yar",
  },
  {
    id: "yara-suspicious-lnk-payload",
    slug: "suspicious-lnk-payload",
    type: "yara",
    name: "Weaponised LNK payload",
    description: {
      en: "Detects .lnk shortcut files that invoke living-off-the-land binaries (powershell, mshta, rundll32) with obfuscation indicators such as -enc or DownloadString.",
      ru: "Обнаруживает .lnk-файлы, запускающие штатные бинари (powershell, mshta, rundll32) с признаками обфускации: -enc, DownloadString и аналогичные.",
    },
    severity: "high",
    mitreTechniques: ["T1204.002", "T1059.001", "T1218"],
    references: [],
    filename: "yara/suspicious_lnk_payload.yar",
  },
  {
    id: "kql-password-spray-detection",
    slug: "password-spray-detection",
    type: "kql",
    name: "Password spray across Entra ID",
    description: {
      en: "Identifies source IPs that fail authentication against ten or more distinct user accounts within a 30-minute window — a hallmark of low-and-slow password spray.",
      ru: "Выявляет IP-адреса, неудачно аутентифицирующиеся под десятью и более учётными записями за 30 минут — типичный признак медленного password spray.",
    },
    severity: "high",
    mitreTechniques: ["T1110.003"],
    references: [],
    filename: "kql/password_spray_detection.kql",
  },
  {
    id: "kql-impossible-travel-m365",
    slug: "impossible-travel-m365",
    type: "kql",
    name: "Impossible travel (M365)",
    description: {
      en: "Detects two successful sign-ins by the same identity from locations that cannot be traversed within the elapsed time at commercial flight speed.",
      ru: "Обнаруживает два успешных входа одного пользователя из локаций, между которыми невозможно переместиться за прошедшее время на скорости пассажирского самолёта.",
    },
    severity: "high",
    mitreTechniques: ["T1078.004"],
    references: [],
    filename: "kql/impossible_travel_m365.kql",
  },
  {
    id: "kql-oauth-consent-phishing",
    slug: "oauth-consent-phishing",
    type: "kql",
    name: "OAuth consent phishing",
    description: {
      en: "Surfaces user consent grants to non-Microsoft third-party applications that request high-impact scopes (Mail.*, Files.ReadWrite.All, offline_access).",
      ru: "Показывает выданные пользователями согласия сторонним (не-Microsoft) приложениям на высокорисковые scope-ы: Mail.*, Files.ReadWrite.All, offline_access.",
    },
    severity: "high",
    mitreTechniques: ["T1528"],
    references: [],
    filename: "kql/oauth_consent_phishing.kql",
  },
  {
    id: "kql-suspicious-inbox-rules",
    slug: "suspicious-inbox-rules",
    type: "kql",
    name: "Suspicious inbox rules",
    description: {
      en: "Detects Exchange Online inbox rule creation patterns associated with BEC: auto-forwarding to external recipients or moving to RSS Feeds/Deleted Items then deleting.",
      ru: "Обнаруживает создание правил Exchange Online, характерных для BEC: автопересылка во внешние адреса или перемещение в RSS Feeds/Корзину с удалением.",
    },
    severity: "high",
    mitreTechniques: ["T1564.008", "T1114.003"],
    references: [],
    filename: "kql/suspicious_inbox_rules.kql",
  },
  {
    id: "kql-service-principal-anomaly",
    slug: "service-principal-anomaly",
    type: "kql",
    name: "Service principal anomaly",
    description: {
      en: "Surfaces newly created service principals in Entra ID that receive privileged directory roles within 60 minutes of creation — backdoor pattern after admin takeover.",
      ru: "Показывает только что созданные service principal в Entra ID, которым в течение часа выдаются привилегированные роли — паттерн закрепления после компрометации администратора.",
    },
    severity: "critical",
    mitreTechniques: ["T1098.003", "T1136.003"],
    references: [],
    filename: "kql/service_principal_anomaly.kql",
  },
];

export function listDetections(type?: DetectionType): Detection[] {
  return type ? REGISTRY.filter((d) => d.type === type) : REGISTRY;
}

export function getDetection(slug: string): Detection | undefined {
  return REGISTRY.find((d) => d.slug === slug);
}

const cache = new Map<string, string>();

export async function loadSource(detection: Detection): Promise<string> {
  const cached = cache.get(detection.id);
  if (cached) return cached;
  const src = await readFile(join(ROOT, detection.filename), "utf8");
  cache.set(detection.id, src);
  return src;
}
