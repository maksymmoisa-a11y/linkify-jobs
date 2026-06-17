# Phase 3 — User Features

## Consilium Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| File storage | Local filesystem `/uploads` + DB path | MVP speed, no S3 config needed |
| AI provider | OpenAI GPT-4o-mini | Cost-efficient, fast, sufficient quality |
| CV parsing | GPT-4o-mini structured output | Extract skills, experience, education, contact |
| Match scoring | Weighted formula: skills overlap + location + salary fit | Deterministic, fast, no AI cost per calculation |
| Cover letter | GPT-4o-mini with company + job + profile context | Personalized, emphasizes overlaps |
| Application flow | Pre-fill + confirm (MVP) | Compliant, covers 90% of cases |
| Email | Resend API (or nodemailer SMTP) | Simple, reliable |
| Consent | Explicit checkbox before AI processing of CV | DSGVO Art. 6/7 compliance |

## Tasks

### 1. File Upload Infrastructure
- API route: POST `/api/upload/cv` — accept PDF/DOCX, max 5MB
- Store in `/uploads/cv/{userId}/{filename}`
- Return file URL (served via protected API route)
- Protected GET `/api/upload/cv/[filename]` — session check

### 2. AI Service Layer (`src/lib/ai/`)
- `cv-parser.ts` — send CV text to GPT-4o-mini, return structured profile data
- `match-score.ts` — calculate match between profile and job (deterministic algorithm)
- `cover-letter.ts` — generate personalized cover letter using profile + job + company context

### 3. CV Upload + Parse Flow
- Profile page: upload button → API upload → AI parse → show extracted data → user confirms/edits
- Store parsed data in profiles.cv_parsed_data (JSONB)
- Auto-populate profile fields from parsed CV

### 4. Match Score Algorithm
- Input: user profile (skills, experience, location, salary) + job (requirements, location, salary)
- Skills overlap: count matching skills / total required skills (weight: 50%)
- Location match: exact=100%, same region=70%, remote=100% (weight: 20%)
- Salary match: within range=100%, close=70%, far=30% (weight: 20%)
- Experience relevance: keyword overlap in titles/descriptions (weight: 10%)
- Output: 0-100 integer score

### 5. Cover Letter Generation
- Input: user profile, job details, company info
- Prompt: emphasize overlapping skills, relevant experience, alignment with company direction
- Output: formatted cover letter text
- UI: "Generate Cover Letter" button → preview → edit → save

### 6. Application Flow (Pre-fill + Confirm)
- Application page: `/[locale]/jobs/[id]/apply`
- Pre-filled form with user profile data
- Dynamic fields from job.applicationFields
- Cover letter section (generate or write manually)
- Review step → Confirm → Submit
- Status tracking: draft → prefilled → submitted → confirmed

### 7. Dashboard Enhancement
- Real stats from DB (applications count, views used, avg match score)
- Recent applications list with status badges
- Quick actions: view job, edit application

### 8. Email Notifications
- Welcome email on registration
- Application submitted confirmation
- Weekly digest: new matching jobs (basic)

## File Map

```
uploads/                              # gitignored, outside public/
  cv/{userId}/{filename}

src/
├── lib/
│   ├── ai/
│   │   ├── cv-parser.ts             # CV → structured profile data
│   │   ├── match-score.ts           # Profile × Job → 0-100 score
│   │   └── cover-letter.ts          # Generate personalized cover letter
│   ├── email/
│   │   └── send.ts                  # Email sending utility
│   └── db/
│       └── queries/
│           ├── profiles.ts           # Profile CRUD
│           └── applications.ts       # Application CRUD + status
├── app/
│   ├── [locale]/
│   │   └── (dashboard)/
│   │       ├── dashboard/page.tsx    # Enhanced with real data
│   │       ├── profile/page.tsx      # Profile management + CV upload
│   │       └── applications/
│   │           ├── page.tsx          # My applications list
│   │           └── [id]/page.tsx     # Application detail
│   ├── [locale]/
│   │   └── (public)/
│   │       └── jobs/[id]/
│   │           └── apply/page.tsx    # Application form
│   └── api/
│       ├── upload/
│       │   └── cv/route.ts          # CV upload endpoint
│       ├── ai/
│       │   ├── parse-cv/route.ts     # CV parsing endpoint
│       │   ├── match-score/route.ts  # Match score endpoint
│       │   └── cover-letter/route.ts # Cover letter endpoint
│       └── applications/
│           └── route.ts              # Submit application
└── components/
    ├── profile/
    │   ├── cv-upload.tsx             # Drag & drop CV upload
    │   ├── profile-form.tsx          # Edit profile fields
    │   └── skills-input.tsx          # Tag-style skills input
    └── applications/
        ├── application-form.tsx      # Dynamic application form
        ├── cover-letter-editor.tsx   # Cover letter preview + edit
        └── application-status.tsx    # Status badge component
```
