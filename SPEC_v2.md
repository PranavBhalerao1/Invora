# SSV Camp App v2 — SPEC.md

## Overview

V2 upgrades the v1 inventory app (localStorage) to a full-stack, multi-user app with:
- Supabase backend (shared state across devices)
- **Camp Rooms** — shareable workspaces with a 6-char join code (like Google Doc sharing)
- **Receipt Management** — volunteers photo receipts, Gemini AI parses them, treasurer marks reimbursed
- Same dark saffron/navy glassmorphism UI, extended

---

## V1 → V2 Migration Plan

Claude must handle this transition in order:

1. **Install new dependencies first**:
   ```bash
   npm install @supabase/supabase-js @supabase/ssr @google/generative-ai sonner uuid
   ```

2. **Set up Supabase schema** (provide SQL to run in Supabase dashboard — do not auto-run)

3. **Replace `lib/storage.ts`** (localStorage) with `lib/supabase/inventory.ts` (Supabase queries) — keep the same function signatures so components need minimal changes

4. **Migrate components**: swap localStorage reads/writes for Supabase calls, add loading/error states

5. **Add auth layer** on top of existing pages

6. **Add new pages**: `/receipts`, `/room/[code]`

---

## Supabase Schema

Provide this as a migration SQL file at `supabase/migrations/001_init.sql`:

```sql
-- Rooms (shareable camp workspaces)
create table rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,                        -- e.g. "SSV NJ 2026"
  join_code char(6) not null unique,         -- random 6-char code e.g. "AX7K2P"
  admin_id uuid references auth.users(id),   -- room creator = admin
  created_at timestamptz default now()
);

-- Room members (anyone who joined via code)
create table room_members (
  room_id uuid references rooms(id) on delete cascade,
  user_id uuid references auth.users(id),
  joined_at timestamptz default now(),
  primary key (room_id, user_id)
);

-- Inventory items (same shape as v1, now Supabase-backed)
create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  name text not null,
  category text not null,
  quantity integer not null default 1,
  unit text not null,                        -- "20 lb bag", "4-pack", etc.
  needed integer not null default 1,
  arrived integer not null default 0,
  assigned_to text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Receipts
create table receipts (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  submitted_by_id uuid references auth.users(id),
  submitted_by_name text not null,           -- display name
  vendor text,
  receipt_date date,
  subtotal numeric(10,2),
  tax numeric(10,2),
  total numeric(10,2) not null,
  image_url text,                            -- Supabase Storage path
  reimbursed boolean default false,
  reimbursed_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

-- Receipt line items
create table receipt_items (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid references receipts(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null
);

-- RLS Policies
alter table rooms enable row level security;
alter table room_members enable row level security;
alter table inventory_items enable row level security;
alter table receipts enable row level security;
alter table receipt_items enable row level security;

-- Room members can see rooms they belong to
create policy "members can view room" on rooms
  for select using (
    auth.uid() = admin_id or
    exists (select 1 from room_members where room_id = rooms.id and user_id = auth.uid())
  );

-- Anyone authenticated can create a room
create policy "auth users can create rooms" on rooms
  for insert with check (auth.uid() = admin_id);

-- Members can view/edit inventory in their rooms
create policy "members can view inventory" on inventory_items
  for select using (
    exists (select 1 from room_members where room_id = inventory_items.room_id and user_id = auth.uid())
    or exists (select 1 from rooms where id = inventory_items.room_id and admin_id = auth.uid())
  );

create policy "members can edit inventory" on inventory_items
  for all using (
    exists (select 1 from room_members where room_id = inventory_items.room_id and user_id = auth.uid())
    or exists (select 1 from rooms where id = inventory_items.room_id and admin_id = auth.uid())
  );

-- Same for receipts
create policy "members can view receipts" on receipts
  for select using (
    exists (select 1 from room_members where room_id = receipts.room_id and user_id = auth.uid())
    or exists (select 1 from rooms where id = receipts.room_id and admin_id = auth.uid())
  );

create policy "members can insert receipts" on receipts
  for insert with check (auth.uid() = submitted_by_id);

create policy "members can view receipt items" on receipt_items
  for select using (
    exists (
      select 1 from receipts r
      join room_members rm on rm.room_id = r.room_id
      where r.id = receipt_items.receipt_id and rm.user_id = auth.uid()
    )
  );
```

