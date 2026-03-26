import { NextResponse } from 'next/server'
import {
  validateAdminPassword,
  createRound,
  endRound,
  resolveTokenMints,
} from '@/lib/api/governance-admin'
import { getGovernanceResults } from '@/lib/api/governance'
import type { CreateRoundInput } from '@/lib/api/governance-admin'

export const dynamic = 'force-dynamic'

function getPassword(request: Request): string | null {
  return request.headers.get('x-admin-password')
}

// GET /api/governance/admin — admin stats
export async function GET(request: Request) {
  const password = getPassword(request)
  if (!password || !validateAdminPassword(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const results = await getGovernanceResults()
    return NextResponse.json(results)
  } catch (err) {
    console.error('[governance/admin GET]', err)
    return NextResponse.json({ error: 'Admin stats failed' }, { status: 500 })
  }
}

// POST /api/governance/admin — create round, end round, resolve mints
export async function POST(request: Request) {
  const password = getPassword(request)
  if (!password || !validateAdminPassword(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const action = body.action as string

    if (action === 'create-round') {
      const input = body as CreateRoundInput & { action: string }
      const result = await createRound(input)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      return NextResponse.json({ success: true, round: result.round })
    }

    if (action === 'end-round') {
      const result = await endRound()
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      return NextResponse.json({ success: true })
    }

    if (action === 'resolve-mints') {
      const mints = body.mints as string[]
      if (!mints || !Array.isArray(mints)) {
        return NextResponse.json({ error: 'Provide mints array' }, { status: 400 })
      }
      const resolved = await resolveTokenMints(mints)
      return NextResponse.json({ tokens: resolved })
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  } catch (err) {
    console.error('[governance/admin POST]', err)
    return NextResponse.json({ error: 'Admin action failed' }, { status: 500 })
  }
}
