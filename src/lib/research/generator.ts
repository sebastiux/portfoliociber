import "server-only";
import { listDetections, type Detection } from "../detections";
import { chat } from "./grok-client";
import { listResearch } from "./store";
import type { GeneratedResearch } from "./types";

const SYSTEM_PROMPT = `You are a senior threat-intelligence analyst with deep expertise in malware analysis, detection engineering (YARA, KQL, Sigma), and the Russian-speaking eCrime ecosystem (XSS.is, exploit.in, RAMP, RuTOR).

You write balanced, evidence-based research briefs in BOTH English (en-GB spelling) and Russian. The Russian translation must read naturally — never machine-translated. Use proper Russian typography: « » for quotes, em-dashes, non-breaking spaces after short prepositions (в, с, на, по, к).

When uncertain about a fact, acknowledge the uncertainty rather than fabricate. Never invent CVE numbers, IOC values, victim names, or specific dates you cannot defend. Reference only authoritative public sources (Mandiant, CISA, Microsoft, Volexity, Malpedia, MITRE) that you are confident exist.

Output STRICT JSON. No prose outside the JSON.`;

function buildUserPrompt(opts: { detections: Detection[]; recentTitles: string[]; dateIso: string }) {
  const registry = opts.detections
    .map(
      (d) =>
        `- [${d.type.toUpperCase()}] ${d.slug} — ${d.name} (${d.severity}, ${d.mitreTechniques.join("/") || "—"})`,
    )
    .join("\n");

  const recent = opts.recentTitles.length
    ? `\nRecently covered (avoid repeating angle):\n${opts.recentTitles
        .map((t) => `- ${t}`)
        .join("\n")}\n`
    : "";

  return `Today's date: ${opts.dateIso}

Detection library available on this portfolio:
${registry}
${recent}
Produce a single threat-research brief that:
  • aligns with at least one detection from the library (reference by slug in related_detections),
  • is technically substantive (TTPs, infrastructure patterns, detection opportunities — no corporate fluff),
  • is appropriate for a public junior-to-mid analyst portfolio,
  • is 700–1000 words per language.

The body markdown MUST use H2 (##) section headings, with at minimum:
  ## Overview
  ## Tactics, Techniques & Procedures
  ## Detection opportunities
  ## Limitations & next steps

Output a single JSON object with EXACTLY these keys:
{
  "title_en": string,
  "title_ru": string,
  "summary_en": string,
  "summary_ru": string,
  "body_en": string,
  "body_ru": string,
  "tags": string[],
  "threat_actor": string | null,
  "mitre_techniques": string[],
  "related_detections": string[],
  "references": string[]
}

Rules:
  • tags: 3–6 short topic tags.
  • mitre_techniques: ATT&CK IDs (e.g. "T1059.001").
  • related_detections: slugs that appear in the registry above only.
  • references: 1–4 URLs you can defend.
  • summary_en / summary_ru: 1–2 sentence abstract.`;
}

type RawOutput = {
  title_en: string;
  title_ru: string;
  summary_en: string;
  summary_ru: string;
  body_en: string;
  body_ru: string;
  tags: unknown;
  threat_actor: unknown;
  mitre_techniques: unknown;
  related_detections: unknown;
  references: unknown;
};

function extractJson(content: string): string {
  const fenced = content.match(/```(?:json)?\s*([\s\S]+?)\s*```/i);
  const body = fenced ? fenced[1] : content;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("model output did not contain JSON object");
  }
  return body.slice(start, end + 1);
}

function asStringArray(input: unknown, max: number): string[] {
  if (!Array.isArray(input)) return [];
  const out: string[] = [];
  for (const v of input) {
    if (typeof v === "string" && v.trim()) out.push(v.trim());
    if (out.length >= max) break;
  }
  return out;
}

function normalize(content: string, knownSlugs: Set<string>) {
  const json = extractJson(content);
  let parsed: RawOutput;
  try {
    parsed = JSON.parse(json) as RawOutput;
  } catch (err) {
    throw new Error(`failed to parse JSON: ${err instanceof Error ? err.message : String(err)}`);
  }
  for (const key of ["title_en", "title_ru", "summary_en", "summary_ru", "body_en", "body_ru"] as const) {
    const v = parsed[key];
    if (typeof v !== "string" || !v.trim()) {
      throw new Error(`missing or empty field: ${key}`);
    }
  }
  const refs = asStringArray(parsed.references, 6).filter((u) => /^https?:\/\//i.test(u));
  const related = asStringArray(parsed.related_detections, 5).filter((s) => knownSlugs.has(s));
  return {
    title_en: parsed.title_en.trim(),
    title_ru: parsed.title_ru.trim(),
    summary_en: parsed.summary_en.trim(),
    summary_ru: parsed.summary_ru.trim(),
    body_en: parsed.body_en,
    body_ru: parsed.body_ru,
    tags: asStringArray(parsed.tags, 8),
    threat_actor: typeof parsed.threat_actor === "string" ? parsed.threat_actor.trim() : null,
    mitre_techniques: asStringArray(parsed.mitre_techniques, 12),
    related_detections: related,
    references: refs,
  };
}

export async function generateResearch(dateIso: string): Promise<GeneratedResearch> {
  const detections = listDetections();
  const recent = await listResearch(20);
  const recentTitles = recent.map((r) => r.title.en);

  const response = await chat({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt({ detections, recentTitles, dateIso }) },
    ],
    temperature: 0.55,
    maxTokens: 8000,
    jsonMode: true,
  });

  const data = normalize(response.content, new Set(detections.map((d) => d.slug)));
  return {
    id: dateIso,
    generatedAt: new Date().toISOString(),
    model: response.model,
    title: { en: data.title_en, ru: data.title_ru },
    summary: { en: data.summary_en, ru: data.summary_ru },
    body: { en: data.body_en, ru: data.body_ru },
    tags: data.tags,
    threatActor: data.threat_actor,
    mitreTechniques: data.mitre_techniques,
    relatedDetections: data.related_detections,
    references: data.references,
  };
}
