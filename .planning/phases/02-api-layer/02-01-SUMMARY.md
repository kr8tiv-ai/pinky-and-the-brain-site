---
phase: 02-api-layer
plan: 01
subsystem: api
tags: [helius, birdeye, solscan, solana, rpc, typescript, next.js, fetch]

# Dependency graph
requires:
  - phase: 01-setup
    provides: constants.ts with HELIUS_RPC_URL, BIRDEYE_BASE_URL, SOLSCAN_API_BASE and .env.local with all three API keys

provides:
  - Typed Helius JSON-RPC wrapper (getSolBalance, getTokenAccountsByOwner, getTokenSupply)
  - Typed Birdeye price wrapper (getTokenPrice, getMultiTokenPrices, getOHLCV, getPriceAtTimestamp)
  - Typed Solscan Pro v2 wrapper with pagination (getAccountTransfers, getAllAccountTransfers, getTokenTransfers, getAllTokenTransfers, getTokenHolders, getTop100Holders)

affects:
  - 02-02 (treasury composite layer imports helius + birdeye + solscan)
  - 02-03 (burns/reflections composite layer imports solscan + helius)
  - all Route Handlers in src/app/api/* that proxy external blockchain data

# Tech tracking
tech-stack:
  added: []  # No new packages — all fetching uses native fetch() per plan
  patterns:
    - "Private helper pattern: rpc<T>() generic for Helius, birdeyeHeaders() for auth, solscanHeaders() for auth"
    - "next: { revalidate: N } on all fetch calls — 60s for prices, 300s for historical/tx data"
    - "Typed union for page_size: 10 | 20 | 30 | 40 to enforce Solscan API constraint at compile time"
    - "Pagination helpers with 10-page safety limit (getAllAccountTransfers, getAllTokenTransfers)"
    - "Promise.all for parallel page fetching in getTop100Holders"

key-files:
  created:
    - src/lib/api/helius.ts
    - src/lib/api/birdeye.ts
    - src/lib/api/solscan.ts
  modified: []

key-decisions:
  - "Plain fetch() used for all API calls instead of @solana/web3.js to avoid server-side polyfill issues"
  - "Birdeye X-API-KEY header uses uppercase per API requirement (env var BIRDEYE_API_KEY maps to HTTP header X-API-KEY)"
  - "Solscan page_size typed as 10|20|30|40 union to enforce API constraint at compile time, preventing 400 errors"
  - "Pagination helpers use explicit option types (not Omit<Parameters<...>>) for TypeScript strict mode compatibility"
  - "getAllAccountTransfers and getAllTokenTransfers both use 10-page safety limit to prevent runaway loops"

patterns-established:
  - "Pattern: All lib/api/ functions are pure async, server-side only, no 'use client', no NEXT_PUBLIC_ vars"
  - "Pattern: All external URLs imported from @/lib/constants — never hardcoded in wrapper modules"
  - "Pattern: Private header helper functions (birdeyeHeaders, solscanHeaders) encapsulate auth per service"
  - "Pattern: Pagination helpers accept all options except page (managed internally by the loop)"

requirements-completed: [R1, R5, R6, R7, R9]

# Metrics
duration: 25min
completed: 2026-03-25
---

# Phase 02 Plan 01: API Wrapper Modules Summary

**Typed Helius RPC, Birdeye price/OHLCV, and Solscan Pro v2 wrappers with pagination helpers — all server-side only, no hardcoded keys, zero TypeScript errors**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-03-25T00:00:00Z
- **Completed:** 2026-03-25T00:25:00Z
- **Tasks:** 3
- **Files modified:** 3 (all created new)

## Accomplishments

- Created `src/lib/api/helius.ts` — generic JSON-RPC helper with getSolBalance, getTokenAccountsByOwner, getTokenSupply and exported TokenAccount interface
- Created `src/lib/api/birdeye.ts` — getTokenPrice, getMultiTokenPrices, getOHLCV (v3 endpoint with required time bounds), getPriceAtTimestamp (closest-candle lookup) with TokenPrice and OHLCVCandle interfaces
- Created `src/lib/api/solscan.ts` — full account and token transfer wrappers with pagination helpers, getTokenHolders with typed page_size union (10|20|30|40), and getTop100Holders using parallel Promise.all fetching

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Helius RPC wrapper** - `fc6c9a7` (feat)
2. **Task 2: Create Birdeye price wrapper** - `cb45666` (feat)
3. **Task 3: Create Solscan Pro v2 wrapper** - `89f28e3` (feat)

## Files Created/Modified

- `src/lib/api/helius.ts` (104 lines) — Helius JSON-RPC wrapper; TokenAccount interface; getSolBalance, getTokenAccountsByOwner, getTokenSupply; HELIUS_RPC_URL from constants
- `src/lib/api/birdeye.ts` (142 lines) — Birdeye REST wrapper; TokenPrice + OHLCVCandle interfaces; getTokenPrice, getMultiTokenPrices, getOHLCV, getPriceAtTimestamp; BIRDEYE_BASE_URL from constants, X-API-KEY header
- `src/lib/api/solscan.ts` (263 lines) — Solscan Pro v2 wrapper; Transfer + TokenTransfer + Holder interfaces; getAccountTransfers, getAllAccountTransfers, getTokenTransfers, getAllTokenTransfers, getTokenHolders, getTop100Holders; SOLSCAN_API_BASE from constants, token header

## Decisions Made

- Used plain `fetch()` throughout instead of `@solana/web3.js` SDK, per research recommendation to avoid server-side polyfill issues. The existing `HELIUS_RPC_URL` in constants.ts already includes the API key in the query string.
- Birdeye HTTP header name is `X-API-KEY` (uppercase) — distinct from the env var name `BIRDEYE_API_KEY`. This distinction prevents 401 errors.
- Solscan `page_size` for the holders endpoint is typed as a union `10 | 20 | 30 | 40` to enforce the API constraint at compile time, preventing silent 400 errors at runtime.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript error in pagination helper type signatures**
- **Found during:** Task 3 verification (TypeScript compilation)
- **Issue:** `Omit<Parameters<typeof fn>[1], 'page'>` fails strict TypeScript when the parameter type includes `| undefined`. The type system cannot resolve `.page_size` on the resulting type.
- **Fix:** Replaced inline `Omit<Parameters<...>>` with explicit named option types (`AccountTransferOptions`, `TokenTransferOptions`) that exclude `page` directly.
- **Files modified:** `src/lib/api/solscan.ts`
- **Verification:** `tsc --noEmit` exits with code 0 after fix
- **Committed in:** `89f28e3` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - TypeScript type error)
**Impact on plan:** Required fix for TypeScript strict mode compatibility. No scope creep — same runtime behavior, better compile-time correctness.

## Issues Encountered

- PowerShell path resolution issue in WSL: paths starting with `C:\` were being converted to `/mnt/c//...` which caused cd and git -C commands to fail. Resolved by using `git -C /c/Users/...` (WSL native path at `/c/` mount) and `node node_modules/typescript/bin/tsc` directly for TypeScript checks.

## Next Phase Readiness

- All three base API wrappers are ready for import by composite modules (treasury.ts, burns.ts, reflections.ts) in plans 02 and 03
- All functions return typed objects — no `any` types remain
- Pagination helpers in solscan.ts prevent incomplete data for wallets with many transactions
- Plan 02-02 (treasury composite) can immediately import from helius, birdeye, and solscan wrappers

---
*Phase: 02-api-layer*
*Completed: 2026-03-25*
