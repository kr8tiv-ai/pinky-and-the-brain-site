# PROJECT: $BRAIN War Room Dashboard

## Overview
Add a new `/war-room` page to the existing Pinky and the Brain website (www.pinkyandthebrain.fun). This is a full treasury intelligence dashboard that tracks all $BRAIN token operations — investments, burns, reflections, fee distribution, and wallet activity. Must match the existing classified/dark ops aesthetic exactly.

## Token Details
- **Token:** $BRAIN
- **Contract:** `7r9RJw6gWbj6s1N9pGKrdzzd5H7oK1sauuwkUDVKBAGS`
- **Treasury Wallet:** `CzTn2G4uskfAC66QL1GoeSYEb3M3sUK4zxAoKDRGE4XV`
- **Burn Source Wallet:** `G4vH7anfjEt7WXyT3eAzie3NZRE7ywdgKgcqLVkaHTA8`
- **Burn Destination:** `1nc1nerator11111111111111111111111111111111`
- **Dev Wallet:** `7BLHKsHRGjsTKQdZYaC3tRDeUChJ9E2XsMPpg2Tv23cf` (DISCRETIONARY — NOT TREASURY)
- **Marketing Wallet:** `3KjchVv3grS5S8YP4NfJ8XbU5gCNm9Qq86FrnnVUEB6r`
- **LP Wallet:** `GcNK263XZXW3omuVQpg2wc9Rs79TsGunknz8R378w3d8`
- **Bags Link:** `https://bags.fm/7r9RJw6gWbj6s1N9pGKrdzzd5H7oK1sauuwkUDVKBAGS`

## Tech Stack (Match Existing + Add)
- **Framework:** Next.js 16.2.1 (App Router) — match existing
- **Language:** TypeScript 5 (strict)
- **Styling:** Tailwind CSS v4 — use existing config
- **Animation:** GSAP 3.14 + ScrollTrigger — match existing
- **Data Fetching:** React Query (TanStack Query) with 60s price refresh, 5min tx history
- **Charts:** Recharts (clean integration with existing stack)
- **Solana:** @solana/web3.js + @solana/spl-token
- **Date:** date-fns
- **Hosting:** Hostinger
- **NO new UI libraries** — match existing components

## API Keys (.env.local — NEVER hardcode)
- `HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=9b0285c5-30f7-44b3-93da-2241f5637f01`
- `BIRDEYE_API_KEY=3922a536b1744c95ad31f6d528f3c055`
- `SOLSCAN_API_KEY=eyJhbGciOiJIUzI1NiIs...` (existing)

## API Sources
1. **Helius RPC** — Token balances, transaction history, holder counts
   - RPC: `https://mainnet.helius-rpc.com/?api-key=${KEY}`
   - Enhanced: `https://api-mainnet.helius-rpc.com/v0/`
2. **Birdeye API** — Price data (SOL + USD), OHLCV history
   - `GET https://public-api.birdeye.so/defi/price?address={mint}`
   - Header: `X-API-KEY: ${KEY}`
3. **Solscan Pro v2** — Tx history, holders, token transfers, burn verification
   - Base: `https://pro-api.solscan.io/v2.0/`
   - Header: `token: ${KEY}`

## Dashboard Sections (8 Components)

### 1. Command Header
- $BRAIN price in USD and SOL (live, Birdeye)
- 24h price change %
- Market cap
- Total volume since day 1
- "LIVE" pulsing indicator with Helius RPC connection status

### 2. Treasury Intel (CzTn2G4uskfAC66QL1GoeSYEb3M3sUK4zxAoKDRGE4XV)
- SOL balance (live)
- All SPL tokens held with:
  - Token name + contract address (link to Solscan)
  - Amount held
  - Current value in SOL and USD (Birdeye)
  - Date of purchase (first inbound tx from Solscan)
  - Price paid in SOL at purchase (Birdeye historical OHLCV)
  - Value in USD at purchase
  - Current gain/loss in % and absolute SOL/USD
  - Bags.fm link, X account (from investments.config.ts)
  - Brief description (from investments.config.ts)
