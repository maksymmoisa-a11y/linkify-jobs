# Phase 1 — Foundation

## Decisions (Consilium)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Dev environment | Docker Compose (PG 16 + Redis 7) | Reproducible, one command setup |
| ORM | Drizzle + drizzle-kit push | Fast iteration for MVP, type-safe |
| Session strategy | Database sessions via Redis | NIS2: revocable sessions, fast reads |
| Auth providers (MVP) | Google, LinkedIn | Most relevant for job seekers. Microsoft + Indeed phase 2 |
| i18n routing | `[locale]` URL segment, default `de` | SEO-friendly, middleware auto-detect |
| i18n library | next-intl | Proven with App Router, SSR-compatible |
| UI components | shadcn/ui + Tailwind v4 | Minimal bundle, rapid development |
| Layout zones | (public), (dashboard), (admin) route groups | Clean separation, different nav per zone |

## Tasks

### 1. Docker Compose — dev environment
- `docker-compose.yml`: PostgreSQL 16, Redis 7
- `.env.example` with all required vars
- `.env.local` in .gitignore

### 2. Database — Drizzle schema
- Install: drizzle-orm, drizzle-kit, pg driver
- Schema tables: users, profiles, jobs, applications, portals, audit_log, user_limits
- DB connection singleton (`src/lib/db/index.ts`)
- `drizzle.config.ts`

### 3. Auth — Auth.js v5
- Install: next-auth@beta, @auth/drizzle-adapter
- Providers: Google, LinkedIn
- Redis session store
- Auth middleware (protect /dashboard/*, /admin/*)
- Role-based access: candidate vs admin

### 4. i18n — next-intl
- Install: next-intl
- Middleware: locale detection, redirect
- Messages: `messages/de.json`, `messages/en.json`
- Base translations: nav, footer, auth, common

### 5. Layouts + Navigation
- Root layout with next-intl provider
- **(public)**: Header (logo, search, language switcher, login) + Footer (Impressum, Datenschutz)
- **(dashboard)**: Sidebar (Dashboard, Profile, Applications, Settings) + Header
- **(admin)**: Sidebar (Analytics, Portals, Users, Settings) + Header
- Responsive: mobile hamburger menu
- shadcn/ui setup: button, input, card, dropdown, sheet, avatar

### 6. Legal pages (Germany)
- `/impressum` — placeholder with required §5 TMG fields
- `/datenschutz` — DSGVO privacy policy template
- Cookie consent banner (basic)

## File Map

```
docker-compose.yml
.env.example
drizzle.config.ts
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx              # Root locale layout + next-intl
│   │   ├── (public)/
│   │   │   ├── layout.tsx          # Public header + footer
│   │   │   ├── page.tsx            # Landing page
│   │   │   ├── impressum/page.tsx
│   │   │   ├── datenschutz/page.tsx
│   │   │   └── auth/
│   │   │       └── page.tsx        # Login/Register
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx          # Dashboard sidebar + header
│   │   │   └── dashboard/page.tsx
│   │   └── (admin)/
│   │       ├── layout.tsx          # Admin sidebar + header
│   │       └── admin/page.tsx
│   └── api/
│       └── auth/[...nextauth]/route.ts
├── components/
│   ├── ui/                         # shadcn/ui
│   ├── layout/
│   │   ├── public-header.tsx
│   │   ├── public-footer.tsx
│   │   ├── dashboard-sidebar.tsx
│   │   ├── admin-sidebar.tsx
│   │   └── language-switcher.tsx
│   └── auth/
│       └── login-buttons.tsx
├── lib/
│   ├── db/
│   │   ├── schema.ts
│   │   └── index.ts
│   ├── auth/
│   │   └── config.ts
│   └── i18n/
│       ├── config.ts
│       └── request.ts
├── messages/
│   ├── de.json
│   └── en.json
└── middleware.ts                    # i18n + auth middleware
```
