# Phase 2 — Job Aggregation

## Consilium Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary connector | Jobbörse BA API (`jobsuche.api.bund.dev`) | Open API, no auth, 1.5M+ jobs, covers all Germany |
| Secondary connectors | Connector interface ready, Indeed/Stepstone later | APIs restricted, need partnerships |
| Job sync | Server Action triggered manually + cron-ready | MVP: admin triggers sync, later: automated |
| Normalization | Pipeline pattern: fetch → normalize → upsert | Consistent format regardless of source |
| Search | PostgreSQL full-text search (tsvector/tsquery) | No extra infra, fast enough for MVP |
| Job pages | SSR with revalidation (ISR pattern) | SEO + fresh data |
| SEO | JobPosting JSON-LD on every job page | Google for Jobs indexing |
| Rate limiting | Respect BA API limits, queue-based fetching | Don't get blocked |

## Architecture

```
Admin triggers sync
        │
        ▼
┌─────────────────┐
│  Sync Service   │
│  /api/connectors│
└───────┬─────────┘
        │
        ▼
┌─────────────────┐     ┌──────────────┐
│  BA Connector   │────▶│  Normalizer  │
│  (fetch + map)  │     │  (transform) │
└─────────────────┘     └──────┬───────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  PostgreSQL  │
                        │  jobs table  │
                        │  + tsvector  │
                        └──────┬───────┘
                               │
                        ┌──────┴───────┐
                        │   Search     │
                        │   /jobs      │
                        │   /jobs/[id] │
                        └──────────────┘
```

## Tasks

### 1. Connector Interface (`src/lib/connectors/`)
- Base interface: `JobConnector` with `fetchJobs()`, `getJobDetails()`
- Normalized job type matching our DB schema
- Error handling, retry logic

### 2. Jobbörse BA Connector
- API: `https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs`
- OAuth client credentials for BA API (client_id from developer portal)
- Search by keyword, location, radius
- Map BA response → normalized job format
- Handle pagination (API returns max 100 per page)

### 3. Job Normalization Pipeline
- Transform raw API data → our jobs schema
- Extract: title, company, location, salary, description, requirements
- Generate tsvector for full-text search
- Upsert logic (update existing, insert new, deactivate expired)

### 4. Search API (`/api/jobs/search`)
- Full-text search via PG tsquery
- Filters: location, salary range, remote, keyword
- Pagination with cursor
- Sort: relevance, date, salary

### 5. Job Listing Page (`/[locale]/jobs`)
- SSR search results page
- Search bar + filters sidebar
- Job cards with title, company, location, salary, source
- Pagination
- SEO meta tags

### 6. Job Detail Page (`/[locale]/jobs/[id]`)
- SSR individual job page
- Full description, requirements, company info
- "Apply" CTA button
- JobPosting JSON-LD schema for Google for Jobs
- Social sharing meta (OG tags)

### 7. Admin: Portal Sync Controls
- Trigger sync from admin panel
- View sync status, last sync time, job counts
- Enable/disable portals

## File Map

```
src/
├── lib/
│   ├── connectors/
│   │   ├── types.ts              # JobConnector interface, NormalizedJob type
│   │   ├── base.ts               # Base connector with retry/error handling
│   │   ├── bundesagentur.ts      # Jobbörse BA connector
│   │   └── normalize.ts          # Normalization pipeline
│   └── db/
│       └── queries/
│           └── jobs.ts            # Job search/CRUD queries
├── app/
│   ├── [locale]/
│   │   └── (public)/
│   │       └── jobs/
│   │           ├── page.tsx       # Job listing + search
│   │           └── [id]/
│   │               └── page.tsx   # Job detail + JSON-LD
│   └── api/
│       ├── jobs/
│       │   └── search/
│       │       └── route.ts       # Search API endpoint
│       └── connectors/
│           └── sync/
│               └── route.ts       # Trigger sync endpoint (admin only)
└── components/
    └── jobs/
        ├── job-card.tsx           # Job list card
        ├── job-filters.tsx        # Search filters
        ├── job-search-bar.tsx     # Search input
        └── job-schema.tsx         # JSON-LD component
```
