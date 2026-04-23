# Today Focus V3 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor Today Focus into a compact execution list with lightweight status control, priority badges, and swipe-first complete/remove behavior.

**Architecture:** The change is intentionally local to Today Focus plus any required task-domain support for direct completion. Rows become compact list items, status changes are handled through a segmented control that excludes `完成`, priority becomes a compact menu trigger, and swipe gestures become the primary shortcut for `完成` and `移出焦点`. The user should recover through lightweight post-action feedback, not blocking confirmation dialogs.

**Tech Stack:** React, TypeScript, Zustand, CSS interactions, Vitest, React Testing Library, MCP browser validation

---

## Execution Checklist

1. [2026-04-23-checklist-04-today-focus-v2.md](./2026-04-23-checklist-04-today-focus-v2.md)

### Task 1: Support direct completion with non-blocking recovery

**Files:**
- Modify: `src/types/task.ts`
- Modify: `src/features/tasks/taskStore.ts`
- Modify: `src/tests/stores.test.ts`
- Modify: `src/tests/domain.test.ts`

**Step 1: Write the failing test**

Cover:
- direct completion creates a usable completed task state
- direct completion still leaves the task eligible for reporting
- completion can be followed by non-blocking recovery

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/domain.test.ts src/tests/stores.test.ts`
Expected: FAIL because direct completion behavior is not explicitly supported.

**Step 3: Write minimal implementation**

Ensure status changes to `done` can happen without a blocking completion form while still creating completion metadata sufficient for reports, and expose the UI state needed for undo feedback.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/domain.test.ts src/tests/stores.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/types/task.ts src/features/tasks/taskStore.ts src/tests/domain.test.ts src/tests/stores.test.ts
git commit -m "feat: support direct completion in today focus"
```

### Task 2: Rebuild Today Focus rows around compact list behavior

**Files:**
- Modify: `src/components/focus/FocusList.tsx`
- Modify: `src/features/home/HomePage.tsx`
- Modify: `src/styles/global.css`
- Modify: `src/tests/home.test.tsx`

**Step 1: Write the failing test**

Cover:
- compact list row structure
- segmented status control excludes `完成`
- lightweight priority trigger
- row click opens detail

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/home.test.tsx`
Expected: FAIL because the current Today Focus interaction model is different.

**Step 3: Write minimal implementation**

Refactor Today Focus into:
- compact list rows
- header priority badge
- support line
- status slider row with only `待做 / 进行中 / 阻塞`
- no large visible action button cluster
- no equal-weight complete button

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/home.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/focus/FocusList.tsx src/features/home/HomePage.tsx src/styles/global.css src/tests/home.test.tsx
git commit -m "feat: rebuild today focus as execution list"
```

### Task 3: Add swipe shortcuts, undo feedback, and final validation

**Files:**
- Modify: `src/components/focus/FocusList.tsx`
- Modify: `src/styles/global.css`
- Test: `src/tests/home.test.tsx`

**Step 1: Write the failing interaction verification**

Define checks for:
- drag right preview for complete
- drag left preview for remove
- non-blocking post-action feedback exists
- fallback click controls still work

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/home.test.tsx`
Expected: FAIL or missing coverage before gesture support is added.

**Step 3: Write minimal implementation**

Add horizontal drag gesture handling with thresholds:
- right = complete
- left = remove from focus

Keep row click, status slider, and priority trigger as fallback controls.
Add lightweight undo/recovery feedback instead of confirmation dialogs.

**Step 4: Run verification**

Run:
- `npm test -- src/tests/home.test.tsx`
- `npm test`
- `npm run check`
- `npm run build`

Expected: PASS

**Step 5: MCP validation**

Verify in browser:
- row click opens detail
- priority changes from compact trigger
- clicking status segment updates state
- drag right completes task
- drag left removes task from focus
