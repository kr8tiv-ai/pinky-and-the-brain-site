'use client'

import { MULTIPLIER_THRESHOLDS } from '@/lib/staking/constants'
import { TierPyramid } from '../visualizations'

/**
 * Multiplier tier display using the TierPyramid visualization.
 * Shows the 3-tier staking multiplier structure: 7d→1x, 30d→2x, 90d→3x.
 */

const PYRAMID_TIERS = [
  { label: 'TIER 1', range: '7-30 DAYS', multiplier: '1x', days: 7 },
  { label: 'TIER 2', range: '30-90 DAYS', multiplier: '2x', days: 30 },
  { label: 'TIER 3', range: '90+ DAYS', multiplier: '3x', days: 90 },
]

interface MultiplierTiersProps {
  stakedDays?: number
}

export default function MultiplierTiers({ stakedDays = 0 }: MultiplierTiersProps) {
  // Determine current tier from staked days
  let currentTierIndex = -1 // pre-cliff
  if (stakedDays >= 90) currentTierIndex = 2
  else if (stakedDays >= 30) currentTierIndex = 1
  else if (stakedDays >= 7) currentTierIndex = 0

  return (
    <TierPyramid
      tiers={PYRAMID_TIERS}
      currentTierIndex={currentTierIndex}
      stakedDays={stakedDays}
    />
  )
}
