'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'

/**
 * ⑨ Staking Multiplier Tier Pyramid — Visual tier progression
 * Three tiers stacked, current tier highlighted with pulse ring.
 * Locked tiers dimmed with lock icon.
 */

interface Tier {
  label: string
  range: string
  multiplier: string
  days: number
}

interface TierPyramidProps {
  tiers: Tier[]
  currentTierIndex: number // -1 = pre-cliff (no tier), 0-based index into tiers
  stakedDays?: number
  className?: string
}

const TIER_COLORS = [
  { bg: '#111', border: '#333', accent: '#555', text: '#777' },       // Pre-cliff
  { bg: '#0d0d0d', border: '#444', accent: '#bbb', text: '#bbb' },   // Tier 1
  { bg: '#0d0d0d', border: '#d4f000', accent: '#d4f000', text: '#d4f000' }, // Tier 2
  { bg: '#0d0d0d', border: '#e4ff57', accent: '#e4ff57', text: '#e4ff57' }, // Tier 3 (max)
]

export default function TierPyramid({
  tiers,
  currentTierIndex,
  stakedDays = 0,
  className = '',
}: TierPyramidProps) {
  const pyramidRef = useRef<HTMLDivElement>(null)

  // Entrance animation
  useEffect(() => {
    if (!pyramidRef.current) return
    const blocks = pyramidRef.current.querySelectorAll('[data-pyramid-tier]')
    const ctx = gsap.context(() => {
      gsap.fromTo(
        blocks,
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.12,
          delay: 0.2,
        }
      )
    }, pyramidRef)
    return () => ctx.revert()
  }, [])

  // All tiers including pre-cliff
  const allTiers = [
    { label: 'PRE-CLIFF', range: '0-7 DAYS', multiplier: '0x', days: 0 },
    ...tiers,
  ]

  // Reversed so highest tier is at top
  const reversed = [...allTiers].reverse()

  return (
    <div ref={pyramidRef} className={`flex flex-col items-center gap-1.5 ${className}`}>
      {/* Title */}
      <div className="flex items-center gap-2 mb-3 w-full">
        <span className="font-mono text-[10px] text-[#d4f000]/60 tracking-[0.2em] tabular-nums">03</span>
        <div className="w-3 h-px bg-[#d4f000]/30" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#888] font-bold">
          MULTIPLIER TIERS
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#333]/40 to-transparent" />
      </div>

      {/* Pyramid blocks */}
      {reversed.map((tier, visualIndex) => {
        const actualIndex = allTiers.length - 1 - visualIndex
        const isActive = actualIndex === currentTierIndex + 1 // +1 because pre-cliff is index 0
        const isLocked = actualIndex > currentTierIndex + 1
        const isPassed = actualIndex < currentTierIndex + 1
        const colors = TIER_COLORS[Math.min(actualIndex, TIER_COLORS.length - 1)]

        // Pyramid widths: top = narrowest, bottom = widest
        const widthPct = 40 + (visualIndex / (reversed.length - 1)) * 60

        return (
          <div
            key={tier.label}
            data-pyramid-tier
            className="relative transition-all duration-500 origin-center"
            style={{ width: `${widthPct}%` }}
          >
            {/* Active tier pulse ring */}
            {isActive && (
              <div
                className="absolute -inset-[2px] rounded-sm animate-pulse"
                style={{
                  border: `1px solid ${colors.accent}`,
                  boxShadow: `0 0 12px ${colors.accent}40, inset 0 0 12px ${colors.accent}10`,
                  animationDuration: '2s',
                }}
              />
            )}

            <div
              className={`relative rounded-sm border p-3 flex items-center justify-between transition-all duration-300 ${
                isLocked ? 'opacity-40' : ''
              }`}
              style={{
                backgroundColor: isActive ? `color-mix(in srgb, ${colors.accent} 5%, #0d0d0d)` : colors.bg,
                borderColor: isActive ? colors.accent : `${colors.border}60`,
              }}
            >
              {/* Left: tier info */}
              <div className="flex items-center gap-3">
                {isLocked ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                ) : isActive ? (
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: colors.accent,
                      boxShadow: `0 0 6px ${colors.accent}, 0 0 12px ${colors.accent}60`,
                    }}
                  />
                ) : (
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.accent, opacity: 0.5 }} />
                )}
                <div>
                  <div
                    className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold"
                    style={{ color: isActive ? colors.text : `${colors.text}80` }}
                  >
                    {tier.label}
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#666]">
                    {tier.range}
                  </div>
                </div>
              </div>

              {/* Right: multiplier */}
              <div
                className="font-mono text-xl font-black tabular-nums"
                style={{
                  color: isActive ? colors.text : `${colors.text}60`,
                  textShadow: isActive ? `0 0 12px ${colors.accent}40` : 'none',
                }}
              >
                {tier.multiplier}
              </div>
            </div>
          </div>
        )
      })}

      {/* Current status */}
      {stakedDays > 0 && (
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#888] text-center">
          <span className="text-[#d4f000]">{stakedDays}</span> DAYS STAKED
        </div>
      )}
    </div>
  )
}
