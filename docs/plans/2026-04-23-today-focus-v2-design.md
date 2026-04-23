# Today Focus V3 Design

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
Each Today Focus item becomes a **single-line execution row**:

- left: priority badge
- middle: `项目名 - 任务名`
- right: compact status control

No large card body.
No oversized action button cluster.
No default secondary text line.

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
Status uses a **compact segmented state control**, not a select and not a large button set.

States:
- `待做`
- `进行中`
- `阻塞`

Interaction rules:
- the current state is visually highlighted
- clicking a segment updates state directly
- `完成` is **not** part of the segmented control

### Completion
Completion should be light by default.

Approved rule:
- choosing `完成` immediately marks the task complete
- it does **not** force a completion explanation

Optional follow-up:
- completed tasks may later receive supplemental completion notes
- this is an enhancement path, not a required blocking step

Completion access rules:
- `完成` does not appear as an equal-weight state button next to `待做 / 进行中 / 阻塞`
- `完成` is triggered through the **right-swipe shortcut**
- after completion, show a light feedback path such as `撤销` and optional `补充说明`

### Row Gestures
Today Focus rows support horizontal drag actions:

- drag right → `✅ 完成`
- drag left → `❌ 移出焦点`

Rules:
- below threshold: show motion preview only
- beyond threshold: commit action on release
- drag must work as a shortcut, not the only path
- drag actions should not open modal confirmations

So Today Focus still needs click-based controls as fallback:
- click row → open task detail
- click segmented status control → change status
- click priority badge → change priority

After a drag action, the UI should prefer a **toast with undo** instead of a blocking confirmation dialog.

### Remove from Focus
Removing from focus should not require a large visible button in the row.

Primary path:
- drag left

Fallback path:
- subtle remove affordance if needed, but secondary and visually quiet

## Row Composition
Each row should contain only:

1. priority badge
2. `项目名 - 任务名`
3. compact state control:
   - `待做`
   - `进行中`
   - `阻塞`

It should **not** contain:
- large action buttons like `打开` and `移出`
- equal-weight `完成` button
- large descriptive card body
- default second-line timestamp or project meta text

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
- completion is no longer duplicated between state control and swipe action
- drag actions work as quick shortcuts
- drag actions feel safe because the UI supports post-action recovery rather than pre-action blocking
