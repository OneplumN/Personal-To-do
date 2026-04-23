# Project Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build `Personal-To-do` as a project-driven local-first personal work cockpit with Today Focus and a saved AI report center.

**Architecture:** The app is a React + TypeScript + Vite SPA guided by the root `DESIGN.md`. Browser persistence is separated behind repositories, domain state lives in focused stores, and the product is structured around projects, tasks, Today Focus references, and saved reports.

**Tech Stack:** React, TypeScript, Vite, Zustand, IndexedDB, localStorage, Vitest, React Testing Library

---

## Execution Checklists

Use these checklist documents as the execution boundary for subagents:

1. [2026-04-22-checklist-01-foundation.md](./2026-04-22-checklist-01-foundation.md)
2. [2026-04-22-checklist-02-domain-and-storage.md](./2026-04-22-checklist-02-domain-and-storage.md)
3. [2026-04-22-checklist-03-home-and-project-workspace.md](./2026-04-22-checklist-03-home-and-project-workspace.md)
4. [2026-04-22-checklist-04-task-detail-and-completion.md](./2026-04-22-checklist-04-task-detail-and-completion.md)
5. [2026-04-22-checklist-05-report-center.md](./2026-04-22-checklist-05-report-center.md)

Recommended execution order:
- Checklist 01
- Checklist 02
- Checklist 03
- Checklist 04
- Checklist 05

## Interaction Refinement Round

After the first functional implementation, interaction problems were identified in three high-frequency areas:
- Today Focus
- Project Workspace
- Settings

Follow-up docs:
- [2026-04-23-interaction-refinement-design.md](./2026-04-23-interaction-refinement-design.md)
- [2026-04-23-interaction-refinement-implementation.md](./2026-04-23-interaction-refinement-implementation.md)

### Task 1: Align repository docs with the approved product model

**Files:**
- Create: `docs/plans/2026-04-22-project-dashboard-design.md`
- Create: `docs/plans/2026-04-22-project-dashboard-implementation.md`
- Modify: `README.md`

**Step 1: Write the failing doc checklist**

Create a checklist for the approved structure:
- Home = Today Focus + Project cards
- Project workspace
- Task detail with checklist and progress log
- Report Center

**Step 2: Run verification**

Run: `rg -n "Today Focus|Project Workspace|Report Center|completed tasks" docs/plans README.md`
Expected: missing or incomplete references before updates.

**Step 3: Write minimal implementation**

Document the approved product model and implementation sequence in the repository.

**Step 4: Run verification**

Run: `rg -n "Today Focus|Project Workspace|Report Center|completed tasks" docs/plans README.md`
Expected: PASS

**Step 5: Commit**

```bash
git add docs/plans README.md
git commit -m "docs: define project dashboard product model"
```

### Task 2: Bootstrap the frontend application shell

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
- Test: `src/tests/bootstrap.test.tsx`

**Step 1: Write the failing test**

Create a smoke test that renders the app shell and verifies top-level navigation includes Home and Report Center.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/bootstrap.test.tsx`
Expected: FAIL because the frontend app does not exist.

**Step 3: Write minimal implementation**

Set up the Vite + React + TypeScript app with a minimal shell and navigation placeholders for Home, Project Workspace, and Report Center.

**Step 4: Run test to verify it passes**

Run: `npm install && npm test -- src/tests/bootstrap.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add package.json tsconfig.json tsconfig.node.json vite.config.ts .gitignore index.html src
git commit -m "feat: bootstrap project dashboard frontend shell"
```

### Task 3: Define domain models for projects, tasks, focus, and reports

**Files:**
- Create: `src/types/project.ts`
- Create: `src/types/task.ts`
- Create: `src/types/report.ts`
- Create: `src/types/focus.ts`
- Create: `src/lib/constants.ts`
- Test: `src/tests/domain.test.ts`

**Step 1: Write the failing test**

Add tests for:
- project summary shape
- task statuses
- focus reference structure
- report types and source task metadata

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/domain.test.ts`
Expected: FAIL because domain files do not exist.

**Step 3: Write minimal implementation**

Create typed domain definitions matching the approved product model.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/domain.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/types src/lib/constants.ts src/tests/domain.test.ts
git commit -m "feat: define project dashboard domain models"
```

### Task 4: Implement local repositories

**Files:**
- Create: `src/lib/storage/db.ts`
- Create: `src/lib/storage/projectRepository.ts`
- Create: `src/lib/storage/taskRepository.ts`
- Create: `src/lib/storage/focusRepository.ts`
- Create: `src/lib/storage/reportRepository.ts`
- Create: `src/lib/storage/preferenceRepository.ts`
- Test: `src/tests/storage.test.ts`

**Step 1: Write the failing test**

Add tests for project CRUD, task persistence, focus references, report save/load, and preferences.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/storage.test.ts`
Expected: FAIL because the repositories do not exist.

**Step 3: Write minimal implementation**

