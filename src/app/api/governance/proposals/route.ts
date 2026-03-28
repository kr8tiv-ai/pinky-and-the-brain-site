import { NextResponse } from 'next/server'
import { getProposals, createProposal } from '@/lib/api/proposals'
import type { CreateProposalPayload } from '@/lib/api/proposals'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')

    const proposals = await getProposals(wallet)
    return NextResponse.json({ proposals })
  } catch (err) {
    // If Redis isn't configured, return empty array instead of 500
    const isRedisError = err instanceof Error && err.message.includes('Redis not configured')
    if (isRedisError) {
      return NextResponse.json({ proposals: [] })
    }
    console.error('[governance/proposals] GET', err)
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateProposalPayload

    if (!body.wallet || !body.title || !body.description || !body.signature || !body.message || !body.duration) {
      return NextResponse.json(
        { error: 'Missing required fields: wallet, title, description, duration, signature, message' },
        { status: 400 }
      )
    }

    if (body.duration !== 3 && body.duration !== 7) {
      return NextResponse.json(
        { error: 'Duration must be 3 or 7 days.' },
        { status: 400 }
      )
    }

    const result = await createProposal(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, proposal: result.proposal })
  } catch (err) {
    const isRedisError = err instanceof Error && err.message.includes('Redis not configured')
    if (isRedisError) {
      return NextResponse.json({ error: 'Redis not configured' }, { status: 500 })
    }
    console.error('[governance/proposals] POST', err)
    return NextResponse.json({ error: 'Proposal creation failed' }, { status: 500 })
  }
}
