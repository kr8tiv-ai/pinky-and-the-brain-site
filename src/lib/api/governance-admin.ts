// src/lib/api/governance-admin.ts
// Server-side only — admin operations for governance rounds

import { getCurrentRound, saveRound, clearRoundVotes } from './governance'
import { getPricesWithMetadata } from './jupiter'
import type { GovernanceRound, GovernanceCandidate } from '@/lib/governance.config'
import { ADMIN_ROUND_DEFAULTS } from '@/lib/governance.config'

// ─── Auth ────────────────────────────────────────────────────────────────────

export function validateAdminPassword(password: string): boolean {
  const expected = process.env.GOVERNANCE_ADMIN_PASSWORD
  if (!expected) return false
  return password === expected
}

// ─── Create Round ────────────────────────────────────────────────────────────

export interface CreateRoundInput {
  mints: string[]         // 5 token mint addresses
  durationSeconds?: number
  title?: string
}

export async function createRound(input: CreateRoundInput): Promise<{
  success: boolean
  error?: string
  round?: GovernanceRound
}> {
  if (input.mints.length < 2 || input.mints.length > 5) {
    return { success: false, error: 'Provide 2-5 token mint addresses.' }
  }

  // Fetch metadata from DexScreener
  const { metadata } = await getPricesWithMetadata(input.mints)

  const candidates: GovernanceCandidate[] = input.mints.map((mint, i) => {
    const meta = metadata[mint]
    return {
      id: `candidate-${i}`,
      mint,
      symbol: meta?.symbol ?? mint.slice(0, 6),
      name: meta?.name ?? `Token ${i + 1}`,
      description: '',
    }
  })

  const now = Math.floor(Date.now() / 1000)
  const duration = input.durationSeconds ?? ADMIN_ROUND_DEFAULTS.durationSeconds

  const roundId = `round-${now}`
  const round: GovernanceRound = {
    id: roundId,
    title: input.title ?? `Treasury Purchase Vote`,
    description: `Choose the next token for the $BRAIN treasury's ${ADMIN_ROUND_DEFAULTS.treasuryAmount} allocation`,
    treasuryAmount: ADMIN_ROUND_DEFAULTS.treasuryAmount,
    candidates,
    votingOpensAt: now,
    votingClosesAt: now + duration,
    status: 'active',
  }

  // Clear any previous round votes (if re-using)
  const prev = await getCurrentRound()
  if (prev) {
    await clearRoundVotes(prev.id)
  }

  await saveRound(round)
  return { success: true, round }
}

// ─── End Round ───────────────────────────────────────────────────────────────

export async function endRound(): Promise<{
  success: boolean
  error?: string
}> {
  const round = await getCurrentRound()
  if (!round) {
    return { success: false, error: 'No active round to end.' }
  }

  round.status = 'closed'
  round.votingClosesAt = Math.floor(Date.now() / 1000)
  await saveRound(round)
  return { success: true }
}

// ─── Resolve Mints ───────────────────────────────────────────────────────────

export async function resolveTokenMints(
  mints: string[]
): Promise<{ mint: string; symbol: string; name: string }[]> {
  const { metadata } = await getPricesWithMetadata(mints)
  return mints.map(mint => ({
    mint,
    symbol: metadata[mint]?.symbol ?? mint.slice(0, 6),
    name: metadata[mint]?.name ?? 'Unknown',
  }))
}
