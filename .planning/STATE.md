# Project State

## Current Phase
Phase 3: Next.js API Routes & React Query Setup — IN PROGRESS

## Current Plan
03-02 (next plan)

## Completed Phases
- Phase 1: Project Setup & Dependencies (commit 04c6c1c)
- Phase 2: API Layer (02-01, 02-02, 02-03 all complete)

## Completed Plans (Phase 2)
- 02-01: Foundational API wrappers (helius.ts, birdeye.ts, solscan.ts) — commits fc6c9a7, cb45666, 89f28e3
- 02-02: Composite API functions (treasury.ts, burns.ts, reflections.ts) — commits e7a267f, 30133d5
- 02-03: Shared types + route handler upgrades (types.ts, treasury route, hall-of-fame route) — commit e131374

## Completed Plans (Phase 3)
- 03-01: API Route Handlers (price, burns, holders, wallet/[address], lp-fees) — commits 68ab38f, 6128e2f

## Decisions
- Dashboard route: /war-room
- Data fetching: React Query (TanStack Query) with 60s price / 5min tx refresh
- Charts: Recharts
- Solana: @solana/web3.js + @solana/spl-token
- Hosting: Hostinger
- No wallet connect in V1
- No staking in V1 — stub with "PHASE 2: CLASSIFIED"
- Match existing classified/dark ops aesthetic exactly
- All API calls server-side only (Next.js API routes)
- Plain fetch() used for all API wrappers (no @solana/web3.js) to avoid server-side polyfill issues
- Birdeye X-API-KEY header uses uppercase per API requirement
- Solscan page_size typed as 10|20|30|40 union to enforce API constraint at compile time
- Pagination helpers (getAllAccountTransfers, getAllTokenTransfers) use 10-page safety limit
- Composite modules use two-level Promise.all: first for initial fetches, second for per-holding enrichment
- Per-holding try/catch in getTreasuryValuations — partial failures don't crash full treasury response
- burnedPct = totalBurned / (totalBurned + currentSupply) * 100 (% of original supply burned)
- getFeeDistribution is a pure function (no API calls) for R4 fee distribution ledger
- Token decimals always read from API transfer.token_decimals field, never hardcoded
- Thin route handler pattern: all complexity in lib/api/, routes are 15-line proxies only
- types.ts defines API contract once at src/lib/api/types.ts — Phase 3 routes import from there
- revalidate=60 for treasury (price data), revalidate=300 for holders (slower-changing)
- revalidate=60 for price endpoint (fast-changing), revalidate=300 for burns/holders/wallet/lp-fees
- wallet route uses await params pattern required by Next.js 16 dynamic route Promise params
- lp-fees route maps inflows to drop fromAddress field to match LpFeeResponse type exactly
- holders endpoint at /api/holders is canonical war-room endpoint; /api/hall-of-fame stays for landing page compatibility

## Last Session
- Stopped at: Completed 03-01-PLAN.md (API route handlers — price, burns, holders, wallet, lp-fees)
- Date: 2026-03-25

## API Keys Configured
- Helius RPC: configured
- Birdeye: configured (kr8tiv, 60 rpm)
- Solscan Pro v2: configured (existing JWT)

## Wallet Addresses
- Treasury: CzTn2G4uskfAC66QL1GoeSYEb3M3sUK4zxAoKDRGE4XV
- Burn Source: G4vH7anfjEt7WXyT3eAzie3NZRE7ywdgKgcqLVkaHTA8
- Burn Destination: 1nc1nerator11111111111111111111111111111111
- Dev: 7BLHKsHRGjsTKQdZYaC3tRDeUChJ9E2XsMPpg2Tv23cf
- Marketing: 3KjchVv3grS5S8YP4NfJ8XbU5gCNm9Qq86FrnnVUEB6r
- LP: GcNK263XZXW3omuVQpg2wc9Rs79TsGunknz8R378w3d8
