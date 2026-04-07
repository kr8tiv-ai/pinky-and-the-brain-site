/**
 * Formatting utilities for staking amounts, multiplier tiers, and durations.
 */

import BN from 'bn.js'
import {
  BRAIN_DECIMALS,
  SOL_DECIMALS,
  MULTIPLIER_THRESHOLDS,
} from './constants'

// ── Amount formatters ───────────────────────────────────────────────

/**
 * Format a raw BRAIN amount (6 decimals) into a human-readable string
 * with comma separators. Trims trailing zeros but keeps at least 2 decimals.
 * e.g. 1234567890000 → '1,234,567.89'
 */
export function formatBrain(rawAmount: BN): string {
  return formatTokenAmount(rawAmount, BRAIN_DECIMALS, 2)
}

/**
 * Format lamports into SOL with 4 display decimals and comma separators.
 * e.g. 1500000000 → '1.5000'
 */
export function formatSol(lamports: BN): string {
  return formatTokenAmount(lamports, SOL_DECIMALS, 4)
}

/**
 * Internal: format a raw token amount given its decimals and min display decimals.
 */
function formatTokenAmount(
  raw: BN,
  decimals: number,
  minDisplayDecimals: number
): string {
  if (raw.isZero()) return '0.' + '0'.repeat(minDisplayDecimals)

  const isNeg = raw.isNeg()
  const abs = isNeg ? raw.abs() : raw

  const divisor = new BN(10).pow(new BN(decimals))
  const wholePart = abs.div(divisor)
  const fracPart = abs.mod(divisor)

  // Pad fractional part to full decimal width
  const fracStr = fracPart.toString().padStart(decimals, '0')

  // Trim trailing zeros but keep at least minDisplayDecimals
  let trimmed = fracStr
  while (trimmed.length > minDisplayDecimals && trimmed.endsWith('0')) {
    trimmed = trimmed.slice(0, -1)
  }

  const wholeStr = addCommas(wholePart.toString())
  const sign = isNeg ? '-' : ''
  return `${sign}${wholeStr}.${trimmed}`
}

/** Add comma separators to a numeric string. */
function addCommas(numStr: string): string {
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// ── Input parser ────────────────────────────────────────────────────

/**
 * Parse a user-entered BRAIN amount string into a BN (raw 6-decimal value).
 * Returns null for empty, non-numeric, negative, or zero input.
 *
 * Examples:
 *   '500000.123456' → BN('500000123456')
 *   '500000'        → BN('500000000000')
 *   '0.5'           → BN('500000')
 *   ''              → null
 *   '-1'            → null
 *   '0'             → null
 */
export function parseBrainInput(input: string): BN | null {
  // Remove commas and trim whitespace
  const cleaned = input.replace(/,/g, '').trim()

  if (cleaned === '') return null

  // Reject non-numeric strings (allow digits, optional decimal point, optional leading minus)
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null

  const parts = cleaned.split('.')
  const whole = parts[0]
  let frac = parts[1] ?? ''

  // Pad or truncate fractional part to exactly BRAIN_DECIMALS (6) digits
  if (frac.length > BRAIN_DECIMALS) {
    frac = frac.slice(0, BRAIN_DECIMALS)
  } else {
    frac = frac.padEnd(BRAIN_DECIMALS, '0')
  }

  const raw = whole + frac

  // Create BN from the concatenated integer string
  const result = new BN(raw)

  // Reject zero amounts
  if (result.isZero()) return null

  return result
}

// ── Multiplier helpers ──────────────────────────────────────────────

/**
 * Human-readable label for a multiplier tier.
 * 0 → '0x (pre-cliff)', 1 → '1x', 2 → '2x', 3 → '3x'
 */
export function multiplierLabel(tier: number): string {
  if (tier === 0) return '0x (pre-cliff)'
  return `${tier}x`
}

export interface MultiplierProgress {
  /** Current multiplier tier (0–3) */
  current: number
  /** Next multiplier tier, or null if at max (3x) */
  next: number | null
  /** Progress percentage toward next tier (0–100), 100 if at max */
  progressPct: number
  /** Human-readable time remaining to next tier, '' if at max */
  timeRemaining: string
}

/**
 * Calculate multiplier progress from a stake timestamp.
 * Uses the current time to determine tier and progress to the next tier.
 */
export function multiplierProgress(
  stakeTimestamp: number,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): MultiplierProgress {
  const elapsed = nowSeconds - stakeTimestamp

  if (elapsed < 0) {
    // Timestamp in the future — shouldn't happen, but handle gracefully
    return { current: 0, next: 1, progressPct: 0, timeRemaining: formatDuration(MULTIPLIER_THRESHOLDS[0].seconds) }
  }

  // Determine current tier
  let currentTier = 0
  let currentThresholdIdx = -1
  for (let i = MULTIPLIER_THRESHOLDS.length - 1; i >= 0; i--) {
    if (elapsed >= MULTIPLIER_THRESHOLDS[i].seconds) {
      currentTier = MULTIPLIER_THRESHOLDS[i].multiplier
      currentThresholdIdx = i
      break
    }
  }

  // At max tier (3x)
  if (currentThresholdIdx === MULTIPLIER_THRESHOLDS.length - 1) {
    return { current: currentTier, next: null, progressPct: 100, timeRemaining: '' }
  }

  // Calculate progress to next tier
  const nextThreshold = MULTIPLIER_THRESHOLDS[currentThresholdIdx + 1]
  const prevSeconds = currentThresholdIdx >= 0
    ? MULTIPLIER_THRESHOLDS[currentThresholdIdx].seconds
    : 0
  const rangeSeconds = nextThreshold.seconds - prevSeconds
  const elapsedInRange = elapsed - prevSeconds
  const progressPct = Math.min(100, Math.max(0, (elapsedInRange / rangeSeconds) * 100))
  const remaining = nextThreshold.seconds - elapsed

  return {
    current: currentTier,
    next: nextThreshold.multiplier,
    progressPct: Math.round(progressPct * 100) / 100,
    timeRemaining: formatDuration(remaining),
  }
}

// ── Duration formatter ──────────────────────────────────────────────

/**
 * Format a duration in seconds to a human-readable string.
 * e.g. 302400 → '3d 12h', 9000 → '2h 30m', 30 → '< 1m'
 */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '< 1m'

  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) {
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }
  if (minutes > 0) {
    return `${minutes}m`
  }
  return '< 1m'
}