- "CLASSIFIED" redacted card for unknown tokens
- Treasury value over time chart
- How much sold, which tokens, when

### 3. Burn Operations
- Source: G4vH7anfjEt7WXyT3eAzie3NZRE7ywdgKgcqLVkaHTA8
- Destination: 1nc1nerator11111111111111111111111111111111
- Total $BRAIN burned (running total)
- % of total supply burned
- % burned + % locked in LP combined
- Burn transactions table: date/time, amount, tx hash (Solscan link)
- "INCINERATED" visual treatment — red/orange glow within theme

### 4. Fee Distribution Ledger
- 10% Burned | 20% Top 100 Holders | 30% Investments
- 10% Compounding Liquidity | 5% Marketing | 5% DEX Boosts | 20% Dev
- Total SOL earned per category (from LP fee wallet tx history)
- Total USD value per category (SOL price at time of each tx)
- Running totals

### 5. Reflections Terminal
- Total SOL distributed as reflections to top 100 holders
- Current reflection rate
- Top 100 holders table: rank, wallet (truncated), $BRAIN balance
- Match existing "Hall of Fame" table aesthetic

### 6. Marketing Ops (3KjchVv3grS5S8YP4NfJ8XbU5gCNm9Qq86FrnnVUEB6r)
- Total SOL in / out / net balance
- Transaction log: date, amount, direction, tx hash

### 7. Dev Discretionary (7BLHKsHRGjsTKQdZYaC3tRDeUChJ9E2XsMPpg2Tv23cf)
- **Label: "DISCRETIONARY WALLET — NOT RELATED TO TREASURY"**
- Simple in/out/balance format
- Transaction log

### 8. LP Fees (GcNK263XZXW3omuVQpg2wc9Rs79TsGunknz8R378w3d8)
- Total fees earned from LP
- Fee inflows over time (chart)
- Feeds the distribution ledger in section 4

## File Structure
```
/app/war-room/page.tsx
/components/dashboard/
  CommandHeader.tsx
  TreasuryIntel.tsx
  BurnOperations.tsx
  FeeDistribution.tsx
  ReflectionsTerminal.tsx
  MarketingOps.tsx
  DevDiscretionary.tsx
  LpFees.tsx
/lib/api/
  helius.ts
  birdeye.ts
  solscan.ts
  treasury.ts
  burns.ts
  reflections.ts
/lib/constants.ts
/lib/investments.config.ts
/app/api/treasury/route.ts (upgrade existing)
/app/api/burns/route.ts
/app/api/holders/route.ts
/app/api/price/route.ts
```

## Visual Requirements
- Match site theme EXACTLY: dark bg, monospace/terminal fonts, classified doc aesthetic
- Each section = "dossier" or "ops briefing" card
- Redaction style (█████) for loading states
- Pulsing REC indicators for live data
- Number formatting: 1,234.56 SOL, $12,345.67
- Truncated wallet addresses with copy-to-clipboard
- Solscan links open in new tab
- Mobile responsive — stacked single column
- "CLASSIFIED" watermark on loading sections

## Auto-Refresh
- Prices: 60 seconds
- Transaction history: 5 minutes
- All via React Query with stale-while-revalidate

## V1 Exclusions
- No staking UI — stub with "PHASE 2: CLASSIFIED" treatment
- No wallet connect — later phase
- For tokens without determinable purchase data: show "HISTORICAL DATA PENDING"

## Success Criteria
1. Page loads with live $BRAIN price + SOL price within 3 seconds
2. Treasury holdings display with current values and gain/loss
3. Burn transactions pulled and aggregated correctly
4. Top 100 holders table populated
5. All wallet transaction histories showing in/out totals
6. Zero API keys exposed client-side
7. Visually indistinguishable from existing site aesthetic
8. Mobile responsive

## Organization
- **GitHub User:** Matt-Aurora-Ventures (lucidbloks@gmail.com)
- **GitHub Org:** kr8tiv-io
- **Repo:** kr8tiv-io/Pinkyandthebrain
