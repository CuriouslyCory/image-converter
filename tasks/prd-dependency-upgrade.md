# PRD: Full Dependency Upgrade to Latest Versions

## Introduction

The image-converter project's dependencies are significantly outdated, spanning multiple major versions behind current releases. This upgrade brings all dependencies to their latest versions as of March 2026, including major version bumps for the core framework (Next.js 14→16, React 18→19), database ORM (Prisma 6→7), authentication (next-auth v4→v5), API layer (tRPC RC→stable v11), styling (Tailwind CSS 3→4), and linting (ESLint 8→9). The upgrade ensures the project benefits from the latest performance improvements, security patches, and developer experience enhancements.

## Goals

- Upgrade all production and dev dependencies to their latest compatible major versions
- Maintain full existing functionality (image conversion, auth, rate limiting) throughout the upgrade
- Ensure the project builds and runs successfully after each upgrade phase
- Adopt modern configuration patterns (Prisma driver adapters, ESLint flat config, Tailwind CSS-first config)

## User Stories

### US-001: Upgrade React and Next.js to Latest Major Versions
**Description:** As a developer, I want to upgrade React 18→19 and Next.js 14→16 so that the project uses the latest framework features and performance improvements (Turbopack, React Compiler).

**Acceptance Criteria:**
- [ ] `react` and `react-dom` updated to `^19.2.4`
- [ ] `next` updated to `^16.1.0`
- [ ] `@types/react` and `@types/react-dom` updated to `^19.0.0`
- [ ] `eslint-config-next` updated to `^16.1.0`
- [ ] `@t3-oss/env-nextjs` updated to latest compatible version
- [ ] `headers()` call in `src/trpc/server.ts` updated to be async (`await headers()`)
- [ ] `next.config.js` renamed to `next.config.ts` with proper TypeScript config
- [ ] Node.js version requirement of >= 20.9.0 is documented/verified
- [ ] `pnpm build` succeeds
- [ ] `pnpm dev` starts without errors

### US-002: Upgrade Prisma 6 to 7 with Driver Adapters
**Description:** As a developer, I want to upgrade Prisma from v6 to v7 so that the project uses the latest ORM with direct TCP driver adapters for optimal database performance.

**Acceptance Criteria:**
- [ ] `prisma` (dev) and `@prisma/client` updated to `^7.5.0`
- [ ] `@prisma/adapter-ppg` added as a dependency (official Postgres adapter)
- [ ] `tsx` added as a dev dependency
- [ ] In `prisma/schema.prisma`: generator provider changed from `"prisma-client-js"` to `"prisma-client"` with `output = "./generated"` added
- [ ] In `prisma/schema.prisma`: `url = env("DATABASE_URL")` removed from `datasource db` block, `provider = "postgresql"` preserved
- [ ] Any `previewFeatures = ["driverAdapters"]` removed from schema if present
- [ ] `prisma.config.ts` created at repo root using `defineConfig` and `env` from `"prisma/config"`, with `datasource.url` set to `env("DATABASE_URL")`
- [ ] `src/server/db.ts` rewritten to use `PrismaPPG` adapter from `@prisma/adapter-ppg` with `connectionString`
- [ ] PrismaClient import path updated from `"@prisma/client"` to the generated client path (e.g., `"../../prisma/generated/prisma/client.js"` or equivalent with path alias)
- [ ] All other files importing from `@prisma/client` updated to generated path
- [ ] Dev singleton pattern preserved in `src/server/db.ts`
- [ ] `prisma generate` succeeds and outputs to `./prisma/generated/`
- [ ] `pnpm build` succeeds
- [ ] Database queries work (rate limiting, auth sessions)

### US-003: Upgrade next-auth v4 to v5 (Auth.js)
**Description:** As a developer, I want to upgrade from next-auth v4 to v5 (Auth.js) so that the project uses the modern universal `auth()` API pattern.

