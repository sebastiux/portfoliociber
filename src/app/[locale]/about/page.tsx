import { getLocale } from "next-intl/server";
import Link from "next/link";

const LINKEDIN_URL = "https://www.linkedin.com/in/carlos-ortega-63ab84195";
const GITHUB_URL = "https://github.com/sebastiux";
const LINKEDIN_HANDLE = "carlos-ortega-63ab84195";
const GITHUB_HANDLE = "sebastiux";

export default async function AboutPage() {
  const locale = (await getLocale()) as "en" | "ru";
  const copy = locale === "ru" ? RU : EN;

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{copy.title}</h1>
        <p className="text-sm text-[color:var(--muted)]">{copy.role}</p>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <article className="flex flex-col gap-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--panel)] p-5">
          <h2 className="font-mono text-xs uppercase tracking-wider text-[color:var(--muted)]">
            {copy.bioLabel}
          </h2>
          <p className="text-sm leading-relaxed">{copy.bio1}</p>
          <p className="text-sm leading-relaxed text-[color:var(--muted)]">{copy.bio2}</p>
        </article>

        <article className="flex flex-col gap-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--panel)] p-5">
          <h2 className="font-mono text-xs uppercase tracking-wider text-[color:var(--muted)]">
            {copy.contactLabel}
          </h2>
          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs text-[color:var(--muted)]">LinkedIn</span>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noreferrer"
                className="truncate font-mono text-xs"
              >
                /in/{LINKEDIN_HANDLE}
              </a>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs text-[color:var(--muted)]">GitHub</span>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs"
              >
                @{GITHUB_HANDLE}
              </a>
            </li>
          </ul>
          <div className="mt-4 flex gap-2">
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-[color:var(--border)] px-3 py-1.5 text-xs no-underline hover:border-[color:var(--accent)]"
            >
              {copy.openLinkedin} →
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-[color:var(--border)] px-3 py-1.5 text-xs no-underline hover:border-[color:var(--accent)]"
            >
              {copy.openGithub} →
            </a>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Block label={copy.educationLabel}>
          <ul className="space-y-2 text-sm">
            <li>
              <div>Universidad Iberoamericana</div>
              <div className="text-xs text-[color:var(--muted)]">{copy.eduIbero}</div>
            </li>
            <li>
              <div>
                {locale === "ru" ? "Казанский авиационный институт" : "Kazan Aviation Institute"}
              </div>
              <div className="text-xs text-[color:var(--muted)]">{copy.eduKai}</div>
            </li>
          </ul>
        </Block>
        <Block label={copy.experienceLabel}>
          <ul className="space-y-2 text-sm">
            <li>
              <div>Karuna Electronics · KarunaDev</div>
              <div className="text-xs text-[color:var(--muted)]">{copy.expKaruna}</div>
            </li>
          </ul>
        </Block>
        <Block label={copy.languagesLabel}>
          <ul className="space-y-1 text-sm">
            <li>ES — {locale === "ru" ? "родной" : "native"}</li>
            <li>EN — C1</li>
            <li>IT — B2</li>
            <li>RU — B1</li>
          </ul>
        </Block>
      </section>

      <p className="text-xs text-[color:var(--muted)]">
        {copy.designLink}{" "}
        <Link href={`/${locale}/design`}>{copy.designLinkText}</Link>.
      </p>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <article className="flex flex-col gap-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--panel)] p-5">
      <h2 className="font-mono text-xs uppercase tracking-wider text-[color:var(--muted)]">
        {label}
      </h2>
      {children}
    </article>
  );
}

const EN = {
  title: "Carlos Ortega",
  role: "Mechatronics & Cyber-Physical Systems Engineer · threat research & detection automation",
  bioLabel: "Bio",
  bio1: "I build detection content and security automation at the intersection of cyber-physical systems and traditional IT. My work focuses on YARA / KQL detection engineering, SOC tooling, and bilingual (EN / RU) threat-intelligence reporting.",
  bio2: "This site itself doubles as a working sample of that approach: a live YARA scanner, a curated detection library, and a documented architecture you can review end-to-end.",
  contactLabel: "Contact",
  openLinkedin: "Open LinkedIn",
  openGithub: "Open GitHub",
  educationLabel: "Education",
  eduIbero: "Mechatronics & Cyber-Physical Systems",
  eduKai: "Scholarship exchange year",
  experienceLabel: "Experience",
  expKaruna: "Embedded & web engineering",
  languagesLabel: "Languages",
  designLink: "Curious how this site is wired up? See the",
  designLinkText: "architecture diagrams",
};

const RU = {
  title: "Карлос Ортега",
  role: "Инженер мехатроники и киберфизических систем · детект-инжиниринг и автоматизация SOC",
  bioLabel: "О себе",
  bio1: "Разрабатываю детекторы и инструменты автоматизации безопасности на стыке киберфизических систем и классических ИТ. Основные направления: правила YARA / KQL, инструменты для SOC, двуязычные (EN / RU) отчёты по угрозам.",
  bio2: "Этот сайт сам по себе — рабочий пример подхода: живой YARA-сканер, библиотека детекторов и задокументированная архитектура, доступная для разбора целиком.",
  contactLabel: "Контакты",
  openLinkedin: "Открыть LinkedIn",
  openGithub: "Открыть GitHub",
  educationLabel: "Образование",
  eduIbero: "Мехатроника и киберфизические системы",
  eduKai: "Стипендиальный обмен",
  experienceLabel: "Опыт работы",
  expKaruna: "Встраиваемые системы и веб-разработка",
  languagesLabel: "Языки",
  designLink: "Интересует, как устроен этот сайт? Смотрите",
  designLinkText: "диаграммы архитектуры",
};
