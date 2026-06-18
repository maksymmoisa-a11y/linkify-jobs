# Linkify-Jobs — Handoff Document

**Last updated**: 2026-06-18

## What was built

**Linkify-Jobs** — AI-powered job aggregator for Germany. MVP built in 5 phases.

### Tech Stack
- **Framework**: Next.js 15 (App Router, TypeScript, Tailwind CSS v4)
- **Database**: PostgreSQL 16 (Drizzle ORM)
- **Auth**: Auth.js v5 (Google + LinkedIn OAuth + Dev Credentials)
- **AI**: OpenAI GPT-4o-mini (CV parsing, cover letters)
- **i18n**: next-intl (DE/EN)
- **SEO**: SSR, dynamic sitemap, JobPosting JSON-LD, robots.txt, OG tags

---

## Current State

### Running Services
- **Dev server**: `npx next dev --port 3000 --hostname 0.0.0.0`
- **PostgreSQL**: local, port **5434** (NOT default 5432)
- **Tunnel**: localtunnel (URL changes on restart)

### Database
- PostgreSQL 16 on port **5434**
- Database: `linkify_jobs` / User: `linkify` / Password: `linkify_dev_2024`
- Connection: `postgresql://linkify:linkify_dev_2024@localhost:5434/linkify_jobs`
- **10 tables** migrated, **120 demo jobs** seeded
- 2 users: test@linkify-jobs.de (candidate), admin@linkify-jobs.de (admin)

### Dev Login
Auth page (`/de/auth`) has Dev Login at the bottom:
- **"Als Kandidat"** → logs in as test@linkify-jobs.de → redirects to /de/dashboard
- **"Als Admin"** → logs in as admin@linkify-jobs.de → redirects to /de/admin
- **Known issue**: If switching between candidate/admin in same browser, clear cookies first or use incognito
- No password required — dev mode only

### Environment (.env.local)
```
DATABASE_URL=postgresql://linkify:linkify_dev_2024@localhost:5434/linkify_jobs
REDIS_URL=redis://:linkify_redis_2024@localhost:6379
AUTH_SECRET=dev-secret-change-in-production-abc123
AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LOCALE=de
```

**Not yet configured:**
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — Google OAuth
- `AUTH_LINKEDIN_ID` / `AUTH_LINKEDIN_SECRET` — LinkedIn OAuth
- `OPENAI_API_KEY` — AI features (CV parsing, cover letter generation)
- `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` — Email notifications

---

## All Routes (34)

### Public Pages
| Route | Description |
|-------|-------------|
| `/[locale]` | Landing page — hero, search, features |
| `/[locale]/jobs` | Job search + listing with filters |
| `/[locale]/jobs/[id]` | Job detail + JobPosting JSON-LD |
| `/[locale]/jobs/[id]/apply` | Application form (auth required) |
| `/[locale]/auth` | Login (Google, LinkedIn, Dev) |
| `/[locale]/impressum` | Legal notice (§5 TMG) |
| `/[locale]/datenschutz` | Privacy policy (DSGVO) |

### Dashboard (auth required)
| Route | Description |
|-------|-------------|
| `/[locale]/dashboard` | User dashboard — stats, recent apps |
| `/[locale]/profile` | Profile + CV upload |
| `/[locale]/applications` | My applications list |
| `/[locale]/applications/[id]` | Application detail + timeline |
| `/[locale]/settings` | Language, notifications, data export, delete account |

### Admin
| Route | Description |
|-------|-------------|
| `/[locale]/admin` | Analytics — stats, charts, audit log |
| `/[locale]/admin/portals` | Portal CRUD (add/edit/delete/sync) |
| `/[locale]/admin/users` | User management (search, block) |

