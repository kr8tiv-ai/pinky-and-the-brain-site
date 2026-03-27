// src/lib/api/reflections.ts
// Server-side only — do NOT import in client components
// Composite reflections module: LP wallet inflows (fee income) and outflows (distributions),
// plus pure fee split computation for the 10/20/30/10/5/5/20 breakdown.
// Combines solscan (paginated account transfers) foundational wrapper.

import { getAllAccountTransfers } from './solscan'
import { LP_WALLET, SOL_RPC } from '@/lib/constants'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReflectionDistribution {
  txHash: string
  timestamp: number
  amountSol: number
  toAddress: string
}

export interface ReflectionSummary {
  totalDistributedSol: number
  distributions: ReflectionDistribution[]
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Fetches all outbound SOL transfers from the LP wallet — these are the SOL
 * reflection distributions sent to holders.
 *
 * Uses getAllAccountTransfers (paginated, up to 10 pages) to capture full history.
 * Converts lamports to SOL by dividing by 1_000_000_000.
 * Returns distributions sorted most recent first.
 */
export async function getReflectionDistributions(): Promise<ReflectionSummary> {
  const transfers = await getAllAccountTransfers(LP_WALLET, { flow: 'out' })

  const distributions: ReflectionDistribution[] = transfers.map((t) => ({
    txHash: t.trans_id,
    timestamp: t.block_time,
    amountSol: t.amount / 1_000_000_000, // lamports to SOL
    toAddress: t.to_address,
  }))

  // Sort most recent first
  distributions.sort((a, b) => b.timestamp - a.timestamp)

  const totalDistributedSol = distributions.reduce((sum, d) => sum + d.amountSol, 0)

  return {
    totalDistributedSol,
    distributions,
  }
}

/**
 * Fetches all inbound SOL transfers to the LP wallet — these are the fee inflows
 * earned by the LP position over time.
 *
 * Supports R8 (LP Fees) — total fees earned and fee inflow chart data.
 * Returns sorted most recent first.
 */
export async function getLpFeeInflows(): Promise<{
  totalFeeSol: number
  inflows: Array<{
    txHash: string
    timestamp: number
    amountSol: number
    fromAddress: string
  }>
}> {
  const transfers = await getAllAccountTransfers(LP_WALLET, { flow: 'in' })

  const inflows = transfers.map((t) => ({
    txHash: t.trans_id,
    timestamp: t.block_time,
    amountSol: t.amount / 1_000_000_000, // lamports to SOL
    fromAddress: t.from_address,
  }))

  // Sort most recent first
  inflows.sort((a, b) => b.timestamp - a.timestamp)

  const totalFeeSol = inflows.reduce((sum, i) => sum + i.amountSol, 0)

  return { totalFeeSol, inflows }
}

/**
 * Fetches the current SOL balance of the LP wallet via Solana RPC.
 * This represents how much SOL has accrued toward the next payout.
 */
export async function getLpWalletBalance(): Promise<number> {
  const res = await fetch(SOL_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getBalance',
      params: [LP_WALLET],
    }),
    next: { revalidate: 60 },
  })
  const json = (await res.json()) as { result?: { value?: number } }
  return (json.result?.value ?? 0) / 1_000_000_000
}

/**
 * Pure computation: breaks down a total fee amount by the protocol's
 * 10/20/30/10/5/5/20 split across recipient categories.
 *
 * Supports R4 (Fee Distribution Ledger).
 *
 * No API calls — takes totalFeeSol input and returns computed breakdowns.
 */
export function getFeeDistribution(
  totalFeeSol: number
): Record<string, { pct: number; sol: number }> {
  const splits: Record<string, number> = {
    burned: 10,
    holders: 20,
    investments: 30,
    liquidity: 10,
    marketing: 5,
    dexBoosts: 5,
    dev: 20,
  }

  const result: Record<string, { pct: number; sol: number }> = {}
  for (const [key, pct] of Object.entries(splits)) {
    result[key] = {
      pct,
      sol: (totalFeeSol * pct) / 100,
    }
  }

  return result
}
