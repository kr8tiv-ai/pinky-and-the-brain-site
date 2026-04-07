import { describe, it, expect } from 'vitest'
import BN from 'bn.js'
import {
  formatBrain,
  formatSol,
  multiplierLabel,
  multiplierProgress,
  formatDuration,
  parseBrainInput,
} from '../src/lib/staking/format'

describe('formatBrain', () => {
  it('formats zero', () => {
    expect(formatBrain(new BN(0))).toBe('0.00')
  })

  it('formats whole BRAIN amounts', () => {
    // 1,000,000 raw = 1.00 BRAIN (6 decimals)
    expect(formatBrain(new BN(1_000_000))).toBe('1.00')
  })

  it('formats fractional amounts', () => {
    // 1,234,567,890,000 raw = 1,234,567.89 BRAIN
    expect(formatBrain(new BN('1234567890000'))).toBe('1,234,567.89')
  })

  it('formats sub-one amounts', () => {
    // 500,000 raw = 0.50 BRAIN
    expect(formatBrain(new BN(500_000))).toBe('0.50')
  })

  it('formats large amounts with commas', () => {
    // 1,000,000,000,000 raw = 1,000,000.00 BRAIN
    expect(formatBrain(new BN('1000000000000'))).toBe('1,000,000.00')
  })

  it('preserves significant decimals', () => {
    // 1,234,567 raw = 1.234567 BRAIN
    expect(formatBrain(new BN(1_234_567))).toBe('1.234567')
  })

  it('trims trailing zeros beyond 2 decimals', () => {
    // 1,500,000 raw = 1.50 BRAIN (trims to 1.50, not 1.500000)
    expect(formatBrain(new BN(1_500_000))).toBe('1.50')
  })
})

describe('formatSol', () => {
  it('formats zero', () => {
    expect(formatSol(new BN(0))).toBe('0.0000')
  })

  it('formats 1 SOL', () => {
    expect(formatSol(new BN(1_000_000_000))).toBe('1.0000')
  })

  it('formats fractional SOL', () => {
    // 1.5 SOL = 1,500,000,000 lamports
    expect(formatSol(new BN(1_500_000_000))).toBe('1.5000')
  })

  it('formats large SOL amounts', () => {
    // 1,234.5678 SOL = 1,234,567,800,000 lamports
    expect(formatSol(new BN('1234567800000'))).toBe('1,234.5678')
  })

  it('formats small amounts', () => {
    // 0.001 SOL = 1,000,000 lamports
    expect(formatSol(new BN(1_000_000))).toBe('0.0010')
  })
})

describe('multiplierLabel', () => {
  it('returns pre-cliff for tier 0', () => {
    expect(multiplierLabel(0)).toBe('0x (pre-cliff)')
  })

  it('returns 1x for tier 1', () => {
    expect(multiplierLabel(1)).toBe('1x')
  })

  it('returns 2x for tier 2', () => {
    expect(multiplierLabel(2)).toBe('2x')
  })

  it('returns 3x for tier 3', () => {
    expect(multiplierLabel(3)).toBe('3x')
  })
})

describe('multiplierProgress', () => {
  const SECONDS_PER_DAY = 86400
  const NOW = 1700000000 // fixed timestamp for deterministic tests

  it('returns 0x pre-cliff (just staked)', () => {
    const result = multiplierProgress(NOW, NOW)
    expect(result.current).toBe(0)
    expect(result.next).toBe(1)
    expect(result.progressPct).toBe(0)
    expect(result.timeRemaining).toBeTruthy()
  })

  it('returns 0x mid-cliff with progress', () => {
    // 3.5 days into 7-day cliff
    const stakeTime = NOW - (3.5 * SECONDS_PER_DAY)
    const result = multiplierProgress(stakeTime, NOW)
    expect(result.current).toBe(0)
    expect(result.next).toBe(1)
    expect(result.progressPct).toBeCloseTo(50, 0)
    expect(result.timeRemaining).toContain('3d')
  })

  it('returns 1x after 7 days', () => {
    const stakeTime = NOW - (8 * SECONDS_PER_DAY)
    const result = multiplierProgress(stakeTime, NOW)
    expect(result.current).toBe(1)
    expect(result.next).toBe(2)
  })

  it('returns 2x after 30 days', () => {
    const stakeTime = NOW - (35 * SECONDS_PER_DAY)
    const result = multiplierProgress(stakeTime, NOW)
    expect(result.current).toBe(2)
    expect(result.next).toBe(3)
  })

  it('returns 3x (max) after 90 days', () => {
    const stakeTime = NOW - (100 * SECONDS_PER_DAY)
    const result = multiplierProgress(stakeTime, NOW)
    expect(result.current).toBe(3)
    expect(result.next).toBeNull()
    expect(result.progressPct).toBe(100)
    expect(result.timeRemaining).toBe('')
  })

  it('handles progress between tier 1 and tier 2', () => {
    // 18.5 days in (halfway between 7d and 30d)
    const stakeTime = NOW - (18.5 * SECONDS_PER_DAY)
    const result = multiplierProgress(stakeTime, NOW)
    expect(result.current).toBe(1)
    expect(result.next).toBe(2)
    expect(result.progressPct).toBeCloseTo(50, 0)
  })

  it('handles future timestamp gracefully', () => {
    const stakeTime = NOW + 1000
    const result = multiplierProgress(stakeTime, NOW)
    expect(result.current).toBe(0)
    expect(result.next).toBe(1)
    expect(result.progressPct).toBe(0)
  })
})

