'use client'

import { useQuery } from '@tanstack/react-query'

export interface DlmmExitData {
  pool: string
  owner: string
  assetMint: string
  dlmmPool: string
  position: string
  totalSolClaimed: string
  status: number
  createdAt: number
  completedAt: number
  proposalId: string
  bump: number
  publicKey: string
}

/**
 * React Query hook that fetches all DLMM exit accounts via the
 * server-side API route. Works without a connected wallet.
 */
export function useDlmmExits() {
  return useQuery<DlmmExitData[], Error>({
    queryKey: ['dlmm-exits'],
    queryFn: async () => {
      const res = await fetch('/api/staking/exits')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'DLMM exits fetch failed')
      }
      return res.json() as Promise<DlmmExitData[]>
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}
