import { setRequestLocale } from "next-intl/server";
import { MermaidDiagram } from "@/components/mermaid-diagram";

export const dynamic = "force-static";

export default async function DesignPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "ru" ? "ru" : "en";
  setRequestLocale(locale);
  const t = locale === "ru" ? RU : EN;

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t.title}</h1>
        <p className="text-sm text-[color:var(--muted)]">{t.subtitle}</p>
      </header>

      <Section title={t.s1Title} description={t.s1Desc}>
        <MermaidDiagram chart={SYSTEM_CONTEXT} caption={t.s1Caption} />
      </Section>

      <Section title={t.s2Title} description={t.s2Desc}>
        <MermaidDiagram chart={COMPONENT_DIAGRAM} caption={t.s2Caption} />
      </Section>

      <Section title={t.s3Title} description={t.s3Desc}>
        <MermaidDiagram chart={SCAN_SEQUENCE} caption={t.s3Caption} />
      </Section>

      <Section title={t.s4Title} description={t.s4Desc}>
        <MermaidDiagram chart={ENRICH_SEQUENCE} caption={t.s4Caption} />
      </Section>

      <Section title={t.s5Title} description={t.s5Desc}>
        <MermaidDiagram chart={DATA_MODEL} caption={t.s5Caption} />
      </Section>

      <Section title={t.s6Title} description={t.s6Desc}>
        <MermaidDiagram chart={DEPLOYMENT} caption={t.s6Caption} />
      </Section>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium">{title}</h2>
        <p className="text-sm text-[color:var(--muted)]">{description}</p>
      </div>
      {children}
    </section>
  );
}

const SYSTEM_CONTEXT = `flowchart LR
    user(["Visitor / Analyst"])
    browser["Browser<br/>(EN · RU)"]
    app["Next.js 16 app<br/>(App Router · standalone)"]
    yara["yara-x engine<br/>napi-rs binding"]
    redis[("Redis<br/>rate limit · IOC cache")]
    urlscan["urlscan.io"]
    bazaar["MalwareBazaar"]
    abuse["AbuseIPDB<br/>(optional)"]

    user --> browser --> app
    app --> yara
    app <--> redis
    app --> urlscan
    app --> bazaar
    app --> abuse

    classDef ext fill:#1f1f23,stroke:#52525b,color:#e4e4e7
    classDef core fill:#1a1a1d,stroke:#f59e0b,color:#fde68a
    classDef store fill:#0f0f12,stroke:#60a5fa,color:#bfdbfe
    class urlscan,bazaar,abuse ext
    class app,yara core
    class redis store
`;

const COMPONENT_DIAGRAM = `flowchart TB
    subgraph Browser["Browser"]
      ui_scanner["scanner page<br/>(file-scan + ioc tabs)"]
      ui_detections["detections page"]
      ui_design["design page"]
    end

    subgraph App["Next.js — app/"]
      proxy["proxy.ts<br/>(locale routing en/ru)"]
      layout["[locale]/layout.tsx<br/>i18n provider"]

      subgraph Api["/api"]
        api_scan["POST /api/scan"]
        api_enrich["POST /api/enrich"]
        api_det["GET /api/detections/[slug]"]
        api_health["GET /api/health"]
      end
    end

    subgraph Lib["src/lib"]
      yara_engine["yara-engine.ts<br/>compile · scanBuffer"]
      ioc_parser["ioc.ts<br/>parseIocs"]
      enrich_idx["enrichment/index.ts<br/>fan-out + cache"]
      rate["rate-limit.ts<br/>(redis or memory)"]
      detections["detections.ts<br/>registry + source loader"]
    end

    subgraph Content["content/detections"]
      yar["*.yar — 5 rules"]
      kql["*.kql — 5 queries"]
    end

    ui_scanner --> api_scan
    ui_scanner --> api_enrich
    ui_scanner --> api_det
    ui_detections --> api_det

    api_scan --> rate --> yara_engine
    api_enrich --> rate --> ioc_parser --> enrich_idx
    api_det --> detections
    detections --> yar
    detections --> kql
    enrich_idx -.optional cache.-> rate

    classDef ui fill:#0f0f12,stroke:#60a5fa,color:#bfdbfe
    classDef api fill:#1a1a1d,stroke:#f59e0b,color:#fde68a
    classDef lib fill:#1f1f23,stroke:#52525b,color:#e4e4e7
    classDef content fill:#101012,stroke:#38bdf8,color:#bae6fd
    class ui_scanner,ui_detections,ui_design ui
    class api_scan,api_enrich,api_det,api_health api
    class yara_engine,ioc_parser,enrich_idx,rate,detections lib
    class yar,kql content
`;

