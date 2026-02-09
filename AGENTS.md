# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds application code.
- `src/App.tsx` is the main app component; `src/main.tsx` is the React entry point.
- `src/components/` contains reusable components; `src/components/ui/` is the Shadcn UI layer.
- `src/lib/utils.ts` contains shared utilities.
- `src/assets/` contains static assets used by the app.
- `public/` contains static files served as-is by Vite.

## Build, Test, and Development Commands
- `npm run dev` starts the Vite dev server with HMR for local development.
- `npm run build` type-checks with `tsc -b` and builds the production bundle.
- `npm run preview` serves the production build locally for verification.
- `npm run lint` runs ESLint over the codebase.

## Coding Style & Naming Conventions
- Language: TypeScript + React (TSX).
- Formatting: no Prettier config; follow existing file formatting and ESLint rules in `eslint.config.js`.
- Naming: components in `PascalCase` (e.g., `App.tsx`), functions and variables in `camelCase` (see `src/lib/utils.ts`).
- Imports use ES modules; keep relative imports scoped to the nearest module.

## Testing Guidelines
- No testing framework or test scripts are configured yet.
- If you add tests, document the framework and add a `test` script in `package.json`.

## Commit & Pull Request Guidelines
- Commit history currently follows Conventional Commits (example: `feat: initialize yearly-goal-slice-app with React, Vite, Tailwind CSS and Shadcn UI`).
- Use `feat:`, `fix:`, or other Conventional Commit prefixes when possible.
- PRs should include:
  - A short summary of changes and rationale.
  - Any relevant screenshots for UI changes.
  - Links to related issues or tasks, if applicable.

## Configuration Notes
- Vite config lives in `vite.config.ts`.
- Tailwind is configured via `@tailwindcss/vite` and styles live in `src/index.css`.
