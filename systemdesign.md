# SSV Inventory v2 — UI System Design

## Product feel

This app should feel like a modern AI startup product: clean, spacious, polished, calm, premium, and easy to scan.

It should NOT feel like:
- a dense admin dashboard
- a default shadcn demo
- a cluttered ERP tool
- a template SaaS UI
- a tiny-text data grid app

The UI should feel:
- bigger
- cleaner
- more breathable
- more premium
- more visual
- more intentional

Think:
- Linear for polish
- Ramp for clean product surfaces
- Vercel / modern AI tools for spaciousness
- a startup product that makes boring operations feel premium

## Core design principles

1. Default to spacious over dense.
2. Use fewer things on screen at once.
3. Make important cards, metrics, actions, and sections visually larger.
4. Prefer strong hierarchy over cramming information.
5. Use generous padding and spacing.
6. Use large, clean headings where appropriate.
7. Make buttons and inputs feel beautiful, not tiny or generic.
8. Keep surfaces simple and premium.
9. Use color sparingly and intelligently.
10. Make the interface feel calm, not busy.

## Layout direction

The current app should be redesigned away from “tight dashboard density.”

Target layout characteristics:
- page max width should feel generous
- use more whitespace between major sections
- avoid cramming too many cards side by side
- prefer 1-column or 2-column layouts over busy 3-4 column grids unless truly needed
- cards can be larger and more breathable
- tables should not dominate every screen
- important summary content should appear in large polished cards before dense data
- each page should have a clear visual focal point

Each page should feel like:
- top summary / hero area
- primary action row
- key content blocks
- secondary details below

## Typography

Typography should be larger and cleaner than the current version.

Guidelines:
- headings should be confidently sized and visually important
- body text should remain clean and readable
- labels and helper text should not feel tiny
- avoid overly compact text sizing
- use strong type hierarchy between page title, section heading, card title, body, and metadata
- prefer fewer text styles with stronger consistency

Desired feel:
- modern startup UI
- elegant sans-serif
- readable
- premium
- slightly bold where needed
- not enterprise-tiny

## Color system

The current colors should be replaced.

Target color direction:
- clean light theme
- very soft neutral background
- white / near-white cards
- subtle borders
- dark charcoal text
- one tasteful accent color

Recommended palette direction:
- background: soft cool off-white, slightly gray-blue or neutral
- cards: white / very light surface
- primary text: dark charcoal, not pure black
- secondary text: muted slate-gray
- borders: subtle cool gray
- primary accent: refined blue or blue-violet OR a clean desaturated indigo
- success: calm green
- warning: soft amber
- destructive: refined red

Important:
- do not use muddy or ugly colors
- do not use oversaturated default Tailwind-looking colors
- do not use too many accent colors
- avoid purple-glow AI slop aesthetics
- keep the palette premium and restrained

## Buttons

Buttons are currently too generic if they look like default shadcn.

Buttons should feel:
- clean
- slightly larger
- premium
- rounded but not cartoonish
- high-quality spacing
- strong hover/focus states
- easy to tap/click

Primary button:
- beautiful filled surface
- strong contrast
- premium hover state
- not neon, not loud

Secondary / ghost buttons:
- subtle but intentional
- should not disappear into the page
- should still feel designed

## Inputs and form controls

Inputs, selects, filters, and textareas should feel bigger, cleaner, and calmer.

Guidelines:
- slightly taller controls
- more internal padding
- cleaner placeholder styling
- subtle borders
- better focus states
- avoid tiny cramped controls
- use spacing so forms feel premium, not cramped

Receipts and reimbursement flows especially should feel guided and modern rather than like raw internal tooling.

## Cards and surfaces

Cards should be a major strength of the UI.

Guidelines:
- medium to large radius
- soft but crisp borders
- light shadow only where it helps
- generous padding
- clear hierarchy inside the card
- avoid noisy content packing
- use larger featured cards for important summaries or actions

Cards should not all look identical.
There should be hierarchy:
- hero/summary cards
- standard content cards
- compact utility cards

## Tables and data display

This app will always have inventory data, but the UI should not feel like “just a table app.”

Guidelines:
- reduce visual harshness of tables
- increase row breathing room
- improve column alignment and spacing
- make headers cleaner
- use better empty states and filtering controls
- where possible, break dense table-heavy pages into:
  - summary cards
  - toolbar / actions
  - filters
  - then data
- use cards, grouped rows, or detail panels when helpful
- do not let huge ugly tables dominate every view

## Navigation

Navigation should feel modern and polished.

Guidelines:
- cleaner sidebar or top nav
- better spacing around menu items
- active state should feel premium
- icons should be subtle and consistent
- avoid cramped nav lists
- nav should support a clean product feel, not an old admin template feel

## Dashboard page

The dashboard should not be a tiny stat-card grid.

It should feel like:
- a strong welcome / overview area
- large summary cards
- key operational metrics with breathing room
- recent activity in a beautiful card or panel
- quick actions in a way that feels premium
- a modern command-center vibe, but calm and not dense

Avoid:
- tiny KPI tiles
- too many metrics at once
- generic dashboard templates

## Receipt section

The receipt workflow is a major feature and should feel modern and polished.

It should feel like:
- upload and scan in a guided, premium way
- clear status states
- beautiful preview surfaces
- large dropzones/cards where appropriate
- extracted information presented cleanly
- reimbursement workflow should feel trustworthy and easy

Avoid:
- tiny file upload controls
- cluttered metadata walls
- cramped review layouts

## Inventory section

Inventory management should feel clear and powerful without being ugly or overly dense.

It should feel like:
- clear page heading and action area
- summary at top
- elegant filter/search row
- data presented cleanly
- item detail / edit interactions that feel polished
- cards + tables used with hierarchy, not just endless rows

## Motion and polish

Use subtle motion only where it increases quality.

Allowed:
- soft hover transitions
- polished focus states
- gentle card elevation changes
- tasteful page/section transitions
- subtle loading/skeleton states

Avoid:
- flashy gimmicks
- constant animations
- glowing blobs
- excessive motion
- anything that makes the product feel unserious

## Density rule

When in doubt, make it less dense.

If a screen feels crowded:
- reduce the amount shown
- increase spacing
- increase card size
- group information better
- create hierarchy instead of shrinking everything

## Final visual target

The final product should feel like:
- a premium modern startup operations tool
- clean enough to impress someone immediately
- simple enough to understand quickly
- polished enough that the UI itself feels like a product advantage

The final UI should be:
- beautiful
- calm
- premium
- modern
- spacious
- easy to scan
- not cluttered
- not tiny
- not ugly
- not generic shadcn