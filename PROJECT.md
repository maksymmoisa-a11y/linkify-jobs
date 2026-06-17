# Linkify-Jobs — Project Brief & Technical Decisions

## Продукт

**Linkify-Jobs** — AI-powered агрегатор вакансий для немецкого рынка.

Кандидат задаёт промт (стек, опыт, пожелания) → платформа подбирает вакансии с порталов (Stepstone, Indeed, Jobbörse и др.) → автоматически заполняет формы отклика → генерирует персонализированное сопроводительное письмо.

### UVP (Unique Value Proposition)

Полный цикл: **поиск → match → auto-apply** — в одном интерфейсе. Ни один крупный агрегатор этого не делает.

---

## Бизнес-требования

### Роли

| Роль | Описание |
|------|----------|
| **Админ** | Единственный оператор платформы. Управляет порталами, интеграциями, модерацией, аналитикой |
| **Кандидат** | Конечный пользователь. Ищет работу, откликается через платформу |

### Кандидат (User)

- Анонимный поиск вакансий без регистрации
- Опциональная регистрация для доп. функций
- OAuth: Google, Microsoft, LinkedIn, Indeed и другие
- Онбординг: загрузка CV (AI-парсинг) + ручное дополнение профиля
- **Match Score** — выбор порога совпадения при поиске (например 70%+)
- **Smart Cover Letter** — AI генерирует письмо с учётом:
  - Профиля компании (направление, культура, продукт)
  - Требований вакансии
  - Совпадений со стеком и опытом кандидата
  - Упор на пересечения кандидат ↔ компания
- Трёхуровневый отклик:
  1. **Full-auto** — где API/ToS разрешают, платформа отправляет сама
  2. **Pre-fill + confirm** — формы заполнены, кандидат нажимает "Отправить"
  3. **Guided manual** — данные подготовлены для копирования
- Динамические формы отклика — поля определяются требованиями портала-источника
- Дашборд в личном кабинете + email-уведомления
- Free tier: 500 просмотренных вакансий по промту в месяц

### Админ (Owner)

- Аналитика: пользователи, отклики, конверсии
- Управление порталами: вкл/выкл коннекторы, мониторинг парсинга
- Модерация: просмотр пользователей, блокировка

### Контент

- Единый нормализованный формат вакансий (название, компания, локация, зарплата, требования, описание)
- SEO-оптимизированные страницы вакансий (SSR, JobPosting schema, Google for Jobs)
- Без блога на старте

### Рынок и рост

- Старт: Германия
- Расширение: DACH и далее
- Мультиязычный интерфейс (i18n с первого дня)
- Привлечение: SEO + соцсети (без платной рекламы на старте)
- Монетизация: позже (архитектура billing-ready)

### Юридическое

- Запуск как частное лицо
- Impressum §5 TMG
- NIS2 compliance
- DSGVO/GDPR с первого дня

---

## Технические решения (Консилиум)

### Стек

| Слой | Технология | Обоснование |
|------|-----------|-------------|
| **Framework** | Next.js 15 (App Router) | SSR/ISR для SEO, React Server Components, скорость разработки |
| **Language** | TypeScript (strict) | Type safety, DX, масштабируемость |
| **UI** | Tailwind CSS v4 + shadcn/ui | Минимальный бандл, rapid prototyping |
| **Database** | PostgreSQL 16 | Full-text search, JSONB для динамических форм, надёжность под нагрузкой |
| **ORM** | Drizzle ORM | Легковесный, type-safe, быстрее Prisma |
| **Cache** | Redis | Сессии, rate limiting, кеш вакансий |
| **Auth** | Auth.js v5 (NextAuth) | Google, Microsoft, LinkedIn, Indeed OAuth |
| **AI** | OpenAI API (GPT-4o-mini) | Cost-efficient генерация писем, парсинг CV, match scoring |
| **Search** | PostgreSQL FTS (MVP) → Meilisearch (scale) | Минимум инфраструктуры на старте |
| **File Storage** | S3-compatible | CV файлы, документы |
| **i18n** | next-intl | Проверенное решение для Next.js App Router |
| **Deployment** | Docker | Портативность, воспроизводимость |

### Архитектура

```
┌─────────────────────────────────────────────┐
│                  Next.js 15                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │   SSR    │  │   API    │  │  Server   │  │
│  │  Pages   │  │  Routes  │  │  Actions  │  │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  │
│       │              │              │        │
│  ┌────┴──────────────┴──────────────┴────┐   │
│  │           Service Layer               │   │
│  │  ┌─────┐ ┌──────┐ ┌──────┐ ┌──────┐  │   │
│  │  │Auth │ │ Jobs │ │Apply │ │  AI  │  │   │
│  │  └──┬──┘ └──┬───┘ └──┬───┘ └──┬───┘  │   │
│  └─────┼───────┼────────┼────────┼───────┘   │
└────────┼───────┼────────┼────────┼───────────┘
         │       │        │        │
    ┌────┴──┐ ┌──┴───┐ ┌──┴──┐ ┌──┴──────┐
    │ Auth  │ │ PG   │ │Redis│ │ OpenAI  │
    │Provid.│ │  16  │ │     │ │   API   │
    └───────┘ └──────┘ └─────┘ └─────────┘
                │
         ┌──────┴──────┐
         │  Connectors │
         │ ┌─────────┐ │
         │ │Jobbörse │ │
         │ │Indeed   │ │
         │ │Stepstone│ │
         │ └─────────┘ │
         └─────────────┘
```

