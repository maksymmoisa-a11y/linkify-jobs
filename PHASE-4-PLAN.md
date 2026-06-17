# Phase 4 — Admin Panel

## Consilium Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Charts | CSS-based bars/sparklines | No chart library, minimal bundle |
| Auth guard | Middleware + server-side role check | NIS2: admin routes protected |
| Audit logging | Every admin action logged | NIS2 compliance |
| Portal sync | Manual trigger from UI + status display | MVP: admin controls sync |
| User management | List, search, view, block/unblock | Basic moderation |

## Tasks

### 1. Admin Auth Guard
- Server-side role check on all admin pages
- Redirect non-admin to /dashboard
- API routes: check session.user.role === "admin"

### 2. DB Queries (`src/lib/db/queries/admin.ts`)
- `getDashboardStats()` — total users, jobs, applications, active portals
- `getRegistrationsByDay(days)` — user signups per day
- `getApplicationsByDay(days)` — applications per day
- `getPortalStats()` — per-portal job counts, sync status
- `getUsersList(page, search?)` — paginated users with stats
- `toggleUserBlocked(userId, blocked)` — block/unblock
- `logAdminAction(actorId, action, entityType, entityId, details, ip)` — audit log

### 3. Admin Dashboard Page (enhanced)
- 4 stat cards with real data
- Registrations chart (last 30 days, CSS bars)
- Applications chart (last 30 days)
- Recent activity from audit log

### 4. Portals Management Page
- Table: name, status badge, jobs count, last sync time
- Toggle active/paused button per portal
- "Sync Now" button per portal → calls /api/connectors/sync
- Sync progress/result feedback
- Add portal form (name, type, config)

### 5. Users Management Page
- Searchable table: name, email, role, registered date, applications count
- View user detail (profile, applications)
- Block/Unblock action with confirmation
- Pagination

### 6. Admin API Routes
- GET /api/admin/stats — dashboard stats
- GET /api/admin/users — paginated user list
- POST /api/admin/users/[id]/block — toggle block
- GET /api/admin/audit — audit log entries

## File Map

```
src/
├── lib/db/queries/
│   └── admin.ts                    # All admin queries
├── app/
│   ├── [locale]/(admin)/admin/
│   │   ├── page.tsx                # Enhanced dashboard
│   │   ├── portals/page.tsx        # Portal management
│   │   └── users/page.tsx          # User management
│   └── api/admin/
│       ├── stats/route.ts          # Dashboard stats
│       ├── users/route.ts          # User list
│       ├── users/[id]/block/route.ts # Block/unblock
│       └── audit/route.ts          # Audit log
└── components/admin/
    ├── stats-card.tsx              # Stat card component
    ├── mini-chart.tsx              # CSS bar chart
    ├── portal-row.tsx              # Portal table row with actions
    └── user-row.tsx                # User table row with actions
```