describe('formatDuration', () => {
  it('formats days and hours', () => {
    expect(formatDuration(3 * 86400 + 14 * 3600)).toBe('3d 14h')
  })

  it('formats hours and minutes', () => {
    expect(formatDuration(2 * 3600 + 30 * 60)).toBe('2h 30m')
  })

  it('formats sub-minute as < 1m', () => {
    expect(formatDuration(30)).toBe('< 1m')
  })

  it('formats zero as < 1m', () => {
    expect(formatDuration(0)).toBe('< 1m')
  })

  it('formats negative as < 1m', () => {
    expect(formatDuration(-100)).toBe('< 1m')
  })

  it('formats exact days', () => {
    expect(formatDuration(7 * 86400)).toBe('7d')
  })

  it('formats exact hours', () => {
    expect(formatDuration(5 * 3600)).toBe('5h')
  })

  it('formats minutes only', () => {
    expect(formatDuration(45 * 60)).toBe('45m')
  })
})

describe('parseBrainInput', () => {
  it('parses whole number', () => {
    const result = parseBrainInput('500000')
    expect(result).not.toBeNull()
    expect(result!.toString()).toBe('500000000000')
  })

  it('parses decimal number', () => {
    const result = parseBrainInput('500000.123456')
    expect(result).not.toBeNull()
    expect(result!.toString()).toBe('500000123456')
  })

  it('parses sub-one amount', () => {
    const result = parseBrainInput('0.5')
    expect(result).not.toBeNull()
    expect(result!.toString()).toBe('500000')
  })

  it('handles commas in input', () => {
    const result = parseBrainInput('1,000,000')
    expect(result).not.toBeNull()
    expect(result!.toString()).toBe('1000000000000')
  })

  it('handles commas with decimals', () => {
    const result = parseBrainInput('1,234,567.89')
    expect(result).not.toBeNull()
    expect(result!.toString()).toBe('1234567890000')
  })

  it('pads trailing zeros to 6 decimals', () => {
    const result = parseBrainInput('1.5')
    expect(result).not.toBeNull()
    expect(result!.toString()).toBe('1500000')
  })

  it('returns null for empty string', () => {
    expect(parseBrainInput('')).toBeNull()
  })

  it('returns null for whitespace-only', () => {
    expect(parseBrainInput('   ')).toBeNull()
  })

  it('returns null for non-numeric', () => {
    expect(parseBrainInput('abc')).toBeNull()
  })

  it('returns null for mixed alphanumeric', () => {
    expect(parseBrainInput('100abc')).toBeNull()
  })

  it('returns null for zero', () => {
    expect(parseBrainInput('0')).toBeNull()
  })

  it('returns null for 0.000000', () => {
    expect(parseBrainInput('0.000000')).toBeNull()
  })

  it('returns null for negative number', () => {
    expect(parseBrainInput('-100')).toBeNull()
  })

  it('handles very large amounts', () => {
    const result = parseBrainInput('999999999999')
    expect(result).not.toBeNull()
    expect(result!.toString()).toBe('999999999999000000')
  })

  it('preserves max 6 decimal precision', () => {
    const result = parseBrainInput('1.123456')
    expect(result).not.toBeNull()
    expect(result!.toString()).toBe('1123456')
  })

  it('truncates beyond 6 decimals', () => {
    const result = parseBrainInput('1.1234567890')
    expect(result).not.toBeNull()
    // Should truncate to 6 decimal places: 1.123456
    expect(result!.toString()).toBe('1123456')
  })

  it('trims leading/trailing whitespace', () => {
    const result = parseBrainInput('  100  ')
    expect(result).not.toBeNull()
    expect(result!.toString()).toBe('100000000')
  })

  it('handles 1 BRAIN (1.000000)', () => {
    const result = parseBrainInput('1')
    expect(result).not.toBeNull()
    expect(result!.toString()).toBe('1000000')
  })
})
