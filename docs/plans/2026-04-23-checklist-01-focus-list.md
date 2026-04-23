# Checklist 01: Today Focus Action List

## Scope
- convert Today Focus from card-style rows with select menus into an actionable execution list
- add direct status buttons
- add summary-layer priority control

## Ownership
- `src/components/focus/FocusList.tsx`
- `src/features/home/HomePage.tsx`
- any related support files needed for Today Focus rendering
- `src/tests/home.test.tsx`

## Checklist
- [ ] Add task priority to summary-layer rendering
- [ ] Replace Today Focus status select with button-based status actions
- [ ] Keep open-task and remove-from-focus actions available
- [ ] Ensure `完成` still routes into completion flow instead of silently closing the task
- [ ] Make the list compact and scan-friendly
- [ ] Update tests to reflect the new row-level controls

## Definition of Done
- Today Focus behaves like a fast execution list
- high-frequency actions are available without opening detail
- home interaction tests pass

