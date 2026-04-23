# Checklist 04: Today Focus V2

## Scope
- make Today Focus a compact execution list
- replace heavy row controls with segmented status interaction
- move priority to a compact header badge
- support drag shortcuts for complete and remove

## Ownership
- `src/components/focus/FocusList.tsx`
- `src/features/home/HomePage.tsx`
- `src/features/tasks/taskStore.ts`
- `src/types/task.ts`
- `src/styles/global.css`
- `src/tests/home.test.tsx`
- `src/tests/domain.test.ts`
- `src/tests/stores.test.ts`

## Checklist
- [ ] Support direct task completion without a forced completion modal
- [ ] Keep completed tasks reportable after direct completion
- [ ] Rebuild each focus item as a compact list row
- [ ] Move priority into the row header as a small badge/trigger
- [ ] Replace the current status controls with a segmented slider-style control
- [ ] Make row click open task detail
- [ ] Add drag right shortcut for complete
- [ ] Add drag left shortcut for remove from focus
- [ ] Keep non-gesture fallbacks available for accessibility
- [ ] Update automated tests
- [ ] Validate in MCP browser

## Definition of Done
- Today Focus reads as a list, not a card stack
- completion is lightweight and direct
- swipe shortcuts work
- tests and MCP validation pass

