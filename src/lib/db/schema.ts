import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  integer,
  jsonb,
  boolean,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["candidate", "admin"]);
export const applicationStatusEnum = pgEnum("application_status", [
  "draft",
  "prefilled",
  "submitted",
  "confirmed",
  "rejected",
]);
export const portalStatusEnum = pgEnum("portal_status", [
  "active",
  "paused",
  "error",
]);

// ─── Users ───────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  name: varchar("name", { length: 255 }),
  image: text("image"),
  role: userRoleEnum("role").default("candidate").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── Auth.js required tables ─────────────────────────────
export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: varchar("token_type", { length: 255 }),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// ─── Profiles ────────────────────────────────────────────
export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  headline: varchar("headline", { length: 500 }),
  summary: text("summary"),
  skills: jsonb("skills").$type<string[]>().default([]),
  experience: jsonb("experience").$type<
    Array<{
      title: string;
      company: string;
      startDate: string;
      endDate?: string;
      description?: string;
    }>
  >(),
  education: jsonb("education").$type<
    Array<{
      degree: string;
      institution: string;
      year?: number;
    }>
  >(),
  preferredLocations: jsonb("preferred_locations").$type<string[]>().default([]),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  cvFileUrl: text("cv_file_url"),
  cvParsedData: jsonb("cv_parsed_data"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── Jobs ────────────────────────────────────────────────
export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    externalId: varchar("external_id", { length: 500 }),
    sourcePortal: varchar("source_portal", { length: 100 }).notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    companyName: varchar("company_name", { length: 500 }).notNull(),
    companyInfo: jsonb("company_info").$type<{
      website?: string;
      industry?: string;
      size?: string;
      description?: string;
    }>(),
    location: varchar("location", { length: 500 }),
    remote: boolean("remote").default(false),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    salaryCurrency: varchar("salary_currency", { length: 10 }).default("EUR"),
    description: text("description").notNull(),
    requirements: jsonb("requirements").$type<string[]>().default([]),
    applicationFields: jsonb("application_fields").$type<
      Array<{
        name: string;
        type: "text" | "textarea" | "file" | "select" | "checkbox";
        label: string;
        required: boolean;
        options?: string[];
      }>
    >(),
    applicationUrl: text("application_url"),
    matchKeywords: text("match_keywords"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }),
    isActive: boolean("is_active").default(true).notNull(),
  },
  (table) => [
    index("idx_jobs_source").on(table.sourcePortal),
    index("idx_jobs_location").on(table.location),
    index("idx_jobs_active").on(table.isActive),
    index("idx_jobs_created").on(table.createdAt),
  ]
);

// ─── Applications ────────────────────────────────────────
export const applications = pgTable(
  "applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    status: applicationStatusEnum("status").default("draft").notNull(),
    coverLetter: text("cover_letter"),
    formData: jsonb("form_data"),
    matchScore: integer("match_score"),
    appliedAt: timestamp("applied_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_applications_user").on(table.userId),
    index("idx_applications_job").on(table.jobId),
    index("idx_applications_status").on(table.status),
  ]
);

// ─── Portals ─────────────────────────────────────────────
export const portals = pgTable("portals", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(),
  config: jsonb("config").$type<Record<string, unknown>>().default({}),
  status: portalStatusEnum("status").default("paused").notNull(),
  lastSyncAt: timestamp("last_sync_at", { mode: "date" }),
  jobsCount: integer("jobs_count").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── Audit Log ───────────────────────────────────────────
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: uuid("actor_id"),
    action: varchar("action", { length: 255 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    entityId: varchar("entity_id", { length: 255 }),
    details: jsonb("details"),
    ipAddress: varchar("ip_address", { length: 45 }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_audit_actor").on(table.actorId),
    index("idx_audit_action").on(table.action),
    index("idx_audit_created").on(table.createdAt),
  ]
);

// ─── User Limits ─────────────────────────────────────────
export const userLimits = pgTable("user_limits", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  periodStart: timestamp("period_start", { mode: "date" }).notNull(),
  viewsUsed: integer("views_used").default(0).notNull(),
  viewsLimit: integer("views_limit").default(500).notNull(),
});