Also create a **Supabase Storage bucket** named `receipts` (public read, authenticated write).

---

## Auth Flow

Use **Supabase Auth with Email + Password** (simplest, no OAuth needed).

Pages:
- `/login` — email + password sign in form
- `/signup` — email + password + display name registration

After login → redirect to `/` (room selection or create).

Middleware (`middleware.ts`): protect all routes except `/login` and `/signup`. Use `@supabase/ssr` cookie-based session.

---

## Camp Rooms Flow

### `/` — Room Hub (post-login landing)
- Shows list of rooms user belongs to (created or joined)
- **"Create Room"** button → modal: enter room name → generates random 6-char join code → inserts into `rooms` + auto-joins as admin → redirects to `/room/[code]`
- **"Join Room"** button → modal: enter 6-char code → validates → inserts into `room_members` → redirects to `/room/[code]`
- Each room card shows: room name, join code (copyable), member count, item count

### `/room/[code]` — Room Dashboard
- Same as v1 dashboard but scoped to this room
- Header shows room name + join code with a copy button (so admin can share easily)
- Admin badge if current user is room creator
- Two tabs: **Inventory** | **Receipts**
- Inventory tab = full v1 functionality (KPI cards, category progress, table) but data from Supabase
- Receipts tab = receipt list (see below)

---

## Inventory (v2 changes from v1)

Everything from v1 spec carries over. Changes:
- Data source: Supabase `inventory_items` table instead of localStorage
- All mutations (add/edit/delete/stepper) call Supabase, then update local React state optimistically
- Seed data: on room creation, auto-insert the 20 default seed items from v1's `seed.json` into `inventory_items` for that room
- Real-time updates: use Supabase Realtime (`supabase.channel`) to subscribe to `inventory_items` changes — when another member updates arrived count, it reflects instantly for everyone
- Export CSV still works, now queries Supabase

---

## Receipt Management

### Receipt List (`/room/[code]` Receipts tab)

**Summary bar** (glassmorphism KPI cards):
- Total Receipts
- Total Spent (sum of all totals)
- Pending Reimbursement (sum of unreimbursed totals)
- Reimbursed (sum of reimbursed totals)

**Receipt table**:
| Submitted By | Vendor | Date | Total | Items | Status | Actions |
|---|---|---|---|---|---|---|
| Pranav B. | Costco | Jun 27 | $84.32 | 6 items | Pending badge | View / Mark Reimbursed |

- Status badge: `Pending` (yellow) or `Reimbursed` (green)
- **"Mark Reimbursed"** button only visible to room admin
- Clicking a receipt row opens a detail drawer showing line items + receipt image thumbnail

### Submit Receipt Flow

**"Submit Receipt" floating button** (bottom-right, saffron) → opens full-screen modal:

**Step 1 — Upload**
- Large upload area: "Take a photo or upload receipt"
- `<input type="file" accept="image/*" capture="environment">` for mobile camera
- Preview the image once selected
- "Scan Receipt" button → calls `/api/scan-receipt` with the image

**Step 2 — Review & Confirm** (shown after AI parsing)
- Editable fields pre-filled by Gemini:
  - Vendor (text)
  - Date (date picker)
  - Line items list — each row: item name (editable) + price (editable) + delete button
  - "Add line item" button
  - Subtotal / Tax / Total (auto-calculated from line items, editable)
