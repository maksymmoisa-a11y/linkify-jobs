# Phase 5 — Polish (Compliance, SEO, Performance)

## Consilium Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Cookie consent | Minimal banner, block non-essential until accept | DSGVO/ePrivacy compliance |
| Rate limiting | DB-based (user_limits table), middleware check | Already have the table, no Redis needed |
| Sitemap | Dynamic from jobs table via route handler | SEO: thousands of indexable pages |
| Account deletion | Self-service in settings + API | DSGVO Art. 17 right to erasure |
| OG tags | Per-page dynamic meta + default fallback | Social sharing optimization |
| robots.txt | Static, allow all public, block admin/api | Standard SEO practice |
| DSGVO consent | Checkbox before CV upload + AI processing | Art. 6/7 explicit consent |

## Tasks

### 1. Cookie Consent Banner
- Component: persistent bottom banner
- Options: Accept All, Essential Only, Settings
- Store preference in localStorage + cookie
- Block analytics/tracking until consent (MVP: no tracking, just the banner for compliance)

### 2. Rate Limiting Middleware
- Check user_limits on authenticated job search requests
- 500 views/month per user
- Auto-create period on first request of month
- Show remaining count in dashboard
- Return 429 when limit exceeded with friendly message

### 3. Account Deletion (DSGVO Art. 17)
- Settings page: "Delete my account" with confirmation
- API: DELETE /api/account — cascade delete user + profile + applications + uploads
- Audit log entry (anonymized)
- Confirmation email

### 4. Dynamic Sitemap
- /sitemap.xml route — generates from active jobs
- Includes: all public pages + all active job detail pages
- lastmod from job.createdAt
- Priority: homepage=1.0, jobs=0.8, job detail=0.6

### 5. robots.txt
- Allow: /, /de/, /en/, /de/jobs/, /en/jobs/
- Disallow: /api/, /admin/, /dashboard/, /profile/
- Sitemap: {baseUrl}/sitemap.xml

### 6. SEO Meta + OG Tags
- Root metadata with defaults (title, description, OG image)
- Per-page generateMetadata for jobs, job detail
- OG tags: title, description, image, type, url
- Twitter card meta
- Canonical URLs with locale

### 7. Settings Page
- /[locale]/dashboard/settings
- Language preference
- Email notification toggles
- Account deletion section
- Data export (DSGVO Art. 20 — download my data as JSON)

### 8. Data Export (DSGVO Art. 20)
- API: GET /api/account/export
- Returns JSON with: profile, applications, saved jobs
- Downloadable file

### 9. Performance
- Next.js Image optimization for any images
- Proper loading states on all async operations
- Error boundaries

## File Map

```
src/
├── app/
│   ├── sitemap.ts                    # Dynamic sitemap
│   ├── robots.ts                     # robots.txt
│   ├── [locale]/
│   │   └── (dashboard)/
│   │       └── settings/page.tsx     # User settings
│   └── api/
│       └── account/
│           ├── route.ts              # DELETE account
│           └── export/route.ts       # GET data export
├── components/
│   └── layout/
│       └── cookie-consent.tsx        # Cookie banner
└── lib/
    └── rate-limit.ts                 # Rate limiting utility
```
