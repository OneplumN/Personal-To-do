# Checklist 04: Task Detail and Completion Flow

## Scope
- build the task record surface
- support checklist editing
- support lightweight progress log appends
- route completion through a wrap-up dialog

## Ownership
- `src/components/tasks/TaskDetailPanel.tsx`
- `src/components/tasks/ChecklistEditor.tsx`
- `src/components/tasks/ProgressLogEditor.tsx`
- `src/components/tasks/TaskCompletionDialog.tsx`
- related task-detail integration points in project workspace or app shell
- `src/tests/taskDetail.test.tsx`

## Checklist
- [ ] Build task detail panel with title and body editing
- [ ] Build checklist editing interactions
- [ ] Build progress/change log append flow with automatic timestamps
- [ ] Add Today Focus toggle inside task detail
- [ ] Build the completion wrap-up dialog
- [ ] Persist completion summary, key changes, and notes to the task record
- [ ] Ensure marking done does not bypass the wrap-up flow
- [ ] Add tests for task detail interactions
- [ ] Add tests for completion wrap-up behavior
- [ ] Run task detail tests and make them pass

## Definition of Done
- A task can hold real working context, not only status
- Progress notes are easy to append
- Completion produces reusable reporting material
- Task detail tests pass

## Notes for Subagent
- Keep the wrap-up dialog short and practical
- Do not build AI behavior in this checklist

