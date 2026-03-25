import { NextResponse } from 'next/server'
import { getLpFeeInflows, getFeeDistribution } from '@/lib/api/reflections'
import type { LpFeeResponse } from '@/lib/api/types'

export const revalidate = 300

export async function GET() {
  try {
    const { totalFeeSol, inflows: rawInflows } = await getLpFeeInflows()
    const distribution = getFeeDistribution(totalFeeSol)

    const inflows = rawInflows.map(({ txHash, timestamp, amountSol }) => ({
      txHash,
      timestamp,
      amountSol,
    }))

    const data: LpFeeResponse = {
      totalFeeSol,
      inflows,
      distribution,
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[lp-fees API]', err)
    return NextResponse.json(
      { error: 'LP fees data fetch failed' },
      { status: 500 }
    )
  }
}
