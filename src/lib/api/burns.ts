// src/lib/api/burns.ts
// Server-side only — do NOT import in client components
// Composite burns module: aggregates all BRAIN burn transactions and computes burn statistics
// Primary: Helius (incinerator balance, token supply, parsed transaction history)
// Fallback: Solscan for transaction history if Helius parsed API fails

import { getAllTokenTransfers } from './solscan'
import { getTokenSupply, getTokenBalanceForMint } from './helius'
import { BRAIN_TOKEN_MINT, BURN_SOURCE, BURN_DESTINATION, HELIUS_API_URL } from '@/lib/constants'

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
  burnSourceBalance: number // BRAIN held by the burn source wallet (pending burn)
  transactions: BurnTransaction[]
}

// ─── Helius Parsed Transaction History ───────────────────────────────────────

interface HeliusParsedTx {
  signature: string
  timestamp: number
  type: string
  tokenTransfers?: Array<{
    fromUserAccount: string
    toUserAccount: string
    mint: string
    tokenAmount: number
  }>
}

/**
 * Fetches parsed transaction history for the burn source wallet via Helius API.
 * Filters for BRAIN token transfers to the incinerator.
 */
async function getHeliusBurnTransactions(): Promise<BurnTransaction[]> {
  const apiKey = process.env.HELIUS_API_KEY
  if (!apiKey) return []

  const url = `${HELIUS_API_URL}/addresses/${BURN_SOURCE}/transactions/?api-key=${apiKey}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`Helius parsed tx API: ${res.status}`)

  const txs = (await res.json()) as HeliusParsedTx[]
  const burnTxs: BurnTransaction[] = []

  for (const tx of txs) {
    if (!tx.tokenTransfers) continue
    for (const transfer of tx.tokenTransfers) {
      if (
        transfer.mint === BRAIN_TOKEN_MINT &&
        transfer.toUserAccount === BURN_DESTINATION &&
        transfer.tokenAmount > 0
      ) {
        burnTxs.push({
          txHash: tx.signature,
          timestamp: tx.timestamp,
          amount: transfer.tokenAmount,
        })
      }
    }
  }

  burnTxs.sort((a, b) => b.timestamp - a.timestamp)
  return burnTxs
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Fetches burn statistics.
 * Primary: Helius RPC for incinerator balance + token supply + parsed tx history.
 * Fallback: Solscan for individual burn transaction history.
 */
export async function getBurnSummary(): Promise<BurnSummary> {
  // Step 1: Query incinerator balance, burn source balance, and total supply in parallel
  const [incineratorBalance, burnSourceBalance, supplyData] = await Promise.all([
    getTokenBalanceForMint(BURN_DESTINATION, BRAIN_TOKEN_MINT),
    getTokenBalanceForMint(BURN_SOURCE, BRAIN_TOKEN_MINT),
    getTokenSupply(BRAIN_TOKEN_MINT),
  ])

  const totalBurned = incineratorBalance.uiAmount
  const onChainSupply = supplyData.uiAmount  // Total minted (includes incinerator)
  const circulatingSupply = onChainSupply - totalBurned  // Subtract what's in the incinerator
  const burnedPct = onChainSupply > 0 ? (totalBurned / onChainSupply) * 100 : 0

  // Step 2: Try Helius parsed tx history first, then Solscan as fallback
  let transactions: BurnTransaction[] = []
  try {
    transactions = await getHeliusBurnTransactions()
  } catch (err) {
    console.warn('[burns] Helius parsed tx API unavailable:', err)
    // Fallback to Solscan
    try {
      const burnTransfers = await getAllTokenTransfers(BRAIN_TOKEN_MINT, {
        from: BURN_SOURCE,
        to: BURN_DESTINATION,
      })
      transactions = burnTransfers.map((transfer) => {
        const decimals = transfer.token_decimals
        const humanAmount = transfer.amount / Math.pow(10, decimals)
        return {
          txHash: transfer.trans_id,
          timestamp: transfer.block_time,
          amount: humanAmount,
        }
      })
      transactions.sort((a, b) => b.timestamp - a.timestamp)
    } catch (solscanErr) {
      console.warn('[burns] Solscan also unavailable:', solscanErr)
    }
  }

  return {
    totalBurned,
    totalSupply: circulatingSupply,
    burnedPct,
    burnSourceBalance: burnSourceBalance.uiAmount,
    transactions,
  }
}
