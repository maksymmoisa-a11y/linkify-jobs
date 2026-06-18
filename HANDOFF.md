# Linkify-Jobs — Handoff Document

## What was built

**Linkify-Jobs** — AI-powered job aggregator for Germany. MVP built in 5 phases.

### Tech Stack
- **Framework**: Next.js 15 (App Router, TypeScript, Tailwind CSS v4)
- **Database**: PostgreSQL 16 (Drizzle ORM)
- **Auth**: Auth.js v5 (Google + LinkedIn OAuth)
- **AI**: OpenAI GPT-4o-mini (CV parsing, cover letters)
- **i18n**: next-intl (DE/EN)
- **SEO**: SSR, dynamic sitemap, JobPosting JSON-LD, robots.txt, OG tags

### Phase 1 — Foundation
- Next.js 15 project with App Router
- PostgreSQL schema: 10 tables (users, profiles, jobs, applications, portals, audit_log, user_limits, accounts, sessions, verification_tokens)
- Auth.js v5 with Google + LinkedIn OAuth, database sessions
- i18n with DE/EN translations, locale routing via middleware
- Three layout zones: (public), (dashboard), (admin)
- Legal pages: Impressum (§5 TMG), Datenschutz (DSGVO)

### Phase 2 — Job Aggregation
- Bundesagentur für Arbeit API connector (OAuth2, search, detail fetch)
- Base connector class with retry logic + exponential backoff
- Job normalization pipeline with batch upsert
- PostgreSQL full-text search (German tsvector/tsquery)
- SSR job listing page with search bar, filters sidebar, pagination
- SSR job detail page with JobPosting JSON-LD schema
- API: GET /api/jobs/search, POST /api/connectors/sync

### Phase 3 — User Features
- AI CV parser (GPT-4o-mini structured output → profile)
- Match score algorithm: skills 50%, location 20%, salary 20%, experience 10%
- AI cover letter generator (bilingual DE/EN, company-aware, emphasizes overlaps)
- CV drag & drop upload (PDF/DOCX, 5MB limit)
- Profile management: skills tags, experience/education CRUD, preferences
- Application flow: pre-fill + confirm with dynamic form fields
- Cover letter editor with AI generation + manual editing
- Application status tracking with visual timeline
- Dashboard with stats and recent applications
- API: /api/upload/cv, /api/ai/parse-cv, /api/ai/match-score, /api/ai/cover-letter, /api/applications

### Phase 4 — Admin Panel
- Dashboard: 4 stat cards, 30-day registration/application charts (CSS), audit log
- Portal CRUD: create, edit, delete, toggle status, sync trigger
- User management: searchable list, block/unblock, detail view
- Audit logging on all admin actions (NIS2 compliance)
- API: /api/admin/stats, /api/admin/portals (CRUD), /api/admin/users, /api/admin/audit

### Phase 5 — Polish & Compliance
- Dynamic sitemap.xml (static pages + active jobs, bilingual)
- robots.txt (allow public, block admin/api/dashboard)
- SEO metadata: OG tags, Twitter cards, title template, keywords
- Cookie consent banner (Accept All / Essential Only / Settings)
- Rate limiting: 500 job views/month per user, DB-based
- DSGVO Art. 17: account deletion with cascade + file cleanup
- DSGVO Art. 20: data export as downloadable JSON
- Settings page: language, email notifications, data/privacy, usage limit

## Current State

### Running Services
- **Dev server**: `npx next dev --port 3000 --hostname 0.0.0.0`
- **PostgreSQL**: local, port 5434 (NOT default 5432)
- **Tunnel**: localtunnel at https://hip-keys-turn.loca.lt

### Database
- PostgreSQL 16, port 5434
- Database: `linkify_jobs`, User: `linkify`, Password: `linkify_dev_2024`
- 10 tables migrated via `drizzle-kit push`
- Connection: `postgresql://linkify:linkify_dev_2024@localhost:5434/linkify_jobs`

### Environment
- `.env.local` has DATABASE_URL with port 5434
- OAuth credentials NOT configured (need Google + LinkedIn API keys)
- OpenAI API key NOT configured
- SMTP NOT configured

## Routes (34 total)

### Public Pages
- `/[locale]` — Landing page
- `/[locale]/jobs` — Job search + listing
- `/[locale]/jobs/[id]` — Job detail + JSON-LD
- `/[locale]/jobs/[id]/apply` — Application form (auth required)
- `/[locale]/auth` — Login (Google + LinkedIn)
- `/[locale]/impressum` — Legal notice
- `/[locale]/datenschutz` — Privacy policy

### Dashboard (auth required)
- `/[locale]/dashboard` — User dashboard
- `/[locale]/profile` — Profile + CV upload
- `/[locale]/applications` — My applications list
- `/[locale]/applications/[id]` — Application detail
- `/[locale]/settings` — Settings + data export + account deletion

### Admin
- `/[locale]/admin` — Analytics dashboard
- `/[locale]/admin/portals` — Portal CRUD
- `/[locale]/admin/users` — User management

### API Routes
- `GET /api/jobs/search` — Job search
- `POST /api/connectors/sync` — Trigger portal sync
- `POST /api/upload/cv` — CV upload
- `POST /api/ai/parse-cv` — AI CV parsing
- `POST /api/ai/match-score` — Match calculation
- `POST /api/ai/cover-letter` — Cover letter generation
- `GET/POST /api/applications` — Applications CRUD
- `GET /api/admin/stats` — Admin stats
- `GET/POST /api/admin/portals` — Portal list + create
- `GET/PUT/DELETE /api/admin/portals/[id]` — Portal CRUD
- `GET /api/admin/users` — User list
- `POST /api/admin/users/[id]/block` — Block/unblock user
- `GET /api/admin/audit` — Audit log
- `DELETE /api/account` — Account deletion
- `GET /api/account/export` — Data export
- `/api/auth/[...nextauth]` — Auth.js handlers

### Static
- `/sitemap.xml` — Dynamic sitemap
- `/robots.txt` — Robots rules

## To Launch in Production

1. **Domain** — buy and configure DNS
2. **OAuth** — create Google + LinkedIn API apps, add credentials to .env
3. **OpenAI** — add API key to .env (or swap to another AI provider)
4. **SMTP** — configure email provider (Resend, SendGrid, or custom SMTP)
5. **PostgreSQL** — use managed DB (Supabase, Neon, or cloud PG)
6. **Deploy** — Vercel (easiest for Next.js) or Docker self-hosted
7. **First admin** — manually set role='admin' in users table after first login
8. **First sync** — add Bundesagentur portal via admin UI, trigger sync

## Known Limitations (MVP)
- Admin sidebar shows raw i18n keys (nav.analytics etc.) — needs admin nav translations
- No real-time notifications (polling-based)
- Email notifications are stubbed (nodemailer configured but no SMTP)
- Indeed/Stepstone connectors not implemented (APIs restricted)
- No image/logo upload (placeholder icons only)
- Full-auto application mode not implemented (only pre-fill + confirm)
- Match score shown on jobs only when user is authenticated
