# Sajaa — System Architecture

All-in-one SaaS platform for pediatric occupational therapists: patient
management, assessments, documentation, treatment planning, scheduling,
billing, analytics and AI-assisted writing.

## Stack

| Layer      | Choice                                              |
| ---------- | --------------------------------------------------- |
| Frontend   | Next.js (App Router) · React · TypeScript           |
| Styling    | Tailwind CSS v4 · shadcn-style component library (`src/components/ui`) |
| State      | Server Components for reads · TanStack Query for client fetching · local component state for editors |
| Forms      | React Hook Form + Zod (shared client/server validators in `src/lib/validators`) |
| Database   | PostgreSQL via Prisma 7 (driver adapter `@prisma/adapter-pg`) |
| Auth       | Supabase Auth in production (see below) · seeded dev user locally |
| Charts     | Recharts, themed via CSS custom properties          |
| PDF        | `@react-pdf/renderer`, server-side (`/api/documents/[id]/pdf`) |
| AI         | Anthropic API (`/api/ai/assist`), degrades gracefully without a key |
| Deployment | Vercel (app) + Supabase (Postgres, Auth, Storage)   |

## Layout

```
prisma/               schema + migrations + seed (demo clinic)
src/
  app/
    (app)/            authenticated app shell (sidebar/topbar); force-dynamic
      dashboard/      KPI cards, sessions/goals/revenue analytics
      patients/       list, intake form, profile (tabs: overview, history,
                      plan, assessments, documents, timeline)
      assessments/    template library, runner, template builder
      documents/      list, creation wizard, sectioned editor
      schedule/       week calendar, recurring appointments, waitlist
      billing/        invoices, payments, financial summary
      settings/       clinic branding, profile, audit log
    api/              REST-ish route handlers; every mutation validates with
                      Zod, resolves the user via lib/auth, writes an AuditLog
  components/
    ui/               design-system primitives (button, dialog, table, …)
    <feature>/        feature components (client) — pages stay server-side
  lib/
    db.ts             Prisma singleton
    auth.ts           THE auth boundary (single file to swap for Supabase)
    audit.ts          HIPAA-style audit trail helper
    assessment/       template schema types + scoring/interpretation engine
    documents/        section definitions for all 14 document types
    ai/               AI action catalogue + guarded system prompt
    pdf/              branded PDF layout
    validators/       shared Zod schemas
```

## Key design decisions

### Assessments are data, not code
`AssessmentTemplate.schema` (sections → items: scale / number / boolean /
choice / text) and `.scoring` (method + interpretation bands) are JSON
documents typed by `src/lib/assessment/types.ts`. The same engine renders,
autosaves, scores and interprets standardized *and* unlimited custom
assessments — new instruments (Sensory Profile, BOT-2-style forms, COPM, …)
are rows, not deployments. Templates are **version-controlled**: editing a
template that has been administered retires the old row (`isActive=false`)
and creates a successor (`version+1`, `parentTemplateId`), so completed
assessments forever reference the exact version they were scored with.

### Documents are section maps
Every document type (initial evaluation, SOAP, progress report, LMN, …) is a
list of sections defined in `src/lib/documents/definitions.ts`;
`Document.content` stores `{sectionId: text}`. The one editor component
covers all 14 types, and the PDF generator renders any of them. Signing is a
state machine: `DRAFT → COMPLETED → SIGNED`, signed documents are immutable
at the API level (409) and can only be reopened as `AMENDED` — every
transition audited.

### Autosave everywhere
`useAutosave` (src/components/autosave.tsx) debounces changes 1.2s and PATCHes
the owning resource; the indicator shows dirty/saving/saved/error. Used by
the document editor and assessment runner.

### AI never invents clinical facts
`/api/ai/assist` exposes 12 actions (improve, grammar, summarize, expand,
SMART goals, interventions, home programs, clinical reasoning, …). The system
prompt pins OT terminology, forbids fabricating patient specifics (missing
details become `[bracketed placeholders]`), and the UI presents results as
suggestions requiring explicit "Use this" acceptance. Only non-identifying
context (age band, diagnosis list, document/section type) is sent.

### Compliance posture
- `AuditLog` row for every create/update/delete/sign/export, written by all
  mutating routes via `lib/audit.ts`.
- Role enum (`ADMIN/THERAPIST/ASSISTANT/RECEPTIONIST/PARENT`) on `User`
  drives role-based access; enforcement point is `lib/auth.ts` + per-route
  checks as roles beyond therapist are activated.
- Encryption at rest / TLS / backups are infrastructure duties (Supabase
  provides all three); session timeout and MFA come with Supabase Auth.

## Auth (Supabase swap)

Local dev has no Supabase project, so `lib/auth.ts#getCurrentUser` resolves
the seeded therapist. Production wiring (one file):

1. `@supabase/ssr` middleware refreshes the session cookie.
2. `getCurrentUser` reads the Supabase user and joins `User.authId`.
3. Unauthenticated requests redirect to `/login` (Supabase UI).
4. Postgres RLS policies mirror app roles for defense in depth.

## Data model (Prisma)

`User` ─┬─ `Patient` (demographics, diagnoses[], histories, insurance,
        │            status) ── `Contact[]`, `Attachment[]`
        ├─ `AssessmentTemplate` (schema/scoring JSON, versioned)
        │      └─ `Assessment` (responses, computed scores, interpretation)
        ├─ `Document` (typed, sectioned content JSON, sign state)
        ├─ `TreatmentPlan` ── `Goal` (LTG→STG→objective hierarchy)
        │                        └─ `GoalProgress` (0–100 time series)
        ├─ `Appointment` (recurrence via RRULE string + recurrenceId)
        ├─ `Invoice` ── `Payment`
        └─ `AuditLog`
`ClinicSettings` (single row: branding used app-wide and on PDFs)
`WaitlistEntry`

## Roadmap hooks (architected, not yet built)

- **Parent portal**: `Role.PARENT` + patient-scoped RLS; portal is a second
  route group reusing the same API.
- **Notifications**: reminder dispatch reads `Appointment.reminderSentAt`;
  add a provider (Twilio/WhatsApp Business/Resend) behind a queue (Supabase
  cron or Vercel cron).
- **Offline mode**: editors already funnel through `useAutosave`; add an
  IndexedDB write-ahead queue + service worker replay for sync-on-reconnect.
- **i18n / RTL**: UI strings to `next-intl` catalogues; Tailwind logical
  properties; Arabic PDF font registration in `lib/pdf`.
- **Attachments**: `Attachment` model is live; wire upload UI to Supabase
  Storage signed URLs.
- **Future AI**: speech-to-text session dictation, OCR import of paper
  reports, assessment recommendation and outcome prediction all slot in as
  new `/api/ai/*` routes over the same guarded client.
