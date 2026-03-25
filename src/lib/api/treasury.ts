// src/lib/api/treasury.ts
// Server-side only — do NOT import in client components
// Composite treasury module: SOL balance + SPL holdings, current prices, gain/loss computation
// Primary: Helius (RPC + parsed tx history), DexScreener (prices + metadata)
// Historical SOL prices: CoinGecko (free, cached 24h)

import { getSolBalance, getTokenAccountsByOwner } from './helius'
import { getJupiterPrices, getPricesWithMetadata } from './jupiter'
import type { DexTokenMeta } from './jupiter'
import { TREASURY_WALLET, SOL_MINT, HELIUS_API_URL } from '@/lib/constants'
import { HOLDINGS_BY_MINT } from '@/lib/investments.config'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HoldingValuation {
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
}

export interface TreasuryResponse {
  solBalance: number
  solPriceUsd: number
  holdings: HoldingValuation[]
  totalValueUsd: number
  totalValueSol: number
}

// ─── Helius Parsed Transaction History ───────────────────────────────────────

interface HeliusParsedTx {
  signature: string
  timestamp: number
  type: string
  nativeTransfers?: Array<{
    fromUserAccount: string
    toUserAccount: string
    amount: number // lamports
  }>
  tokenTransfers?: Array<{
    fromUserAccount: string
    toUserAccount: string
    mint: string
    tokenAmount: number
  }>
}

interface AcquisitionInfo {
  timestamp: number
  solSpent: number // SOL (not lamports), 0 if transferred for free
}

/**
 * Fetches parsed transaction history for the treasury wallet from Helius.
 * Paginates up to 5 pages (~500 transactions) to find acquisition history.
 */
async function getTreasuryHistory(): Promise<HeliusParsedTx[]> {
  const apiKey = process.env.HELIUS_API_KEY
  if (!apiKey) return []

  const allTxs: HeliusParsedTx[] = []
  let before: string | undefined

  for (let page = 0; page < 5; page++) {
    const url = new URL(`${HELIUS_API_URL}/addresses/${TREASURY_WALLET}/transactions/`)
    url.searchParams.set('api-key', apiKey)
    if (before) url.searchParams.set('before', before)

    const res = await fetch(url.toString(), { next: { revalidate: 300 } })
    if (!res.ok) break

    const txs = (await res.json()) as HeliusParsedTx[]
    if (txs.length === 0) break

    allTxs.push(...txs)
    before = txs[txs.length - 1].signature
  }

  return allTxs
}

/**
 * From transaction history, finds the first acquisition of each token.
 * Looks for the earliest transaction where the token was received by the treasury wallet.
 * Also captures SOL spent in the same transaction (swap cost).
 */
function findAcquisitions(
  txHistory: HeliusParsedTx[],
  mints: string[]
): Record<string, AcquisitionInfo> {
  const mintSet = new Set(mints)
  const result: Record<string, AcquisitionInfo> = {}

  // Sort oldest-first to find the actual first acquisition
  const sorted = [...txHistory].sort((a, b) => a.timestamp - b.timestamp)

  for (const tx of sorted) {
    if (!tx.tokenTransfers) continue

    for (const transfer of tx.tokenTransfers) {
      if (
        transfer.toUserAccount === TREASURY_WALLET &&
        mintSet.has(transfer.mint) &&
        transfer.tokenAmount > 0 &&
        !result[transfer.mint]
      ) {
        // Sum SOL outflows from treasury in this transaction (swap cost)
        let solSpent = 0
        if (tx.nativeTransfers) {
          for (const nt of tx.nativeTransfers) {
            if (nt.fromUserAccount === TREASURY_WALLET && nt.amount > 0) {
              solSpent += nt.amount / 1_000_000_000
            }
          }
        }

        result[transfer.mint] = { timestamp: tx.timestamp, solSpent }
      }
    }
  }

  return result
}

// ─── Historical SOL Price (CoinGecko free API) ──────────────────────────────

/**
 * Fetches historical SOL/USD price for a specific date.
 * Uses CoinGecko free API, cached for 24 hours.
 */
async function getHistoricalSolPrice(timestampSeconds: number): Promise<number | null> {
  try {
    const date = new Date(timestampSeconds * 1000)
    const dd = String(date.getUTCDate()).padStart(2, '0')
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
    const yyyy = date.getUTCFullYear()

    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/solana/history?date=${dd}-${mm}-${yyyy}&localization=false`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return null

    const data = (await res.json()) as {
      market_data?: { current_price?: { usd?: number } }
    }
    return data?.market_data?.current_price?.usd ?? null
  } catch {
    return null
  }
}

/**
 * Batch-fetches historical SOL prices for multiple timestamps.
 * Deduplicates by date to minimize API calls.
 */
async function getHistoricalSolPrices(
  timestamps: number[]
): Promise<Record<number, number>> {
  // Group timestamps by date to deduplicate
  const dateMap = new Map<string, number[]>() // "DD-MM-YYYY" → [timestamps]
  for (const ts of timestamps) {
    const date = new Date(ts * 1000)
    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`
    const group = dateMap.get(key) ?? []
    group.push(ts)
    dateMap.set(key, group)
  }

  const result: Record<number, number> = {}

  // Fetch one price per unique date, then assign to all timestamps on that date
  const entries = Array.from(dateMap.entries())
  // Process sequentially to respect CoinGecko rate limits
  for (const [, tsGroup] of entries) {
    const price = await getHistoricalSolPrice(tsGroup[0])
    if (price !== null) {
      for (const ts of tsGroup) {
        result[ts] = price
      }
    }
  }

  return result
}

