import { NextResponse } from 'next/server'
import { submitProposalVote } from '@/lib/api/proposals'
import type { ProposalVotePayload } from '@/lib/api/proposals'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProposalVotePayload

    if (!body.wallet || !body.proposalId || !body.vote || !body.signature || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields: wallet, proposalId, vote, signature, message' },
        { status: 400 }
      )
    }

    if (body.vote !== 'yes' && body.vote !== 'no') {
      return NextResponse.json(
        { error: 'Vote must be "yes" or "no".' },
        { status: 400 }
      )
    }

    const result = await submitProposalVote(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, weight: result.weight })
  } catch (err) {
    console.error('[governance/proposals/vote]', err)
    return NextResponse.json({ error: 'Vote submission failed' }, { status: 500 })
  }
}
