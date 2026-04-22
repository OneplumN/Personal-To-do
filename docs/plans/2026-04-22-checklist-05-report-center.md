# Checklist 05: Report Center and AI Reporting

## Scope
- build the Report Center
- generate daily / weekly / monthly reports from completed tasks only
- support structured draft + polished output
- save and edit reports

## Ownership
- `src/features/reports/ReportCenterPage.tsx`
- `src/lib/ai/buildReportDraft.ts`
- `src/lib/ai/polishReport.ts`
- `src/components/reports/ReportEditor.tsx`
- `src/tests/reportCenter.test.tsx`
- reporting-related docs if created during implementation

## Checklist
- [ ] Build Report Center page and top-level report navigation
- [ ] Support daily, weekly, and monthly generation flows
- [ ] Filter source material to completed tasks only
- [ ] Build structured draft generation flow
- [ ] Build polished text generation flow
- [ ] Save generated reports as editable records
- [ ] Allow reopening and editing saved reports
- [ ] Add tests proving incomplete tasks are excluded
- [ ] Add tests for saved editable report behavior
- [ ] Run report center tests and make them pass

## Definition of Done
- Reports are first-class saved artifacts
- Daily/weekly/monthly generation works off completed tasks only
- Structured draft and polished output both exist
- Report Center tests pass

## Notes for Subagent
- Do not add per-project reporting in v1 unless explicitly required later
- Preserve the distinction between generated content and user-edited content

