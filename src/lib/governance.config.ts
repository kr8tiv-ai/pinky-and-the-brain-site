// src/lib/governance.config.ts
// Shared types and utilities for governance — safe to import in both client and server

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GovernanceCandidate {
  id: string          // Unique slug used as vote key
  mint: string        // Solana token mint address
  symbol: string      // Ticker symbol (e.g. "BONK")
  name: string        // Full token name
  description: string // Why this token is a candidate
}

export interface GovernanceRound {
  id: string
  title: string
  description: string
  treasuryAmount: string              // Display string e.g. "0.5 SOL"
  candidates: GovernanceCandidate[]
  votingOpensAt: number               // Unix timestamp (seconds)
  votingClosesAt: number              // Unix timestamp (seconds)
  status: 'upcoming' | 'active' | 'closed'
}

export interface StoredVote {
  wallet: string
  candidateId: string
  weight: number      // BRAIN balance at time of vote
  timestamp: number   // Unix seconds
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const ADMIN_ROUND_DEFAULTS = {
  treasuryAmount: '0.5 SOL',
  durationSeconds: 7 * 24 * 60 * 60, // 7 days
}

// ─── Shared Message Builder ──────────────────────────────────────────────────

/**
 * Builds the canonical vote message that the client signs and the server verifies.
 * Must be deterministic — both sides produce the same string.
 */
export function buildVoteMessage(roundId: string, candidateId: string): string {
  return [
    '$BRAIN Governance Vote',
    `Round: ${roundId}`,
    `Vote: ${candidateId}`,
    'This signature does not authorize any on-chain transaction.',
  ].join('\n')
}
