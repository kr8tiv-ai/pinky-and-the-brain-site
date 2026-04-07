'use client'

import { useEffect } from 'react'
import BN from 'bn.js'
import { formatSol } from '@/lib/staking/format'
import { PRECISION } from '@/lib/staking/constants'
import { useClaimMutation } from '@/hooks/useStakingMutations'

interface ClaimableRewardsProps {
  /** Raw staked BRAIN amount (BN from chain) */
  stakedAmount: BN
  /** Current multiplier (0–3) */
  currentMultiplier: number
  /** Pool's reward_per_share (u128, from chain) */
  rewardPerShare: BN
  /** Staker's reward_debt (u128, from chain) */
  rewardDebt: BN
  /** Staker's pending_rewards (u64, from chain) */
  pendingRewards: BN
  /** Whether the staking pool is paused */
  poolPaused?: boolean
  /** Callback to notify parent of mutation status changes */
  onMutationStateChange?: (state: {
    isPending: boolean
    isSuccess: boolean
    isError: boolean
    error: Error | null
  }) => void
}

/**
 * ClaimableRewards — displays estimated claimable SOL rewards.
 *
 * Calculation mirrors on-chain claim logic:
 *   pending = (staked_amount * current_multiplier * reward_per_share / PRECISION) - reward_debt + pending_rewards
 *
 * Labelled as "estimated" since actual claim amount is determined on-chain.
 */
export default function ClaimableRewards({
  stakedAmount,
  currentMultiplier,
  rewardPerShare,
  rewardDebt,
  pendingRewards,
  poolPaused = false,
  onMutationStateChange,
}: ClaimableRewardsProps) {
  const precision = new BN(PRECISION)
  const claimMutation = useClaimMutation()

  // Calculate weighted share: staked_amount * current_multiplier * reward_per_share / PRECISION
  const weightedShare = stakedAmount
    .mul(new BN(currentMultiplier))
    .mul(rewardPerShare)
    .div(precision)

  // pending = weightedShare - reward_debt + pending_rewards
  // Use max(0, ...) to handle any rounding discrepancies
  let estimated: BN
  try {
    estimated = weightedShare.sub(rewardDebt).add(pendingRewards)
    if (estimated.isNeg()) estimated = new BN(0)
  } catch {
    estimated = new BN(0)
  }

  const isZero = estimated.isZero()
  const formattedAmount = formatSol(estimated)

  const claimDisabled = isZero || claimMutation.isPending || poolPaused

  // Notify parent of mutation state changes via useEffect
  useEffect(() => {
    if (onMutationStateChange) {
      onMutationStateChange({
        isPending: claimMutation.isPending,
        isSuccess: claimMutation.isSuccess,
        isError: claimMutation.isError,
        error: claimMutation.error,
      })
    }
  }, [claimMutation.isPending, claimMutation.isSuccess, claimMutation.isError, claimMutation.error, onMutationStateChange])

  return (
    <div
      data-wr-reveal
      className={`relative border rounded-sm p-4 transition-all duration-300 group
        ${isZero
          ? 'border-[#333]/30 bg-[#0d0d0d]/60 hover:border-[#444]/50'
          : 'border-[#d4f000]/20 bg-[#d4f000]/[0.03] hover:border-[#d4f000]/35 hover:bg-[#d4f000]/[0.05]'
        }
      `}
    >
      {/* Hover accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#d4f000]/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

      {/* Label */}
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#777] mb-1 flex items-center gap-1.5">
        <span className="text-[#d4f000]/50 text-[9px]">◆</span>
        CLAIMABLE REWARDS
      </div>

      {/* Estimated label */}
      <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#555] mb-2">
        ESTIMATED — ACTUAL DETERMINED ON-CHAIN
      </div>

      {/* Amount */}
      <div className={`font-mono text-[18px] sm:text-[22px] font-black tabular-nums leading-none
        ${isZero ? 'text-[#555]' : 'text-[#d4f000]'}
        group-hover:drop-shadow-[0_0_8px_rgba(212,240,0,0.1)] transition-all duration-300
      `}>
        {formattedAmount}
        <span className="text-[11px] sm:text-[13px] font-bold text-[#888] ml-1.5">SOL</span>
      </div>

      {/* Claim button — live transaction */}
      {!isZero && (
        <div className="mt-3">
          <button
            onClick={() => claimMutation.mutate()}
            disabled={claimDisabled}
            className={`font-mono text-[10px] uppercase tracking-[0.2em] px-4 py-1.5 border rounded-sm transition-all duration-200
              ${claimDisabled
                ? 'border-[#d4f000]/20 text-[#d4f000]/50 cursor-not-allowed'
                : 'border-[#d4f000]/30 text-[#d4f000]/80 hover:border-[#d4f000]/50 hover:text-[#d4f000] hover:bg-[#d4f000]/[0.04] active:bg-[#d4f000]/[0.08]'
              }
            `}
          >
            {claimMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 border border-[#d4f000]/40 border-t-[#d4f000] rounded-full animate-spin" />
                CLAIMING...
              </span>
            ) : (
              'CLAIM REWARDS'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
