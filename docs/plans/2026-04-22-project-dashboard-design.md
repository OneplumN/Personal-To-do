# Project Dashboard Product Design

## Status
Approved for planning. This design supersedes the earlier kanban-first exploration as the primary product direction.

## Goal
Define `Personal-To-do` as a project-driven personal work cockpit rather than a generic todo board.

## Product Thesis
The product helps one person answer four questions with minimal friction:

1. What projects am I responsible for right now?
2. What am I actually focusing on today?
3. What is the current state of work inside each project?
4. What finished work can be turned into daily, weekly, or monthly reporting?

This is not a collaboration tool, not a team project manager, and not a general note app. It is a single-user work operating system.

## Core Objects

### Project
Projects are manually created. They are the top-level structure of the product.

Each project has:
- name
- optional description
- auto-calculated progress
- optional manual progress note or adjustment
- task collection

Projects appear as cards on the home screen.

### Task
Tasks live inside projects. A task is the main execution unit.

Each task has:
- title
- detail body
- checklist
- progress / change log entries
- status
- completion wrap-up fields

Statuses:
- `todo`
- `in_progress`
- `blocked`
- `done`

### Today Focus
Today Focus is a cross-project execution layer. It is not a separate data object and not a task copy.

Rules:
- tasks are manually added from projects
- focus items are references to the original task
- edits made in Today Focus update the original task
- no automatic system recommendations in v1

### Report
Reports are saved artifacts generated from completed tasks.

Each report has:
- type: daily / weekly / monthly
- time range
- source tasks
- structured draft
- polished version
- editable stored content

Reports live in a dedicated Report Center.

## Information Architecture

### Home
Home is a two-layer dashboard:

1. **Today Focus**
2. **Project Overview**

Home does not show the report list by default. Report history belongs in its own area.

#### Today Focus section
Shows manually selected task references from different projects.

Each item should show:
- project name
- task title
- current task status
- last updated time

Supported actions:
- open task
- update task status
- remove from Today Focus

#### Project card section
Each project card shows:
- project name
- current progress
- in-progress count
- latest completed task

Primary action:
- enter project workspace

### Project Workspace
Project Workspace is the main work area.

Top section:
- project summary
- progress state
- quick metrics

Bottom section:
- task workspace with `list / board` toggle

This is not a pure kanban page. It is a project workbench.

### Task Detail
Task detail is where task substance lives.

It includes:
- title
- detail body
- checklist
- append-only progress/change notes with automatic timestamps
- Today Focus toggle
- completion action

### Completion Wrap-up
Marking a task done should not be a silent status change.

On completion, show a short wrap-up panel with:
- completion summary
- key changes
- notes

These fields are optional but strongly encouraged because they improve reporting quality.

### Report Center
Report Center is a separate navigation destination.

It stores:
- generated daily reports
- generated weekly reports
- generated monthly reports

Reports are:
- created from completed tasks only
- saved
- editable
- reviewable later

Default AI entry point in v1:
- global report generation first

Future extension:
- per-project reports

## Key Workflows

### Morning workflow
1. Open Home
2. Scan Today Focus
3. Scan project cards
4. Enter a project or continue from Today Focus

### Execution workflow
1. Open project
2. add or update tasks
3. append progress notes as work changes
4. mark task blocked / in progress / done
5. if done, complete wrap-up panel

### Reporting workflow
1. Open Report Center
2. Choose daily / weekly / monthly range
3. AI reads completed tasks only
4. Generate structured draft
5. Polish into formal text
6. Save and optionally edit

## Progress Model
Project progress should be a hybrid:
- system calculates default progress from task state
- user may add a manual note or override signal

This avoids false precision while still giving useful visibility on the home screen.

## MVP Scope

### Must have
- Home with Today Focus + Project cards
- Project creation
- Project workspace with list / board task views
- Task detail with body, checklist, and progress log
- Manual Today Focus add/remove
- Done wrap-up panel
- Report Center with saved daily/weekly/monthly reports
- AI reads completed tasks only

### Can wait
- project templates
- tagging system
- per-project report generation
- advanced filters
- analytics

## Non-Goals
- multi-user collaboration
- notifications
- automatic prioritization
- calendar scheduling
- generalized note-taking outside tasks

## Product Principles
- Project context first
- Daily execution visible immediately
- Task records should accumulate process, not only status
- Completion should produce reusable reporting material
- Reports are artifacts, not temporary popups

## Follow-up Interaction Refinement

The first functional implementation surfaced a second-round interaction need. See:
- [2026-04-23-interaction-refinement-design.md](./2026-04-23-interaction-refinement-design.md)

That refinement round changes:
- Today Focus into an actionable list
- Project Workspace into a board-first surface
- Settings into a right-side drawer
