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
      const res = await fetch(`/api/governance/results${params}`)
      if (!res.ok) throw new Error('Governance results fetch failed')
      return res.json() as Promise<GovernanceResultsResponse>
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
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
