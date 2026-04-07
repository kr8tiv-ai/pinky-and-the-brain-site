'use client'

import { useQuery } from '@tanstack/react-query'
import { useAnchorProvider } from '@/hooks/useAnchorProvider'
import { findStakingPool } from '@/lib/staking/pda'

/**
 * React Query hook that fetches the on-chain StakingPool account
 * via the Anchor program.
 *
 * Works in both modes:
 * - connected wallet: signed provider context
 * - no wallet: read-only provider context (queries only)
 */
export function useStakingPool() {
  const { program } = useAnchorProvider()

  return useQuery({
    queryKey: ['staking-pool-onchain'],
    queryFn: async () => {
      if (!program) throw new Error('Program not available')

      const [poolPda] = findStakingPool(program.programId)
      const pool = await (program.account as any).stakingPool.fetch(poolPda)

      return {
        owner: pool.owner.toBase58(),
        crank: pool.crank.toBase58(),
        brainMint: pool.brainMint.toBase58(),
        brainVault: pool.brainVault.toBase58(),
        rewardVault: pool.rewardVault.toBase58(),
        treasury: pool.treasury.toBase58(),
        totalStaked: pool.totalStaked,
        totalWeightedStake: pool.totalWeightedStake,
        rewardPerShare: pool.rewardPerShare,
        totalRewardsDistributed: pool.totalRewardsDistributed,
        protocolFeeBps: pool.protocolFeeBps,
        minStakeAmount: pool.minStakeAmount,
        isPaused: pool.isPaused,
        bump: pool.bump,
        brainVaultBump: pool.brainVaultBump,
        rewardVaultBump: pool.rewardVaultBump,
      }
    },
    enabled: !!program,
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}
