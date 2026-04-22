# Checklist 01: Frontend Foundation

## Scope
- bootstrap frontend toolchain
- establish app shell
- confirm navigation skeleton
- keep scope limited to infrastructure and layout shell

## Ownership
- `package.json`
- `tsconfig.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `.gitignore`
- `index.html`
- `src/main.tsx`
- `src/app/App.tsx`
- `src/styles/global.css`
- `src/tests/bootstrap.test.tsx`

## Checklist
- [ ] Create the Vite + React + TypeScript project skeleton
- [ ] Add scripts for dev, build, test, and lint if used
- [ ] Add a minimal app shell with top-level navigation for `Home` and `Report Center`
- [ ] Ensure the app shell respects `DESIGN.md` at a structural level
- [ ] Add the first smoke test for app boot and top-level navigation
- [ ] Run the bootstrap test and make it pass
- [ ] Verify the app starts locally

## Definition of Done
- `npm install` succeeds
- `npm test -- src/tests/bootstrap.test.tsx` passes
- The app renders a shell suitable for Home, Project Workspace, and Report Center

## Notes for Subagent
- Do not implement project data, task logic, or report logic here
- This checklist should leave clean placeholders, not feature behavior

