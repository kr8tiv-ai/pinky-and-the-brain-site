// src/lib/api/burns.ts
// Server-side only — do NOT import in client components
// Composite burns module: aggregates all BRAIN burn transactions and computes burn statistics
// Combines solscan (paginated token transfers) and helius (token supply) foundational wrappers

import { getAllTokenTransfers } from './solscan'
import { getTokenSupply } from './helius'
import { BRAIN_TOKEN_MINT, BURN_SOURCE, BURN_DESTINATION } from '@/lib/constants'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BurnTransaction {
  txHash: string
  timestamp: number
  amount: number // human-readable (divided by token decimals)
}

export interface BurnSummary {
  totalBurned: number       // total $BRAIN burned, human-readable
  totalSupply: number       // current total supply, human-readable
  burnedPct: number         // % of original supply burned
  transactions: BurnTransaction[]
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Fetches all BRAIN burn transactions and computes aggregate burn statistics.
 *
 * Uses getAllTokenTransfers (paginated, up to 10 pages) to capture all burns —
 * not just the first page. Research warns burns may span multiple pages.
 *
 * Token decimals are read from each transfer's token_decimals field, NOT hardcoded,
 * per research pitfall #6 (decimals vary per token and should come from the API).
 *
 * burnedPct = totalBurned / (totalBurned + currentSupply) * 100
 * This represents the % of original supply that has been burned.
 *
 * Fetches burn transactions and current supply in parallel.
 */
export async function getBurnSummary(): Promise<BurnSummary> {
  // Fetch all burn transactions and current token supply in parallel
  const [burnTransfers, supplyData] = await Promise.all([
    getAllTokenTransfers(BRAIN_TOKEN_MINT, {
      from: BURN_SOURCE,
      to: BURN_DESTINATION,
    }),
    getTokenSupply(BRAIN_TOKEN_MINT),
  ])

  // Map raw transfers to BurnTransaction — read decimals from each transfer
  const transactions: BurnTransaction[] = burnTransfers.map((transfer) => {
    const decimals = transfer.token_decimals
    const humanAmount = transfer.amount / Math.pow(10, decimals)
    return {
      txHash: transfer.trans_id,
      timestamp: transfer.block_time,
      amount: humanAmount,
    }
  })

  // Sort most recent first
  transactions.sort((a, b) => b.timestamp - a.timestamp)

  // Compute totals
  const totalBurned = transactions.reduce((sum, tx) => sum + tx.amount, 0)
  const currentSupply = supplyData.uiAmount

  // burnedPct: % of original (burned + current) supply that has been burned
  const originalSupply = totalBurned + currentSupply
  const burnedPct = originalSupply > 0 ? (totalBurned / originalSupply) * 100 : 0

  return {
    totalBurned,
    totalSupply: currentSupply,
    burnedPct,
    transactions,
  }
}
