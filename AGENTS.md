# AGENTS

## Verified Facts

- App framework: Next.js 15 + React 19 + TypeScript
- Unit test command: `npm test`
- Production build command: `npm run build`
- Official E2E entrypoint: `npm run test:e2e`
- E2E harness owner: `scripts/run-playwright.mjs`
- E2E config requirement: `playwright.config.ts` expects `PLAYWRIGHT_BASE_URL` from the wrapper
- Local persisted data override: `DREAMFOLD_DATA_DIR`
- Seeded E2E sample data toggle: `DREAMFOLD_ENABLE_SEED_DATA=1`

## Operating Rules

- Read current repo files before changing behavior. Follow existing local patterns unless the request explicitly changes them.
- Do not run Playwright directly with `npx playwright test` or IDE defaults. Use `npm run test:e2e` so the isolated wrapper owns port, data dir, and cleanup.
- When touching harness code, preserve these invariants:
  - per-run isolated port
  - per-run isolated data directory
  - wrapper-managed server startup and cleanup
  - no fallback to shared `.dreamfold-data` during E2E
- When touching dream creation input handling, treat the final chosen text as the primary validation target instead of strengthening pre-resolution checks.
- If both `dreamText` and `voiceTranscript` are present, preserve a valid edited `dreamText` instead of blindly overwriting it with transcript text.
- Treat `npm run build` as a standalone verification step. If it fails while dev/E2E is running, rerun it alone before classifying it as product-code breakage.
- For UI state changes, do not stop at helper-level tests. Add page-level or E2E coverage for the rendered branch.
- Stage only intended files. Never include generated caches, temp dirs, local data files, or scratch outputs.

## Verification Order

1. `npm test`
2. `npm run build`
3. `npm run test:e2e`

## Review Gate

- Fresh review is required before handoff or PR creation.
- Reviewers should report findings first with severity and concrete file references.
- After fixing actionable findings, rerun the affected verification before asking for another review pass.

## Reference

- Detailed harness guidance: [docs/harness-engineering-guidelines.md](docs/harness-engineering-guidelines.md)
