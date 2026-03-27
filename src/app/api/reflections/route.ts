import { NextResponse } from 'next/server'
import {
  getLpFeeInflows,
  getReflectionDistributions,
  getLpWalletBalance,
  getFeeDistribution,
} from '@/lib/api/reflections'
import { getTokenPrice } from '@/lib/api/birdeye'
import { SOL_MINT, PAYOUT_THRESHOLD_SOL } from '@/lib/constants'
import type { ReflectionsDashboardResponse } from '@/lib/api/types'

export const revalidate = 300

export async function GET() {
  try {
    const [feeData, reflectionData, accruedSol, solPrice] = await Promise.all([
      getLpFeeInflows(),
      getReflectionDistributions(),
      getLpWalletBalance(),
      getTokenPrice(SOL_MINT).catch(() => ({ value: 0 })),
    ])

    const solPriceUsd = solPrice.value ?? 0
    const totalFeeSol = feeData.totalFeeSol
    const feeBreakdown = getFeeDistribution(totalFeeSol)

    // Estimate trading volume from fees (1% creator fee)
    const estimatedVolumeSol = totalFeeSol / 0.01

    // Last payout timestamp from most recent distribution
    const lastPayoutTimestamp =
      reflectionData.distributions.length > 0
        ? reflectionData.distributions[0].timestamp
        : null

    // Estimate next payout based on accrual rate
    let nextPayoutEstimate: number | null = null
    if (lastPayoutTimestamp && accruedSol > 0 && accruedSol < PAYOUT_THRESHOLD_SOL) {
      const now = Math.floor(Date.now() / 1000)
      const timeSinceLastPayout = now - lastPayoutTimestamp
      if (timeSinceLastPayout > 0) {
        const accrualRate = accruedSol / timeSinceLastPayout // SOL per second
        const remaining = PAYOUT_THRESHOLD_SOL - accruedSol
        const secondsToThreshold = remaining / accrualRate
        nextPayoutEstimate = now + Math.floor(secondsToThreshold)
      }
    }

    const data: ReflectionsDashboardResponse = {
      totalFeesLifetimeSol: totalFeeSol,
      totalReflectedSol: reflectionData.totalDistributedSol,
      currentAccruedSol: accruedSol,
      payoutThresholdSol: PAYOUT_THRESHOLD_SOL,
      estimatedVolumeSol,
      solPriceUsd,
      lastPayoutTimestamp,
      nextPayoutEstimate,
      feeBreakdown,
      distributions: reflectionData.distributions.slice(0, 50),
    }

    return NextResponse.json(data)
  } catch (err) {
    console.warn('[reflections API] Error fetching data:', err)

    const fallback: ReflectionsDashboardResponse = {
      totalFeesLifetimeSol: 0,
      totalReflectedSol: 0,
      currentAccruedSol: 0,
      payoutThresholdSol: PAYOUT_THRESHOLD_SOL,
      estimatedVolumeSol: 0,
      solPriceUsd: 0,
      lastPayoutTimestamp: null,
      nextPayoutEstimate: null,
      feeBreakdown: getFeeDistribution(0),
      distributions: [],
    }

    return NextResponse.json(fallback)
  }
}
