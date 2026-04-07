import { NextResponse } from 'next/server'
import {
  getFeeShareData,
  getClaimHistory,
  getFeeDistribution,
} from '@/lib/api/reflections'
import { getTokenPrice } from '@/lib/api/birdeye'
import { getTokenSupply } from '@/lib/api/helius'
import { SOL_MINT, PAYOUT_THRESHOLD_SOL, BRAIN_TOKEN_MINT } from '@/lib/constants'
import type { ReflectionsDashboardResponse } from '@/lib/api/types'

export const revalidate = 120

export async function GET() {
  // Fetch each source independently so one failure doesn't kill all data
  const [feeShareData, claimEvents, solPrice, tokenSupply] = await Promise.all([
    getFeeShareData().catch((e) => {
      console.warn('[reflections] PDA read failed:', e?.message)
      return { totalAccumulatedSol: 0, totalClaimedSol: 0, currentUnclaimedSol: 0 }
    }),
    getClaimHistory().catch((e) => {
      console.warn('[reflections] Claim history failed:', e?.message)
      return [] as Array<{ txHash: string; timestamp: number; amountSol: number; toAddress: string }>
    }),
    getTokenPrice(SOL_MINT).catch((e) => {
      console.warn('[reflections] Birdeye price failed:', e?.message)
      return { value: 0 }
    }),
    getTokenSupply(BRAIN_TOKEN_MINT).catch((e) => {
      console.warn('[reflections] Token supply failed:', e?.message)
      return { uiAmount: 0, amount: '0', decimals: 9 }
    }),
  ])

  const solPriceUsd = solPrice.value ?? 0

  // Derive lifetime totals from actual claim history (verifiable on-chain txs)
  // rather than PDA counter offsets which may not map correctly to the
  // Fee Share V2 Anchor layout and can overstate values.
  const totalClaimedFromHistory = claimEvents.reduce((sum, e) => sum + e.amountSol, 0)

  // Use claim history total as our source of truth for lifetime fees.
  // PDA counters (totalAccumulatedSol) include internal recirculation and
  // can read ~80 SOL when actual distributed is far less.
  const totalFeeSol = totalClaimedFromHistory + feeShareData.currentUnclaimedSol
  const feeBreakdown = getFeeDistribution(totalFeeSol)

  // Reflections = 20% of total claimed (claimer 0 gets 20% for holder distributions)
  const totalReflectedSol = totalClaimedFromHistory * 0.20

  // Estimate trading volume from fees
  // bags.fm charges 1% total fee; Meteora takes 20% of that (0.20% of volume)
  // PDA receives remaining 80% (0.80% of volume), so volume = fees / 0.008
  const estimatedVolumeSol = totalFeeSol > 0 ? totalFeeSol / 0.008 : 0

  // Last claim timestamp from most recent event
  const lastPayoutTimestamp =
    claimEvents.length > 0 ? claimEvents[0].timestamp : null

  // Estimate next payout based on accrual toward threshold
  let nextPayoutEstimate: number | null = null
  const accruedSol = feeShareData.currentUnclaimedSol
  if (lastPayoutTimestamp && accruedSol > 0 && accruedSol < PAYOUT_THRESHOLD_SOL) {
    const now = Math.floor(Date.now() / 1000)
    const timeSinceLastPayout = now - lastPayoutTimestamp
    if (timeSinceLastPayout > 0) {
      const accrualRate = accruedSol / timeSinceLastPayout
      const remaining = PAYOUT_THRESHOLD_SOL - accruedSol
      const secondsToThreshold = remaining / accrualRate
      nextPayoutEstimate = now + Math.floor(secondsToThreshold)
    }
  }

  const data: ReflectionsDashboardResponse = {
    totalFeesLifetimeSol: totalFeeSol,
    totalReflectedSol,
    currentAccruedSol: accruedSol,
    payoutThresholdSol: PAYOUT_THRESHOLD_SOL,
    estimatedVolumeSol,
    solPriceUsd,
    lastPayoutTimestamp,
    nextPayoutEstimate,
    totalSupply: tokenSupply.uiAmount,
    feeBreakdown,
    distributions: claimEvents.slice(0, 50),
  }

  return NextResponse.json(data)
}
