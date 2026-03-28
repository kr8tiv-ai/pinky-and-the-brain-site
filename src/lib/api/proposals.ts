// src/lib/api/proposals.ts
// Server-side only — do NOT import in client components
// Community proposal creation, voting, and listing via Upstash Redis

import { Redis } from '@upstash/redis'
import nacl from 'tweetnacl'
import bs58 from 'bs58'
import { getTokenBalanceForMint } from './helius'
import { BRAIN_TOKEN_MINT } from '@/lib/constants'
import {
  buildProposalCreateMessage,
  buildProposalVoteMessage,
} from '@/lib/governance.config'
import type { Proposal, ProposalVote, ProposalWithTally } from '@/lib/governance.config'

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

export interface CreateProposalPayload {
  wallet: string
  title: string
  description: string
  referenceLinks: { label: string; url: string }[]
  duration: 3 | 7
  signature: string
  message: string
}

export interface ProposalVotePayload {
  wallet: string
  proposalId: string
  vote: 'yes' | 'no'
  signature: string
  message: string
}

// ─── Redis Keys ──────────────────────────────────────────────────────────────

const PROPOSALS_LIST_KEY = 'gov:proposals'

function proposalKey(id: string): string {
  return `gov:proposal:${id}`
}

function proposalVoteKey(id: string, wallet: string): string {
  return `gov:proposal:${id}:vote:${wallet}`
}

function proposalVotersKey(id: string): string {
  return `gov:proposal:${id}:voters`
}

// ─── Proposal Creation ──────────────────────────────────────────────────────

export async function createProposal(payload: CreateProposalPayload): Promise<{
  success: boolean
  error?: string
  proposal?: Proposal
}> {
  const { wallet, title, description, referenceLinks, duration, signature, message } = payload

  // 1. Validate input lengths
  if (!title || title.length > 100) {
    return { success: false, error: 'Title is required and must be 100 characters or fewer.' }
  }
  if (!description || description.length > 500) {
    return { success: false, error: 'Description is required and must be 500 characters or fewer.' }
  }
  if (referenceLinks && referenceLinks.length > 5) {
    return { success: false, error: 'Maximum 5 reference links allowed.' }
  }

  // 2. Verify message format
  const expectedMessage = buildProposalCreateMessage(title)
  if (message !== expectedMessage) {
    return { success: false, error: 'Message mismatch — possible tampering.' }
  }

  // 3. Verify ed25519 signature
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

  // 4. Check BRAIN token balance
  const balance = await getTokenBalanceForMint(wallet, BRAIN_TOKEN_MINT)
  if (balance.uiAmount <= 0) {
    return { success: false, error: 'No $BRAIN tokens found. You need BRAIN to create a proposal.' }
  }

  // 5. Check no existing active proposal by this wallet
  const now = Math.floor(Date.now() / 1000)
  const recentIds = await redis().lrange(PROPOSALS_LIST_KEY, 0, 49)
  if (recentIds.length > 0) {
    const pipeline = redis().pipeline()
    for (const id of recentIds) {
      pipeline.get<Proposal>(proposalKey(id as string))
    }
    const proposals = await pipeline.exec<(Proposal | null)[]>()
    for (const p of proposals) {
      if (p && p.createdBy === wallet && p.status === 'active' && p.votingEndsAt > now) {
        return { success: false, error: 'You already have an active proposal. Wait for it to close before creating another.' }
      }
    }
  }

  // 6. Create and store proposal
  const id = `prop-${now}-${Math.random().toString(36).slice(2, 8)}`
  const durationSeconds = duration * 24 * 60 * 60

  const proposal: Proposal = {
    id,
    title,
    description,
    referenceLinks: referenceLinks || [],
    createdBy: wallet,
    createdAt: now,
    duration,
    votingEndsAt: now + durationSeconds,
    status: 'active',
  }

  await redis().set(proposalKey(id), proposal)
  await redis().lpush(PROPOSALS_LIST_KEY, id)

  return { success: true, proposal }
}

