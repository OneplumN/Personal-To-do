# Task Detail Drawer Design

## Status
Approved for implementation.

## Why This Exists
The current task detail surface is overloaded and mixes too many modes:
- task metadata
- content editing
- checklist handling
- progress log
- completion workflow

This makes the task detail feel like a dense editor rather than a practical working surface.

## Approved Direction
Task detail becomes a **right-side drawer** with **checklist-first hierarchy**.

It must behave like a focused work drawer, not a modal document viewer.

## Layout

Top control row:
- priority
- editable title
- status

Then:
1. checklist
2. body
3. notes
4. fixed footer actions

Visual structure:

```text
[priority] [title input________________] [status]
----------------------------------------
checklist
----------------------------------------
body
----------------------------------------
notes
----------------------------------------
[Close] [Save]
```

## Interaction Rules

### Surface
- opens from both Home and Project Workspace
- appears as a right-side drawer
- does not navigate away from the current page
- closes via top-right close, overlay click, or `Esc`

### Save model
- manual save only
- edits to title, priority, status, checklist, body, and notes stay local until save
- close without save discards unsaved changes

### Checklist
Checklist is the primary work area.

Required interactions:
- toggle item complete
- add item
- delete item
- edit item text inline
- reorder items

This should feel like a compact task-operations list, not a loose note-taking area.

### Body
Body is secondary context:
- background
- problem statement
- supporting details

### Notes
Notes are a standing scratch area for extra context or final remarks.
Notes are always visible, not collapsed.

### Out of Scope
- progress/change history in the drawer
- forcing completion summaries before task completion
- separate tabs inside the drawer

## Alternative Kept in Reserve
An alternate checklist presentation with more relaxed, note-like spacing is intentionally kept as a fallback if the compact interaction model feels too rigid later.

## Acceptance Signals
This redesign is successful if:
- the first visual focus is the checklist
- title, priority, and status are immediately editable at the top
- the drawer feels lighter and less cognitively loaded than the old modal
- the user can continue moving through tasks without losing page context
