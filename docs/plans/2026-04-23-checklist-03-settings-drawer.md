# Checklist 03: Settings Drawer

## Scope
- replace the current settings modal interaction with a right-side drawer
- improve close behavior and action placement

## Ownership
- `src/features/settings/SettingsDialog.tsx`
- `src/components/common/Modal.tsx` or its replacement
- `src/app/App.tsx`
- `src/styles/global.css`
- `src/tests/preferences.test.tsx`

## Checklist
- [ ] Convert settings surface to a right-side drawer
- [ ] Keep header fixed with a visible close action
- [ ] Keep footer fixed with `关闭` and `保存设置`
- [ ] Make content scroll independently
- [ ] Support overlay close
- [ ] Support `Esc` close
- [ ] Preserve existing settings functionality while improving interaction behavior
- [ ] Update tests for the new behavior

## Definition of Done
- settings can be dismissed reliably
- save and close actions remain accessible while scrolling
- settings tests pass

