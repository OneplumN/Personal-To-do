# Checklist 03: Home and Project Workspace

## Scope
- build Home as `Today Focus + Project Overview`
- build Project Workspace as `summary + task workspace`
- support list / board switching in project context

## Ownership
- `src/components/focus/FocusList.tsx`
- `src/components/projects/ProjectCard.tsx`
- `src/features/home/HomePage.tsx`
- `src/features/projects/ProjectWorkspacePage.tsx`
- `src/components/tasks/TaskListView.tsx`
- `src/components/tasks/TaskBoardView.tsx`
- `src/components/tasks/TaskWorkspaceHeader.tsx`
- `src/app/App.tsx`
- `src/tests/home.test.tsx`
- `src/tests/projectWorkspace.test.tsx`

## Checklist
- [ ] Build the Home page with a Today Focus section at the top
- [ ] Make Today Focus show referenced tasks with project name, title, status, and updated time
- [ ] Build project cards showing project name, progress, in-progress count, and latest completed task
- [ ] Add manual project creation entry point on Home
- [ ] Build Project Workspace with project summary and quick metrics
- [ ] Build task workspace toggle for `list / board`
- [ ] Ensure Project Workspace is a workbench, not a pure kanban page
- [ ] Add Home page tests
- [ ] Add Project Workspace tests
- [ ] Run both test files and make them pass

## Definition of Done
- Home visually matches the approved information hierarchy
- Project cards communicate project state at a glance
- Project Workspace supports both task views
- Home and Project Workspace tests pass

## Notes for Subagent
- Use placeholders if a later checklist owns deeper task-detail behavior
- Do not implement report generation here

