# Finora feature/icon-system — update instructions

Source base: `main` commit `d610126`
Feature commit: `ac96aa3`

## Option 1 — apply patch

From the local Finora repository:

```bash
git checkout main
git pull origin main
git checkout -b feature/icon-system
git apply --index Finora_feature_icon-system.patch
git commit -m "feat: integrate Finora SVG icon system"
```

## Option 2 — copy changed files

Extract this ZIP at the repository root and preserve the folder structure. It contains only files changed by this feature.

## Validate

```bash
pnpm check
pnpm lint
pnpm test
pnpm build
```

## What changed

- Added 29 canonical SVG files under `assets/icons/`.
- Added `components/ui/finora-icons.tsx`, a typed React Native SVG registry.
- Added `tools/generate-finora-icons.py` for regenerating the registry from canonical SVG files.
- Replaced the starter tab Home icon with the Finora Home SVG icon.
- Updated the Foundation Home screen to use Finora mark, wallet, budget, report, notification, transaction and add icons.

This feature does not implement financial data or business logic.
