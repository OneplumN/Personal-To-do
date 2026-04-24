# Checklist 05: Task Detail Drawer

## Scope
- replace the current task detail modal with a right-side drawer
- make checklist the first and most prominent editing area
- keep body and notes secondary
- support full checklist editing operations

## Ownership
- `src/components/tasks/TaskDetailPanel.tsx`
- `src/components/tasks/ChecklistEditor.tsx`
- `src/components/common/Drawer.tsx`
- `src/features/tasks/taskStore.ts`
- `src/types/task.ts`
- `src/styles/global.css`
- `src/tests/taskDetail.test.tsx`
- `src/tests/domain.test.ts`
- `src/tests/stores.test.ts`

## Checklist
- [ ] Add task notes support
- [ ] Add checklist item edit support
- [ ] Add checklist item delete support
- [ ] Add checklist reorder support
- [ ] Replace the task detail modal with a right-side drawer
- [ ] Put priority, title, and status on the top control row
- [ ] Make checklist the primary content block
- [ ] Keep body and notes visible below checklist
- [ ] Add fixed footer `关闭 / 保存`
- [ ] Keep manual save behavior
- [ ] Update tests
- [ ] Validate in MCP browser

## Definition of Done
- task detail opens as a right drawer
- checklist is clearly the first-class interaction area
- body and notes remain available but secondary
- tests and MCP validation pass

