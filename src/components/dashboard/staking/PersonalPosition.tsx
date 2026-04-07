'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import gsap from 'gsap'
import BN from 'bn.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { useStakerAccount } from '@/hooks/useStakerAccount'
import { useStakingPool } from '@/hooks/useStakingPool'
import { formatBrain, formatDuration } from '@/lib/staking/format'
import MultiplierProgress from './MultiplierProgress'
import ClaimableRewards from './ClaimableRewards'
import StakeForm from './StakeForm'
import UnstakeButton from './UnstakeButton'
import TransactionToast from './TransactionToast'
import type { ToastStatus } from './TransactionToast'

// ── Section Header ──────────────────────────────────────────────────

function SectionHeader() {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="font-mono text-[10px] text-[#d4f000]/60 tracking-[0.2em] tabular-nums">04</span>
      <div className="w-3 h-px bg-[#d4f000]/30" />
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#888] font-bold">
        PERSONAL POSITION
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-[#333]/40 to-transparent" />
    </div>
  )
}

// ── Wallet Not Connected ────────────────────────────────────────────

function ConnectWalletPrompt() {
  return (
    <div className="mt-6 border border-[#e6c84a]/15 bg-[#e6c84a]/[0.02] rounded-sm p-6">
      <SectionHeader />
      <div className="text-center py-4">
        <div className="font-mono text-[13px] uppercase tracking-[0.25em] text-[#e6c84a] font-bold mb-2">
          ◆ CONNECT WALLET TO VIEW POSITION
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#666]">
          LINK YOUR WALLET TO ACCESS STAKING OPERATIONS AND VIEW YOUR POSITION
        </div>
      </div>
    </div>
  )
}

// ── No Active Stake ─────────────────────────────────────────────────

function NoStakePrompt() {
  return (
    <div className="mt-6 border border-[#333]/40 rounded-sm bg-[#0d0d0d]/60 p-6">
      <SectionHeader />
      <div className="py-4">
        <div className="text-center mb-4">
          <div className="font-mono text-[13px] uppercase tracking-[0.25em] text-[#888] font-bold mb-2">
            ◆ NO ACTIVE STAKE
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#555]">
            STAKE BRAIN TOKENS TO EARN SOL REWARDS WITH TIME-BASED MULTIPLIERS
          </div>
        </div>
        <StakeForm />
      </div>
    </div>
  )
}

// ── Loading State ───────────────────────────────────────────────────

