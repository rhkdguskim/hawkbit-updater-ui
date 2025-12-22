# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains the React + TypeScript application code.
- `src/features/` groups feature domains (pages, flows, data wiring).
- `src/components/` holds shared UI components; `src/providers/` and `src/stores/` hold app-wide context and state.
- `src/api/` is the API client layer (generated with Orval).
- `src/i18n/` stores translation resources and setup.
- `public/` contains static assets served as-is.
- `docs/` contains product/feature documentation and PRD material.
- `tools/ddi-simulator/` provides a device simulator used in local workflows.

## Build, Test, and Development Commands
- `npm run dev` starts the Vite dev server with HMR.
- `npm run build` runs TypeScript project build and produces a production bundle.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint across the repo.
- `npm run gen:api` regenerates API clients using `orval.config.ts`.
- `docker-compose up` starts local backend services defined in `docker-compose.yml`.

## Coding Style & Naming Conventions
- TypeScript + React; keep files in `.ts`/`.tsx`.
- Indentation is 2 spaces; use semicolons and single quotes as in existing files.
- React components use `PascalCase` (e.g., `MainLayout.tsx`); hooks use `useCamelCase`.
- Prefer absolute imports via the `@/` alias (see `tsconfig.json`).
- Run `npm run lint` before pushing changes.

## Testing Guidelines
- No dedicated test runner is configured yet (no `test` script in `package.json`).
- If adding tests, document the chosen framework and add a script for it.

## Commit & Pull Request Guidelines
- Commit messages follow Conventional Commits: `feat:`, `fix:`, `chore:`, etc.
- Use short, imperative summaries (e.g., `feat: add rollout filter builder`).
- PRs should describe scope, list key changes, link issues, and include screenshots for UI changes.
- Update translations under `src/i18n/` when adding user-facing text.

## Configuration & Security
- Keep environment-specific config out of source control; prefer `.env` patterns when needed.
- Regenerate API clients after backend contract changes and review the diff carefully.
