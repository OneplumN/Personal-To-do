# Floating Today Step Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a desktop floating window for Yibu that lets users review and advance today's work without opening the full workspace.

**Architecture:** Add a second Tauri window named `today-step` that shares the existing React app, routes, stores, and SQLite data. Keep business logic in shared React modules; keep window creation, global shortcut, always-on-top behavior, and tray integration in `src-tauri` or `src/lib/desktop`.

**Tech Stack:** React 19, TypeScript, Zustand, Tauri 2, SQLite storage adapter, Vitest, Testing Library.

---

## Product Scope

The floating window is not a mini version of the whole app. It is a high-frequency execution surface.

Primary jobs:

- See the current Today focus list.
- Complete or advance a focused task.
- Check or uncheck short checklist items.
- Capture a quick task into a default place.
- Open the full Yibu window at the selected task or project.

Non-goals for the first release:

- Full project management.
- AI report configuration.
- Settings editing.
- Multi-project board views.
- Complex task body editing.

## Release Phases

### Phase 1: Today Focus Viewer

Ship a compact always-on-top window that shows today's focus tasks and opens the main app for deeper editing.

Success criteria:

- User can open a small floating window from desktop.
- Window shows the same Today focus data as the main app.
- User can complete a focused task or open it in the main window.
- Window has no demo data in production.

### Phase 2: Today Capture

Add a single-line input for quickly creating a task.

Success criteria:

- User can type a title and press Enter to create a task.
- Task lands in a predictable default project or Inbox.
- Esc clears or closes without creating.
- Created task appears in the main app without restart.

### Phase 3: Lightweight Execution

Add checklist and status actions directly inside the floating window.

Success criteria:

- User can toggle up to three visible checklist items per task.
- User can advance `todo -> in_progress -> done`.
- Changes sync with the main window.

### Phase 4: Desktop Polish

Add global shortcut, tray menu, pin/auto-hide behavior, and launch behavior.

Success criteria:

- User can toggle the floating window with a shortcut.
- Tray menu can open main window or floating window.
- Floating window can be pinned or dismissed.
- Shortcut and tray behavior are covered by tests or manual release checklist.

---

## Tasklist

### Task 1: Define Floating Window Route

**Files:**
- Modify: `src/app/App.tsx`
- Create: `src/features/todayStep/TodayStepPage.tsx`
- Test: `src/tests/todayStep.test.tsx`

**Step 1: Add failing route test**

Create a test that renders `/today-step` and expects a compact heading:

```tsx
expect(screen.getByRole("heading", { name: "Today Step" })).toBeInTheDocument();
```

**Step 2: Run the test**

Run:

```bash
npm test -- --run src/tests/todayStep.test.tsx
```

Expected: fail because the route/page does not exist.

**Step 3: Add route and page shell**

Create `TodayStepPage` with a compact layout and no settings/report/project management controls.

**Step 4: Run the test again**

Run:

```bash
npm test -- --run src/tests/todayStep.test.tsx
```

Expected: pass.

**Step 5: Commit**

```bash
git add src/app/App.tsx src/features/todayStep/TodayStepPage.tsx src/tests/todayStep.test.tsx
git commit -m "feat: add today step route shell"
```

### Task 2: Render Today Focus In Today Step

**Files:**
- Modify: `src/features/todayStep/TodayStepPage.tsx`
- Reuse: `src/features/focus/focusStore.ts`
- Reuse: `src/features/tasks/taskStore.ts`
- Test: `src/tests/todayStep.test.tsx`

**Step 1: Write focus rendering test**

Seed a project, task, and focus reference. Render `/today-step`. Assert the focused task title appears and non-focused tasks do not dominate the view.

**Step 2: Implement data loading**

Use existing stores and repositories. Keep the view capped to a small number of focus items, ideally 3 to 5.

**Step 3: Add empty state**

Show a quiet empty state when there are no focus tasks:

```text
No focus tasks.
```

**Step 4: Run tests**

