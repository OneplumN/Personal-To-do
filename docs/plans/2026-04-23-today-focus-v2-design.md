# Today Focus V2 Design

## Status
Approved for implementation.

## Why This Exists
The first interaction refinement round still left Today Focus too heavy:
- rows felt like cards instead of a real execution list
- actions were still button-heavy
- priority control was too large and too control-like
- completion still felt too interruptive

This round focuses only on Today Focus.

## Product Intent
Today Focus should feel like a **daily execution sheet**, not a secondary dashboard.

The user should be able to:
- scan it quickly
- update status quickly
- remove items quickly
- mark a task complete without being blocked

## Approved Interaction Model

### Layout
Each Today Focus item becomes a compact list row with three layers:

1. header:
   - priority badge
   - task title
2. support line:
   - project name
   - recent update time
3. status control line:
   - segmented status slider

No large card body.
No oversized action button cluster.

### Priority
Priority is displayed as a **small badge in the task header**.

Levels:
- `普通`
- `重要`
- `紧急`

Interaction:
- compact trigger
- opens a small local selection menu
- must not dominate the row

### Status
Status uses a **segmented slider-style control**, not a select and not a large button set.

States:
- `待做`
- `进行中`
- `阻塞`
- `完成`

Interaction rules:
- the current state is visually highlighted
- clicking a segment updates state directly
- `完成` completes immediately

### Completion
Completion should be light by default.

Approved rule:
- choosing `完成` immediately marks the task complete
- it does **not** force a completion explanation

Optional follow-up:
- completed tasks may later receive supplemental completion notes
- this is an enhancement path, not a required blocking step

### Row Gestures
Today Focus rows support horizontal drag actions:

- drag right → `✅ 完成`
- drag left → `❌ 移出焦点`

Rules:
- below threshold: show motion preview only
- beyond threshold: commit action on release
- drag must work as a shortcut, not the only path

So Today Focus still needs click-based controls as fallback:
- click row → open task detail
- click segmented status control → change status
- click priority badge → change priority

### Remove from Focus
Removing from focus should not require a large visible button in the row.

Primary path:
- drag left

Fallback path:
- subtle remove affordance if needed, but secondary

## Out of Scope
- changes to Project Workspace in this round
- changes to Settings in this round
- new reporting behavior
- mobile-first gesture redesign outside Today Focus

## Acceptance Signals
This round is successful if:
- Today Focus visually reads as a list, not a card grid
- priority becomes lighter and more label-like
- status changes feel direct and low-friction
- completion no longer forces a blocking modal
- drag actions work as quick shortcuts