Implement browser persistence with `IndexedDB` and clear repository APIs. Today Focus must store task references only, not task copies.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/storage.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/storage src/tests/storage.test.ts
git commit -m "feat: add local repositories for projects tasks focus and reports"
```

### Task 5: Build project, task, focus, and report stores

**Files:**
- Create: `src/features/projects/projectStore.ts`
- Create: `src/features/tasks/taskStore.ts`
- Create: `src/features/focus/focusStore.ts`
- Create: `src/features/reports/reportStore.ts`
- Test: `src/tests/stores.test.ts`

**Step 1: Write the failing test**

Cover:
- project creation
- task creation under projects
- manual add/remove from Today Focus
- focus updates mutating the underlying task
- report save/update

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/stores.test.ts`
Expected: FAIL because the stores do not exist.

**Step 3: Write minimal implementation**

Create focused Zustand stores with clear responsibilities. Ensure focus items are task references and never diverge from task state.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/stores.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features src/tests/stores.test.ts
git commit -m "feat: add state management for projects focus and reports"
```

### Task 6: Build the Home dashboard

**Files:**
- Create: `src/components/focus/FocusList.tsx`
- Create: `src/components/projects/ProjectCard.tsx`
- Create: `src/features/home/HomePage.tsx`
- Modify: `src/app/App.tsx`
- Test: `src/tests/home.test.tsx`

**Step 1: Write the failing test**

Cover rendering:
- Today Focus section
- project overview cards
- manual project creation trigger

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/home.test.tsx`
Expected: FAIL because the Home dashboard is not implemented.

**Step 3: Write minimal implementation**

Build the Home page as:
- top Today Focus section
- project card grid below

Each project card should display:
- name
- progress
- in-progress count
- latest completed task

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/home.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components src/features/home src/app/App.tsx src/tests/home.test.tsx
git commit -m "feat: build home dashboard with focus and project overview"
```

### Task 7: Build the Project Workspace

**Files:**
- Create: `src/features/projects/ProjectWorkspacePage.tsx`
- Create: `src/components/tasks/TaskListView.tsx`
- Create: `src/components/tasks/TaskBoardView.tsx`
- Create: `src/components/tasks/TaskWorkspaceHeader.tsx`
- Test: `src/tests/projectWorkspace.test.tsx`

**Step 1: Write the failing test**

Cover:
- project summary render
- list/board view toggle
- task creation entry point
- project metrics display

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/projectWorkspace.test.tsx`
Expected: FAIL because the project workspace is missing.

**Step 3: Write minimal implementation**

Implement the project page with:
- summary header
- metrics
- list/board task workspace

Statuses must be `todo`, `in_progress`, `blocked`, `done`.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/projectWorkspace.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/projects src/components/tasks src/tests/projectWorkspace.test.tsx
git commit -m "feat: build project workspace"
```

### Task 8: Build Task Detail and completion wrap-up

**Files:**
- Create: `src/components/tasks/TaskDetailPanel.tsx`
- Create: `src/components/tasks/ChecklistEditor.tsx`
- Create: `src/components/tasks/ProgressLogEditor.tsx`
- Create: `src/components/tasks/TaskCompletionDialog.tsx`
- Test: `src/tests/taskDetail.test.tsx`

**Step 1: Write the failing test**

Cover:
- editing task body
- checklist interactions
- appending progress notes with automatic timestamps
- completing a task through the wrap-up dialog

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/taskDetail.test.tsx`
Expected: FAIL because task detail components do not exist.

**Step 3: Write minimal implementation**

Build task detail as the main task record surface. Completion must route through the wrap-up dialog and persist summary, key changes, and notes.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/taskDetail.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/tasks src/tests/taskDetail.test.tsx
git commit -m "feat: add task detail and completion wrap-up"
```

### Task 9: Build the Report Center and AI generation flow

**Files:**
- Create: `src/features/reports/ReportCenterPage.tsx`
- Create: `src/lib/ai/buildReportDraft.ts`
- Create: `src/lib/ai/polishReport.ts`
- Create: `src/components/reports/ReportEditor.tsx`
- Test: `src/tests/reportCenter.test.tsx`

**Step 1: Write the failing test**

Cover:
- generating a report from completed tasks only
- saving generated reports
- editing saved reports
- preserving both draft and polished content

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/reportCenter.test.tsx`
Expected: FAIL because report center components do not exist.

**Step 3: Write minimal implementation**

Build a Report Center with:
- daily / weekly / monthly generation
- completed-task filtering
- structured draft generation
- polished text generation
- saved editable report records

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/reportCenter.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/reports src/lib/ai src/components/reports src/tests/reportCenter.test.tsx
git commit -m "feat: build report center and ai reporting flow"
```

### Task 10: Final polish and usage documentation

**Files:**
- Modify: `README.md`
- Create: `docs/workflow.md`
- Create: `docs/reporting.md`

**Step 1: Write the failing doc checklist**

Confirm documentation covers:
- project creation
- Today Focus behavior
- project workspace behavior
- report generation behavior

**Step 2: Run verification**

Run: `rg -n "Today Focus|Project Workspace|Report Center|completed tasks" README.md docs/workflow.md docs/reporting.md`
Expected: FAIL before docs are added.

**Step 3: Write minimal implementation**

Document the full user workflow from project creation through task execution and report generation.

**Step 4: Run verification**

Run: `rg -n "Today Focus|Project Workspace|Report Center|completed tasks" README.md docs/workflow.md docs/reporting.md`
Expected: PASS

**Step 5: Commit**

```bash
git add README.md docs/workflow.md docs/reporting.md
git commit -m "docs: add product workflow and reporting docs"
```
