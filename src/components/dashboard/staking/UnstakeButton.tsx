'use client'

import { useState, useCallback, useEffect } from 'react'
import { useUnstakeMutation } from '@/hooks/useStakingMutations'
import { MULTIPLIER_THRESHOLDS } from '@/lib/staking/constants'

interface UnstakeButtonProps {
  /** Unix timestamp (seconds) when user staked */
  stakeTimestamp: number
  /** Callback to notify parent of mutation status changes */
  onMutationStateChange?: (state: {
    isPending: boolean
    isSuccess: boolean
    isError: boolean
    error: Error | null
  }) => void
}

const CLIFF_SECONDS = MULTIPLIER_THRESHOLDS[0].seconds // 7 days

/**
 * UnstakeButton — two-step unstake with inline confirmation dialog.
 *
 * Pre-cliff (< 7 days staked): warns that rewards will be forfeited.
 * Post-cliff (>= 7 days staked): notes that rewards will be auto-claimed.
 */
export default function UnstakeButton({
  stakeTimestamp,
  onMutationStateChange,
}: UnstakeButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const unstakeMutation = useUnstakeMutation()

  const nowSec = Math.floor(Date.now() / 1000)
  const isPreCliff = (nowSec - stakeTimestamp) < CLIFF_SECONDS

  const handleConfirm = useCallback(() => {
    unstakeMutation.mutate(undefined, {
      onSettled: () => {
        setShowConfirm(false)
      },
    })
  }, [unstakeMutation])

  // Notify parent of mutation state changes via useEffect
  useEffect(() => {
    if (onMutationStateChange) {
      onMutationStateChange({
        isPending: unstakeMutation.isPending,
        isSuccess: unstakeMutation.isSuccess,
        isError: unstakeMutation.isError,
        error: unstakeMutation.error,
      })
    }
  }, [unstakeMutation.isPending, unstakeMutation.isSuccess, unstakeMutation.isError, unstakeMutation.error, onMutationStateChange])

  if (showConfirm) {
    return (
      <div className="border border-[#ff9e9e]/20 bg-[#ff9e9e]/[0.03] rounded-sm p-4 space-y-3">
        {/* Warning message */}
        <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#ff9e9e] leading-relaxed">
          {isPreCliff
            ? 'UNSTAKING NOW WILL FORFEIT ALL ACCUMULATED REWARDS. YOUR FULL BRAIN DEPOSIT WILL BE RETURNED.'
            : 'UNSTAKING WILL AUTO-CLAIM YOUR PENDING SOL REWARDS AND RETURN YOUR BRAIN.'}
        </div>

        {/* Confirm / Cancel buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            disabled={unstakeMutation.isPending}
            className="flex-1 font-mono text-[10px] uppercase tracking-[0.2em] font-bold px-4 py-2.5 bg-[#ff9e9e]/10 border border-[#ff9e9e]/30 text-[#ff9e9e] rounded-sm hover:bg-[#ff9e9e]/20 hover:border-[#ff9e9e]/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {unstakeMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-3 h-3 border border-[#ff9e9e]/40 border-t-[#ff9e9e] rounded-full animate-spin" />
                UNSTAKING...
              </span>
            ) : (
              'CONFIRM UNSTAKE'
            )}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={unstakeMutation.isPending}
            className="font-mono text-[10px] uppercase tracking-[0.2em] px-4 py-2.5 border border-[#333]/40 text-[#888] rounded-sm hover:border-[#555] hover:text-[#aaa] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            CANCEL
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="w-full font-mono text-[10px] uppercase tracking-[0.2em] px-4 py-2.5 border border-[#ff9e9e]/20 text-[#ff9e9e]/70 rounded-sm hover:border-[#ff9e9e]/40 hover:text-[#ff9e9e] hover:bg-[#ff9e9e]/[0.04] transition-all duration-200"
    >
      UNSTAKE
    </button>
  )
}
