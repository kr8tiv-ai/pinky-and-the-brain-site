# ROADMAP: $BRAIN War Room Dashboard

## Milestone 1: Foundation & API Layer
> Set up dependencies, constants, API wrappers, and the page shell

### Phase 1: Project Setup & Dependencies
- Install: @solana/web3.js, @solana/spl-token, @tanstack/react-query, recharts, date-fns
- Remove unused: @react-three/fiber, @react-three/drei, three, framer-motion
- Configure .env.local with Helius, Birdeye, Solscan keys
- Create /lib/constants.ts (all wallet addresses, token mint, config)
- Create /lib/investments.config.ts (manual metadata for treasury holdings)

### Phase 2: API Layer (/lib/api/)
- helius.ts — RPC wrapper (getBalance, getTokenAccounts, getTokenSupply, Enhanced Transactions)
- birdeye.ts — price fetch, historical OHLCV for purchase price lookback
- solscan.ts — transaction history, token holders, token transfers, burn tx filtering
- treasury.ts — composite: combine above to compute gain/loss per holding
- burns.ts — fetch and aggregate all burn transactions
- reflections.ts — fetch SOL distribution transactions
- All calls go through Next.js API routes, never client-side with secret keys

**Plans:** 3 plans
**Requirements:** [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11]

Plans:
- [x] 02-01-PLAN.md — Foundational API wrappers (helius.ts, birdeye.ts, solscan.ts) ✓ 2026-03-25
- [x] 02-02-PLAN.md — Composite API functions (treasury.ts, burns.ts, reflections.ts) ✓ 2026-03-25
- [x] 02-03-PLAN.md — Shared types, upgrade treasury route, real hall-of-fame route ✓ 2026-03-25

### Phase 3: Next.js API Routes & React Query Setup
- /app/api/price/route.ts — $BRAIN and SOL prices (60s revalidate)
- /app/api/burns/route.ts — burn transactions and totals
- /app/api/holders/route.ts — top 100 holders (canonical endpoint)
- /app/api/wallet/[address]/route.ts — generic wallet in/out/balance
- /app/api/lp-fees/route.ts — LP fee inflows + distribution
- React Query hooks for all data domains with auto-refresh intervals

**Goal:** All API routes serving typed data and all React Query hooks wired for client consumption
**Plans:** 2 plans
**Requirements:** [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11]

Plans:
- [x] 03-01-PLAN.md — Create 5 new API route handlers (price, burns, holders, wallet, lp-fees) ✓ 2026-03-25
- [x] 03-02-PLAN.md — Create 6 React Query hooks (usePrice, useTreasury, useBurns, useHolders, useWallet, useLpFees) ✓ 2026-03-25

---

## Milestone 2: War Room Page & Core Sections
> Build the page shell and first 4 dashboard sections

### Phase 4: War Room Page Shell & Command Header
- Create /app/war-room/page.tsx
- Add navigation link from landing page to War Room
- CommandHeader.tsx: live $BRAIN price (USD + SOL), 24h change, market cap, total volume
- "LIVE" pulsing indicator with connection status
- Match classified/dark ops aesthetic exactly

### Phase 5: Treasury Intel Section
- TreasuryIntel.tsx: SOL balance + all SPL token holdings
- Per-token display: name, contract, amount, current value, purchase date/price, gain/loss
- Bags.fm links, X accounts, descriptions from investments.config.ts
- "CLASSIFIED" redacted cards for unknown tokens
- Treasury value over time chart (Recharts)
- Sold tokens tracking

### Phase 6: Burn Operations Section
- BurnOperations.tsx: fetch all burns from source → incinerator
- Total burned, % of supply, % burned + LP locked
- Burn transactions table with date/time, amount, Solscan tx links
- "INCINERATED" visual treatment (red/orange glow within theme)

### Phase 7: Fee Distribution Ledger
- FeeDistribution.tsx: visual breakdown of 10/20/30/10/5/5/20 split
- Calculate totals per category from LP fee wallet tx history
- SOL + USD values per category
- Running totals with formatted numbers

---

## Milestone 3: Holder & Wallet Intelligence
> Reflections, holder data, and wallet tracking sections

### Phase 8: Reflections Terminal
- ReflectionsTerminal.tsx: total SOL distributed as reflections
- Current reflection rate
- Top 100 holders table: rank, wallet (truncated + copy), $BRAIN balance
- Match existing Hall of Fame table aesthetic from landing page

### Phase 9: Marketing Ops & Dev Discretionary
- MarketingOps.tsx: total in/out/balance for marketing wallet
- Transaction log: date, amount, direction, tx hash (Solscan links)
- DevDiscretionary.tsx: clearly labeled "DISCRETIONARY — NOT TREASURY"
- Same in/out/balance format
- Transaction logs for both

### Phase 10: LP Fees Section
- LpFees.tsx: total fees earned from LP
- Fee inflows over time chart (Recharts)
- Connection to Fee Distribution Ledger data
- Formatted SOL/USD totals

---

## Milestone 4: Polish & Deploy
> Loading states, responsive design, performance, deployment

### Phase 11: Loading States & Error Handling
- Redaction style (█████) loading skeletons for all sections
- "CLASSIFIED" watermark on loading sections
- Error boundaries with themed error states
- Graceful fallbacks when APIs are unavailable

### Phase 12: Responsive Design & Animation
- Mobile responsive: stacked single column on mobile
- GSAP entrance animations matching landing page quality
- Pulsing REC indicators for live data
- Copy-to-clipboard on all wallet addresses
- Solscan links open in new tab
- Number formatting: 1,234.56 SOL / $12,345.67

### Phase 13: Performance & Deployment
- Staking section stub: "PHASE 2: CLASSIFIED" treatment
- React Query cache optimization
- Bundle analysis and code splitting
- Hostinger deployment configuration
- Final testing across devices

---

## Dependency Map
```
Phase 1 (Setup) → Phase 2 (API Layer) → Phase 3 (Routes + RQ)
                                              ↓
Phase 4 (Shell + Header) → Phase 5 (Treasury) → Phase 6 (Burns) → Phase 7 (Fees)
                                                                        ↓
Phase 8 (Reflections) → Phase 9 (Marketing + Dev) → Phase 10 (LP Fees)
                                                          ↓
Phase 11 (Loading) → Phase 12 (Responsive) → Phase 13 (Deploy)
```

## API Budget
| Service | Plan | Cost/mo |
|---------|------|---------|
| Helius | Free/Developer | $0-49 |
| Birdeye | Free (60 rpm) | $0 |
| Solscan Pro | Existing key | $0 |
| **Total** | | **$0-49** |
