// src/lib/api/governance.ts
// Server-side only — do NOT import in client components
// Governance vote verification, storage, and tallying via Upstash Redis

import { Redis } from '@upstash/redis'
import nacl from 'tweetnacl'
import bs58 from 'bs58'
import { getTokenBalanceForMint } from './helius'
import { BRAIN_TOKEN_MINT } from '@/lib/constants'
import { buildVoteMessage } from '@/lib/governance.config'
import type { GovernanceRound, GovernanceCandidate, StoredVote } from '@/lib/governance.config'

// ─── Redis Client ────────────────────────────────────────────────────────────

function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    throw new Error('Upstash Redis not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.')
  }
  return new Redis({ url, token })
}

let _redis: Redis | null = null
function redis(): Redis {
  if (!_redis) _redis = getRedis()
  return _redis
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VotePayload {
  wallet: string       // Base58 public key
  candidateId: string  // Must match a candidate in the active round
  signature: string    // Base58-encoded ed25519 signature
  message: string      // The exact message that was signed
}

export interface CandidateWithTally extends GovernanceCandidate {
  voteCount: number    // Number of unique wallets
  voteWeight: number   // Sum of BRAIN-weighted votes
}

export interface GovernanceResultsResponse {
  round: GovernanceRound | null
  candidates: CandidateWithTally[]
  totalVoters: number
  totalWeight: number
  userVote: StoredVote | null
}

// ─── Redis Keys ──────────────────────────────────────────────────────────────

const ROUND_KEY = 'gov:current-round'

function voteKey(roundId: string, wallet: string): string {
  return `gov:${roundId}:vote:${wallet}`
}

function votersKey(roundId: string): string {
  return `gov:${roundId}:voters`
}

// ─── Round Management ────────────────────────────────────────────────────────

export async function getCurrentRound(): Promise<GovernanceRound | null> {
  return redis().get<GovernanceRound>(ROUND_KEY)
}

export async function saveRound(round: GovernanceRound): Promise<void> {
  await redis().set(ROUND_KEY, round)
}

export async function clearRoundVotes(roundId: string): Promise<void> {
  const voters = await redis().smembers(votersKey(roundId))
  if (voters.length > 0) {
    const pipeline = redis().pipeline()
    for (const wallet of voters) {
      pipeline.del(voteKey(roundId, wallet))
    }
    pipeline.del(votersKey(roundId))
    await pipeline.exec()
  }
}

// ─── Vote Submission ─────────────────────────────────────────────────────────

export async function submitVote(payload: VotePayload): Promise<{
  success: boolean
  error?: string
  weight?: number
}> {
  const { wallet, candidateId, signature, message } = payload

  // 1. Get active round
  const round = await getCurrentRound()
  if (!round) {
    return { success: false, error: 'No active voting round.' }
  }

  // 2. Check round timing
  const now = Math.floor(Date.now() / 1000)
  if (now < round.votingOpensAt) {
    return { success: false, error: 'Voting has not opened yet.' }
  }
  if (now > round.votingClosesAt) {
    return { success: false, error: 'Voting has closed.' }
  }

  // 3. Validate candidate
  const candidate = round.candidates.find(c => c.id === candidateId)
  if (!candidate) {
    return { success: false, error: `Invalid candidate: ${candidateId}` }
  }

  // 4. Verify message format
  const expectedMessage = buildVoteMessage(round.id, candidateId)
  if (message !== expectedMessage) {
    return { success: false, error: 'Message mismatch — possible tampering.' }
  }

  // 5. Verify ed25519 signature
  try {
    const publicKeyBytes = bs58.decode(wallet)
    const signatureBytes = bs58.decode(signature)
    const messageBytes = new TextEncoder().encode(message)
    const valid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes)
    if (!valid) {
      return { success: false, error: 'Invalid signature.' }
    }
  } catch {
    return { success: false, error: 'Signature verification failed.' }
  }

  // 6. Check if already voted
  const existingVote = await redis().get<StoredVote>(voteKey(round.id, wallet))
  if (existingVote) {
    return { success: false, error: 'This wallet has already voted in this round.' }
  }

  // 7. Check BRAIN token balance
  const balance = await getTokenBalanceForMint(wallet, BRAIN_TOKEN_MINT)
  if (balance.uiAmount <= 0) {
    return { success: false, error: 'No $BRAIN tokens found. You need BRAIN to vote.' }
  }

  // 8. Store vote
  const vote: StoredVote = {
    wallet,
    candidateId,
    weight: Math.floor(balance.uiAmount),
    timestamp: now,
  }

  await redis().set(voteKey(round.id, wallet), vote)
  await redis().sadd(votersKey(round.id), wallet)

  return { success: true, weight: vote.weight }
}

// ─── Results ─────────────────────────────────────────────────────────────────

export async function getGovernanceResults(
  walletAddress?: string | null
): Promise<GovernanceResultsResponse> {
  const round = await getCurrentRound()

  if (!round) {
    return {
      round: null,
      candidates: [],
      totalVoters: 0,
      totalWeight: 0,
      userVote: null,
    }
  }

  // Determine runtime status
  const now = Math.floor(Date.now() / 1000)
  if (round.status !== 'closed') {
    if (now < round.votingOpensAt) round.status = 'upcoming'
    else if (now > round.votingClosesAt) round.status = 'closed'
    else round.status = 'active'
  }

  // Get all voters
  const voters = await redis().smembers(votersKey(round.id))

  // Fetch all votes
  const votes: StoredVote[] = []
  if (voters.length > 0) {
    const pipeline = redis().pipeline()
    for (const wallet of voters) {
      pipeline.get<StoredVote>(voteKey(round.id, wallet))
    }
    const results = await pipeline.exec<(StoredVote | null)[]>()
    for (const v of results) {
      if (v) votes.push(v)
    }
  }

  // Tally
  const tallyCount: Record<string, number> = {}
  const tallyWeight: Record<string, number> = {}
  for (const c of round.candidates) {
    tallyCount[c.id] = 0
    tallyWeight[c.id] = 0
  }
  for (const vote of votes) {
    tallyCount[vote.candidateId] = (tallyCount[vote.candidateId] ?? 0) + 1
    tallyWeight[vote.candidateId] = (tallyWeight[vote.candidateId] ?? 0) + vote.weight
  }

  const totalWeight = Object.values(tallyWeight).reduce((sum, w) => sum + w, 0)

  // User vote check
  let userVote: StoredVote | null = null
  if (walletAddress) {
    userVote = await redis().get<StoredVote>(voteKey(round.id, walletAddress))
  }

  return {
    round,
    candidates: round.candidates.map(c => ({
      ...c,
      voteCount: tallyCount[c.id] ?? 0,
      voteWeight: tallyWeight[c.id] ?? 0,
    })),
    totalVoters: voters.length,
    totalWeight,
    userVote,
  }
}
