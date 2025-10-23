# Repository Guidelines

## Project Structure & Module Organization
- Active code lives in `wiskey-new/`; treat `wiskey/` and `Solve Mobile Prototype/` as read-only references.
- Next.js routes reside in `wiskey-new/app/`. Co-locate feature-specific components alongside their screens.
- Shared UI primitives and the `cn` helper sit in `wiskey-new/components/ui/`; reuse them before adding new abstractions.
- Styles are consolidated in `wiskey-new/styles/`. Extend utility classes there instead of scattering inline overrides.
- Place component tests beside their source (`Component.test.tsx`) or inside a `__tests__/` folder near the implementation.

## Build, Test, and Development Commands
- `npm install` (run once inside `wiskey-new/`) installs dependencies.
- `npm run dev` launches the mobile-frame Next.js dev server.
- `npm run build` creates the production bundle; follow with `npm run start` for a smoke check.
- `npm run lint` enforces TypeScript strictness and repository conventions; run it before every PR.

## Coding Style & Naming Conventions
- Favor functional React 19 components with PascalCase exports and camelCase helpers.
- Include `'use client';` atop all interactive components, especially when using Radix primitives.
- Stick to TypeScript strict mode—type every prop and external data shape.
- Reuse utility classes from `styles/index.css`; avoid arbitrary class names or new global CSS unless reviewed.

## Testing Guidelines
- Default stack: React Testing Library + Vitest for unit-level coverage, Playwright for flows.
- Name tests after the component or hook they exercise (`WalletHeader.test.tsx`); mock data providers thoughtfully.
- Document manual verification steps in PR descriptions until automated coverage lands.

## Commit & Pull Request Guidelines
- Write present-tense, Conventional-style commit subjects under 72 chars (e.g., `Add wallet header skeleton`).
- PRs should explain motivation, summarize key changes, and list `npm run lint` plus any executed tests.
- Attach screenshots or screen recordings for UI updates and link tracking issues when available.

## Security & Configuration Tips
- Store secrets in `.env.local`; never commit `.env*` files.
- Confirm Base network settings when touching wallet or Onchain integrations via `RootProvider`.
- Validate theme behavior on light/dark toggles before merging visual changes.
