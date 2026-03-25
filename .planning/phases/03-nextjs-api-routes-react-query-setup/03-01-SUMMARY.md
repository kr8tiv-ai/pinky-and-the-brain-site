---
phase: 03-nextjs-api-routes-react-query-setup
plan: 01
subsystem: api-routes
tags: [next.js, api-routes, server-side, proxy-pattern, typescript]
dependency_graph:
  requires: [02-01, 02-02, 02-03]
  provides: [price-endpoint, burns-endpoint, holders-endpoint, wallet-endpoint, lp-fees-endpoint]
  affects: [03-02-react-query-hooks, 03-03-dashboard-ui]
tech_stack:
  added: []
  patterns: [thin-proxy-route, await-params-next16, parallel-promise-all]
key_files:
  created:
    - src/app/api/price/route.ts
    - src/app/api/burns/route.ts
    - src/app/api/holders/route.ts
    - src/app/api/wallet/[address]/route.ts
    - src/app/api/lp-fees/route.ts
  modified: []
decisions:
  - revalidate=60 for price endpoint (fast-changing), revalidate=300 for all others (5-minute cache)
  - wallet route uses await params pattern required by Next.js 16 dynamic route Promise params
  - lp-fees route maps inflows to drop fromAddress field to match LpFeeResponse type exactly
  - holders endpoint at /api/holders is canonical war-room endpoint; /api/hall-of-fame stays for landing page compatibility
  - marketCap and volume24h set to undefined — Birdeye /defi/price does not return these fields
metrics:
  duration_minutes: 3
  tasks_completed: 2
  files_created: 5
  files_modified: 0
  completed_date: "2026-03-25"
---

# Phase 3 Plan 01: API Route Handlers Summary

**One-liner:** Five thin Next.js API route handlers proxying lib/api/ composite functions to complete the server-side data layer for the War Room dashboard.

## What Was Built

Created 5 new Next.js API route handlers at `src/app/api/`. Each is a thin proxy (15-54 lines) that imports a Phase 2 lib/api/ function, calls it, and returns typed `NextResponse.json`. No business logic lives in route files. All API keys remain server-side in lib/api/ wrappers.

### Routes Created

| Endpoint | File | Revalidate | Lib Function | Response Type |
|---|---|---|---|---|
| GET /api/price | price/route.ts | 60s | getMultiTokenPrices | PriceResponse |
| GET /api/burns | burns/route.ts | 300s | getBurnSummary | BurnSummaryResponse |
| GET /api/holders | holders/route.ts | 300s | getTop100Holders | HolderResponse[] |
| GET /api/wallet/[address] | wallet/[address]/route.ts | 300s | getAllAccountTransfers | WalletActivityResponse |
| GET /api/lp-fees | lp-fees/route.ts | 300s | getLpFeeInflows + getFeeDistribution | LpFeeResponse |

### Full API Surface (7 total endpoints)

| Endpoint | Status |
|---|---|
| GET /api/treasury | Existing (Phase 2) |
| GET /api/hall-of-fame | Existing (Phase 2) |
| GET /api/price | New (this plan) |
| GET /api/burns | New (this plan) |
| GET /api/holders | New (this plan) |
| GET /api/wallet/[address] | New (this plan) |
| GET /api/lp-fees | New (this plan) |

## Implementation Notes

**Price route:** Calls `getMultiTokenPrices([BRAIN_TOKEN_MINT, SOL_MINT])` and constructs `PriceResponse` from the returned map. `priceSol` is derived by dividing BRAIN price by SOL price. `marketCap` and `volume24h` are `undefined` — Birdeye `/defi/price` does not return these fields.

**Wallet route:** Uses `await params` pattern required by Next.js 16 where `params` is a `Promise<{ address: string }>`. Fetches inbound and outbound transfers in parallel with `Promise.all`. Converts lamports to SOL (divide by 1_000_000_000). Serves R6 (marketing wallet), R7 (dev wallet), and R8 (LP wallet) — same endpoint, different address param.

**LP fees route:** Calls `getLpFeeInflows()` and the pure `getFeeDistribution()` function. Maps inflows to drop `fromAddress` field before returning, ensuring structural match with `LpFeeResponse.inflows` type which expects `{ txHash, timestamp, amountSol }` only.

## Verification

- TypeScript: `tsc --noEmit` passes with zero errors across all 5 new files
- No `process.env` usage in any route file (all API key access is in lib/api/ wrappers)
- All routes export `revalidate` as literal number (not expression)
- All 7 API route directories confirmed present

## Deviations from Plan

None — plan executed exactly as written.

## Task Commits

| Task | Description | Commit |
|---|---|---|
| Task 1 | price, burns, holders routes | 68ab38f |
| Task 2 | wallet dynamic route + lp-fees route | 6128e2f |
