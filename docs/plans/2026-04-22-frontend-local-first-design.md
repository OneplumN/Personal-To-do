# Frontend Local-First Redesign

## Status
Approved for repository setup and implementation planning.

## Goal
Rebuild `Personal-To-do` as a single-user frontend application without Django, optimized for local-first usage with backup and restore support.

## Product Assumptions
- Single user only
- No login or account system
- No Django or custom backend
- Data stored in the local browser
- AI configuration may be stored locally because the app is for personal use
- Data portability is handled by JSON export and import

## Architecture
The project will become a static frontend app built with React, TypeScript, and Vite. State will live in Zustand stores, but browser persistence will be handled through a dedicated storage layer so UI state and persistence do not become tightly coupled.

Tasks and preferences will be stored locally. `IndexedDB` is the primary task store because it is more durable and extensible than `localStorage`. Preferences can also be mirrored in `localStorage` when useful for fast startup behavior such as theme bootstrapping.

## Repository Shape

```text
Personal-To-do/
  docs/plans/
  public/
  src/
    app/
    components/
    features/tasks/
    features/preferences/
    features/settings/
    lib/storage/
    lib/import/
    lib/export/
    lib/ai/
    styles/
    tests/
    types/
  package.json
  tsconfig.json
  vite.config.ts
```

This is a feature-oriented layout. `features/` owns behavior, `lib/` owns infrastructure, and `types/` owns the small shared domain model.

## Domain Model

```ts
type Task = {
  id: string
  title: string
  note: string
  columnId: 'task' | 'doing' | 'done'
  status: 'normal' | 'priority' | 'waiting'
  completed: boolean
  createdAt: string
  updatedAt: string
}

type Preferences = {
  theme: 'light' | 'dark'
  laneColors: {
    task: string
    doing: string
    done: string
  }
  aiEndpoint: string
  aiKey: string
  aiRole: string
}
```

`completed` is intentionally kept for the first iteration even though it overlaps with `columnId === 'done'`. The duplication keeps migration and export logic straightforward. It can be removed later if it becomes unnecessary.

## Persistence Strategy
- `taskRepository`: create, list, update, delete, replace all, export snapshot
- `preferenceRepository`: read and write preferences
- Primary task store: `IndexedDB`
- Optional fast boot preference mirror: `localStorage`

The UI should never read or write browser storage directly. All persistence goes through repository modules so that future changes like cloud sync or a BaaS bridge stay isolated.

## AI Strategy
AI remains optional. The app stores `aiEndpoint`, `aiKey`, and `aiRole` locally and uses them only when the user explicitly triggers task summarization.

Failure modes must be soft:
- missing config should only disable the feature
- request errors should not affect tasks
- invalid responses should surface as user-visible errors, not corrupt state

## Import and Export
Export format:

```json
{
  "version": 1,
  "exportedAt": "2026-04-22T12:00:00.000Z",
  "tasks": [],
  "preferences": {}
}
```

Import behavior for the first iteration:
- validate version and required fields
- reject malformed payloads before writing anything
- support replace-only import
- create an automatic pre-import backup in memory or downloadable form before overwrite

This avoids complex merge behavior in the first release.

## Error Handling
Three error classes matter:
- storage errors
- import/export validation errors
- AI request errors

Main task operations should always prioritize data safety over convenience. Any operation that could replace data must validate first and fail closed.

## Testing Strategy
The first iteration needs targeted coverage, not broad coverage theater.

Required tests:
- task transition behavior
- storage repository read/write behavior
- import validation and replace behavior
- export shape
- one or two critical UI flows using React Testing Library

## Delivery Phases
1. Bootstrap frontend repository and toolchain
2. Define domain types and storage repositories
3. Implement task store and task board UI
4. Implement preferences and settings
5. Implement JSON export/import
6. Re-introduce AI summarization
7. Polish UX and optional PWA support

## Non-Goals
- Multi-user support
- Server-side sync
- Hidden AI credentials
- Admin features
- Django migration compatibility beyond basic model shape reuse