- "Your name" field (text, required — no auth lookup, just display name)
- Notes textarea (optional)
- "Submit" → inserts into `receipts` + `receipt_items`, uploads image to Supabase Storage

### API Route: `/api/scan-receipt`

```ts
// app/api/scan-receipt/route.ts
// Accepts multipart form data with image file
// Calls Gemini 1.5 Flash with vision
// Returns structured JSON:
{
  vendor: string,
  date: string,          // YYYY-MM-DD
  items: { name: string, price: number }[],
  subtotal: number,
  tax: number,
  total: number
}

// Gemini prompt:
// "You are a receipt parser. Extract all line items, vendor name, date, subtotal, tax, 
//  and total from this receipt image. Return ONLY valid JSON matching this schema: 
//  { vendor, date, items: [{name, price}], subtotal, tax, total }. 
//  If a field is unclear, make your best guess. Never return null for total."
```

Use `@google/generative-ai` SDK. Image passed as `inlineData` with base64 encoding.
Gemini model: `gemini-1.5-flash`.

---

## File Structure (v2)

```
ssv-camp/
├── app/
│   ├── layout.tsx
│   ├── middleware.ts                    # auth protection
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── page.tsx                         # Room Hub
│   ├── room/
│   │   └── [code]/
│   │       └── page.tsx                 # Room Dashboard (inventory + receipts tabs)
│   └── api/
│       └── scan-receipt/
│           └── route.ts                 # Gemini vision API route
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── rooms/
│   │   ├── RoomCard.tsx
│   │   ├── CreateRoomModal.tsx
│   │   └── JoinRoomModal.tsx
│   ├── inventory/                       # all v1 components, migrated
│   │   ├── KPICard.tsx
│   │   ├── CategoryProgress.tsx
│   │   ├── InventoryTable.tsx
│   │   ├── ItemModal.tsx
│   │   ├── DeleteDialog.tsx
│   │   ├── StatusBadge.tsx
│   │   └── InlineStepper.tsx
│   ├── receipts/
│   │   ├── ReceiptTable.tsx
│   │   ├── ReceiptSummaryBar.tsx
│   │   ├── SubmitReceiptModal.tsx       # 2-step: upload → review
│   │   ├── ReceiptDetailDrawer.tsx
│   │   └── ReimburseButton.tsx
│   └── ui/
│       ├── Header.tsx
│       ├── Toast.tsx
│       └── CopyCode.tsx                # copy join code button
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── inventory.ts                # all inventory DB helpers
│   │   ├── receipts.ts                 # all receipt DB helpers
│   │   └── rooms.ts                   # room CRUD + join logic
│   └── gemini.ts                      # Gemini client init
├── types/
│   └── index.ts                       # all shared types
├── data/
│   └── seed.json                      # same 20 items from v1
├── supabase/
│   └── migrations/
│       └── 001_init.sql
└── styles/
    └── globals.css
```

---

## Acceptance Criteria

- [ ] `npm run dev` starts with no errors; all env vars documented in `.env.example`
- [ ] `/signup` and `/login` work; sessions persist across refresh
- [ ] Unauthenticated users are redirected to `/login` by middleware
- [ ] User can create a room; gets a 6-char join code
- [ ] Second user can join the room using the code
- [ ] Inventory tab shows seeded items on room creation; all v1 CRUD + stepper + filter + export CSV works
- [ ] Supabase Realtime: arrived count update by one user reflects for all room members without refresh
- [ ] Receipt tab: submit receipt flow works end-to-end (upload → Gemini scans → review → submit)
- [ ] Gemini correctly parses a test receipt image into vendor, items, total
- [ ] Room admin can mark a receipt as reimbursed; non-admin cannot see the button
- [ ] Receipt detail drawer shows line items and image
- [ ] All pages responsive at 375px and 1280px
- [ ] Dark saffron/navy glassmorphism theme consistent throughout all new pages
- [ ] `.env.example` file present with all required variable names (no values)