// ─── Holding Enrichment ──────────────────────────────────────────────────────

function enrichHolding(
  mint: string,
  uiAmount: number,
  currentPriceUsd: number,
  solPriceUsd: number,
  dexMeta?: DexTokenMeta,
  acquisition?: AcquisitionInfo,
  historicalSolPrice?: number
): HoldingValuation {
  const metadata = HOLDINGS_BY_MINT[mint]
  const currentValueUsd = uiAmount * currentPriceUsd
  const currentPriceSol = solPriceUsd > 0 ? currentPriceUsd / solPriceUsd : 0
  const currentValueSol = uiAmount * currentPriceSol

  const base: HoldingValuation = {
    mint,
    symbol: metadata?.symbol ?? dexMeta?.symbol ?? mint.slice(0, 6) + '…',
    name: metadata?.name ?? dexMeta?.name ?? mint.slice(0, 8) + '…',
    description: metadata?.description,
    xAccount: metadata?.xAccount,
    bagsLink: metadata?.bagsLink,
    uiAmount,
    currentPriceUsd,
    currentPriceSol,
    currentValueUsd,
    currentValueSol,
    category: metadata?.category ?? 'unknown',
  }

  // Enrich with acquisition data if available
  if (acquisition) {
    base.purchaseDate = acquisition.timestamp

    // Calculate cost basis from SOL spent × historical SOL price
    if (acquisition.solSpent > 0 && historicalSolPrice) {
      const costBasisUsd = acquisition.solSpent * historicalSolPrice
      const purchasePriceUsd = costBasisUsd / uiAmount
      const gainLossUsd = currentValueUsd - costBasisUsd
      const gainLossPct = costBasisUsd > 0 ? (gainLossUsd / costBasisUsd) * 100 : undefined

      base.purchasePriceUsd = purchasePriceUsd
      base.costBasisUsd = costBasisUsd
      base.gainLossUsd = gainLossUsd
      base.gainLossPct = gainLossPct
    }
  }

  return base
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Fetches full treasury valuation: SOL balance, all SPL token holdings with
 * current prices, acquisition dates, cost basis, and gain/loss.
 */
export async function getTreasuryValuations(): Promise<TreasuryResponse> {
  // Step 1: Fetch SOL balance, token accounts, SOL price, and tx history in parallel
  const [solBalance, tokenAccounts, solPrices, txHistory] = await Promise.all([
    getSolBalance(TREASURY_WALLET),
    getTokenAccountsByOwner(TREASURY_WALLET),
    getJupiterPrices([SOL_MINT]),
    getTreasuryHistory(),
  ])

  const solPriceUsd = solPrices[SOL_MINT] ?? 0

  // Step 2: Filter to non-zero token accounts (ignore dust)
  const nonZeroAccounts = tokenAccounts.filter(acct => acct.uiAmount > 0)

  // Step 3: Batch-fetch current prices + token metadata via DexScreener
  const mintList = nonZeroAccounts.map(acct => acct.mint)
  const { prices, metadata: dexMetadata } = mintList.length > 0
    ? await getPricesWithMetadata(mintList)
    : { prices: {} as Record<string, number>, metadata: {} as Record<string, DexTokenMeta> }

  // Step 4: Find acquisition info for each holding from Helius tx history
  const acquisitions = findAcquisitions(txHistory, mintList)

  // Step 5: Fetch historical SOL prices for all acquisition dates
  const acqTimestamps = Object.values(acquisitions)
    .filter(a => a.solSpent > 0)
    .map(a => a.timestamp)
  const historicalPrices = acqTimestamps.length > 0
    ? await getHistoricalSolPrices(acqTimestamps)
    : {}

  // Step 6: Enrich each holding (synchronous now — all data pre-fetched)
  const holdings = nonZeroAccounts.map(acct => {
    const currentPriceUsd = prices[acct.mint] ?? 0
    const acq = acquisitions[acct.mint]
    const histSolPrice = acq ? historicalPrices[acq.timestamp] : undefined
    return enrichHolding(
      acct.mint,
      acct.uiAmount,
      currentPriceUsd,
      solPriceUsd,
      dexMetadata[acct.mint],
      acq,
      histSolPrice
    )
  })

  // Step 7: Compute portfolio totals
  const solValueUsd = solBalance * solPriceUsd
  const holdingsValueUsd = holdings.reduce((sum, h) => sum + h.currentValueUsd, 0)
  const totalValueUsd = solValueUsd + holdingsValueUsd
  const totalValueSol = solPriceUsd > 0 ? totalValueUsd / solPriceUsd : 0

  return {
    solBalance,
    solPriceUsd,
    holdings,
    totalValueUsd,
    totalValueSol,
  }
}
