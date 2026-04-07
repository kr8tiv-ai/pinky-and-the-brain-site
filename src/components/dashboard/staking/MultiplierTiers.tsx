'use client'

import { MULTIPLIER_THRESHOLDS } from '@/lib/staking/constants'

/**
 * Static multiplier tier reference display.
 * Shows the 3-tier staking multiplier structure: 7d→1x, 30d→2x, 90d→3x.
 * War-room styled with lime accents and monospace typography.
 */

const TIER_LABELS = [
  { label: 'PRE-CLIFF', range: '0–7 DAYS', multiplier: '0x', color: 'text-[#555]', borderColor: 'border-[#333]/30', bgColor: 'bg-[#111]/40' },
  { label: 'TIER 1', range: `7–30 DAYS`, multiplier: '1x', color: 'text-[#bbb]', borderColor: 'border-[#444]/30', bgColor: 'bg-[#0d0d0d]/60' },
  { label: 'TIER 2', range: `30–90 DAYS`, multiplier: '2x', color: 'text-[#d4f000]/80', borderColor: 'border-[#d4f000]/15', bgColor: 'bg-[#d4f000]/[0.02]' },
  { label: 'TIER 3', range: `90+ DAYS`, multiplier: '3x', color: 'text-[#d4f000]', borderColor: 'border-[#d4f000]/30', bgColor: 'bg-[#d4f000]/[0.04]' },
] as const

export default function MultiplierTiers() {
  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="font-mono text-[10px] text-[#d4f000]/60 tracking-[0.2em] tabular-nums">03</span>
        <div className="w-3 h-px bg-[#d4f000]/30" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#888] font-bold">
          MULTIPLIER TIERS
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#333]/40 to-transparent" />
      </div>

      {/* Tier cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TIER_LABELS.map((tier, i) => (
          <div
            key={tier.label}
            className={`relative border ${tier.borderColor} ${tier.bgColor} rounded-sm p-3 transition-all duration-300 hover:border-[#d4f000]/25 group`}
          >
            {/* Tier label */}
            <div className={`font-mono text-[9px] uppercase tracking-[0.2em] ${tier.color} mb-2 font-bold`}>
              {tier.label}
            </div>

            {/* Multiplier value */}
            <div className={`font-mono text-[18px] sm:text-[22px] font-black ${tier.color} tabular-nums leading-none mb-1.5`}>
              {tier.multiplier}
            </div>

            {/* Duration range */}
            <div className="font-mono text-[9px] text-[#666] uppercase tracking-[0.15em]">
              {tier.range}
            </div>

            {/* Subtle progress bar visual */}
            <div className="mt-2 h-[2px] bg-[#222] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#d4f000]/30 to-[#d4f000]/60 transition-all duration-500"
                style={{ width: `${((i) / 3) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
