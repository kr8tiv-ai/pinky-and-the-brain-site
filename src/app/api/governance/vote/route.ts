import { NextResponse } from 'next/server'
import { submitVote } from '@/lib/api/governance'
import type { VotePayload } from '@/lib/api/governance'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VotePayload

    if (!body.wallet || !body.candidateId || !body.signature || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields: wallet, candidateId, signature, message' },
        { status: 400 }
      )
    }

    const result = await submitVote(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, weight: result.weight })
  } catch (err) {
    console.error('[governance/vote]', err)
    return NextResponse.json({ error: 'Vote submission failed' }, { status: 500 })
  }
}
