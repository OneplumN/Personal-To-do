# Frontend Local-First Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the placeholder repository with a single-user local-first frontend implementation of Personal-To-do.

**Architecture:** The app will be rebuilt as a React + TypeScript + Vite SPA. A root-level `DESIGN.md` defines the visual system first, browser persistence is isolated behind storage repositories, UI state lives in Zustand stores, and backup/restore uses a versioned JSON snapshot format.

**Tech Stack:** React, TypeScript, Vite, Zustand, IndexedDB, localStorage, Vitest, React Testing Library

---

### Task 1: Create the Design System Contract

**Files:**
- Create: `DESIGN.md`
- Modify: `README.md`

**Step 1: Write the failing design checklist**

Create a checklist that verifies the project has explicit guidance for:
- visual theme
- semantic colors
- typography
- component styling
- motion
- responsive behavior

**Step 2: Run the verification**

Run: `rg -n "Visual Theme|Color Palette|Typography|Component|Responsive|Agent Prompt" DESIGN.md`
Expected: FAIL because `DESIGN.md` does not exist yet.

**Step 3: Write minimal implementation**

Add a root-level `DESIGN.md` describing the approved Desk Journal direction: warm paper surfaces, precise hierarchy, semantic kanban colors, restrained utility panels, and archival completed-state treatment.

**Step 4: Run verification to confirm it passes**

Run: `rg -n "Visual Theme|Color Palette|Typography|Component|Responsive|Agent Prompt" DESIGN.md`
Expected: PASS

**Step 5: Commit**

```bash
git add DESIGN.md README.md
git commit -m "docs: add project design system contract"
```

### Task 2: Bootstrap Project Tooling

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `.gitignore`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/app/App.tsx`
- Create: `src/styles/global.css`

**Step 1: Write the failing bootstrap check**

Create a minimal smoke test file at `src/tests/bootstrap.test.ts` that imports the app entry and asserts the app shell title renders.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/bootstrap.test.ts`
Expected: FAIL because the frontend toolchain and files do not exist yet.

**Step 3: Write minimal implementation**

Initialize the Vite app structure, set up React + TypeScript scripts, and create a minimal app shell that renders `Personal To-do`.

**Step 4: Run test to verify it passes**

Run: `npm install && npm test -- src/tests/bootstrap.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add package.json tsconfig.json tsconfig.node.json vite.config.ts .gitignore index.html src
git commit -m "feat: bootstrap local-first frontend app"
```

### Task 3: Define Domain Types and Constants

**Files:**
- Create: `src/types/task.ts`
- Create: `src/types/preferences.ts`
- Create: `src/lib/constants.ts`
- Test: `src/tests/domain.test.ts`

**Step 1: Write the failing test**

Add tests that validate the allowed task columns, statuses, and default lane colors.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/domain.test.ts`
Expected: FAIL because domain modules do not exist.

**Step 3: Write minimal implementation**

Create typed domain definitions that mirror the approved design and expose default values in constants.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/domain.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/types src/lib/constants.ts src/tests/domain.test.ts
git commit -m "feat: add domain model definitions"
```

### Task 4: Implement Local Persistence Layer

**Files:**
- Create: `src/lib/storage/db.ts`
- Create: `src/lib/storage/taskRepository.ts`
- Create: `src/lib/storage/preferenceRepository.ts`
- Test: `src/tests/storage.test.ts`

**Step 1: Write the failing test**

Add tests for storing, loading, updating, and replacing tasks plus reading and writing preferences.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/storage.test.ts`
Expected: FAIL because repository modules are missing.

**Step 3: Write minimal implementation**

Implement repository modules with `IndexedDB` for tasks and a simple persistence strategy for preferences. Keep browser APIs wrapped so UI code never touches storage directly.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/storage.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/storage src/tests/storage.test.ts
git commit -m "feat: add browser persistence repositories"
```

### Task 5: Build Task Store and Task Actions

**Files:**
- Create: `src/features/tasks/taskStore.ts`
- Create: `src/features/tasks/taskSelectors.ts`
- Test: `src/tests/taskStore.test.ts`

**Step 1: Write the failing test**

