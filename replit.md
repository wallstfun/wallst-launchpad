# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite (Tailwind CSS, Shadcn UI, React Query, Framer Motion)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── wall-st-launchpad/  # Wall St. Launchpad React frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Wall St. Launchpad

A premium dark-themed Solana memecoin launchpad app.

### Features
- Ultra-dark trading terminal design (#050505 background, neon green #00ff88 accents)
- Hero section with "Create Coin" CTA
- Stats bar (Total Launches, SOL Raised, Graduated, Fee)
- Live Launches grid of token cards with bonding curve progress bars
- Create Coin modal with ticker cooldown enforcement (15-minute cooldown per ticker)
- **Real Phantom wallet connection** via `window.solana` browser API
- **Real Raydium LaunchLab integration** using `@raydium-io/raydium-sdk-v2@0.2.36-alpha`
  - Program ID: `LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj` (mainnet), `DRay6fNdQ5J82H7xV6uq2aV3mNrUZ1J4PgSKsWgptcm6` (devnet)
  - Devnet Config: `7ZR4zD7PYfY2XxoG1Gxcy2EgEeGYrpxrwzPuwdUBssEt`
  - Token creation via `raydium.launchpad.createLaunchpad()`, signs with Phantom
- Token metadata endpoint serves Metaplex-compatible JSON as token URI
- Raydium migration badge for completed launches
- Graceful fallback: still records token in DB if on-chain tx fails (devnet / no wallet)
- **Platform fee collection**: 0.75% `shareFeeRate` sent to `Hw7yc27h6Lws6YsQmdLoj4M7psyFHRhosFwoGuSESmTh` on every buy/sell via `shareFeeReceiver` in the Raydium LaunchLab SDK

### Key Files
- `artifacts/wall-st-launchpad/src/pages/home.tsx` — Main page
- `artifacts/wall-st-launchpad/src/components/create-token-modal.tsx` — Launch modal with full on-chain flow
- `artifacts/wall-st-launchpad/src/components/token-card.tsx` — Token cards
- `artifacts/wall-st-launchpad/src/components/layout.tsx` — App layout/navbar
- `artifacts/wall-st-launchpad/src/hooks/use-wallet.tsx` — Real Phantom wallet context
- `artifacts/wall-st-launchpad/src/lib/launchpad.ts` — Raydium LaunchLab SDK integration
- `artifacts/api-server/src/routes/launchpad.ts` — Launchpad API routes + metadata endpoint
- `lib/db/src/schema/tokens.ts` — Tokens table schema

### Environment Variables
- `VITE_RPC_URL` — Solana RPC endpoint (defaults to `https://api.devnet.solana.com`)

### API Endpoints
- `GET /api/launchpad/tokens` — List all tokens
- `POST /api/launchpad/tokens` — Create a token (enforces 15-min ticker cooldown)
- `GET /api/launchpad/check-ticker?ticker=XXX` — Check ticker availability
- `PATCH /api/launchpad/tokens/:id/update-progress` — Update SOL raised (auto-migrates when target reached)
- `GET /api/launchpad/token-metadata?name=X&symbol=Y&description=Z&image=W` — Metaplex token metadata JSON (used as LaunchLab URI)

### Vite Config Notes
- `vite-plugin-node-polyfills` provides Buffer/process/crypto polyfills for Solana SDK
- `@raydium-io/raydium-sdk-v2`, `@solana/web3.js`, `@solana/buffer-layout`, `lodash` are in `optimizeDeps.include` to ensure correct CJS→ESM conversion by esbuild
- `bn.js`, `@solana/buffer-layout` installed directly in frontend workspace to satisfy Vite's dep resolution

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/wall-st-launchpad` (`@workspace/wall-st-launchpad`)

React + Vite frontend. Served at `/`. Uses `@workspace/api-client-react` for typed API calls.

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

- `src/schema/tokens.ts` — tokens table

Production migrations handled by Replit when publishing. In development: `pnpm --filter @workspace/db run push`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config.
Run codegen: `pnpm --filter @workspace/api-spec run codegen`
