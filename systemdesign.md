# Camp Inventory UI System Design

## Product direction

This app should feel like a modern operational tool, not a school project and not a generic AI template. The closest reference energy is **Linear × Stripe × Mercury**: restrained, crisp, high-signal, dark-friendly, and confident.

The product is a room-based coordination app for camp inventory and receipts. The interface should communicate:
- logistics clarity
- trustworthiness
- speed
- calm control
- lightweight intelligence

It should **not** communicate:
- playful startup landing page energy
- generic purple AI gradients
- shiny "AI app" gimmicks
- dashboard clutter
- random colors for every card

## Visual language

### Brand attributes

Use these five words as the visual filter for every design decision:
- calm
- exact
- premium
- operational
- fast

### Core aesthetic

- Dark-first interface with excellent light mode support.
- Mostly neutral surfaces with one restrained accent color.
- Dense but breathable layout.
- Thin borders, low-chroma backgrounds, strong typography.
- Motion should feel physical and quiet, never flashy.

### Anti-slop rules

Avoid these completely:
- purple/blue gradient blobs
- glassmorphism everywhere
- giant rounded pills on every component
- icon-in-colored-circle feature cards
- thick borders and loud shadows
- too many card variants
- centered marketing-page style content inside the app
- fake-AI copy like “unlock insights” or “supercharge your workflow”

## References

Use these products as directional references:
- Linear for density, hierarchy, and sidebar/nav discipline.[cite:254][cite:239]
- Stripe/Mercury for calm surfaces, premium spacing, and polished empty states.[cite:254][cite:243]
- Modern SaaS dashboards in 2026 emphasize minimal-but-dense UI, modular cards, strong dark mode, and action-oriented layout rather than decorative dashboards.[cite:243][cite:245][cite:256]

## Information architecture

The app is a web application, so prioritize operational clarity over theatrical hero design.

### Primary app areas

- Dashboard
- Inventory
- Receipts
- Room / Members
- Settings

### Navigation model

Desktop:
- Left sidebar, collapsible
- Top utility bar for room switcher, theme toggle, account actions

Mobile:
- Bottom tab bar for core destinations
- Overflow actions behind sheet/menu

### Dashboard structure

The dashboard should answer three questions instantly:
1. What still needs attention?
2. What changed recently?
3. What should I do next?

Recommended order:
- Top summary row: items needed, items arrived, receipts submitted, total receipt spend
- Action strip: Add inventory item, Scan receipt, Invite member
- Two-column body:
  - left: urgent inventory shortages / missing items
  - right: recent receipts / recent activity
- lower section: room members and status snapshots

Do not use decorative analytics cards without decisions attached. High-performing dashboards are increasingly operational, not just informational.[cite:239][cite:245]

## Design system

### Color system

Use a restrained neutral-first palette.

#### Dark mode
- Background: near-black graphite, not pure black
- Surface 1: charcoal
- Surface 2: slightly lifted graphite
- Border: subtle warm-gray or cool-neutral alpha border
- Text primary: soft white
- Text secondary: muted gray
- Accent: one teal, blue-green, or steel-cyan tone only
- Success: muted green
- Warning: muted amber
- Danger: muted rose/red

#### Light mode
- Background: warm off-white or cool paper gray
- Surfaces: white + slightly tinted surface layers
- Text: charcoal
- Accent: same hue family as dark mode

#### Rules
- One accent only for primary actions and active states
- No multicolor card set unless for actual semantic status
- Use semantic colors sparingly
- Charts, if any, should remain restrained and consistent with the brand palette

### Typography

Recommended pairings:
- Body/UI: Satoshi, General Sans, or Inter
- Optional display accent: Cabinet Grotesk or a very restrained serif for marketing surfaces only

Rules:
- App UI should mostly use one sans family
- Big type should come from weight and spacing, not giant size
- Tight, disciplined headings
- Body text always highly readable
- Use tabular numerals for metrics and counts

Suggested type scale:
- Page title: 28–34px semibold
- Section title: 18–22px semibold
- Body: 14–16px
- Meta labels: 12–13px
- Buttons: 14–15px medium

### Radius