// ─── Vote Submission ────────────────────────────────────────────────────────

export async function submitProposalVote(payload: ProposalVotePayload): Promise<{
  success: boolean
  error?: string
  weight?: number
}> {
  const { wallet, proposalId, vote, signature, message } = payload

  // 1. Verify message format
  const expectedMessage = buildProposalVoteMessage(proposalId, vote)
  if (message !== expectedMessage) {
    return { success: false, error: 'Message mismatch — possible tampering.' }
  }

  // 2. Verify ed25519 signature
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

  // 3. Get proposal and check status
  const proposal = await redis().get<Proposal>(proposalKey(proposalId))
  if (!proposal) {
    return { success: false, error: 'Proposal not found.' }
  }

  const now = Math.floor(Date.now() / 1000)
  if (proposal.status === 'closed' || proposal.votingEndsAt <= now) {
    return { success: false, error: 'Voting on this proposal has ended.' }
  }

  // 4. Check for duplicate vote
  const existingVote = await redis().get<ProposalVote>(proposalVoteKey(proposalId, wallet))
  if (existingVote) {
    return { success: false, error: 'This wallet has already voted on this proposal.' }
  }

  // 5. Get BRAIN balance for vote weight
  const balance = await getTokenBalanceForMint(wallet, BRAIN_TOKEN_MINT)
  if (balance.uiAmount <= 0) {
    return { success: false, error: 'No $BRAIN tokens found. You need BRAIN to vote.' }
  }

  // 6. Store vote
  const proposalVote: ProposalVote = {
    wallet,
    vote,
    weight: Math.floor(balance.uiAmount),
    timestamp: now,
  }

  await redis().set(proposalVoteKey(proposalId, wallet), proposalVote)
  await redis().sadd(proposalVotersKey(proposalId), wallet)

  return { success: true, weight: proposalVote.weight }
}

// ─── Listing & Tallying ─────────────────────────────────────────────────────

export async function getProposals(
  walletAddress?: string | null
): Promise<ProposalWithTally[]> {
  const proposalIds = await redis().lrange(PROPOSALS_LIST_KEY, 0, 49)

  if (proposalIds.length === 0) {
    return []
  }

  // Fetch all proposals
  const pipeline = redis().pipeline()
  for (const id of proposalIds) {
    pipeline.get<Proposal>(proposalKey(id as string))
  }
  const proposals = await pipeline.exec<(Proposal | null)[]>()

  const now = Math.floor(Date.now() / 1000)
  const results: ProposalWithTally[] = []

  for (const proposal of proposals) {
    if (!proposal) continue

    // Auto-close expired proposals
    if (proposal.status === 'active' && proposal.votingEndsAt <= now) {
      proposal.status = 'closed'
      await redis().set(proposalKey(proposal.id), proposal)
    }

    // Get all voters for this proposal
    const voters = await redis().smembers(proposalVotersKey(proposal.id))

    // Fetch all votes
    let yesWeight = 0
    let noWeight = 0
    let yesWallets = 0
    let noWallets = 0
    let userVote: ProposalVote | null = null

    if (voters.length > 0) {
      const votePipeline = redis().pipeline()
      for (const voter of voters) {
        votePipeline.get<ProposalVote>(proposalVoteKey(proposal.id, voter))
      }
      const votes = await votePipeline.exec<(ProposalVote | null)[]>()

      for (const v of votes) {
        if (!v) continue
        if (v.vote === 'yes') {
          yesWeight += v.weight
          yesWallets++
        } else {
          noWeight += v.weight
          noWallets++
        }
        if (walletAddress && v.wallet === walletAddress) {
          userVote = v
        }
      }
    }

    results.push({
      ...proposal,
      yesWeight,
      noWeight,
      yesWallets,
      noWallets,
      userVote,
    })
  }

  return results
}