**Acceptance Criteria:**
- [ ] `next-auth` updated to latest v5 beta (`next-auth@beta`)
- [ ] `@auth/prisma-adapter` updated to latest compatible version
- [ ] `src/server/auth.ts` rewritten to use `NextAuth()` function that exports `{ handlers, auth, signIn, signOut }`
- [ ] `auth()` replaces `getServerAuthSession()` as the session retrieval method
- [ ] Module augmentation updated for v5 types
- [ ] Discord provider and Prisma adapter preserved
- [ ] `src/app/api/auth/[...nextauth]/route.ts` simplified to import and re-export `handlers` from `~/server/auth`
- [ ] `src/server/api/trpc.ts` updated: import changed from `getServerAuthSession` to `auth`, call updated accordingly
- [ ] Unused `import * as trpcNext from "@trpc/server/adapters/next"` removed from `src/server/api/trpc.ts`
- [ ] `src/env.js` updated: `NEXTAUTH_SECRET` → `AUTH_SECRET`, `NEXTAUTH_URL` → `AUTH_URL` in schema and `runtimeEnv`
- [ ] `.env` file references updated to use new env var names
- [ ] `pnpm build` succeeds
- [ ] Discord OAuth login/logout flow works

### US-004: Upgrade tRPC from RC to Stable v11
**Description:** As a developer, I want to upgrade tRPC from the release candidate (11.0.0-rc.446) to stable v11 so that the project uses the production-ready API layer.

**Acceptance Criteria:**
- [ ] `@trpc/client` updated to `^11.6.0`
- [ ] `@trpc/server` updated to `^11.6.0`
- [ ] `@trpc/react-query` updated to `^11.6.0`
- [ ] `@tanstack/react-query` updated to `^5.90.21`
- [ ] If `unstable_httpBatchStreamLink` was renamed in stable, update import in `src/trpc/react.tsx`
- [ ] Verify `createHydrationHelpers` import from `@trpc/react-query/rsc` works in `src/trpc/server.ts`
- [ ] Verify `initTRPC` and `superjson` transformer config still work in `src/server/api/trpc.ts`
- [ ] `pnpm build` succeeds
- [ ] Image conversion mutation works end-to-end from the UI

### US-005: Upgrade Tailwind CSS 3 to 4
**Description:** As a developer, I want to upgrade Tailwind CSS from v3 to v4 so that the project uses the new CSS-first configuration approach and improved performance.

**Acceptance Criteria:**
- [ ] `tailwindcss` updated to `^4.0.0`
- [ ] `postcss` removed if only used for Tailwind (Tailwind 4 bundles its own PostCSS plugin via `@tailwindcss/postcss`)
- [ ] `tailwindcss-animate` removed or replaced with compatible v4 alternative
- [ ] `prettier-plugin-tailwindcss` updated to latest
- [ ] Tailwind config file (`tailwind.config.ts` or similar) deleted or migrated to CSS-first config
- [ ] `src/app/globals.css` updated with `@import "tailwindcss"` directive and any custom theme moved to `@theme`
- [ ] `postcss.config.js`/`postcss.config.cjs` deleted if it only contained Tailwind config, or updated to use `@tailwindcss/postcss`
- [ ] All existing utility classes verified to work or updated for v4 renames
- [ ] `pnpm build` succeeds
- [ ] UI renders correctly with no visual regressions
- [ ] Verify in browser using dev-browser skill

### US-006: Upgrade ESLint 8 to 9 with Flat Config
**Description:** As a developer, I want to upgrade ESLint from v8 to v9 with the new flat config format so that the project uses the modern linting configuration.

**Acceptance Criteria:**
- [ ] `eslint` updated to `^9.0.0`
- [ ] `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` updated to latest compatible
- [ ] `.eslintrc.cjs` deleted
- [ ] `eslint.config.js` (or `.mjs`) created with flat config format
- [ ] All existing custom rules preserved: `consistent-type-imports`, `no-unused-vars` with `argsIgnorePattern: "^_"`, `require-await: off`, `no-misused-promises` config
- [ ] `next/core-web-vitals`, `recommended-type-checked`, and `stylistic-type-checked` configs included
- [ ] `pnpm lint` passes (or only has pre-existing warnings)

### US-007: Upgrade Remaining Dependencies
**Description:** As a developer, I want to upgrade all remaining dependencies to their latest compatible versions for security and feature improvements.