function PositionSkeleton() {
  return (
    <div className="mt-6 border border-[#333]/40 rounded-sm bg-[#0d0d0d]/60 p-6">
      <SectionHeader />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {[0, 1].map((i) => (
          <div key={i} className="border border-[#333]/30 bg-[#0d0d0d]/60 rounded-sm p-4">
            <div className="wr-skeleton h-3 w-20 mb-3" style={{ animationDelay: `${i * 150}ms` }} />
            <div className="wr-skeleton h-6 w-32" style={{ animationDelay: `${i * 150 + 75}ms` }} />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="wr-skeleton h-3 w-40" style={{ animationDelay: '300ms' }} />
        <div className="wr-skeleton h-[6px] w-full" style={{ animationDelay: '375ms' }} />
      </div>
    </div>
  )
}

// ── Error State ─────────────────────────────────────────────────────

function PositionError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mt-6 border border-[#ff9e9e]/20 bg-[#ff9e9e]/[0.03] rounded-sm p-6">
      <SectionHeader />
      <div className="text-center py-4">
        <div className="font-mono text-[13px] uppercase tracking-[0.25em] text-[#ff9e9e] font-bold mb-2">
          ◆ SIGNAL LOST
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#666] mb-4">
          UNABLE TO RETRIEVE STAKER DATA — CONNECTION INTERRUPTED
        </div>
        <button onClick={onRetry} className="wr-vote-btn">
          RETRY CONNECTION
        </button>
      </div>
    </div>
  )
}

// ── Stat Card (matching PoolOverview pattern) ───────────────────────

function StatCard({
  label,
  value,
  suffix,
  accent = false,
  sub,
}: {
  label: string
  value: string
  suffix?: string
  accent?: boolean
  sub?: string
}) {
  return (
    <div
      data-wr-reveal
      className={`relative border rounded-sm p-4 transition-all duration-300 group
        ${accent
          ? 'border-[#d4f000]/20 bg-[#d4f000]/[0.03] hover:border-[#d4f000]/35 hover:bg-[#d4f000]/[0.05]'
          : 'border-[#333]/30 bg-[#0d0d0d]/60 hover:border-[#444]/50 hover:bg-[#0d0d0d]/80'
        }
      `}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#d4f000]/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#777] mb-2 flex items-center gap-1.5">
        <span className="text-[#d4f000]/50 text-[9px]">◆</span>
        {label}
      </div>
      <div className={`font-mono text-[16px] sm:text-[20px] font-black tabular-nums leading-none
        ${accent ? 'text-[#d4f000]' : 'text-white'}
        group-hover:drop-shadow-[0_0_8px_rgba(212,240,0,0.1)] transition-all duration-300
      `}>
        {value}
        {suffix && (
          <span className="text-[11px] sm:text-[13px] font-bold text-[#888] ml-1.5">{suffix}</span>
        )}
      </div>
      {sub && (
        <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#555] mt-1.5">
          {sub}
        </div>
      )}
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────

export default function PersonalPosition() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { publicKey, connected } = useWallet()
  const {
    data: staker,
    isLoading: stakerLoading,
    isError: stakerError,
    refetch: refetchStaker,
  } = useStakerAccount()
  const {
    data: pool,
    isLoading: poolLoading,
  } = useStakingPool()

  // ── Toast state ─────────────────────────────────────────────────
  const [toastStatus, setToastStatus] = useState<ToastStatus>('idle')
  const [toastSuccessMsg, setToastSuccessMsg] = useState('')
  const [toastErrorMsg, setToastErrorMsg] = useState('')

  const handleDismissToast = useCallback(() => {
    setToastStatus('idle')
    setToastSuccessMsg('')
    setToastErrorMsg('')
  }, [])

  // Track claim mutation state from ClaimableRewards
  const handleClaimMutationState = useCallback((state: {
    isPending: boolean
    isSuccess: boolean
    isError: boolean
    error: Error | null
  }) => {
    if (state.isPending && toastStatus !== 'pending') {
      setToastStatus('pending')
    } else if (state.isSuccess && toastStatus === 'pending') {
      setToastSuccessMsg('CLAIM CONFIRMED — SOL REWARDS TRANSFERRED')
      setToastStatus('success')
    } else if (state.isError && toastStatus === 'pending') {
      setToastErrorMsg(state.error?.message ?? 'CLAIM FAILED')
      setToastStatus('error')
    }
  }, [toastStatus])

  // Track unstake mutation state from UnstakeButton
  const handleUnstakeMutationState = useCallback((state: {
    isPending: boolean
    isSuccess: boolean
    isError: boolean
    error: Error | null
  }) => {
    if (state.isPending && toastStatus !== 'pending') {
      setToastStatus('pending')
    } else if (state.isSuccess && toastStatus === 'pending') {
      setToastSuccessMsg('UNSTAKE CONFIRMED — BRAIN RETURNED TO WALLET')
      setToastStatus('success')
    } else if (state.isError && toastStatus === 'pending') {
      setToastErrorMsg(state.error?.message ?? 'UNSTAKE FAILED')
      setToastStatus('error')
    }
  }, [toastStatus])

  // GSAP stagger reveal when position data loads
  useEffect(() => {
    if (!staker || !containerRef.current) return
    const els = containerRef.current.querySelectorAll('[data-wr-reveal]')
    if (!els.length) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        els,
        { y: 20, opacity: 0, scale: 0.97, filter: 'blur(2px)' },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.06,
          delay: 0.1,
        }
      )
    }, containerRef)
    return () => ctx.revert()
  }, [staker])

  // ── Gate: Wallet not connected ────────────────────────────────
  if (!connected || !publicKey) {
    return <ConnectWalletPrompt />
  }

  // ── Gate: Loading ─────────────────────────────────────────────
  if (stakerLoading || poolLoading) {
    return <PositionSkeleton />
  }

  // ── Gate: Error ───────────────────────────────────────────────
  if (stakerError) {
    return <PositionError onRetry={() => refetchStaker()} />
  }

  // ── Gate: No active stake ─────────────────────────────────────
  if (!staker) {
    return <NoStakePrompt />
  }

  // ── Active stake: format data ─────────────────────────────────
  const stakedAmount = new BN(staker.stakedAmount)
  const rewardDebt = new BN(staker.rewardDebt)
  const pendingRewards = new BN(staker.pendingRewards)
  const rewardPerShare = pool ? new BN(pool.rewardPerShare) : new BN(0)
  const poolPaused = pool?.isPaused ?? false

  // Stake timestamp formatting
  const stakeDate = new Date(staker.stakeTimestamp * 1000)
  const stakeDateStr = stakeDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const nowSec = Math.floor(Date.now() / 1000)
  const stakedDuration = formatDuration(nowSec - staker.stakeTimestamp)

  return (
    <div ref={containerRef} className="mt-6 border border-[#333]/40 rounded-sm bg-[#0d0d0d]/60 p-6">
      <SectionHeader />

      {/* Transaction Toast */}
      <TransactionToast
        status={toastStatus}
        successMessage={toastSuccessMsg}
        errorMessage={toastErrorMsg}
        onDismiss={handleDismissToast}
      />

      {/* Row 1: Staked Amount + Stake Timestamp */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <StatCard
          label="STAKED AMOUNT"
          value={formatBrain(stakedAmount)}
          suffix="BRAIN"
          accent
        />
        <StatCard
          label="STAKING SINCE"
          value={stakeDateStr}
          sub={`${stakedDuration} ELAPSED`}
        />
      </div>

      {/* Row 2: Multiplier Progress */}
      <div className="mb-4 border border-[#333]/30 bg-[#0d0d0d]/60 rounded-sm p-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#777] mb-3 flex items-center gap-1.5">
          <span className="text-[#d4f000]/50 text-[9px]">◆</span>
          MULTIPLIER STATUS
        </div>
        <MultiplierProgress stakeTimestamp={staker.stakeTimestamp} />
      </div>

      {/* Row 3: Claimable Rewards */}
      <ClaimableRewards
        stakedAmount={stakedAmount}
        currentMultiplier={staker.currentMultiplier}
        rewardPerShare={rewardPerShare}
        rewardDebt={rewardDebt}
        pendingRewards={pendingRewards}
        poolPaused={poolPaused}
        onMutationStateChange={handleClaimMutationState}
      />

      {/* Row 4: Unstake Button */}
      <div className="mt-4">
        <UnstakeButton
          stakeTimestamp={staker.stakeTimestamp}
          onMutationStateChange={handleUnstakeMutationState}
        />
      </div>
    </div>
  )
}