const SCAN_SEQUENCE = `sequenceDiagram
    autonumber
    actor U as Analyst
    participant UI as Scanner UI
    participant API as POST /api/scan
    participant RL as rate-limit
    participant VAL as validateRule
    participant Y as yara-x

    U->>UI: select preset or paste rule, attach file (<= 10 MB)
    UI->>API: multipart {rule, file}
    API->>RL: incr scan:{ip} (limit 10/h)
    alt over limit
      RL-->>API: blocked
      API-->>UI: 429 Retry-After
    else allowed
      API->>VAL: compile check
      alt compile errors
        VAL-->>API: errors[]
        API-->>UI: 422 {compile.errors}
      else compile ok
        API->>Y: compile(rule).scanAsync(buffer)
        Y-->>API: matches[] (offsets, len, identifier)
        API->>API: sha256(file) · wipe buffer
        API-->>UI: 200 {result, sha256, durationMs}
        UI-->>U: render matches + hex preview
      end
    end
`;

const ENRICH_SEQUENCE = `sequenceDiagram
    autonumber
    actor U as Analyst
    participant UI as IOC tab
    participant API as POST /api/enrich
    participant P as parseIocs
    participant C as Redis cache
    participant US as urlscan.io
    participant MB as MalwareBazaar
    participant AB as AbuseIPDB

    U->>UI: paste IOC block (ip, domain, url, hash)
    UI->>API: {input}
    API->>P: tokenize + classify + dedupe (max 25)
    loop for each IOC
      API->>C: get enrich:{type}:{value}
      alt cache hit
        C-->>API: cached report
      else miss
        par parallel lookups
          API->>US: search by domain / page.ip / page.url
          API->>MB: get_info (hash only)
          API->>AB: check ipAddress (ip only, if key set)
        end
        API->>C: setex 1h
      end
    end
    API-->>UI: {reports[]}
    UI-->>U: table verdict · sources · score · notes
`;

const DATA_MODEL = `classDiagram
    direction LR

    class Detection {
      +string id
      +string slug
      +DetectionType type
      +string name
      +I18nDescription description
      +Severity severity
      +string[] mitreTechniques
      +string[] references
      +string filename
    }

    class I18nDescription {
      +string en
      +string ru
    }

    class ScanResult {
      +number durationMs
      +number fileSize
      +string sha256
      +ScanMatch[] matched
    }

    class ScanMatch {
      +string rule
      +string namespace
      +string[] tags
      +Record meta
      +MatchData[] matches
    }

    class MatchData {
      +string identifier
      +number offset
      +number length
      +string data
    }

    class EnrichmentReport {
      +string ioc
      +IocType type
      +Verdict verdict
      +SourceReport[] sources
    }

    class SourceReport {
      +string source
      +Verdict verdict
      +number? score
      +string? url
      +string? notes
    }

    class RateLimitResult {
      +boolean allowed
      +number remaining
      +number resetAt
    }

    Detection o-- I18nDescription
    ScanResult o-- ScanMatch
    ScanMatch o-- MatchData
    EnrichmentReport o-- SourceReport
`;

