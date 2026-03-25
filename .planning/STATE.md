# Project State

## Current Phase
Phase 2: War Room Data Hooks & API Routes — Plan 02 (Composite API functions)

## Current Plan
02-02-PLAN.md — Composite API functions (treasury.ts, burns.ts, reflections.ts)

## Completed Phases
- Phase 1: Project Setup & Dependencies (commit 04c6c1c)

## Completed Plans (Phase 2)
- 02-01: Foundational API wrappers (helius.ts, birdeye.ts, solscan.ts) — commits fc6c9a7, cb45666, 89f28e3

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

## Last Session
- Stopped at: Completed 02-01-PLAN.md (foundational API wrappers)
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
