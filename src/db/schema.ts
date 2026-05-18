import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";

export const detectionType = pgEnum("detection_type", ["yara", "kql"]);
export const severity = pgEnum("severity", ["info", "low", "medium", "high", "critical"]);
export const iocType = pgEnum("ioc_type", ["ip", "domain", "url", "hash"]);

export const scans = pgTable("scans", {
  id: uuid("id").defaultRandom().primaryKey(),
  ruleName: text("rule_name").notNull(),
  matched: boolean("matched").notNull(),
  scanDurationMs: integer("scan_duration_ms").notNull(),
  fileSizeBytes: integer("file_size_bytes").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const detections = pgTable("detections", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: detectionType("type").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  descriptionEn: text("description_en").notNull(),
  descriptionRu: text("description_ru").notNull(),
  source: text("source").notNull(),
  mitreTechniques: text("mitre_techniques").array().notNull(),
  severity: severity("severity").notNull(),
  githubUrl: text("github_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const iocCache = pgTable("ioc_cache", {
  id: uuid("id").defaultRandom().primaryKey(),
  iocValue: text("ioc_value").notNull(),
  iocType: iocType("ioc_type").notNull(),
  enrichmentData: jsonb("enrichment_data").notNull(),
  cachedAt: timestamp("cached_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
