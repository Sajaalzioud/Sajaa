# Sajaa — Pediatric OT Documentation Platform

All-in-one platform for pediatric occupational therapists: patient
management, assessment administration & scoring, clinical documentation with
AI assistance, treatment planning with goal tracking, scheduling, billing,
analytics and branded PDF reports. Built to eliminate paperwork.

## Features

- **Dashboard** — active patients, weekly sessions, draft notes, goals
  achieved; sessions/goal-status/revenue charts; today's appointments.
- **Patients** — full intake (demographics, diagnoses, insurance, contacts,
  medical/developmental/birth/family history), instant search & filters,
  profile with overview / history / treatment plan / assessments /
  documents / visit-timeline tabs, allergy banner, auto-calculated age,
  auto-generated MRN.
- **Assessments** — JSON-schema template engine with a visual builder
  (sections, item types, scale presets, scoring bands), automatic scoring +
  interpretation text, autosave while administering, duplication and
  version control (edits to in-use templates create new versions).
- **Documentation** — 14 document types (initial evaluation → letter of
  medical necessity) rendered by one sectioned editor with autosave,
  complete/sign workflow (signed = immutable, amendments audited).
- **AI assist** — per-section rewrite & generate actions (SMART goals,
  interventions, home programs, clinical reasoning…) via the Anthropic API;
  suggestions require explicit acceptance and never invent patient facts.
- **Scheduling** — week calendar, recurring weekly appointments, status
  workflow (completed / no-show / cancelled → session note), waiting list.
- **Billing** — invoices, payment recording with automatic status rollup,
  collected/outstanding/overdue summary.
- **Global search** — ⌘K palette across patients, documents, assessments
  and goals.
- **PDF generation** — clinic-branded, professionally laid out PDFs for any
  document (logo color, patient block, signature block, page numbers).
- **Compliance** — audit log on every mutation, role-based user model,
  dark/light theme, responsive down to mobile.

## Getting started

```bash
npm install                       # also runs prisma generate
createdb sajaa_ot                 # any PostgreSQL 14+
cp .env.example .env              # set DATABASE_URL (+ ANTHROPIC_API_KEY for AI)
npx prisma migrate dev            # create schema
npm run db:seed                   # demo clinic with realistic data
npm run dev                       # http://localhost:3000
```

Useful scripts: `db:migrate`, `db:seed`, `db:studio`, `build`, `lint`.

## Documentation

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the system design, data
model, key decisions (assessment engine, document model, auth boundary,
AI guardrails) and the roadmap for parent portal, notifications, offline
mode and Arabic/RTL support.
