'use client'

import { useState, useEffect } from 'react'
import { multiplierProgress, multiplierLabel, formatDuration } from '@/lib/staking/format'

/**
 * Tier color map: 0x=red, 1x=yellow, 2x=green-yellow, 3x=green (lime)
 */
const TIER_COLORS: Record<number, { text: string; badge: string; glow: string; bar: string }> = {
  0: {
    text: 'text-[#ff9e9e]',
    badge: 'border-[#ff9e9e]/30 bg-[#ff9e9e]/[0.06]',
    glow: '',
    bar: 'from-[#ff9e9e]/40 to-[#ff9e9e]/70',
  },
  1: {
    text: 'text-[#e6c84a]',
    badge: 'border-[#e6c84a]/30 bg-[#e6c84a]/[0.06]',
    glow: '0 0 6px rgba(230,200,74,0.2)',
    bar: 'from-[#e6c84a]/40 to-[#e6c84a]/70',
  },
  2: {
    text: 'text-[#a3d400]',
    badge: 'border-[#a3d400]/30 bg-[#a3d400]/[0.06]',
    glow: '0 0 8px rgba(163,212,0,0.25)',
    bar: 'from-[#a3d400]/40 to-[#a3d400]/70',
  },
  3: {
    text: 'text-[#d4f000]',
    badge: 'border-[#d4f000]/30 bg-[#d4f000]/[0.08]',
    glow: '0 0 10px rgba(212,240,0,0.3)',
    bar: 'from-[#d4f000]/50 to-[#d4f000]/80',
  },
}

interface MultiplierProgressProps {
  stakeTimestamp: number
}

/**
 * MultiplierProgress — live countdown progress bar for multiplier tier advancement.
 * Updates every second via setInterval. Shows current tier badge, progress bar
 * toward next tier, and countdown text. At max tier (3x), shows MAX TIER badge.
 */
export default function MultiplierProgress({ stakeTimestamp }: MultiplierProgressProps) {
  const [nowSeconds, setNowSeconds] = useState(() => Math.floor(Date.now() / 1000))

  // Tick every second for live countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setNowSeconds(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const progress = multiplierProgress(stakeTimestamp, nowSeconds)
  const tierColors = TIER_COLORS[progress.current] ?? TIER_COLORS[0]
  const isMaxTier = progress.next === null

  return (
    <div data-wr-reveal className="space-y-3">
      {/* Tier badge + label row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Current tier badge */}
          <div
            className={`font-mono text-[14px] sm:text-[16px] font-black tabular-nums px-3 py-1 border rounded-sm ${tierColors.text} ${tierColors.badge}`}
            style={tierColors.glow ? { boxShadow: tierColors.glow } : undefined}
          >
            {multiplierLabel(progress.current)}
          </div>

          {/* Arrow + next tier */}
          {!isMaxTier && progress.next !== null && (
            <>
              <span className="font-mono text-[12px] text-[#555]">→</span>
              <span className={`font-mono text-[12px] uppercase tracking-[0.15em] ${TIER_COLORS[progress.next]?.text ?? 'text-[#888]'}`}>
                {progress.next}x
              </span>
            </>
          )}
        </div>

        {/* Countdown or max badge */}
        {isMaxTier ? (
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#d4f000]" style={{ boxShadow: '0 0 5px #d4f000' }} />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d4f000] font-bold">
              MAX TIER ACHIEVED
            </span>
          </div>
        ) : (
          <span className="font-mono text-[11px] text-[#888] tabular-nums tracking-[0.1em]">
            {progress.timeRemaining} to {progress.next}x
          </span>
        )}
      </div>

      {/* Progress bar */}
      {!isMaxTier && (
        <div className="relative h-[6px] bg-[#1a1a1a] rounded-full overflow-hidden border border-[#333]/20">
          <div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${tierColors.bar} rounded-full transition-all duration-1000 ease-linear`}
            style={{ width: `${Math.max(1, progress.progressPct)}%` }}
          />
          {/* Subtle pulse at the leading edge */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white/10 rounded-full animate-pulse"
            style={{ left: `${Math.max(1, progress.progressPct)}%`, transform: 'translateX(-50%)' }}
          />
        </div>
      )}

      {/* Max tier: full bar */}
      {isMaxTier && (
        <div className="relative h-[6px] bg-[#1a1a1a] rounded-full overflow-hidden border border-[#d4f000]/15">
          <div className="absolute inset-0 bg-gradient-to-r from-[#d4f000]/50 to-[#d4f000]/80 rounded-full" />
        </div>
      )}
    </div>
  )
}
