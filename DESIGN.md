# Personal-To-do Design System

## 1. Visual Theme & Atmosphere

Personal-To-do is a **single-user, local-first desk journal for task flow**. It should feel like a calm personal workspace rather than a corporate dashboard.

The design language combines:
- **Notion-like warmth** in surfaces and reading comfort
- **Linear-like precision** in spacing, hierarchy, and interaction clarity
- **Personal kanban semantics** through strong, stable column colors

Core mood:
- warm
- deliberate
- focused
- archival
- low-noise

This UI is opened frequently and used for long sessions. It must reward repetition. Avoid novelty that becomes tiring after three days.

## 2. Color Palette & Roles

### Light Theme

| Token | Hex | Role |
|---|---|---|
| `canvas` | `#F9F6F0` | Main page background, paper tone |
| `surface` | `#FFFFFF` | Cards, modals, inputs |
| `surface-muted` | `#FFF8EC` | Soft alternate panels |
| `text-primary` | `#111928` | Main copy |
| `text-secondary` | `#30405A` | Supporting copy |
| `text-muted` | `#6B7280` | Timestamps, helper labels |
| `border-soft` | `#E7E0D4` | Default borders |
| `border-strong` | `#CBD5E1` | Focused or emphasized borders |
| `shadow-ink` | `rgba(17, 25, 40, 0.08)` | Global soft shadow tone |

### Semantic Column Colors

| Token | Hex | Role |
|---|---|---|
| `task-primary` | `#FFB347` | Task pool anchor color |
| `task-bg` | `#FFEEC5` | Task pool tinted column background |
| `doing-primary` | `#5AC8FA` | In-progress anchor color |
| `doing-bg` | `#E8F7FF` | In-progress tinted column background |
| `done-primary` | `#34D399` | Completed anchor color |
| `done-bg` | `#EAFBF3` | Completed tinted column background |

### Status Colors

| Token | Hex | Role |
|---|---|---|
| `status-normal` | `#94A3B8` | Default chip |
| `status-priority` | `#B45309` | Important / urgent attention |
| `status-waiting` | `#7D8AFF` | Blocked / waiting state |
| `danger` | `#DC2626` | Destructive actions |

### Dark Theme

Dark mode should preserve the same semantic meaning, but remain muted and readable. No neon effects.

| Token | Hex | Role |
|---|---|---|
| `canvas-dark` | `#020617` | Main dark background |
| `surface-dark` | `#111928` | Cards and overlays |
| `surface-dark-raised` | `#1F2333` | Elevated panels |
| `text-dark-primary` | `#E2E8F0` | Main text |
| `text-dark-secondary` | `#CBD5F5` | Secondary text |
| `text-dark-muted` | `#94A3B8` | Meta text |
| `border-dark` | `rgba(203, 213, 245, 0.14)` | Dark theme border |

Dark semantic backgrounds should be translucent overlays based on the column meaning, not full-saturation panels.

## 3. Typography Rules

### Font Families

- **Display / section heading:** `Bricolage Grotesque`, `Noto Serif SC`, serif
- **Body / UI text:** `Source Han Sans SC`, `PingFang SC`, `Segoe UI`, sans-serif
- **Mono / timestamps / counts:** `JetBrains Mono`, `SFMono-Regular`, monospace

The point is contrast:
- headings should feel editorial and intentional
- body text should feel stable and highly readable
- meta information should feel mechanical and quiet

### Type Hierarchy

| Usage | Size | Weight | Notes |
|---|---|---|---|
| App title | `clamp(2rem, 1.6rem + 1.2vw, 3rem)` | 700 | Short, strong, not shouty |
| Section title | `1.125rem - 1.5rem` | 650 | Column names, panel titles |
| Card title | `1rem - 1.125rem` | 600 | Primary readable content |
| Body | `0.95rem - 1rem` | 400 | Default task text |
| Meta | `0.78rem - 0.85rem` | 500 | Date, status, hints |
| Numeric / timestamp | `0.8rem - 0.9rem` | 500 | Use mono for time-based info |

Rules:
- avoid ultra-thin fonts
- avoid oversized all-caps section labels
- use tighter tracking for UI labels, not for long text
- Chinese text should not be letter-spaced aggressively

## 4. Layout Principles

### Overall Shell

- App should feel like a **personal desk**, not a SaaS admin console
- Centered main shell with generous breathing room
- Desktop max width around `1440px - 1600px`
- Page padding: `24px` mobile, `32px` tablet, `40px+` desktop

### Header

Header contains:
- current date and weekday
- app title
- lightweight utility actions: theme toggle, settings, export/import

The header should feel calm and editorial, not toolbar-heavy.

### Board

- Three columns are always the primary mental model:
  - `任务池`
  - `进行中`
  - `已完成`
- Columns should use semantic tinted surfaces, not flat white sameness
- Completed column must feel more settled and archival than the other two
- On desktop, columns sit side by side
- On mobile, columns become horizontally swipeable or stacked with strong section anchors

