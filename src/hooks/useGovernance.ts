'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useWallet } from '@solana/wallet-adapter-react'
import { buildVoteMessage } from '@/lib/governance.config'
import type { GovernanceRound, GovernanceCandidate, StoredVote } from '@/lib/governance.config'
import bs58 from 'bs58'

// ─── Response Types (mirrors server types) ───────────────────────────────────

export interface CandidateWithTally extends GovernanceCandidate {
  voteCount: number
  voteWeight: number
}

export interface GovernanceResultsResponse {
  round: GovernanceRound | null
  candidates: CandidateWithTally[]
  totalVoters: number
  totalWeight: number
  userVote: StoredVote | null
}

// ─── Results Hook ────────────────────────────────────────────────────────────

export function useGovernanceResults(walletAddress: string | null) {
  return useQuery<GovernanceResultsResponse, Error>({
    queryKey: ['governance-results', walletAddress],
    queryFn: async () => {
      const params = walletAddress ? `?wallet=${walletAddress}` : ''
      try {
        const res = await fetch(`/api/governance/results${params}`)
        if (!res.ok) return { round: null, candidates: [], totalVoters: 0, totalWeight: 0, userVote: null }
        return res.json() as Promise<GovernanceResultsResponse>
      } catch {
        return { round: null, candidates: [], totalVoters: 0, totalWeight: 0, userVote: null }
      }
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
    retry: false,
  })
}

// ─── Vote Mutation ───────────────────────────────────────────────────────────

interface VoteResult {
  success: boolean
  weight?: number
  error?: string
}

export function useVote() {
  const { publicKey, signMessage } = useWallet()
  const queryClient = useQueryClient()

  return useMutation<VoteResult, Error, { candidateId: string; roundId: string }>({
    mutationFn: async ({ candidateId, roundId }) => {
      if (!publicKey || !signMessage) {
        throw new Error('Wallet not connected')
      }

      // Build and sign the message
      const message = buildVoteMessage(roundId, candidateId)
      const messageBytes = new TextEncoder().encode(message)
      const signatureBytes = await signMessage(messageBytes)

      // Submit to API
      const res = await fetch('/api/governance/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
          candidateId,
          signature: bs58.encode(signatureBytes),
          message,
        }),
      })

      const data = (await res.json()) as VoteResult
      if (!res.ok) {
        throw new Error(data.error ?? 'Vote failed')
      }
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance-results'] })
    },
  })
}

// ─── Admin Hooks ─────────────────────────────────────────────────────────────

export function useAdminResults(password: string | null) {
  return useQuery<GovernanceResultsResponse, Error>({
    queryKey: ['governance-admin', password],
    queryFn: async () => {
      const res = await fetch('/api/governance/admin', {
        headers: { 'x-admin-password': password! },
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Admin auth failed')
      }
      return res.json() as Promise<GovernanceResultsResponse>
    },
    enabled: !!password,
    staleTime: 15_000,
    refetchInterval: 15_000,
  })
}

export function useAdminAction(password: string) {
  const queryClient = useQueryClient()

  return useMutation<unknown, Error, Record<string, unknown>>({
    mutationFn: async (body) => {
      const res = await fetch('/api/governance/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Admin action failed')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance-admin'] })
      queryClient.invalidateQueries({ queryKey: ['governance-results'] })
    },
  })
}

// ─── Proposal Types (client-side mirrors) ────────────────────────────────────

export interface ProposalWithTally {
  id: string
  title: string
  description: string
  referenceLinks: { label: string; url: string }[]
  createdBy: string
  createdAt: number
  duration: 3 | 7
  votingEndsAt: number
  status: 'active' | 'closed'
  yesWeight: number
  noWeight: number
  yesWallets: number
  noWallets: number
  userVote?: { wallet: string; vote: 'yes' | 'no'; weight: number; timestamp: number } | null
}

// ─── Proposals List Hook ─────────────────────────────────────────────────────

export function useProposals(walletAddress: string | null) {
  return useQuery<{ proposals: ProposalWithTally[] }, Error>({
    queryKey: ['proposals', walletAddress],
    queryFn: async () => {
      const params = walletAddress ? `?wallet=${walletAddress}` : ''
      try {
        const res = await fetch(`/api/governance/proposals${params}`)
        if (!res.ok) return { proposals: [] }
        return res.json()
      } catch {
        return { proposals: [] }
      }
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
    retry: false,
  })
}

// ─── Create Proposal Mutation ────────────────────────────────────────────────

export function useCreateProposal() {
  const { publicKey, signMessage } = useWallet()
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean; proposal?: ProposalWithTally; error?: string }, Error, {
    title: string
    description: string
    referenceLinks: { label: string; url: string }[]
    duration: 3 | 7
  }>({
    mutationFn: async ({ title, description, referenceLinks, duration }) => {
      if (!publicKey || !signMessage) throw new Error('Wallet not connected')

      const { buildProposalCreateMessage } = await import('@/lib/governance.config')
      const message = buildProposalCreateMessage(title)
      const messageBytes = new TextEncoder().encode(message)
      const signatureBytes = await signMessage(messageBytes)

      const res = await fetch('/api/governance/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
          title,
          description,
          referenceLinks,
          duration,
          signature: bs58.encode(signatureBytes),
          message,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create proposal')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
    },
  })
}

// ─── Proposal Vote Mutation ──────────────────────────────────────────────────

export function useProposalVote() {
  const { publicKey, signMessage } = useWallet()
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean; weight?: number; error?: string }, Error, {
    proposalId: string
    vote: 'yes' | 'no'
  }>({
    mutationFn: async ({ proposalId, vote }) => {
      if (!publicKey || !signMessage) throw new Error('Wallet not connected')

      const { buildProposalVoteMessage } = await import('@/lib/governance.config')
      const message = buildProposalVoteMessage(proposalId, vote)
      const messageBytes = new TextEncoder().encode(message)
      const signatureBytes = await signMessage(messageBytes)

      const res = await fetch('/api/governance/proposals/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
          proposalId,
          vote,
          signature: bs58.encode(signatureBytes),
          message,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Vote failed')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
    },
  })
}
