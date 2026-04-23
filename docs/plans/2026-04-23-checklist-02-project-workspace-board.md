# Checklist 02: Board-First Project Workspace

## Scope
- remove the old list/board split as the main interaction
- make the board the primary workspace
- keep task entries list-like inside each status column

## Ownership
- `src/features/projects/ProjectWorkspacePage.tsx`
- `src/components/tasks/TaskBoardView.tsx`
- `src/components/tasks/TaskWorkspaceHeader.tsx`
- `src/components/tasks/TaskListView.tsx` if retained or removed
- `src/tests/projectWorkspace.test.tsx`

## Checklist
- [ ] Make the board the default and primary task workspace
- [ ] Represent each task as a compact task row inside a column
- [ ] Add summary-layer quick actions for status and priority
- [ ] Add add/remove Today Focus action at task summary level
- [ ] Keep open-detail action available
- [ ] Ensure new task entry still feels local to the board
- [ ] Update workspace tests for the new interaction model

## Definition of Done
- Users can manage most task progress without opening task detail
- status distribution remains visible at all times
- project workspace tests pass

