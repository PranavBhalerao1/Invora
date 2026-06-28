# SSV Camp Inventory Manager — SPEC.md

## Overview

A Next.js inventory management app for HSS Sangha Shiksha Varg (SSV) camp. Tracks all food, supplies, and equipment across an 8-day camp. No backend — all state lives in `localStorage` with JSON seed data. Deployable as a static export to Vercel.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, static export)
- **Styling**: Tailwind CSS v3 with custom theme tokens
- **Animation**: Motion Primitives (framer-motion under the hood)
- **Icons**: Lucide React
- **Font**: Tiro Devanagari (display/headings via Google Fonts) + Inter (body)
- **Persistence**: localStorage (JSON serialized)
- **No backend, no auth, no Supabase**

---

## Color Tokens (Tailwind theme extension)

```js
colors: {
  bg: '#0b0f1a',           // deep navy background
  surface: '#111827',      // card surface
  'surface-2': '#1a2235',  // elevated card
  border: 'rgba(255,255,255,0.08)',
  saffron: '#FF7518',      // primary accent
  'saffron-light': '#ffaa5e',
  'saffron-dim': 'rgba(255,117,24,0.15)',
  text: '#f0f4ff',
  muted: '#8b95aa',
  faint: '#3d4a60',
  success: '#4ade80',
  warning: '#facc15',
  error: '#f87171',
}
```

Glassmorphism utility class (add to globals.css):
```css
.glass {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
}
```

---

## Data Model

### Item

```ts
interface InventoryItem {
  id: string;                  // uuid
  name: string;                // "Basmati Rice"
  category: Category;          // enum (see below)
  quantity: number;            // numeric count of units
  unit: string;                // "20 lb bag", "4-pack", "box of 48", "gallons", "lbs", etc. (free text)
  totalAmount: string;         // derived display string e.g. "3 × 20 lb bag"
  needed: number;              // how many units needed total
  arrived: number;             // how many units have physically arrived at camp
  status: 'pending' | 'partial' | 'arrived';  // auto-derived: arrived===0→pending, arrived<needed→partial, arrived>=needed→arrived
  assignedTo?: string;         // optional person responsible for bringing this
  notes?: string;              // free text notes
  createdAt: string;           // ISO date string
  updatedAt: string;           // ISO date string
}
```

### Status Derivation Logic (always computed, never stored):
- `arrived === 0` → `'pending'` (red badge)
- `0 < arrived < needed` → `'partial'` (yellow badge)
- `arrived >= needed` → `'arrived'` (green badge)

### Category Enum
```ts
type Category =
  | 'Food & Grains'
  | 'Produce & Dairy'
  | 'Beverages'
  | 'Cooking Supplies'
  | 'Cleaning Supplies'
  | 'Medical & First Aid'
  | 'Sports & Activities'
  | 'Bedding & Linens'
  | 'Stationery & Craft'
  | 'Miscellaneous';
```

---

## Persistence Layer

File: `lib/storage.ts`

- `loadInventory(): InventoryItem[]` — reads from localStorage key `ssv_inventory`. On first load (empty), seeds with `data/seed.json`.
- `saveInventory(items: InventoryItem[]): void` — writes full array to localStorage.
- `exportCSV(items: InventoryItem[]): void` — triggers browser download of a `.csv` file with all fields.
- All mutations go through these two functions; no direct localStorage calls in components.

---

## Seed Data (`data/seed.json`)

Pre-populate ~20 realistic camp items, for example:
- Basmati Rice — 4 × 20 lb bag — needed: 4, arrived: 0
- Whole Wheat Flour (Atta) — 2 × 10 lb bag — needed: 2, arrived: 0
- Cooking Oil — 6 × 1 gallon — needed: 6, arrived: 0
- Paper Plates — 3 × pack of 100 — needed: 3, arrived: 0
- Hand Sanitizer — 10 × 8 oz bottle — needed: 10, arrived: 0
- First Aid Kit — 2 × standard kit — needed: 2, arrived: 0
- (etc. — fill out all 10 categories with 1–3 items each)

---

## Pages & Routes

### `/` — Dashboard / Overview
- **Header**: App name "SSV Camp Inventory", saffron logo/icon, "Add Item" CTA button
- **Stats row** (4 glassmorphism KPI cards, animated number counters via Motion Primitives):
  - Total Items
  - Arrived (count + % of total)
  - Pending
  - Partial
- **Category Progress Section**: One horizontal progress bar per category, showing `arrived/needed` ratio, saffron fill, animated on mount
- **Recent Activity** (optional): Last 5 updated items

