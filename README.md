# portfoliociber

Bilingual (EN / RU) threat-research portfolio with a live YARA scanner and IOC enrichment.

## Stack

- Next.js 16 (App Router, standalone output) on Node.js 22
- next-intl 4 for EN / RU routing (`/en/...`, `/ru/...`)
- `@litko/yara-x` napi-rs bindings for YARA-X scanning (in-process, no subprocess)
- Tailwind CSS v4
- Drizzle ORM + PostgreSQL (optional)
- ioredis + Redis (optional — falls back to in-memory rate limiting)

## Running locally

```bash
npm install
npm run dev
# open http://localhost:3000 (auto-redirects to /en)
```

Smoke-test for the native YARA-X binary:

```bash
node scripts/smoke-yara.mjs
```

## Live scanner

Two modes at `/[locale]/scanner`:

1. **File scan** — upload a file (max 10 MB), paste/select a YARA rule, get matches with offsets and a SHA-256 of the input. Files are read into memory, scanned, and discarded before the response returns. No file contents, hashes, or IPs are logged. Rate limit: 10 scans / IP / hour.
2. **IOC enrichment** — paste IPs, domains, URLs, MD5/SHA1/SHA256 hashes. Backend queries urlscan.io (no key), MalwareBazaar (no key), AbuseIPDB (optional key). Results cached in Redis for 1 hour when `REDIS_URL` is set.

## Detection library

Located in `content/detections/`:

- 5 YARA rules (RedLine, GootLoader, LockBit, generic VBA downloader, weaponised LNK)
- 5 KQL queries (password spray, impossible travel, OAuth consent phishing, suspicious inbox rules, service-principal anomaly)

Each is registered in `src/lib/detections.ts` with bilingual descriptions and MITRE ATT&CK mappings. The scanner lets you load any YARA rule as a preset.

## Daily threat-intel research (Grok-powered)

`/research` is populated automatically by an in-process scheduler. Once per day the app:

1. Acquires a Redis distributed lock for `research:lock:YYYY-MM-DD` (so multi-replica deploys generate exactly once).
2. Sends the current YARA + KQL registry, recent titles, and today's date to the Grok API (`https://api.x.ai/v1`).
3. Asks for a 700–1000-word bilingual (EN / RU) brief that ties an active threat angle back to one or more deployed rules.
4. Parses the JSON response and stores it in Redis under `research:auto:YYYY-MM-DD`.

The scheduler ticks every hour but no-ops if today's report already exists. It runs only when `GROK_API_KEY` is set and `RESEARCH_AUTO_GENERATE` isn't `false`. The first tick fires 30 s after process start, so a fresh deploy on a new day produces its report shortly after boot.

Env vars (see `.env.example`):

| Var | Required | Default | Purpose |
| --- | --- | --- | --- |
| `GROK_API_KEY` | yes (to enable) | — | xAI API key |
| `GROK_MODEL` | no | `grok-4` | model id |
| `GROK_BASE_URL` | no | `https://api.x.ai/v1` | swap for an OpenAI-compatible gateway if needed |
| `RESEARCH_AUTO_GENERATE` | no | `true` | set to `false` to keep the API key but pause generation |
| `REDIS_URL` | strongly recommended | — | persistent storage; without it reports go to in-memory and are lost on restart |

Generated content is rendered through `react-markdown` with `skipHtml`, so any HTML emitted by the model is treated as text — XSS surface is the same as a typical Markdown blog.

## Deploying to Railway

1. Provision the Railway service backed by this repo. `railway.json` selects the `Dockerfile` builder and `/api/health` as the health-check.
2. Add the **Redis** plugin if you want shared rate limiting / IOC caching. Reference its `REDIS_URL` env var on the service.
3. Add the **PostgreSQL** plugin only if you intend to persist scan statistics. Reference its `DATABASE_URL`. The app runs fine without either.
4. (Optional) Set `ABUSEIPDB_API_KEY` to enable IP reputation lookups.

## API

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/api/scan` | `multipart/form-data` with `rule` (string) and `file` (binary). `application/json` with `{op:"validate", rule}` validates without scanning. |
| `POST` | `/api/enrich` | `{ input: "ioc1\nioc2\n..." }` — auto-detects IP / domain / URL / hash. |
| `GET`  | `/api/detections/[slug]` | Returns rule metadata + source for a detection from the library. |
| `GET`  | `/api/health` | Liveness + Redis status. |
