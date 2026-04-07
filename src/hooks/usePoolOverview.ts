'use client'

import { useQuery } from '@tanstack/react-query'

/**
 * Pool overview data returned by the /api/staking/pool route.
 * All numeric values are serialized as strings to preserve
 * precision across the JSON boundary (u128 values exceed Number.MAX_SAFE_INTEGER).
 */
export interface PoolOverview {
  totalStaked: string
  totalWeightedStake: string
  rewardPerShare: string
  totalRewardsDistributed: string
  protocolFeeBps: number
  minStakeAmount: string
  isPaused: boolean
  rewardVaultBalance: string
}

/**
 * React Query hook that fetches pool overview data via the server-side
 * API route. Works without a connected wallet — the API route uses
 * Helius RPC directly. This is the public-facing pool data source.
 */
export function usePoolOverview() {
  return useQuery<PoolOverview, Error>({
    queryKey: ['staking-pool-overview'],
    queryFn: async () => {
      const res = await fetch('/api/staking/pool')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Staking pool fetch failed')
      }
      return res.json() as Promise<PoolOverview>
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}
