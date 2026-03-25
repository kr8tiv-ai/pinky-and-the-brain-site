---
phase: 03-nextjs-api-routes-react-query-setup
plan: 02
subsystem: ui
tags: [react-query, tanstack-query, hooks, typescript, client-components]

# Dependency graph
requires:
  - phase: 03-01
    provides: API route handlers for /api/price, /api/burns, /api/holders, /api/wallet/[address], /api/lp-fees
  - phase: 02-03
    provides: Shared response types in src/lib/api/types.ts
provides:
  - usePrice() hook with 60s auto-refresh
  - useTreasury() hook with 60s auto-refresh
  - useBurns() hook with 5min auto-refresh
  - useHolders() hook with 5min auto-refresh
  - useWallet(address) parameterized hook with 5min auto-refresh
  - useLpFees() hook with 5min auto-refresh
affects: [04-war-room-dashboard, phase-4-components, all-war-room-sections]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - React Query v5 single-object API for all data hooks
    - 'use client' directive on all hooks (client-component data fetching)
    - fetch('/api/...') in queryFn — no direct lib/api/ imports in hooks
    - Parameterized queryKey (['wallet', address]) for per-wallet cache deduplication
    - enabled guard (!!address) for conditional hook execution

key-files:
  created:
    - src/hooks/usePrice.ts
    - src/hooks/useTreasury.ts
    - src/hooks/useBurns.ts
    - src/hooks/useHolders.ts
    - src/hooks/useWallet.ts
    - src/hooks/useLpFees.ts
  modified: []

key-decisions:
  - "useWallet is a single generic hook serving R6 (marketing), R7 (dev), R8 (LP) — callers pass wallet constants, address in queryKey handles deduplication"
  - "usePrice staleTime=30s (lower than global 60s default) to keep price data feeling live"
  - "No onError callbacks used — React Query v5 surfaces errors via result.isError and result.error"
  - "HolderResponse[] is array (not wrapped object) to match /api/holders route output"

patterns-established:
  - "Hook pattern: 'use client', import type from @/lib/api/types, fetch /api/route, single-object useQuery<ResponseType, Error>"
  - "Price/treasury hooks: staleTime=30-60s, refetchInterval=60s"
  - "Transaction hooks (burns/holders/wallet/lp-fees): staleTime=300s, refetchInterval=300s"

requirements-completed: [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11]

# Metrics
duration: 8min
completed: 2026-03-25
---

# Phase 3 Plan 02: React Query Data Hooks Summary

**6 typed React Query v5 hooks with auto-refresh across all War Room data domains — price/treasury at 60s, transactions at 5min**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-25T07:39:46Z
- **Completed:** 2026-03-25T07:48:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Created all 6 React Query v5 hooks in src/hooks/ — usePrice, useTreasury, useBurns, useHolders, useWallet, useLpFees
- Price and treasury hooks refresh every 60s satisfying R11 fast-refresh requirement
- Transaction hooks (burns, holders, wallet, LP fees) refresh every 5min satisfying R11 slow-refresh requirement
- useWallet is a single generic parameterized hook that serves 3 wallet sections (marketing R6, dev R7, LP R8) via address in queryKey for proper cache deduplication
- All hooks are client-safe — no server-side imports, all data flows through /api/ routes via fetch

## Task Commits

Each task was committed atomically:

1. **Task 1: Create price, treasury, and burns hooks** - `dfe6160` (feat)
2. **Task 2: Create holders, wallet, and LP fees hooks** - `5b78a29` (feat)

## Files Created/Modified
- `src/hooks/usePrice.ts` - Price data hook, 60s stale/refetch, queryKey=['price']
- `src/hooks/useTreasury.ts` - Treasury valuation hook, 60s stale/refetch, queryKey=['treasury']
- `src/hooks/useBurns.ts` - Burn summary hook, 5min stale/refetch, queryKey=['burns']
- `src/hooks/useHolders.ts` - Top 100 holders hook, 5min stale/refetch, queryKey=['holders']
- `src/hooks/useWallet.ts` - Generic wallet activity hook, address param, queryKey=['wallet', address]
- `src/hooks/useLpFees.ts` - LP fee distribution hook, 5min stale/refetch, queryKey=['lp-fees']

## Decisions Made
- Single generic useWallet(address) hook instead of separate per-wallet hooks — address in queryKey handles React Query's cache deduplication correctly for concurrent calls to different wallets
- usePrice staleTime set to 30s (below global QueryClient default of 60s) to make price feel more live while still capping network load with 60s refetchInterval
- No onError callbacks — v5 removed these; error state surfaces via result.isError/result.error which components consume directly

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None - all 6 hooks compiled with zero TypeScript errors on first attempt.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 6 data hooks are ready for Phase 4 War Room dashboard components
- Components simply call `usePrice()`, `useTreasury()`, `useWallet(MARKETING_WALLET)`, etc.
- QueryProvider (src/providers/query-client.tsx) already wraps the app — no additional setup needed

---
*Phase: 03-nextjs-api-routes-react-query-setup*
*Completed: 2026-03-25*

## Self-Check: PASSED

- FOUND: src/hooks/usePrice.ts
- FOUND: src/hooks/useTreasury.ts
- FOUND: src/hooks/useBurns.ts
- FOUND: src/hooks/useHolders.ts
- FOUND: src/hooks/useWallet.ts
- FOUND: src/hooks/useLpFees.ts
- FOUND commit: dfe6160
- FOUND commit: 5b78a29
