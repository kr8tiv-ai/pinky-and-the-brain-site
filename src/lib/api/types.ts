// src/lib/api/types.ts
// Shared response types for all API Route Handlers
// These types define the API contract between server routes and client consumers
// Server-side only — do NOT import in client components

// ─── Error type ───────────────────────────────────────────────────────────────

export interface ApiError {
  error: string
  status?: number
}

// ─── Treasury ─────────────────────────────────────────────────────────────────

export interface TreasuryResponse {
  solBalance: number
  solPriceUsd: number
  holdings: Array<{
    mint: string
    symbol: string
    name: string
    description?: string
    xAccount?: string
    bagsLink?: string
    uiAmount: number
    currentPriceUsd: number
    currentPriceSol: number
    currentValueUsd: number
    currentValueSol: number
    purchaseDate?: number
    purchasePriceUsd?: number
    costBasisUsd?: number
    gainLossUsd?: number
    gainLossPct?: number
    category: string
  }>
  totalValueUsd: number
  totalValueSol: number
}

// ─── Burns ────────────────────────────────────────────────────────────────────

export interface BurnSummaryResponse {
  totalBurned: number
  totalSupply: number
  burnedPct: number
  burnSourceBalance: number
  transactions: Array<{
    txHash: string
    timestamp: number
    amount: number
  }>
}

// ─── Holders (Hall of Fame) ───────────────────────────────────────────────────

export interface HolderResponse {
  rank: number
  address: string
  owner: string
  amount: number
  decimals: number
}

// ─── Wallet Activity (marketing, dev, LP wallets) ─────────────────────────────

export interface WalletActivityResponse {
  totalIn: number
  totalOut: number
  netBalance: number
  transactions: Array<{
    txHash: string
    timestamp: number
    amount: number
    flow: 'in' | 'out'
  }>
}

// ─── LP Fees ──────────────────────────────────────────────────────────────────

export interface LpFeeResponse {
  totalFeeSol: number
  inflows: Array<{
    txHash: string
    timestamp: number
    amountSol: number
  }>
  distribution: Record<string, { pct: number; sol: number }>
}

// ─── Reflections (SOL distributions to holders) ───────────────────────────────

export interface ReflectionResponse {
  totalDistributedSol: number
  distributions: Array<{
    txHash: string
    timestamp: number
    amountSol: number
  }>
}

// ─── Reflections Dashboard (comprehensive) ──────────────────────────────────

export interface ReflectionsDashboardResponse {
  totalFeesLifetimeSol: number
  totalReflectedSol: number
  currentAccruedSol: number
  payoutThresholdSol: number
  estimatedVolumeSol: number
  solPriceUsd: number
  lastPayoutTimestamp: number | null
  nextPayoutEstimate: number | null
  feeBreakdown: Record<string, { pct: number; sol: number }>
  distributions: Array<{
    txHash: string
    timestamp: number
    amountSol: number
    toAddress: string
  }>
}

// ─── Price (Command Header) ───────────────────────────────────────────────────

export interface PriceResponse {
  priceUsd: number
  priceSol: number
  priceChange24h: number
  marketCap?: number
  volume24h?: number
}