Use smaller radii than typical AI-generated UIs:
- Buttons: 10–12px
- Inputs: 10–12px
- Cards: 14–18px
- Chips/badges: pill only when semantically useful

### Borders and shadows

- Prefer 1px alpha borders
- Use low, tight shadows only for elevated layers like modals/dropdowns
- Most cards should rely on surface contrast, not giant shadows

## Core components

### Buttons

Need exactly three button tiers:
- Primary: filled accent
- Secondary: surface with subtle border
- Ghost: text-only with hover fill

Rules:
- No gradients on buttons
- No oversized pill buttons everywhere
- Clear hover/pressed/focus states
- Icon + label spacing must feel tight and premium

### Inputs

- Slightly inset look on dark mode
- Strong focus ring using accent color
- Labels above fields, never placeholder-only
- Numeric inputs and steppers need cleaner custom styling than browser default

### Cards

Cards should look system-level, not marketing-level.

Use cards for:
- metric summaries
- receipt previews
- inventory tables/rows
- activity panels
- member cards

Rules:
- consistent padding scale
- subdued border
- one visual highlight max per card
- no noisy internal dividers unless necessary

### Tables and inventory rows

Inventory is the product core, so the table/list design matters most.

Recommended behavior:
- desktop: compact table with strong row hover, sticky header
- mobile: stacked cards with the most important fields visible first

Inventory row hierarchy:
- name
- quantity needed / arrived
- unit
- assignee / status / actions

Status should be legible through a combination of text + subtle badge color, not only color.

### Modals / sheets

- Use elevated sheet/modal surfaces with better spacing than current UI
- Receipt scanning should feel like a deliberate workflow, not a raw form dump
- Large dialogs should have clear visual zones: header, content, sticky footer actions

### Empty states

Every empty state should look intentional.

Examples:
- Inventory empty → “No inventory yet” with one strong CTA
- Receipts empty → “No receipts submitted” with scan/upload CTA
- Activity empty → informative line plus next action

2026 SaaS dashboard guidance emphasizes action-oriented empty states rather than blank charts or dead panels.[cite:239][cite:243]

## Screen-by-screen redesign notes

### Dashboard

Problems to avoid:
- random metric cards
- weak hierarchy
- too much equal-weight content

Target:
- one clear primary metric region
- one clear next-actions region
- one clear recent activity region
- compact but premium spacing

### Inventory

This should feel like the most polished part of the app.

Need:
- strong scanability
- better spacing in rows
- cleaner number alignment
- clearer add/edit flows
- subtle inline progress visualization
- elegant status tags

### Receipts

Receipts should feel like a workflow:
- upload/scan state
- review normalized items state
- save + sync feedback state

The review modal should be beautifully structured with clear columns and stronger grouping.

### Members / room

This page should feel more like a clean admin panel:
- member list
- roles/badges
- invite/share code UI
- recent contribution signals if useful

## Motion

Use motion for orientation, not spectacle.

Include:
- subtle sidebar expand/collapse
- card hover lift only 1–2px max
- modal/sheet enter transitions
- row insertion/removal transitions
- receipt save success microinteraction

Avoid:
- springy bounce everywhere
- long fades
- animated gradients
- decorative floating elements

## Implementation guidance

### Tech stack suggestions

For a Next.js app, the best practical stack is:
- Tailwind CSS for tokens + utility ergonomics
- shadcn/ui as a base only, then heavily restyle
- Framer Motion or Motion for purposeful transitions
- Lucide icons
- class-variance-authority for button/input/card variants

### Recommended workflow

1. Create a real design system first:
- colors
- type scale
- radius scale
- spacing scale
- button/input/card variants

2. Build a **design-test page** before touching the app screens.

3. Then redesign in this order:
- app shell (sidebar, topbar, page container)
- buttons/inputs/modals
- dashboard
- inventory
- receipts
- member/settings pages

4. After each screen, do both desktop and mobile cleanup.

## Cursor / Claude prompts

### Prompt 1 — establish design system