### Summary Zone

The completed column includes the daily / weekly / monthly summary control and result preview. This is a signature feature. It should feel like a review ritual, not a side feature.

## 5. Component Stylings

### Board Column

- Rounded, structured panel
- Tinted background derived from semantic column color
- Top area includes column label, count, and contextual actions
- Completed column can be visually calmer, slightly less saturated, more archival

### Task Card

Task cards should feel like **index cards**, not plastic SaaS tiles.

Requirements:
- soft radius (`18px - 22px`)
- subtle border
- matte surface
- light shadow with low blur
- enough vertical space for title and meta

Task card content:
- title
- optional note preview
- status chip
- updated time

Hover:
- very slight lift
- slightly stronger shadow
- no dramatic bounce

### Status Chip

- compact
- clear semantic color
- rounded pill or softened capsule
- never dominate the card

Priority should feel warm and important, not alarming.
Waiting should feel paused, not disabled.

### Icon Actions

Pure icon actions must use a shared visual language so repeated controls do not drift.

Rules:
- no filled background by default
- no border or shadow by default
- fixed button box: `28px - 32px`
- fixed icon size: `16px`
- hover changes color only, unless accessibility focus requires a subtle outline
- tooltips / `aria-label` must name the action

Semantic colors:
- close, delete, remove: mac red `#ff5f57`
- confirm, complete, add: mac green `#28c840`
- edit, view, neutral utilities: muted gray-blue from the text token

Icon meanings:
- `+` means create / open add input
- `✓` means confirm / complete
- `−` means cancel an in-progress add flow
- `×` means close, delete, or remove existing content
- pencil means edit or open a detail editor

Do not reuse `×` for canceling a temporary add input. Cancel should use `−` so it is visually distinct from destructive delete / close.

### Composer

- inline but clear
- should feel like jotting something quickly into a notebook
- input field can be softly inset into the column panel

### Task Detail Surface

Use a modal or side sheet with the feeling of an extracted note page.

Requirements:
- strong title
- comfortable note editing area
- clear metadata
- non-aggressive actions

This should feel like focusing on one card from the board, not opening a database row editor.

### Settings Surface

Settings should be a compact sheet or dialog, never a separate “admin” screen.

Sections:
- appearance
- lane colors
- import/export
- AI settings

## 6. Depth & Elevation

Use only 3 depth levels:

1. **Canvas** — page background
2. **Panel** — columns and structured containers
3. **Raised surface** — cards, dialogs, overlays

Shadows must be:
- soft
- low contrast
- layered
- quiet

Do not use:
- heavy glows
- glassmorphism blur overload
- giant floating shadows

## 7. Motion & Interaction

Motion should support rhythm, not spectacle.

Timing:
- `140ms - 220ms` for most transitions
- `240ms - 320ms` for dialogs and summary reveals

Recommended interactions:
- card hover lift by a few pixels
- column highlight during move actions
- completed-state transitions that feel archival: slight slide + fade + settle
- staggered entrance only on first page load, not on every state change

Avoid:
- elastic bounce
- dramatic parallax
- glowing pulsing states
- constant micro-animation noise

## 8. Responsive Behavior

### Mobile

- Preserve three-column mental model
- Prefer horizontal board sections or clear stacked sections with sticky labels
- Touch targets minimum `44px`
- Settings and detail views should use full-height sheets

### Tablet

- Two-column compromise is acceptable only if the third column remains clearly reachable
- Summary controls must remain visible without feeling hidden

### Desktop

- Full three-column board
- Spacious top header
- Settings and detail panels may use centered modal or side sheet depending on complexity

## 9. Do’s and Don’ts

### Do

- preserve semantic color memory for the three columns
- make the completed column feel restful and rewarding
- use calm, durable surfaces suitable for daily use
- keep hierarchy extremely clear
- let task titles dominate over decorative chrome
- design AI summary output as a polished review sheet

### Don’t

- do not make it look like a team collaboration dashboard
- do not use default purple-gradient AI aesthetics
- do not flatten all three columns into the same white cards
- do not hide the summary feature deep inside settings
- do not overload the interface with badges, counters, and toolbars
- do not make dark mode neon or cyberpunk

## 10. Agent Prompt Guide

If an AI agent builds UI for this project, it should follow these constraints:

- Build a **warm editorial personal kanban**, not a startup dashboard
- Use a **paper-like light theme** by default with precise spacing
- Preserve these semantic anchors:
  - task = warm orange
  - doing = clear blue
  - done = green
- Use **Bricolage Grotesque / Noto Serif SC** style headings, readable sans-serif body text, and monospace metadata
- Make task cards feel like index cards
- Make completed-task summaries feel ceremonial and reflective
- Prefer restraint over novelty

Short prompt:

> Design this app like a calm personal desk journal with Linear-level precision, Notion-like warmth, and strong semantic kanban colors. Avoid generic AI gradients or enterprise dashboard patterns.