### API Routes
| Route | Method | Description |
|-------|--------|-------------|
| `/api/jobs/search` | GET | Job search with filters |
| `/api/connectors/sync` | POST | Trigger portal sync |
| `/api/upload/cv` | POST | CV file upload |
| `/api/ai/parse-cv` | POST | AI CV parsing |
| `/api/ai/match-score` | POST | Match score calculation |
| `/api/ai/cover-letter` | POST | AI cover letter generation |
| `/api/applications` | GET/POST | Applications list + create |
| `/api/admin/stats` | GET | Admin dashboard stats |
| `/api/admin/portals` | GET/POST | Portal list + create |
| `/api/admin/portals/[id]` | GET/PUT/DELETE | Portal CRUD |
| `/api/admin/users` | GET | User list |
| `/api/admin/users/[id]/block` | POST | Block/unblock user |
| `/api/admin/audit` | GET | Audit log |
| `/api/account` | DELETE | Account deletion (DSGVO Art. 17) |
| `/api/account/export` | GET | Data export (DSGVO Art. 20) |
| `/api/auth/[...nextauth]` | * | Auth.js handlers |

### Static
| Route | Description |
|-------|-------------|
| `/sitemap.xml` | Dynamic sitemap |
| `/robots.txt` | Robots rules |

---

## Phases Built

### Phase 1 — Foundation
- Next.js 15 project, PostgreSQL schema (10 tables), Auth.js, i18n DE/EN, 3 layout zones, legal pages

### Phase 2 — Job Aggregation
- Bundesagentur API connector (OAuth2 — currently 403, credentials expired)
- Job normalization pipeline, PG full-text search (German), SSR job pages, JobPosting JSON-LD
- **120 demo jobs seeded** from 12 companies across 12 German cities

### Phase 3 — User Features
- AI CV parser, match score algorithm, AI cover letter generator
- CV upload, profile management, application flow (pre-fill + confirm)
- Application status tracking, dashboard with stats

### Phase 4 — Admin Panel
- Dashboard analytics (stats, 30-day charts, audit log)
- Portal CRUD (add, edit, delete, toggle, sync)
- User management (search, block/unblock)
- Audit logging (NIS2)

### Phase 5 — Polish & Compliance
- Dynamic sitemap, robots.txt, OG/Twitter meta tags
- Cookie consent banner, rate limiting (500 views/month)
- DSGVO: account deletion, data export, consent
- Settings page

---

## Scripts

```bash
# Seed demo jobs
DATABASE_URL="postgresql://linkify:linkify_dev_2024@localhost:5434/linkify_jobs" npx tsx scripts/seed-jobs.ts

# Sync from BA API (currently 403 — needs new credentials)
DATABASE_URL="postgresql://linkify:linkify_dev_2024@localhost:5434/linkify_jobs" npx tsx scripts/sync-jobs.ts

# Push DB schema
DATABASE_URL="postgresql://linkify:linkify_dev_2024@localhost:5434/linkify_jobs" npx drizzle-kit push

# Start dev server
npx next dev --port 3000 --hostname 0.0.0.0

# Start tunnel
npx localtunnel --port 3000
```

---

## To Launch in Production

1. **Domain** — buy linkify-jobs.de and configure DNS
2. **OAuth** — create Google + LinkedIn API apps, add keys to .env
3. **OpenAI** — add OPENAI_API_KEY for AI features
4. **SMTP** — configure email (Resend, SendGrid, or SMTP)
5. **PostgreSQL** — managed DB (Supabase, Neon, or cloud PG)
6. **Deploy** — Vercel (easiest) or Docker self-hosted
7. **Admin** — set role='admin' for your user in DB
8. **Remove** — Dev Login credentials provider (production flag already blocks it)
9. **BA API** — get new Bundesagentur API credentials when available

## Known Limitations
- BA API returns 403 (public credentials expired) — using seed data for now
- Admin sidebar shows raw i18n keys for nav items
- AI features need OPENAI_API_KEY to work
- Email notifications stubbed (no SMTP configured)
- Only pre-fill+confirm application mode (no full-auto yet)
- Switching candidate/admin login needs cookie clear in same browser
