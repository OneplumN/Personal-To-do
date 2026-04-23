# Interaction Refinement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor the highest-friction interactions in Personal-To-do so the product supports daily work with lower effort and clearer summary-layer controls.

**Architecture:** The refinement keeps the existing product objects but changes interaction hierarchy. Today Focus becomes an actionable list, Project Workspace becomes board-first with list-like task items inside status columns, and Settings becomes a right-side drawer with fixed header and footer controls.

**Tech Stack:** React, TypeScript, Vite, Zustand, IndexedDB, Vitest, React Testing Library, MCP browser validation

---

## Execution Checklists

1. [2026-04-23-checklist-01-focus-list.md](./2026-04-23-checklist-01-focus-list.md)
2. [2026-04-23-checklist-02-project-workspace-board.md](./2026-04-23-checklist-02-project-workspace-board.md)
3. [2026-04-23-checklist-03-settings-drawer.md](./2026-04-23-checklist-03-settings-drawer.md)

Recommended order:
- Checklist 01
- Checklist 02
- Checklist 03

### Task 1: Refine the domain for priority and summary-layer controls

**Files:**
- Modify: `src/types/task.ts`
- Modify: `src/lib/constants.ts`
- Modify: `src/features/tasks/taskStore.ts`
- Test: `src/tests/domain.test.ts`
- Test: `src/tests/stores.test.ts`

**Step 1: Write the failing test**

Add tests for task priority levels and store-level priority updates.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/domain.test.ts src/tests/stores.test.ts`
Expected: FAIL because priority is not yet modeled.

**Step 3: Write minimal implementation**

Add priority to tasks with levels:
- `normal`
- `important`
- `urgent`

Expose store actions that allow summary-layer priority changes.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/domain.test.ts src/tests/stores.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/types/task.ts src/lib/constants.ts src/features/tasks/taskStore.ts src/tests/domain.test.ts src/tests/stores.test.ts
git commit -m "feat: add task priority model"
```

### Task 2: Build Today Focus as an actionable list

**Files:**
- Modify: `src/components/focus/FocusList.tsx`
- Modify: `src/features/home/HomePage.tsx`
- Test: `src/tests/home.test.tsx`

**Step 1: Write the failing test**

Cover:
- status buttons render instead of a select
- priority can be changed from the row
- remove-from-focus remains available

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/home.test.tsx`
Expected: FAIL because Today Focus still uses the old interaction model.

**Step 3: Write minimal implementation**

Refactor Today Focus into a compact row list with:
- project name
- title
- recent update
- priority control
- status buttons
- open / remove actions

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/home.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/focus/FocusList.tsx src/features/home/HomePage.tsx src/tests/home.test.tsx
git commit -m "feat: redesign today focus as actionable list"
```

### Task 3: Make Project Workspace board-first

**Files:**
- Modify: `src/features/projects/ProjectWorkspacePage.tsx`
- Modify: `src/components/tasks/TaskBoardView.tsx`
- Modify: `src/components/tasks/TaskWorkspaceHeader.tsx`
- Possibly delete or demote: `src/components/tasks/TaskListView.tsx`
- Test: `src/tests/projectWorkspace.test.tsx`

**Step 1: Write the failing test**

Cover:
- board is the main workspace
- list/board toggle is removed or no longer primary
- task summaries in columns expose direct controls

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/projectWorkspace.test.tsx`
Expected: FAIL because the old toggle model still exists.

**Step 3: Write minimal implementation**

Refactor Project Workspace so the main surface is a four-column board, while each item remains list-like and scan-friendly. Add direct summary-layer controls for status, priority, and Today Focus.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/projectWorkspace.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/projects/ProjectWorkspacePage.tsx src/components/tasks/TaskBoardView.tsx src/components/tasks/TaskWorkspaceHeader.tsx src/components/tasks/TaskListView.tsx src/tests/projectWorkspace.test.tsx
git commit -m "feat: make project workspace board-first"
```

### Task 4: Replace Settings modal with a right-side drawer

**Files:**
- Modify: `src/features/settings/SettingsDialog.tsx`
- Modify: `src/components/common/Modal.tsx` or replace it with a drawer-specific surface
- Modify: `src/app/App.tsx`
- Modify: `src/styles/global.css`
- Test: `src/tests/preferences.test.tsx`

**Step 1: Write the failing test**

Cover:
- settings open
- settings close
- fixed actions still available after scroll-sensitive layout changes

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/preferences.test.tsx`
Expected: FAIL because settings still use the old modal interaction.

**Step 3: Write minimal implementation**

Refactor settings into a right-side drawer with:
- fixed header
- fixed footer actions
- scrollable content
- overlay close
- `Esc` close

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/preferences.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/settings/SettingsDialog.tsx src/components/common/Modal.tsx src/app/App.tsx src/styles/global.css src/tests/preferences.test.tsx
git commit -m "feat: redesign settings as drawer"
```

### Task 5: Full verification

**Files:**
- Test: existing automated suite

**Step 1: Run full tests**

Run: `npm test`
Expected: PASS

**Step 2: Run type checks**

Run: `npm run check`
Expected: PASS

**Step 3: Run production build**

Run: `npm run build`
Expected: PASS

**Step 4: Run MCP browser simulation**

Verify in browser:
- Today Focus list actions
- Project Workspace summary-layer controls
- Settings drawer open/close/scroll behavior

**Step 5: Commit**

```bash
git commit --allow-empty -m "test: verify interaction refinement round"
```
