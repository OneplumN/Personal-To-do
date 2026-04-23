# Interaction Refinement Design

## Status
Approved for planning and implementation.

## Why This Round Exists
The current product has functional coverage but does not yet meet the interaction standard for a daily-use personal work tool.

The problems are structural:
- high-frequency actions are buried too deep
- Today Focus does not yet behave like a real execution list
- the project page still makes users choose between views instead of supporting scanning and action together
- settings behave like a generic form modal rather than a utility control surface

This round focuses on interaction efficiency before any visual polishing pass.

## Scope
This refinement round changes three areas:

1. Today Focus
2. Project Workspace
3. Settings

No new product objects are introduced in this round.

## 1. Today Focus

### Current problem
Today Focus currently feels like task cards with indirect actions. This increases friction for the highest-frequency area of the product.

### Approved direction
Today Focus becomes a **compact actionable list**.

Each row must show:
- project name
- task title
- task priority
- current status
- recent update time

Each row must support direct actions without opening task detail first:
- update task status
- update task priority
- open task detail
- remove from focus

### Status interaction
Task status should not use a select menu in Today Focus.

Use button-style segmented actions:
- `待做`
- `进行中`
- `阻塞`
- `完成`

When the user chooses `完成`, the task must still flow into the completion wrap-up dialog instead of silently flipping state.

### Priority interaction
Priority is a separate concept from status and should be lighter.

Approved levels:
- `普通`
- `重要`
- `紧急`

Priority should be shown as a compact control, ideally a pill or compact trigger that opens a small selection menu.

## 2. Project Workspace

### Current problem
The current list/board toggle splits the mental model. Real work requires both:
- understanding status distribution
- scanning detailed task information

Switching between list and board slows this down.

### Approved direction
Project Workspace becomes **board-first**.

Structure:
- top: project summary and metrics
- below: four status columns
  - `待做`
  - `进行中`
  - `阻塞`
  - `已完成`

Within each column, tasks are rendered as **list-like entries**, not oversized visual cards.

This keeps the benefits of kanban while preserving scan efficiency.

### Task item behavior inside the board
Each task item in a column should expose quick controls directly in the summary layer:
- priority control
- status movement / state switch
- add/remove from Today Focus
- open task detail

This means task status should be changeable from the task summary surface, not only inside the detail panel.

### New task interaction
New task creation in a project should feel lightweight and local to the workspace.

It should not feel buried or detached from the board.

Preferred behavior:
- a clear `+ 新建任务` action in the workspace header
- either an inline quick-create row or a compact create surface attached to the board region

## 3. Settings

### Current problem
The current settings interaction is neither stable nor ergonomic:
- button placement becomes weak during scroll
- close behavior is not resilient enough
- the surface does not feel like a utility control panel

### Approved direction
Settings becomes a **right-side drawer**.

### Required interaction rules
- open from the top nav
- close from top-right close action
- close on overlay click
- close on `Esc`
- scroll only the content region
- keep header fixed
- keep footer actions fixed

### Layout
Top:
- title
- close action

Middle scroll region:
- appearance
- lane colors
- AI settings
- import/export

Bottom fixed action area:
- `关闭`
- `保存设置`

## Interaction Principles
- High-frequency actions should be available one level earlier
- Summary layers should support quick state changes
- Deep edit layers should focus on content, not routine toggles
- Utility panels must remain controllable during scroll
- Priority and status must remain clearly separated

## Out of Scope
- visual redesign beyond what is needed to support the new interaction model
- advanced drag-and-drop
- mobile-specific gesture redesign
- settings information architecture expansion

## Acceptance Signals
This round is successful if:
- Today Focus can be operated mostly without opening task detail
- Project Workspace no longer requires list/board switching for normal use
- Settings feel stable and dismissible in all common interaction paths