**Acceptance Criteria:**
- [ ] `sharp` updated to `^0.34.5`
- [ ] `zod` updated to latest `^3.x`
- [ ] `superjson` updated to latest `^2.x`
- [ ] `geist` updated to latest
- [ ] `lucide-react` updated to latest
- [ ] `class-variance-authority` updated to latest
- [ ] `clsx` updated to latest
- [ ] `tailwind-merge` updated to latest
- [ ] `image-to-ico` updated to latest
- [ ] `server-only` updated to latest
- [ ] All `@radix-ui/*` packages updated to latest React 19-compatible versions
- [ ] `prettier` updated to latest
- [ ] `@types/node` updated to `^22.x`
- [ ] `typescript` updated to latest `^5.x`
- [ ] Sharp API verified in `src/server/api/routers/convert.ts` (webp/png/jpeg/ico conversion)
- [ ] Radix UI wrapper components in `src/components/ui/` updated if `forwardRef` patterns changed for React 19
- [ ] `pnpm build` succeeds
- [ ] Image conversion works for all formats (webp, png, jpeg, ico)

## Functional Requirements

- FR-1: All dependencies in `package.json` must be updated to their latest compatible major versions
- FR-2: The Prisma schema must use the new v7 `"prisma-client"` generator with `output = "./generated"` and driver adapter pattern
- FR-3: A `prisma.config.ts` file must be created at the repo root to centralize Prisma CLI configuration
- FR-4: The `src/server/db.ts` Prisma client must use `@prisma/adapter-ppg` driver adapter for PostgreSQL
- FR-5: Authentication must use the Auth.js v5 `NextAuth()` + `auth()` pattern instead of `getServerSession(authOptions)`
- FR-6: Environment variables must be renamed from `NEXTAUTH_SECRET`/`NEXTAUTH_URL` to `AUTH_SECRET`/`AUTH_URL`
- FR-7: The auth route handler must export handlers from the centralized auth config
- FR-8: The `next/headers` `headers()` call must be awaited (async in Next.js 15+)
- FR-9: The Next.js config must be converted from `.js` to `.ts`
- FR-10: The ESLint config must be converted from `.eslintrc.cjs` (legacy) to `eslint.config.js` (flat config)
- FR-11: Tailwind CSS must be migrated from JS-based config to CSS-first config with `@import "tailwindcss"`
- FR-12: Each upgrade phase must produce a buildable application — no phase should leave the app in a broken state

## Non-Goals

- No new features or UI changes beyond what's required for compatibility
- No database migrations or schema model changes (only Prisma config/generator changes)
- No change to the application's functionality or behavior
- No migration to the new `@trpc/tanstack-react-query` package (classic `@trpc/react-query` is still supported in v11)
- No addition of Prisma Accelerate
- No upgrade of pnpm version (already at 10.12.4)

## Technical Considerations

- **Execution order matters:** Phases must be executed sequentially due to dependency chains: React 19 → Next.js 16 → Prisma 7 → next-auth v5 → tRPC stable → Tailwind 4 → ESLint 9 → remaining deps
- **Node.js requirement:** Next.js 16 requires Node.js >= 20.9.0. Verify the deployment environment supports this.
- **Prisma 7 is the highest-risk upgrade:** It changes how the database client is constructed (driver adapters), changes import paths (generated client), and removes the datasource URL from the schema. Follow the [official migration guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7).
- **next-auth v5 is still in beta:** The API is largely stable but marked as beta. The `next-auth@beta` npm tag should be used.
- **Tailwind CSS 4 config migration:** The project's custom theme configuration (colors, spacing, animations) must be manually translated from JS config to CSS `@theme` blocks.
- **ESLint flat config:** The `eslint-config-next` package for Next.js 16 should support flat config. If not, a compatibility wrapper may be needed.

## Success Metrics

- All dependencies are at their latest major versions
- `pnpm build` completes without errors
- `pnpm lint` passes
- Image conversion works for all supported formats (webp, png, jpeg, ico)
- Discord OAuth login/logout flow works
- Database rate limiting works
- No React 19 hydration warnings in browser console

## Open Questions

- Does the deployment environment (Vercel or other) support Node.js >= 20.9.0?
- Should `.env.example` be updated with the new `AUTH_SECRET`/`AUTH_URL` variable names?
- Is `tailwindcss-animate` compatible with Tailwind CSS 4, or does it need a replacement?
- Does `eslint-config-next@16` natively support ESLint 9 flat config format?
