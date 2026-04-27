# Project Workspace List-First Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the project workspace into a single-screen, list-first three-column task board while leaving task detail behavior unchanged.

**Architecture:** The existing project hero stays in place, but the workspace removes `Current Push` and the done-column report ritual so the board becomes the only primary task surface. `TaskBoardView` is refactored from card-like task blocks into compact list rows, and desktop layout shifts to a viewport-locked shell with per-column scrolling and a pinned blocked subsection inside the in-progress lane.

**Tech Stack:** React, TypeScript, Zustand, CSS, Vitest, React Testing Library

---

## Execution Checklist

1. [2026-04-27-project-workspace-list-first-design.md](./2026-04-27-project-workspace-list-first-design.md)

### Task 1: Remove duplicate project-workspace sections and lock the feature scope

**Files:**
- Modify: `src/features/projects/ProjectWorkspacePage.tsx`
- Modify: `src/tests/projectWorkspace.test.tsx`

**Step 1: Write the failing test**

Cover:
- the project workspace no longer renders `当前推进`
- the project workspace no longer renders `生成日报` or `打开报告中心`
- the page still renders the hero plus the three board columns

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/projectWorkspace.test.tsx`
Expected: FAIL because the current page still renders `Current Push` and wires the report ritual into the done column.

**Step 3: Write minimal implementation**

In `src/features/projects/ProjectWorkspacePage.tsx`:
- remove `Current Push`
- remove report store imports and report-generation wiring
- stop passing `reportPanel` into `TaskBoardView`
- keep project hero, create-task header, board, and detail panel intact

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/projectWorkspace.test.tsx`
Expected: PASS with the simplified project workspace structure.

**Step 5: Commit**

```bash
git add src/features/projects/ProjectWorkspacePage.tsx src/tests/projectWorkspace.test.tsx
git commit -m "refactor: simplify project workspace to board-only layout"
```

### Task 2: Rebuild the task board as a list-first three-column surface

**Files:**
- Modify: `src/components/tasks/TaskBoardView.tsx`
- Modify: `src/tests/projectWorkspace.test.tsx`

**Step 1: Write the failing test**

Cover:
- task rows render as compact lane items with title plus one-line preview
- done rows prefer completion summary text
- blocked tasks render inside the `进行中` lane under a `阻塞中` subsection
- row actions are reduced to one lightweight state action plus detail open

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/projectWorkspace.test.tsx`
Expected: FAIL because the current board still renders heavier card blocks, multiple quick-action buttons, and the old done-column ritual behavior.

**Step 3: Write minimal implementation**

In `src/components/tasks/TaskBoardView.tsx`:
- remove `ReportRitual`
- replace the card-like row structure with a compact list-row DOM
- keep the existing status grouping logic
- pin blocked tasks as the first subsection in the in-progress lane
- keep `onOpenTask` as the detail entry and preserve one lightweight status action per row

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/projectWorkspace.test.tsx`
Expected: PASS with the new task-row structure and blocked-lane grouping.

**Step 5: Commit**

```bash
git add src/components/tasks/TaskBoardView.tsx src/tests/projectWorkspace.test.tsx
git commit -m "feat: convert project task board to list-first rows"
```

### Task 3: Enforce single-screen desktop layout with per-column scrolling

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/features/projects/ProjectWorkspacePage.tsx` if extra layout class names are needed
- Modify: `src/components/tasks/TaskBoardView.tsx` if extra shell/body class names are needed
- Modify: `src/tests/projectWorkspace.test.tsx`

**Step 1: Write the failing test**

Cover:
- the project workspace exposes the new layout hooks/classes for a single-screen board shell
- the board columns and their bodies expose stable structure for internal scrolling

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/projectWorkspace.test.tsx`
Expected: FAIL because the current workspace is still a normal stacked page without explicit single-screen board-shell structure.

**Step 3: Write minimal implementation**

In `src/styles/global.css` and related markup:
- make the desktop project workspace fit within the main surface height
- remove outer page scrolling for the desktop project workspace
- give the board area the remaining height after the hero
- allow each column body to scroll independently
- keep mobile and small-screen fallbacks stacked and page-scrollable
- reduce the visual weight of the task-workspace header and create-task controls to match the lighter board

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/projectWorkspace.test.tsx`
Expected: PASS with the updated layout hooks present in the DOM.

**Step 5: Commit**

```bash
git add src/styles/global.css src/features/projects/ProjectWorkspacePage.tsx src/components/tasks/TaskBoardView.tsx src/tests/projectWorkspace.test.tsx
git commit -m "feat: add single-screen project workspace layout"
```

### Task 4: Full verification

**Files:**
- Test: existing automated suite

**Step 1: Run targeted tests**

Run: `npm test -- src/tests/projectWorkspace.test.tsx src/tests/taskDetail.test.tsx`
Expected: PASS and confirm the task-board redesign did not break task-detail entry behavior.

**Step 2: Run full tests**

Run: `npm test`
Expected: PASS

**Step 3: Run type checks**

Run: `npm run check`
Expected: PASS

**Step 4: Run production build**

Run: `npm run build`
Expected: PASS

**Step 5: Manual browser validation**

Verify:
- project page shows only hero plus three-column task board
- desktop page stays within one screen
- columns scroll internally
- blocked subsection stays at the top of the in-progress lane
- task rows show title, one-line preview, and compact meta
- opening a task still uses the existing detail panel unchanged
