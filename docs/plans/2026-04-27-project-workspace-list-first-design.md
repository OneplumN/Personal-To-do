# Project Workspace List-First Design

## Status
Approved for implementation.

## Why This Exists
The current project workspace carries too many competing surfaces:
- project hero
- current push cards
- three-column task board
- done-column report ritual

That makes the page feel like a mixed dashboard instead of a focused task workspace. It also gives the task area the same card weight as project cards and focus cards, which weakens hierarchy.

## Approved Direction
Project workspace becomes a **single-screen, list-first task board**.

The page keeps the project hero and one three-column task surface:
- `待做`
- `进行中`
- `已完成`

Everything else is removed from this page for now:
- no `Current Push`
- no report ritual in the done column

The project page itself should not scroll on desktop. Each task column should scroll internally.

## Layout

### Page shell
- top: project overview / progress hero
- bottom: one task workspace surface that fills the remaining viewport height

Desktop intent:

```text
[project hero]
[three-column task board fills remaining height]
```

### Board structure
- three columns remain the primary mental model
- columns are still semantic status areas, not flat tabs
- columns become visually lighter and more list-like than the current card-heavy board

### Blocked placement
`阻塞` remains attached to the `进行中` lane.

Approved presentation:
- `阻塞中` is a pinned subsection at the top of the `进行中` column
- regular `进行中` rows appear below it
- `阻塞` does not become a fourth lane

## Task Row Structure
Each task becomes a **compact list row**, not a standalone card.

Approved hierarchy:

```text
[status] title                                  [open]
         one-line preview
         checklist 2/5 · updated today · [one quick action]
```

### Row rules
- first line: status marker, title, open-detail action
- second line: one-line preview text
- third line: compact meta and one lightweight quick action

### Preview text
- active tasks use `task.body`
- done tasks prefer `task.completionWrapUp.summary`
- if no summary exists, fall back to `task.body`
- preview is always clamped to one line

### Quick actions
Rows keep only one lightweight state action:
- `待做` -> `开始`
- `进行中` -> `完成`
- `阻塞` -> `恢复`
- `已完成` -> `重新打开`

Priority editing and dense multi-button action groups are removed from the row surface. Detailed editing remains in the existing task detail panel.

## Interaction Rules

### Scope boundary
This redesign changes the **task board only**.

Out of scope for this pass:
- task detail panel redesign
- task data model changes
- report center changes
- new filters, sorting systems, or scheduling fields

### Detail behavior
- opening a task still uses the existing task detail panel
- task detail behavior stays unchanged

### New task entry
- the create-task entry remains in the task workspace header
- its visual weight should be reduced so it does not dominate the board

## Scrolling Model
Desktop behavior is strict:
- the project page should fit within one screen
- the page container should not vertically scroll during normal use
- each column body should scroll independently

This keeps the page in an operational mode rather than a document mode.

## Responsive Behavior
The one-screen lock applies to desktop-first usage.

On smaller screens:
- stacked layout is acceptable
- normal page scrolling can return
- internal lane scrolling does not need to be preserved if it harms usability

## Acceptance Signals
This redesign is successful if:
- the project page feels like one focused workspace instead of multiple stacked modules
- task rows read as a light operational list rather than a collection of heavy cards
- the whole desktop workspace fits in one screen
- blocked items are immediately visible at the top of the in-progress lane
- task detail remains available without requiring redesign work in this pass