Cover create, update, delete, promote, regress, and status cycling behavior.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/taskStore.test.ts`
Expected: FAIL because the store does not exist.

**Step 3: Write minimal implementation**

Build a Zustand store that uses the task repository and keeps all task transitions inside store actions rather than UI components.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/taskStore.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/tasks src/tests/taskStore.test.ts
git commit -m "feat: add local task state management"
```

### Task 6: Build Preferences and Settings Store

**Files:**
- Create: `src/features/preferences/preferenceStore.ts`
- Create: `src/features/settings/SettingsDialog.tsx`
- Test: `src/tests/preferences.test.ts`

**Step 1: Write the failing test**

Test theme persistence, lane color updates, and AI settings persistence.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/preferences.test.ts`
Expected: FAIL because preference state modules do not exist.

**Step 3: Write minimal implementation**

Add a preferences store and a basic settings dialog wired to the preference repository.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/preferences.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/preferences src/features/settings src/tests/preferences.test.ts
git commit -m "feat: add local preferences and settings"
```

### Task 7: Build the Kanban UI

**Files:**
- Create: `src/components/TaskCard.tsx`
- Create: `src/components/TaskComposer.tsx`
- Create: `src/components/BoardColumn.tsx`
- Modify: `src/app/App.tsx`
- Test: `src/tests/board.test.tsx`

**Step 1: Write the failing test**

Cover rendering empty columns, adding a task, editing a task, and moving a task forward or backward.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/board.test.tsx`
Expected: FAIL because the board UI is not implemented.

**Step 3: Write minimal implementation**

Implement a usable three-column board with task creation, detail editing, and status controls. Reproduce current behavior before polishing appearance.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/board.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components src/app/App.tsx src/tests/board.test.tsx
git commit -m "feat: build local kanban board interface"
```

### Task 8: Add JSON Export and Import

**Files:**
- Create: `src/lib/export/exportSnapshot.ts`
- Create: `src/lib/import/importSnapshot.ts`
- Create: `src/features/settings/ImportExportPanel.tsx`
- Test: `src/tests/importExport.test.ts`

**Step 1: Write the failing test**

Cover export shape, invalid import rejection, and replace-style import.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/importExport.test.ts`
Expected: FAIL because export/import modules do not exist.

**Step 3: Write minimal implementation**

Implement versioned snapshot export and replace-only import with validation before write.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/importExport.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/export src/lib/import src/features/settings/ImportExportPanel.tsx src/tests/importExport.test.ts
git commit -m "feat: add local backup and restore support"
```

### Task 9: Re-introduce Optional AI Summaries

**Files:**
- Create: `src/lib/ai/polishCompletedTasks.ts`
- Modify: `src/features/settings/SettingsDialog.tsx`
- Modify: `src/app/App.tsx`
- Test: `src/tests/ai.test.ts`

**Step 1: Write the failing test**

Cover missing config behavior, request payload shape, and graceful error handling.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/ai.test.ts`
Expected: FAIL because the AI module does not exist.

**Step 3: Write minimal implementation**

Add a small AI client that reads local settings and only runs when the user explicitly requests summarization.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/ai.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/ai src/features/settings/SettingsDialog.tsx src/app/App.tsx src/tests/ai.test.ts
git commit -m "feat: restore optional AI summarization"
```

### Task 10: Final Cleanup and Documentation

**Files:**
- Modify: `README.md`
- Create: `docs/backup-and-restore.md`

**Step 1: Write the failing documentation checklist**

Create a checklist of required README sections: setup, local development, storage behavior, import/export, AI security note.

**Step 2: Run the verification**

Run: `rg -n \"Setup|Development|Import|Export|AI\" README.md docs/backup-and-restore.md`
Expected: missing sections before documentation update.

**Step 3: Write minimal implementation**

Document how to run the app, where data lives, how to export and import backups, and the local AI key tradeoff.

**Step 4: Run verification to confirm coverage**

Run: `rg -n \"Setup|Development|Import|Export|AI\" README.md docs/backup-and-restore.md`
Expected: matching sections found.

**Step 5: Commit**

```bash
git add README.md docs/backup-and-restore.md
git commit -m "docs: add local-first usage documentation"
```