```bash
npm test -- --run src/tests/todayStep.test.tsx
```

**Step 5: Commit**

```bash
git add src/features/todayStep/TodayStepPage.tsx src/tests/todayStep.test.tsx
git commit -m "feat: show today focus in today step"
```

### Task 3: Add Minimal Floating Window Styling

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/features/todayStep/TodayStepPage.tsx`
- Test: `src/tests/todayStep.test.tsx`

**Step 1: Add layout constraints**

Design for a 360-420px floating window:

- No large hero layout.
- No nested cards.
- Stable row heights.
- One-line task titles where possible.
- Warm paper-like background consistent with current app.

**Step 2: Add accessibility assertions**

Ensure icon-only controls have `aria-label`.

**Step 3: Run tests and build**

```bash
npm test -- --run src/tests/todayStep.test.tsx
npm run build
```

**Step 4: Commit**

```bash
git add src/styles/global.css src/features/todayStep/TodayStepPage.tsx src/tests/todayStep.test.tsx
git commit -m "style: design compact today step window"
```

### Task 4: Create Tauri Today-Step Window

**Files:**
- Modify: `src-tauri/src/lib.rs`
- Modify: `src-tauri/tauri.conf.json`
- Test: manual desktop run

**Step 1: Add second window definition**

Add a Tauri window label such as `today-step`, with:

- small width and height
- always on top
- hidden by default if feasible
- route URL `/today-step`

**Step 2: Verify app starts**

Run:

```bash
npm run tauri:dev
```

Expected: main app still opens normally. Today Step window can be created or shown without breaking the main window.

**Step 3: Manual test**

Check:

- Main window still loads data.
- Today Step window shows the same focus data.
- Closing today step window does not close main app unless intended.

**Step 4: Commit**

```bash
git add src-tauri/src/lib.rs src-tauri/tauri.conf.json
git commit -m "feat: add desktop today step window"
```

### Task 5: Open Main Window From Today Step

**Files:**
- Create or modify: `src/lib/desktop/windowCommands.ts`
- Modify: `src/features/todayStep/TodayStepPage.tsx`
- Test: `src/tests/todayStep.test.tsx`

**Step 1: Add button behavior test**

In web/test mode, clicking `Open Yibu` should be safe and not throw.

**Step 2: Implement desktop-aware open command**

Use a runtime guard so Web builds do not call Tauri APIs.

**Step 3: Add buttons**

Each task row may include:

- Complete
- Open in Yibu

**Step 4: Run checks**

```bash
npm run check
npm test -- --run src/tests/todayStep.test.tsx
```

**Step 5: Commit**

```bash
git add src/lib/desktop/windowCommands.ts src/features/todayStep/TodayStepPage.tsx src/tests/todayStep.test.tsx
git commit -m "feat: open main app from today step"
```

### Task 6: Add Task Completion Action

**Files:**
- Modify: `src/features/todayStep/TodayStepPage.tsx`
- Reuse: `src/features/tasks/taskStore.ts`
- Test: `src/tests/todayStep.test.tsx`

**Step 1: Write completion test**

Render a focused `in_progress` or `todo` task. Click Complete. Assert the task store updates to `done`.

**Step 2: Implement complete action**

Use existing store methods rather than duplicating persistence logic.

**Step 3: Refresh focus view**

Decide whether completed tasks remain visible briefly or disappear immediately. Prefer disappearing after successful completion for Phase 1.

**Step 4: Run tests**

```bash
npm test -- --run src/tests/todayStep.test.tsx
```

**Step 5: Commit**

```bash
git add src/features/todayStep/TodayStepPage.tsx src/tests/todayStep.test.tsx
git commit -m "feat: complete focused tasks from today step"
```

### Task 7: Add Today Capture

**Files:**
- Modify: `src/features/todayStep/TodayStepPage.tsx`
- Reuse or modify: `src/features/projects/projectStore.ts`
- Reuse or modify: `src/features/tasks/taskStore.ts`
- Test: `src/tests/todayStep.test.tsx`

**Step 1: Decide default destination**

Use one of:

- first existing project
- a dedicated Inbox project
- last active project

For the first implementation, prefer an Inbox only if the domain model already supports it cleanly. Otherwise use the first project and show clear empty state if no project exists.

**Step 2: Write today capture test**

Type `Follow up with design` into the quick input. Press Enter. Assert a task is created.

**Step 3: Implement input behavior**

- Enter creates.
- Esc clears.
- Empty input does nothing.

**Step 4: Run tests**

```bash
npm test -- --run src/tests/todayStep.test.tsx
```

**Step 5: Commit**

```bash
git add src/features/todayStep/TodayStepPage.tsx src/tests/todayStep.test.tsx
git commit -m "feat: capture tasks from today step"
```

### Task 8: Add Global Shortcut And Tray Entry

**Files:**
- Modify: `src-tauri/Cargo.toml`
- Modify: `src-tauri/src/lib.rs`
- Modify: `src-tauri/capabilities/default.json`
- Test: manual desktop run

**Step 1: Add needed Tauri plugins**

Investigate current Tauri plugin availability before adding dependencies:

```bash
npm info @tauri-apps/plugin-global-shortcut version
npm info @tauri-apps/plugin-opener version
```

**Step 2: Register shortcut**

Candidate shortcut:

```text
CmdOrCtrl+Shift+Space
```

**Step 3: Add tray menu**

Menu items:

- Open Yibu
- Today Step
- Quit

**Step 4: Manual test**

Run:

```bash
npm run tauri:dev
```

Check shortcut and tray behavior on macOS.

**Step 5: Commit**

```bash
git add package.json package-lock.json src-tauri/Cargo.toml src-tauri/src/lib.rs src-tauri/capabilities/default.json
git commit -m "feat: add today step shortcut and tray"
```

### Task 9: Verify Production Build Has No Demo Data

**Files:**
- No source files expected unless failure is found.

**Step 1: Build web and desktop**

```bash
npm run build
npm run tauri:build
```

**Step 2: Check for demo strings**

```bash
for value in "产品体验收敛" "品牌升级" "复核焦点卡片结构" "确认 DEV 自动 seed" "demoSnapshot"; do
  grep -R -F "$value" dist src-tauri/target 2>/dev/null && exit 1
