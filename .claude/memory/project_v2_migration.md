---
name: project-v2-migration
description: V2 migration status — Supabase, auth, rooms, receipts, Gemini all implemented
metadata:
  type: project
---

V2 migration is complete as of 2026-06-28.

**Why:** Full-stack upgrade from localStorage to Supabase with Camp Rooms and Receipt Management.

**What was built:**
- Auth: `/login`, `/signup` with Supabase email+password
- Middleware: protects all routes except /login and /signup
- Room Hub: `/` — create/join rooms with 6-char codes
- Room Dashboard: `/room/[code]` — Inventory + Receipts tabs with Supabase Realtime
- Inventory: Supabase-backed, seeded on room creation, realtime updates
- Receipts: Submit flow (upload → Gemini scan → review → insert), admin-only reimburse
- Gemini API: `/api/scan-receipt` route using gemini-1.5-flash vision
- SQL schema: `supabase/migrations/001_init.sql`

**Requires user action before the app works:**
1. Create Supabase project
2. Run `supabase/migrations/001_init.sql` in Supabase SQL editor
3. Create Storage bucket named `receipts` (public read, authenticated write)
4. Create `.env.local` with NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, GEMINI_API_KEY

**How to apply:** Check SPEC_v2.md acceptance criteria against this list before declaring done.
