---
phase: 02-api-layer
plan: 03
subsystem: api
tags: [typescript, nextjs, solscan, birdeye, route-handlers, types]

# Dependency graph
requires:
  - phase: 02-api-layer/02-01
    provides: helius.ts, birdeye.ts, solscan.ts foundational wrappers
  - phase: 02-api-layer/02-02
    provides: treasury.ts, burns.ts, reflections.ts composite modules
provides:
  - Shared TypeScript response types for all API routes (src/lib/api/types.ts)
  - Upgraded /api/treasury route delegating to getTreasuryValuations()
  - Real /api/hall-of-fame route returning Solscan top 100 holders
affects:
  - 03-war-room-ui (uses these routes for data)
  - all future Phase 3 routes (use types.ts interfaces)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Thin route handler proxy pattern — route imports lib/api function, calls it, returns JSON, handles 500
    - Shared types module at src/lib/api/types.ts — single source of truth for API response shapes
    - revalidate export per route — 60s for price-sensitive data, 300s for slower-changing data

key-files:
  created:
    - src/lib/api/types.ts
  modified:
    - src/app/api/treasury/route.ts
    - src/app/api/hall-of-fame/route.ts

key-decisions:
  - "Thin route handler pattern: all complexity in lib/api/, routes are 15-line proxies only"
  - "types.ts defines API contract once — prevents duplication across routes and Phase 3 consumers"
  - "revalidate=60 for treasury (price data), revalidate=300 for holders (slower-changing)"

patterns-established:
  - "Route Handler pattern: import lib/api fn → call it → NextResponse.json → catch → 500 + console.error"
  - "Shared types import path: @/lib/api/types — Phase 3 routes MUST use these, not define their own"

requirements-completed: [R9, R10, R11, R5]

# Metrics
duration: 4min
completed: 2026-03-25
---

# Phase 2 Plan 03: API Types and Route Handlers Summary

**Shared response types module plus thin Next.js Route Handler proxies for treasury (Helius+Birdeye) and hall-of-fame (Solscan top-100 holders), replacing hardcoded mocks and inline public-RPC calls**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-25T06:53:04Z
- **Completed:** 2026-03-25T06:57:21Z
- **Tasks:** 1 (combined Parts A, B, C)
- **Files modified:** 3 files (1 created, 2 replaced)

## Accomplishments
- Created `src/lib/api/types.ts` with 8 shared response interfaces covering all planned API routes
- Upgraded treasury route from 109-line inline implementation (public RPC, Jupiter prices, only $BRAIN priced) to a 17-line proxy using the full `getTreasuryValuations()` with Helius+Birdeye+gain-loss
- Replaced hall-of-fame 5-item hardcoded mock with real Solscan top-100 holder data via `getTop100Holders()`
- Zero TypeScript errors across all three files

## Task Commits

1. **Task 1: Create shared API types and upgrade existing routes** - `e131374` (feat)

## Files Created/Modified
- `src/lib/api/types.ts` — 8 shared response interfaces: ApiError, TreasuryResponse, BurnSummaryResponse, HolderResponse, WalletActivityResponse, LpFeeResponse, ReflectionResponse, PriceResponse
- `src/app/api/treasury/route.ts` — Replaced 109-line inline impl with 17-line proxy to getTreasuryValuations()
- `src/app/api/hall-of-fame/route.ts` — Replaced 5-item mock with real getTop100Holders(BRAIN_TOKEN_MINT)

## Decisions Made
- Types defined as standalone interfaces in types.ts rather than re-exporting from lib/api modules — Phase 3 routes import from one place, not scattered across composite modules
- Hall-of-fame uses `BRAIN_TOKEN_MINT` constant (imported from `@/lib/constants`), not hardcoded string — consistent with Wave 2 pattern
- Treasury `revalidate = 60` (price data refreshes frequently), hall-of-fame `revalidate = 300` (holder rankings change slowly)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Node.js not in WSL PATH — used `wslpath -w` to convert paths for PowerShell script execution for TypeScript verification. Standard pattern for this project environment.

## User Setup Required
None - no external service configuration required. API keys were configured in Phase 1.

## Next Phase Readiness
- Full data pipeline proven end-to-end: Route Handler → lib/api/ composite → lib/api/ foundational → external API
- Phase 3 can build all remaining routes (`/api/burns`, `/api/reflections`, `/api/wallet-activity`, `/api/lp-fees`, `/api/price`) following the identical thin-proxy pattern
- `types.ts` has all response interfaces Phase 3 routes will need — import from `@/lib/api/types`
- No blockers

---
*Phase: 02-api-layer*
*Completed: 2026-03-25*