const DEPLOYMENT = `flowchart LR
    subgraph GitHub["GitHub"]
      repo["sebastiux/portfoliociber<br/>branch: main"]
    end

    subgraph Railway["Railway · production"]
      direction TB
      build["Builder<br/>(Dockerfile, multi-stage)"]
      subgraph svc["service: portfoliociber"]
        node["node 22<br/>server.js (standalone)"]
        wasm["@litko/yara-x<br/>linux-x64-gnu binary"]
      end
      redissvc[("plugin: Redis<br/>REDIS_URL")]
      build --> svc
      svc <-->|REDIS_URL ref| redissvc
    end

    user(["Public traffic"])
    repo -->|push triggers deploy| build
    user -->|HTTPS *.up.railway.app| svc
    svc -->|/api/health| svc

    classDef gh fill:#0f0f12,stroke:#52525b,color:#e4e4e7
    classDef rw fill:#1a1a1d,stroke:#f59e0b,color:#fde68a
    classDef store fill:#0f0f12,stroke:#60a5fa,color:#bfdbfe
    class repo gh
    class build,svc,node,wasm rw
    class redissvc store
`;

const EN = {
  title: "Architecture & UML diagrams",
  subtitle:
    "End-to-end design of this portfolio: from user request to YARA scan result, deployment topology, and the data model behind each API.",
  s1Title: "1 · System context",
  s1Desc:
    "High-level boundary: who talks to the application and which external dependencies it reaches.",
  s1Caption: "Figure 1 — System-context diagram (C4 level 1).",
  s2Title: "2 · Component view",
  s2Desc:
    "Components inside the Next.js application: UI screens, API routes, library modules, and on-disk detection content.",
  s2Caption: "Figure 2 — Component diagram (C4 level 3).",
  s3Title: "3 · File-scan sequence",
  s3Desc:
    "What happens when a user uploads a file and a YARA rule to /api/scan. Includes rate-limit and compile-error branches.",
  s3Caption: "Figure 3 — UML sequence diagram for /api/scan.",
  s4Title: "4 · IOC enrichment sequence",
  s4Desc:
    "Parsing, deduplication, parallel fan-out across public threat-intel sources, and Redis-backed result caching.",
  s4Caption: "Figure 4 — UML sequence diagram for /api/enrich.",
  s5Title: "5 · Data model",
  s5Desc: "Type relationships for detections, scan results, IOC enrichment, and rate-limit state.",
  s5Caption: "Figure 5 — UML class diagram of the public types.",
  s6Title: "6 · Deployment topology",
  s6Desc:
    "Railway service backed by the Docker image, with an attached Redis plugin and GitHub-driven continuous deployment.",
  s6Caption: "Figure 6 — Deployment diagram (production environment).",
};

const RU = {
  title: "Архитектура и UML-диаграммы",
  subtitle:
    "Сквозной дизайн портфолио: от запроса пользователя до результата YARA-сканирования, топология деплоя и модель данных каждого API.",
  s1Title: "1 · Системный контекст",
  s1Desc:
    "Верхнеуровневая граница: кто обращается к приложению и к каким внешним зависимостям оно ходит.",
  s1Caption: "Рис. 1 — Диаграмма системного контекста (C4 уровень 1).",
  s2Title: "2 · Компонентная диаграмма",
  s2Desc:
    "Компоненты внутри Next.js-приложения: UI-экраны, API-маршруты, библиотечные модули и контент детекторов на диске.",
  s2Caption: "Рис. 2 — Диаграмма компонентов (C4 уровень 3).",
  s3Title: "3 · Последовательность сканирования файла",
  s3Desc:
    "Что происходит, когда пользователь загружает файл и YARA-правило в /api/scan. Включены ветки rate-limit и ошибок компиляции.",
  s3Caption: "Рис. 3 — UML sequence-диаграмма для /api/scan.",
  s4Title: "4 · Последовательность обогащения индикаторов",
  s4Desc:
    "Парсинг, дедупликация, параллельный опрос открытых источников и кеширование результатов в Redis.",
  s4Caption: "Рис. 4 — UML sequence-диаграмма для /api/enrich.",
  s5Title: "5 · Модель данных",
  s5Desc:
    "Связи типов: детекторы, результаты сканирования, обогащение индикаторов и состояние rate-limit.",
  s5Caption: "Рис. 5 — UML class-диаграмма публичных типов.",
  s6Title: "6 · Топология деплоя",
  s6Desc:
    "Railway-сервис, собранный из Docker-образа, с подключённым плагином Redis и автоматическим деплоем из GitHub.",
  s6Caption: "Рис. 6 — Диаграмма развёртывания (продакшен).",
};