### `/inventory` — Full Inventory Table
- **Filters bar**: Search (by name), filter by Category (dropdown), filter by Status (All / Pending / Partial / Arrived)
- **Inventory table** (or card grid on mobile):
  - Columns: Name | Category | Unit | Needed | Arrived | Status badge | Assigned To | Actions
  - **Arrived counter**: `+` / `−` stepper buttons to increment/decrement `arrived` count inline (no modal needed). Clamps to `[0, needed]`.
  - **Actions**: Edit (pencil icon → opens modal) | Delete (trash icon → confirm dialog)
- **"Add Item" floating button** (bottom-right, saffron, animated)

### Modals

**Add / Edit Item Modal** (shared component `<ItemModal>`):
- Fields:
  - Name (text input, required)
  - Category (select dropdown)
  - Quantity / Needed (number input) — how many units you need
  - Unit (text input with autocomplete suggestions: "lbs", "gallon", "4-pack", "box of 48", "case", "bag") — free text
  - Arrived so far (number input, default 0)
  - Assigned To (text input, optional)
  - Notes (textarea, optional)
- Display a live preview: `"3 × 20 lb bag"` updates as user types quantity + unit
- Save button: creates new item (uuid) or updates existing item, saves to localStorage
- Cancel button: closes modal, no changes

**Delete Confirm Dialog**:
- Simple modal: "Delete [Item Name]?" with Cancel + Delete (red) buttons

---

## Key Interactions & UX Details

1. **Inline arrived stepper**: On the inventory table, clicking `+` on "Arrived" immediately updates the count and re-derives status with a smooth color transition on the badge. No page reload.

2. **Animated KPI counters**: On dashboard load, numbers count up from 0 to their value over ~800ms using Motion Primitives `useMotionValue` + `useTransform`.

3. **Progress bars**: Animate width from 0% to actual % on mount (framer-motion `initial={{ width: 0 }}` → `animate={{ width: X% }}`).

4. **Status badge colors**:
   - Pending → red pill (`bg-red-500/20 text-red-400 border border-red-500/30`)
   - Partial → yellow pill (`bg-yellow-500/20 text-yellow-400 border border-yellow-500/30`)
   - Arrived → green pill (`bg-green-500/20 text-green-400 border border-green-500/30`)

5. **Glassmorphism cards**: All cards use `.glass` utility. Table rows use subtle `hover:bg-white/5` transition.

6. **Export CSV button**: In the header of `/inventory`, triggers `exportCSV()` — downloads `ssv_inventory_export.csv`.

7. **Mobile**: Table collapses to card list view at `sm` breakpoint. Each card shows name, status badge, unit info, and the +/− stepper.

8. **Empty state**: If no items match filters, show a centered illustration (SVG lotus/om symbol) with text "No items found."

9. **Toast notifications**: On add/edit/delete, show a brief saffron-colored toast in the bottom-right corner (disappears after 2s, framer-motion slide-in).

---

## File Structure

```
ssv-inventory/
├── app/
│   ├── layout.tsx             # root layout, fonts, global styles
│   ├── page.tsx               # Dashboard
│   └── inventory/
│       └── page.tsx           # Inventory table page
├── components/
│   ├── Header.tsx             # nav + logo
│   ├── KPICard.tsx            # animated stat card
│   ├── CategoryProgress.tsx   # progress bar section
│   ├── InventoryTable.tsx     # full table with filters
│   ├── ItemModal.tsx          # add/edit modal
│   ├── DeleteDialog.tsx       # confirm dialog
│   ├── StatusBadge.tsx        # pill badge component
│   ├── InlineStepper.tsx      # +/− arrived counter
│   └── Toast.tsx              # notification toast
├── lib/
│   └── storage.ts             # localStorage read/write/export
├── data/
│   └── seed.json              # default inventory items
├── types/
│   └── inventory.ts           # InventoryItem, Category types
└── styles/
    └── globals.css            # .glass utility + base styles
```

---

## Acceptance Criteria (for /goal stop condition)

- [ ] App runs with `npm run dev` without errors
- [ ] Dashboard shows 4 animated KPI cards and category progress bars
- [ ] `/inventory` page loads with seeded data on first visit
- [ ] Can add a new item via modal; it appears in the table and persists on refresh
- [ ] Can edit an existing item; changes persist on refresh
- [ ] Can delete an item with confirmation; item removed and persists on refresh
- [ ] Inline +/− stepper updates arrived count and status badge in real time
- [ ] Search and filter (category + status) work correctly
- [ ] Export CSV downloads a valid CSV file
- [ ] All pages are responsive at 375px (mobile) and 1280px (desktop)
- [ ] Dark saffron/navy theme with glassmorphism cards is applied throughout
- [ ] Animated number counters and progress bars animate on mount
- [ ] Toast notifications appear on add/edit/delete