### Безопасность (NIS2 + DSGVO)

- **Encryption**: TLS 1.3 (transit), AES-256 (at rest)
- **Auth**: OAuth 2.0 + PKCE, secure session management
- **Data Protection**: data minimization, right to erasure, consent management
- **Audit**: полное логирование действий админа и системы
- **Rate Limiting**: per-user, per-IP через Redis
- **CSP**: strict Content Security Policy headers
- **Input Validation**: server-side validation на всех endpoints
- **File Upload**: virus scanning, type validation, size limits
- **Secrets**: environment variables, no hardcoded credentials
- **Dependencies**: automated vulnerability scanning

### Структура проекта

```
src/
├── app/
│   ├── [locale]/
│   │   ├── (public)/          # Анонимные страницы
│   │   │   ├── page.tsx       # Landing / поиск
│   │   │   ├── jobs/
│   │   │   │   ├── page.tsx   # Список вакансий
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Детали вакансии
│   │   │   └── auth/
│   │   │       └── page.tsx   # Login/Register
│   │   ├── (dashboard)/       # Авторизованные страницы
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx   # Дашборд кандидата
│   │   │   ├── profile/
│   │   │   │   └── page.tsx   # Профиль + CV
│   │   │   └── applications/
│   │   │       └── page.tsx   # Мои отклики
│   │   └── (admin)/           # Админ-панель
│   │       └── admin/
│   │           ├── page.tsx   # Аналитика
│   │           ├── portals/
│   │           │   └── page.tsx # Управление порталами
│   │           └── users/
│   │               └── page.tsx # Модерация
│   └── api/
│       ├── jobs/              # CRUD вакансий
│       ├── applications/      # Отклики
│       ├── ai/                # AI endpoints
│       └── connectors/        # Portal sync
├── components/
│   ├── ui/                    # shadcn/ui
│   ├── jobs/                  # Job-related components
│   ├── profile/               # Profile components
│   └── admin/                 # Admin components
├── lib/
│   ├── db/
│   │   ├── schema.ts          # Drizzle schema
│   │   └── index.ts           # DB connection
│   ├── auth/
│   │   └── config.ts          # Auth.js config
│   ├── ai/
│   │   ├── match.ts           # Match scoring
│   │   ├── cover-letter.ts    # Cover letter generation
│   │   └── cv-parser.ts       # CV parsing
│   ├── connectors/
│   │   ├── base.ts            # Base connector interface
│   │   ├── indeed.ts          # Indeed connector
│   │   ├── jobboerse.ts       # Jobbörse connector
│   │   └── stepstone.ts       # Stepstone connector
│   └── i18n/
│       └── config.ts          # next-intl config
├── messages/
│   ├── de.json                # Немецкий
│   └── en.json                # Английский
└── types/
    ├── job.ts                 # Job types
    ├── user.ts                # User types
    └── application.ts         # Application types
```

### Database Schema (основные таблицы)

```
users
  - id, email, name, role (candidate|admin)
  - oauth_provider, oauth_id
  - created_at, updated_at

profiles
  - user_id (FK), headline, summary
  - skills (JSONB), experience (JSONB)
  - preferred_locations, salary_range
  - cv_file_url, cv_parsed_data (JSONB)

jobs
  - id, external_id, source_portal
  - title, company_name, company_info (JSONB)
  - location, salary_min, salary_max
  - description, requirements (JSONB)
  - application_fields (JSONB) — динамические поля формы
  - match_keywords (tsvector) — FTS
  - created_at, expires_at

applications
  - id, user_id (FK), job_id (FK)
  - status (draft|prefilled|submitted|confirmed)
  - cover_letter, form_data (JSONB)
  - match_score
  - applied_at

portals
  - id, name, type, config (JSONB)
  - status (active|paused|error)
  - last_sync_at, jobs_count

audit_log
  - id, actor_id, action, entity_type, entity_id
  - details (JSONB), ip_address
  - created_at

user_limits
  - user_id (FK), period_start
  - views_used, views_limit (500)
```

---

## MVP Scope

### Phase 1 — Foundation
- [x] Next.js 15 project init
- [ ] Database schema + migrations
- [ ] Auth (Google, Microsoft, LinkedIn)
- [ ] i18n setup (de, en)
- [ ] Base layout + navigation

### Phase 2 — Job Aggregation
- [ ] Jobbörse connector (open API)
- [ ] Indeed connector (Publisher API)
- [ ] Job normalization pipeline
- [ ] Job listing + search pages (SSR)
- [ ] Job detail page + JobPosting schema

### Phase 3 — User Features
- [ ] CV upload + AI parsing
- [ ] User profile management
- [ ] Match score algorithm
- [ ] Cover letter AI generation
- [ ] Application flow (3-level)
- [ ] Dashboard + email notifications

### Phase 4 — Admin
- [ ] Admin dashboard + analytics
- [ ] Portal management UI
- [ ] User moderation

### Phase 5 — Polish
- [ ] NIS2/DSGVO compliance (Impressum, Datenschutz, consent)
- [ ] Rate limiting (500 views/month)
- [ ] SEO optimization (sitemap, meta, Google for Jobs)
- [ ] Social sharing meta tags
- [ ] Performance optimization
