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

// ─── Proposal Types ──────────────────────────────────────────────────────────

export interface Proposal {
  id: string
  title: string
  description: string
  referenceLinks: { label: string; url: string }[]
  createdBy: string
  createdAt: number
  duration: 3 | 7
  votingEndsAt: number
  status: 'active' | 'closed'
}

export interface ProposalVote {
  wallet: string
  vote: 'yes' | 'no'
  weight: number
  timestamp: number
}

export interface ProposalWithTally extends Proposal {
  yesWeight: number
  noWeight: number
  yesWallets: number
  noWallets: number
  userVote?: ProposalVote | null
}

export function buildProposalCreateMessage(title: string): string {
  return [
    '$BRAIN Community Proposal',
    `Title: ${title}`,
    'This signature does not authorize any on-chain transaction.',
  ].join('\n')
}

export function buildProposalVoteMessage(proposalId: string, vote: 'yes' | 'no'): string {
  return [
    '$BRAIN Proposal Vote',
    `Proposal: ${proposalId}`,
    `Vote: ${vote}`,
    'This signature does not authorize any on-chain transaction.',
  ].join('\n')
}
