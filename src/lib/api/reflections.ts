// src/lib/api/reflections.ts
// Server-side only — do NOT import in client components
// Reads fee data directly from the Fee Share V2 on-chain PDA accounts
// and claim event history from Helius parsed transactions API.

import {
  HELIUS_RPC_URL,
  HELIUS_API_URL,
  FEE_SHARE_AUTHORITY_PDA,
} from '@/lib/constants'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FeeShareData {
  totalAccumulatedSol: number
  totalClaimedSol: number
  currentUnclaimedSol: number
}

export interface ClaimEvent {
  txHash: string
  timestamp: number
  amountSol: number
  toAddress: string
}

// ─── On-chain PDA Reads ────────────────────────────────────────────────────────

/**
 * Reads the fee_share_authority PDA to get total accumulated/claimed fees,
 * and queries the PDA balance for current unclaimed SOL.
 *
 * PDA account layout (Anchor/Borsh):
 *   [0..8]   discriminator
 *   [8..40]  feeShareConfig pubkey
 *   [40..48] totalAccumulatedFees u64 LE (lamports)
 *   [48..56] (internal counter)
 *   [56..64] totalClaimedFees u64 LE (lamports)
 *   [64..72] (internal counter)
 *   [72..80] totalLifetimeAccFees u64 LE (lamports)
 */
export async function getFeeShareData(): Promise<FeeShareData> {
  const SOL_MINT = 'So11111111111111111111111111111111111111112'

  const [accountRes, wsolRes] = await Promise.all([
    // Read PDA account data for accumulated/claimed totals
    fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getAccountInfo',
        params: [FEE_SHARE_AUTHORITY_PDA, { encoding: 'base64' }],
      }),
      next: { revalidate: 120 },
    }),
    // Read WSOL token balance of the PDA (unclaimed fees held as wrapped SOL)
    fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'getTokenAccountsByOwner',
        params: [
          FEE_SHARE_AUTHORITY_PDA,
          { mint: SOL_MINT },
          { encoding: 'jsonParsed' },
        ],
      }),
      next: { revalidate: 60 },
    }),
  ])

  const accountJson = (await accountRes.json()) as {
    result?: { value?: { data?: [string, string] } }
  }
  const wsolJson = (await wsolRes.json()) as {
    result?: {
      value: { account: { data: { parsed: { info: { tokenAmount: { uiAmount: number | null } } } } } }[]
    }
  }

  let totalAccumulatedSol = 0
  let totalClaimedSol = 0

  const rawData = accountJson.result?.value?.data
  if (rawData && rawData[0]) {
    const data = Buffer.from(rawData[0], 'base64')
    // Read u64 LE values at verified on-chain offsets
    if (data.length >= 80) {
      const accumulatedLamports = data.readBigUInt64LE(40) // totalAccumulatedFees
      const claimedLamports = data.readBigUInt64LE(56)     // totalClaimedFees
      totalAccumulatedSol = Number(accumulatedLamports) / 1_000_000_000
      totalClaimedSol = Number(claimedLamports) / 1_000_000_000
    }
  }

  // WSOL token balance = unclaimed fees sitting in the authority PDA
  let currentUnclaimedSol = 0
  const wsolAccounts = wsolJson.result?.value ?? []
  if (wsolAccounts.length > 0) {
    currentUnclaimedSol = wsolAccounts[0].account.data.parsed.info.tokenAmount.uiAmount ?? 0
  }

  return { totalAccumulatedSol, totalClaimedSol, currentUnclaimedSol }
}

// ─── Claim Event History ──────────────────────────────────────────────────────

/**
 * Fetches parsed transaction history from Helius for the fee_share_authority PDA.
 * Extracts SOL transfers out of the PDA (claim events by fee recipients).
 */
export async function getClaimHistory(): Promise<ClaimEvent[]> {
  const apiKey = process.env.HELIUS_API_KEY
  if (!apiKey) return []

  try {
    const url = `${HELIUS_API_URL}/addresses/${FEE_SHARE_AUTHORITY_PDA}/transactions?api-key=${apiKey}&limit=100`
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) return []

    const txs = (await res.json()) as Array<{
      signature: string
      timestamp: number
      tokenTransfers?: Array<{
        fromUserAccount: string
        toUserAccount: string
        tokenAmount: number
        mint: string
      }>
    }>

    const events: ClaimEvent[] = []
    const SOL_MINT = 'So11111111111111111111111111111111111111112'

    for (const tx of txs) {
      if (!tx.tokenTransfers) continue
      // Claims are WSOL token transfers from the authority PDA to claimers
      for (const transfer of tx.tokenTransfers) {
        if (
          transfer.fromUserAccount === FEE_SHARE_AUTHORITY_PDA &&
          transfer.mint === SOL_MINT &&
          transfer.tokenAmount > 0
        ) {
          events.push({
            txHash: tx.signature,
            timestamp: tx.timestamp,
            amountSol: transfer.tokenAmount,
            toAddress: transfer.toUserAccount,
          })
        }
      }
    }

    // Sort most recent first, deduplicate by txHash+toAddress
    events.sort((a, b) => b.timestamp - a.timestamp)
    return events
  } catch (e) {
    console.warn('[reflections] Helius claim history failed:', (e as Error)?.message)
    return []
  }
}

// ─── Fee Distribution Computation ────────────────────────────────────────────

/**
 * Pure computation: breaks down a total fee amount by the protocol's
 * 10/20/30/10/5/5/20 split across recipient categories.
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
