'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import BN from 'bn.js'
import { usePoolOverview } from '@/hooks/usePoolOverview'
import { formatBrain, formatSol } from '@/lib/staking/format'
import MultiplierTiers from './MultiplierTiers'

// ── Helpers ─────────────────────────────────────────────────────────

/** Format basis points as percentage string, e.g. 200 → '2%' */
function formatBps(bps: number): string {
  const pct = bps / 100
  return pct % 1 === 0 ? `${pct}%` : `${pct.toFixed(2)}%`
}

// ── Stat Card ───────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  suffix,
  accent = false,
}: {
  label: string
  value: string
  suffix?: string
  accent?: boolean
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
      {/* Hover top accent line */}
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
    </div>
  )
}

// ── Loading Skeleton ────────────────────────────────────────────────

function PoolSkeleton() {
  return (
    <div className="space-y-6">
      {/* Section 01 skeleton */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="wr-skeleton h-3 w-6" />
          <div className="w-3 h-px bg-[#333]" />
          <div className="wr-skeleton h-3 w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border border-[#333]/30 bg-[#0d0d0d]/60 rounded-sm p-4">
              <div className="wr-skeleton h-3 w-20 mb-3" style={{ animationDelay: `${i * 150}ms` }} />
              <div className="wr-skeleton h-6 w-32" style={{ animationDelay: `${i * 150 + 75}ms` }} />
            </div>
          ))}
        </div>
      </div>

      {/* Section 02 skeleton */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="wr-skeleton h-3 w-6" />
          <div className="w-3 h-px bg-[#333]" />
          <div className="wr-skeleton h-3 w-28" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border border-[#333]/30 bg-[#0d0d0d]/60 rounded-sm p-4">
              <div className="wr-skeleton h-3 w-24 mb-3" style={{ animationDelay: `${i * 150 + 300}ms` }} />
              <div className="wr-skeleton h-6 w-28" style={{ animationDelay: `${i * 150 + 375}ms` }} />
            </div>
          ))}
        </div>
      </div>

      {/* Section 03 skeleton */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="wr-skeleton h-3 w-6" />
          <div className="w-3 h-px bg-[#333]" />
          <div className="wr-skeleton h-3 w-32" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border border-[#333]/30 bg-[#0d0d0d]/60 rounded-sm p-3">
              <div className="wr-skeleton h-3 w-14 mb-2" style={{ animationDelay: `${i * 100 + 600}ms` }} />
              <div className="wr-skeleton h-7 w-12" style={{ animationDelay: `${i * 100 + 650}ms` }} />
              <div className="wr-skeleton h-2 w-16 mt-2" style={{ animationDelay: `${i * 100 + 700}ms` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Error State ─────────────────────────────────────────────────────

function PoolError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="border border-[#ff9e9e]/20 bg-[#ff9e9e]/[0.03] rounded-sm p-8 text-center">
      <div className="font-mono text-[14px] uppercase tracking-[0.3em] text-[#ff9e9e] font-black mb-2">
        ◆ SIGNAL LOST
      </div>
      <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#666] mb-5">
        UNABLE TO RETRIEVE STAKING POOL DATA — CONNECTION INTERRUPTED
      </div>
      <button
        onClick={onRetry}
        className="wr-vote-btn"
      >
        RETRY CONNECTION
      </button>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────

export default function PoolOverview() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { data, isLoading, isError, error, refetch } = usePoolOverview()

  // GSAP stagger reveal on data load
  useEffect(() => {
    if (!data || !containerRef.current) return
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
  }, [data])

  // Loading state
  if (isLoading) {
    return <PoolSkeleton />
  }

  // Error state
  if (isError) {
    return <PoolError onRetry={() => refetch()} />
  }

  // No data edge case
  if (!data) {
    return <PoolError onRetry={() => refetch()} />
  }

  // Parse string amounts to BN for formatting
  const totalStaked = new BN(data.totalStaked)
  const totalRewardsDistributed = new BN(data.totalRewardsDistributed)
  const rewardVaultBalance = new BN(data.rewardVaultBalance)
  const protocolFeePct = formatBps(data.protocolFeeBps)

  return (
    <div ref={containerRef} className="space-y-6">
      {/* ── Section 01: POOL STATUS ──────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-[10px] text-[#d4f000]/60 tracking-[0.2em] tabular-nums">01</span>
          <div className="w-3 h-px bg-[#d4f000]/30" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#888] font-bold">
            POOL STATUS
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-[#333]/40 to-transparent" />
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                data.isPaused ? 'bg-[#ff9e9e]' : 'bg-[#d4f000]'
              }`}
              style={
                data.isPaused
                  ? undefined
                  : { boxShadow: '0 0 5px #d4f000, 0 0 12px rgba(212,240,0,0.3)' }
              }
            />
            <span
              className={`font-mono text-[10px] font-bold uppercase tracking-[0.2em] ${
                data.isPaused ? 'text-[#ff9e9e]' : 'text-[#d4f000]'
              }`}
            >
              {data.isPaused ? 'PAUSED' : 'ACTIVE'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            label="TOTAL BRAIN STAKED"
            value={formatBrain(totalStaked)}
            suffix="BRAIN"
            accent
          />
          <StatCard
            label="MIN STAKE"
            value={formatBrain(new BN(data.minStakeAmount))}
            suffix="BRAIN"
          />
          <StatCard
            label="PROTOCOL FEE"
            value={protocolFeePct}
          />
        </div>
      </div>

      {/* ── Section 02: REWARDS INTEL ────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-[10px] text-[#d4f000]/60 tracking-[0.2em] tabular-nums">02</span>
          <div className="w-3 h-px bg-[#d4f000]/30" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#888] font-bold">
            REWARDS INTEL
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-[#333]/40 to-transparent" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            label="TOTAL SOL DISTRIBUTED"
            value={formatSol(totalRewardsDistributed)}
            suffix="SOL"
            accent
          />
          <StatCard
            label="REWARD VAULT BALANCE"
            value={formatSol(rewardVaultBalance)}
            suffix="SOL"
          />
          <StatCard
            label="REWARD POOL STATUS"
            value={rewardVaultBalance.isZero() ? 'DEPLETED' : 'FUNDED'}
          />
        </div>
      </div>

      {/* ── Section 03: MULTIPLIER TIERS ─────────────────────────── */}
      <MultiplierTiers />
    </div>
  )
}