```text
Redesign this app into a modern operational SaaS UI inspired by Linear, Stripe, and Mercury.

Goals:
- calm, premium, dark-first, dense but breathable
- avoid generic AI startup slop
- neutral surfaces + one restrained accent
- polished inventory/receipt workflows

First, do NOT redesign random pages immediately.
Instead:
1. audit the current UI architecture
2. create or refactor a central design system / tokens layer
3. define colors, typography, radius, spacing, shadows, and component variants
4. restyle core primitives first:
   - app shell
   - sidebar
   - topbar
   - buttons
   - inputs
   - cards
   - tables
   - modals
   - badges
5. create a dedicated internal design-test page or story-like preview route that renders the major components in light and dark mode
6. only after the primitives look good, start applying them across screens

Rules:
- no purple gradient AI slop
- no glowing blobs
- no generic shadcn defaults
- no giant rounded pills everywhere
- no centered marketing-page dashboard layout
- keep it product-grade and operational

Output:
- summarize token choices
- list files changed
- say which components are now standardized
```

### Prompt 2 — redo app shell

```text
Redesign the app shell completely.

Focus only on:
- sidebar
- top navigation
- page container
- spacing system
- mobile nav behavior

Target aesthetic:
- Linear / Stripe / Mercury energy
- dark-first
- premium dense dashboard
- crisp borders, restrained accent, better typography

Requirements:
- collapsible sidebar on desktop
- clean mobile navigation
- consistent max widths and gutters
- proper selected/hover/focus states
- topbar should feel minimal and expensive
- improve page titles/subtitles/actions hierarchy

Do not touch business logic. Only shell/layout/UI.
After changes, summarize the before/after design decisions.
```

### Prompt 3 — redo dashboard

```text
Now redesign the dashboard using the new design system.

Goals:
- make it feel like a real operational control center
- emphasize what needs attention, what changed recently, and what actions matter next
- remove any remaining AI-template feel

Requirements:
- stronger hierarchy
- fewer but better cards
- better metric typography
- better empty states
- cleaner action area
- make desktop and mobile both feel intentional

Avoid decorative analytics that do not help decisions.
Use subtle motion and premium spacing.
Do not change backend logic.
```

### Prompt 4 — redo inventory + receipts

```text
Redesign the Inventory and Receipts experiences to be the most polished parts of the app.

Inventory goals:
- highly scannable
- clean row hierarchy
- better controls for needed/arrived/unit
- elegant status badges
- improved add/edit modal

Receipts goals:
- make scanning/review/save feel premium and trustworthy
- improve modal layout, spacing, footer actions, and review table/list
- make OCR/AI-generated content feel readable and editable

Requirements:
- use the shared design system
- no logic changes unless required for UI correctness
- improve empty states, loading states, and success/failure feedback
- optimize both mobile and desktop

After changes, summarize the UI improvements by screen.
```

## Best tools / skills / MCP ideas

### Skills worth using

- **Claude Code / Cursor + design-system-first prompting**: good for broad refactors if you force it to build primitives first.
- **shadcn/ui**: use as raw parts, not final styling.
- **Tailwind variants / CVA**: keeps the system coherent.
- **Framer Motion / Motion**: for tasteful transitions.
- **Lucide**: clean icon baseline.

### Good reference sources

- SaaSFrame for dashboard composition references.[cite:241]
- Modern SaaS dashboard pattern roundups for hierarchy and layout decisions.[cite:243][cite:254]

### MCP / workflow ideas

If your setup supports them, prioritize tools that help with:
- screenshotting the app at multiple breakpoints
- DOM inspection / browser automation
- contrast checking
- component inventory extraction
- visual diffing after refactors

The most useful practical loop is:
1. Claude/Cursor edits code
2. browser MCP takes screenshots at desktop + mobile
3. inspect visual regressions
4. iterate screen by screen

### Strong practical stack

- Playwright MCP for screenshot + interaction QA
- browser devtools MCP for inspection
- a component/story preview route inside your app
- optional Figma MCP only if you already design in Figma; otherwise code-first is faster for this app

## Final standard

The redesign is successful if the app feels like:
- a product somebody could charge for
- a serious logistics tool
- calm and modern in dark mode
- custom, not template-driven

The redesign is not successful if it still feels like:
- default shadcn
- random Tailwind blocks
- neon AI startup demo
- a hackathon prototype
