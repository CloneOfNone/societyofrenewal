# Contributing to Society of Renewal

Thanks for helping build the Society of Renewal experience. This document outlines how to collaborate effectively and keep the project production-ready.

## Table of Contents

- [Project Setup](#project-setup)
- [Environment Variables](#environment-variables)
- [Preferred Tooling](#preferred-tooling)
- [Workflow Overview](#workflow-overview)
- [Coding Standards](#coding-standards)
- [Testing & Verification](#testing--verification)
- [Committing & Reviews](#committing--reviews)
- [Database & Migrations](#database--migrations)
- [Documentation](#documentation)

## Project Setup

1. **Clone** the repository and install dependencies (Node 18+ recommended):
   ```bash
   npm install
   ```
2. Copy the provided env template:
   ```bash
   cp .env.example .env.local
   ```
3. Populate the environment variables as described below.

## Environment Variables

The application relies on the following variables:

| Variable                                     | Required | Description                                                                   |
| -------------------------------------------- | -------- | ----------------------------------------------------------------------------- |
| `APP_URL`                                    | ✅       | Base URL for generating links (e.g., `http://localhost:3000` in development). |
| `POSTGRES_URL` or `DATABASE_URL`             | ✅       | Connection string for Postgres (Vercel Postgres uses `POSTGRES_URL`).         |
| `EMAIL_PROVIDER_API_KEY` or `RESEND_API_KEY` | ✅       | Transactional email provider key for double opt-in messages.                  |
| `RESEND_AUDIENCE_ID`                         | ⛔️      | Optional list ID if syncing signups to a Resend audience.                     |
| `TURNSTILE_SECRET`                           | ⛔️      | Cloudflare Turnstile secret; omit to disable the verification step locally.   |
| `KV_REST_API_URL` & `KV_REST_API_TOKEN`      | ⛔️      | Vercel KV credentials for rate limiting (falls back to in-memory if unset).   |

Keep secrets out of version control. Use Vercel project settings to mirror production values.

## Preferred Tooling

- **Editor:** VS Code or Cursor. The repo provides `.vscode` settings to run ESLint fixes and Prettier formatting on save. Accept the recommended extensions when prompted.
- **Package Manager:** npm (lockfile committed). Avoid mixing package managers.
- **Node.js:** v18 or newer.

## Workflow Overview

1. Create a feature branch: `git checkout -b feat/my-update`.
2. Make changes with the spec in `docs/spec/landing-build-spec.md` as the source of truth.
3. Run the verification commands before every commit:
   ```bash
   npm run format
   npm run lint
   npm run build
   ```
4. Address any issues before opening a pull request.

## Coding Standards

- Use TypeScript throughout. Avoid `any`; leverage `zod` schemas for runtime validation.
- Follow the existing folder structure (`src/app`, `src/components`, `src/lib`, etc.).
- Use the provided `cn` helper for composing class names and keep Tailwind utility classes sorted (Prettier handles this on save).
- Respect the animation accessibility hooks (`useReducedMotion`) and content copy defined in `docs/content/landing-page.md`.
- Any new environment variable should be added to `.env.example`, documented here, and referenced via the typed helpers in `src/lib/env.ts`.

## Testing & Verification

The project includes lightweight checks:

- `npm run lint` — ESLint with Next.js, TypeScript, and import rules.
- `npm run format` — Prettier + Tailwind class ordering (fails if files need formatting).
- `npm run build` — Ensures Next.js production build, TypeScript types, and static generation succeed.

Run all three before committing or opening a PR. Add additional unit/integration tests as features grow.

## Committing & Reviews

- Use **Angular-style commit messages**, e.g. `feat: add ripple button animation` or `fix: debounce waitlist endpoint`.
- Keep commits scoped and descriptive. Squash merge if multiple WIP commits accumulate.
- Each PR should include:
  - Summary of changes and the spec section it addresses.
  - Notes on testing (`lint`, `format`, `build`, additional checks).
  - Screenshots or recordings for UI changes when possible.

## Database & Migrations

- Schema definitions live in `src/db/schema.ts`.
- Generate new migrations in `src/db/migrations/` and run them locally with `npm run db:migrate`.
- Migrations must be idempotent and backward compatible. Document any manual setup required for reviewers.

## Documentation

- Keep specification updates in `docs/spec/landing-build-spec.md`.
- Update user-facing copy in `docs/content/landing-page.md` and outline changes in `docs/content/outline.md`.
- Mention relevant documentation updates in your PR description.

Thank you for contributing and helping build a compassionate, accessible Society of Renewal.
