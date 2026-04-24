# Task Detail Drawer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current task-detail modal with a checklist-first right-side drawer that supports compact task editing and manual save.

**Architecture:** The redesign keeps the current task object but shifts editing into a local draft inside a Drawer surface. The drawer owns a focused editable checklist section, secondary body and notes sections, and a fixed action footer. The old progress-log-first layout is removed from the main interaction path.

**Tech Stack:** React, TypeScript, Zustand, Vitest, React Testing Library, MCP browser validation

---

## Execution Checklist

1. [2026-04-23-checklist-05-task-detail-drawer.md](./2026-04-23-checklist-05-task-detail-drawer.md)

### Task 1: Extend the task model for drawer editing

**Files:**
- Modify: `src/types/task.ts`
- Modify: `src/features/tasks/taskStore.ts`
- Modify: `src/tests/domain.test.ts`
- Modify: `src/tests/stores.test.ts`

**Step 1: Write the failing test**

Cover:
- tasks support notes
- checklist items can be edited, deleted, and reordered

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/domain.test.ts src/tests/stores.test.ts`
Expected: FAIL because the current task model does not support the new editing operations.

**Step 3: Write minimal implementation**

Add:
- `notes` field
- checklist item update
- checklist item delete
- checklist reorder support

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/domain.test.ts src/tests/stores.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/types/task.ts src/features/tasks/taskStore.ts src/tests/domain.test.ts src/tests/stores.test.ts
git commit -m "feat: extend task model for drawer editing"
```

### Task 2: Replace modal task detail with a drawer

**Files:**
- Modify: `src/components/tasks/TaskDetailPanel.tsx`
- Modify: `src/components/common/Drawer.tsx` if needed
- Modify: `src/styles/global.css`
- Modify: `src/tests/taskDetail.test.tsx`

**Step 1: Write the failing test**

Cover:
- drawer renders instead of centered modal
- top control row contains priority, title, and status
- body and notes fields exist
- save and close actions exist in the drawer footer

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/taskDetail.test.tsx`
Expected: FAIL because the old modal structure still exists.

**Step 3: Write minimal implementation**

Refactor Task Detail into a right-side drawer with:
- top control row
- checklist-first layout
- body section
- notes section
- fixed footer actions

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/taskDetail.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/tasks/TaskDetailPanel.tsx src/components/common/Drawer.tsx src/styles/global.css src/tests/taskDetail.test.tsx
git commit -m "feat: rebuild task detail as drawer"
```

### Task 3: Build compact checklist editing interactions

**Files:**
- Modify: `src/components/tasks/ChecklistEditor.tsx`
- Modify: `src/components/tasks/TaskDetailPanel.tsx`
- Modify: `src/styles/global.css`
- Modify: `src/tests/taskDetail.test.tsx`

**Step 1: Write the failing test**

Cover:
- inline checklist text editing
- item delete
- item reorder
- add item

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/taskDetail.test.tsx`
Expected: FAIL because the current checklist editor is too limited.

**Step 3: Write minimal implementation**

Make checklist the primary compact editing area with:
- checkbox
- editable label
- delete affordance
- reorder controls or drag behavior

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/taskDetail.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/tasks/ChecklistEditor.tsx src/components/tasks/TaskDetailPanel.tsx src/styles/global.css src/tests/taskDetail.test.tsx
git commit -m "feat: upgrade checklist interactions in task drawer"
```

### Task 4: Full verification

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

**Step 4: MCP validation**

Verify in browser:
- open task from Home and Project Workspace
- drawer opens from the right
- checklist is visually dominant
- notes and body are present
- save works
- closing without save discards draft changes

