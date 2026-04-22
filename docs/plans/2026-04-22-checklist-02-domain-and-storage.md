# Checklist 02: Domain and Storage Layer

## Scope
- define the approved product domain
- implement local persistence repositories
- implement state stores for projects, tasks, focus, and reports

## Ownership
- `src/types/project.ts`
- `src/types/task.ts`
- `src/types/report.ts`
- `src/types/focus.ts`
- `src/lib/constants.ts`
- `src/lib/storage/db.ts`
- `src/lib/storage/projectRepository.ts`
- `src/lib/storage/taskRepository.ts`
- `src/lib/storage/focusRepository.ts`
- `src/lib/storage/reportRepository.ts`
- `src/lib/storage/preferenceRepository.ts`
- `src/features/projects/projectStore.ts`
- `src/features/tasks/taskStore.ts`
- `src/features/focus/focusStore.ts`
- `src/features/reports/reportStore.ts`
- `src/tests/domain.test.ts`
- `src/tests/storage.test.ts`
- `src/tests/stores.test.ts`

## Checklist
- [ ] Define TypeScript models for `Project`, `Task`, `FocusReference`, and `Report`
- [ ] Encode task statuses as `todo`, `in_progress`, `blocked`, `done`
- [ ] Add domain constants that match the approved product model
- [ ] Implement browser persistence with IndexedDB-backed repositories
- [ ] Ensure Today Focus stores task references, not task copies
- [ ] Implement project, task, focus, and report stores with clean responsibilities
- [ ] Add tests for domain definitions
- [ ] Add tests for repository behavior
- [ ] Add tests proving focus updates mutate the original task
- [ ] Run all domain/storage/store tests and make them pass

## Definition of Done
- Domain models compile cleanly
- Persistence APIs exist for all four core object groups
- Focus references never duplicate task state
- `domain`, `storage`, and `stores` tests all pass

## Notes for Subagent
- Do not build page UI here
- Avoid leaking storage logic into components