done
```

Expected: no matches.

**Step 3: Commit if fixes were needed**

```bash
git status --short
```

If clean, no commit needed.

### Task 10: Release Checklist

**Files:**
- Modify: `README.md`
- Optional: `docs/plans/2026-05-12-floating-today-step.md`

**Step 1: Update README**

Document:

- Today Step purpose.
- Shortcut.
- Desktop-only status.
- Web behavior if `/today-step` is opened in browser.

**Step 2: Run full verification**

```bash
npm run check
npm test -- --run
npm run build
npm run tauri:build
```

**Step 3: Commit**

```bash
git add README.md docs/plans/2026-05-12-floating-today-step.md
git commit -m "docs: plan today step floating window"
```

---

## Platform Boundary Notes

Shared with Web:

- `TodayStepPage`
- focus/task rendering
- store-level actions
- tests for route and data behavior

Desktop-only:

- always-on-top window
- global shortcut
- tray
- window positioning
- SQLite-backed persistence

Web fallback:

- `/today-step` can render as a compact web route for development and testing.
- Web should not attempt Tauri window commands.

## Open Decisions

- Should the floating window be hidden by default or launched at startup?
- Should completed focus tasks disappear immediately or stay with a success state?
- Should today capture create into Inbox, first project, or last active project?
- Should Today Step be English-only internally, consistent with the app shell?

## Recommended First Slice

Start with Tasks 1-4 only:

1. Add `/today-step` route.
2. Render Today focus.
3. Style compact floating layout.
4. Create a Tauri today step window.

This proves the product shape without overcommitting to shortcut, tray, or capture behavior too early.
