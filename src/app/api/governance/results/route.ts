import { NextResponse } from 'next/server'
import { getGovernanceResults } from '@/lib/api/governance'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')

    const results = await getGovernanceResults(wallet)
    return NextResponse.json(results)
  } catch (err) {
    // If Redis isn't configured, return empty state instead of 500
    const isRedisError = err instanceof Error && err.message.includes('Redis not configured')
    if (isRedisError) {
      return NextResponse.json({
        round: null,
        candidates: [],
        totalVoters: 0,
        totalWeight: 0,
        userVote: null,
      })
    }
    console.error('[governance/results]', err)
    return NextResponse.json({ error: 'Results fetch failed' }, { status: 500 })
  }
}
