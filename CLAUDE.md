# CLAUDE.md — SSV Camp App (v2)

## Project Overview
SSV Camp App — a full-stack Next.js app for HSS Sangha Shiksha Varg camps.
Two core features:
1. **Inventory Management** — track food, supplies, equipment across an 8-day camp
2. **Receipt Management** — volunteers scan receipts, org treasurer marks reimbursements

## Tech Stack
- **Framework**: Next.js 14, App Router, TypeScript
- **Styling**: Tailwind CSS v3 + custom theme tokens (see design tokens below)
- **Animation**: Motion Primitives (framer-motion)
- **Icons**: Lucide React
- **Fonts**: Tiro Devanagari (display) + Inter (body) via Google Fonts
- **Backend**: Supabase (Postgres DB + Auth + Storage)
- **AI**: Google Gemini 1.5 Flash via @google/generative-ai SDK (receipt parsing)
- **Deployment**: Vercel (static + serverless)

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
```
Never hardcode these. Always read from process.env.

## Design Tokens (Tailwind theme extension in tailwind.config.ts)
```ts
colors: {
  bg: '#0b0f1a',
  surface: '#111827',
  'surface-2': '#1a2235',
  border: 'rgba(255,255,255,0.08)',
  saffron: '#FF7518',
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

## Glassmorphism Utility (globals.css)
```css
.glass {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
}
```

## Code Conventions
- All components in `components/` — no logic in page files beyond data fetching
- All Supabase calls go through `lib/supabase/` helper functions — never call supabase client directly in components
- All types in `types/` directory
- Use `async/await` not `.then()` chains
- Use `sonner` for toast notifications
- Mobile-first: design at 375px, expand up

## Supabase Client Setup
- Browser client: `lib/supabase/client.ts` using `createBrowserClient`
- Server client: `lib/supabase/server.ts` using `createServerClient` with cookies
- Never import server client in client components

## Key Decisions
- Camp Rooms are shareable workspaces identified by a 6-character join code
- Inventory and receipts both belong to a Room
- Any room member can edit inventory and submit receipts
- Only the room creator (admin) can mark receipts as reimbursed and delete items
- Receipt parsing uses Gemini 1.5 Flash vision — API call happens in a Next.js API route, never client-side (keeps API key server-side)
