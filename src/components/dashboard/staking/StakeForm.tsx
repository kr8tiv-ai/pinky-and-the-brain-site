'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import gsap from 'gsap'
import BN from 'bn.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { useBrainBalance } from '@/hooks/useBrainBalance'
import { useStakeMutation } from '@/hooks/useStakingMutations'
import { useStakerAccount } from '@/hooks/useStakerAccount'
import { useStakingPool } from '@/hooks/useStakingPool'
import { parseBrainInput, formatBrain } from '@/lib/staking/format'
import { BRAIN_DECIMALS } from '@/lib/staking/constants'

// ── Validation ──────────────────────────────────────────────────────

interface ValidationResult {
  error: string | null
  disabled: boolean
  rawAmount: BN | null
}

function useValidation(
  amount: string,
  balance: BN | undefined,
  poolMinStake: BN | undefined,
  poolPaused: boolean | undefined,
  hasActiveStake: boolean,
): ValidationResult {
  return useMemo(() => {
    // Pool-level gates (checked first regardless of input)
    if (poolPaused) {
      return { error: 'STAKING POOL IS CURRENTLY PAUSED', disabled: true, rawAmount: null }
    }
    if (hasActiveStake) {
      return { error: 'ACTIVE STAKE EXISTS — UNSTAKE FIRST', disabled: true, rawAmount: null }
    }

    // Empty input — disable without error message
    if (amount.trim() === '') {
      return { error: null, disabled: true, rawAmount: null }
    }

    // Parse the input string
    const parsed = parseBrainInput(amount)
    if (!parsed) {
      return { error: 'INVALID AMOUNT', disabled: true, rawAmount: null }
    }

    // Check minimum stake
    if (poolMinStake && parsed.lt(poolMinStake)) {
      return { error: 'BELOW MINIMUM STAKE (100,000 BRAIN)', disabled: true, rawAmount: null }
    }

    // Check balance
    if (balance && parsed.gt(balance)) {
      return { error: 'INSUFFICIENT BRAIN BALANCE', disabled: true, rawAmount: null }
    }

    return { error: null, disabled: false, rawAmount: parsed }
  }, [amount, balance, poolMinStake, poolPaused, hasActiveStake])
}

// ── Helpers ─────────────────────────────────────────────────────────

/** Convert raw BN balance to a human-readable decimal string for the input field. */
function balanceToInputString(raw: BN): string {
  if (raw.isZero()) return '0'
  const divisor = new BN(10).pow(new BN(BRAIN_DECIMALS))
  const whole = raw.div(divisor)
  const frac = raw.mod(divisor)
  if (frac.isZero()) return whole.toString()
  const fracStr = frac.toString().padStart(BRAIN_DECIMALS, '0').replace(/0+$/, '')
  return `${whole}.${fracStr}`
}

// ── Component ───────────────────────────────────────────────────────

export default function StakeForm() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [amount, setAmount] = useState('')

  const { connected } = useWallet()
  const { data: balance } = useBrainBalance()
  const { data: pool } = useStakingPool()
  const { data: staker } = useStakerAccount()
  const stakeMutation = useStakeMutation()

  const hasActiveStake = staker !== null && staker !== undefined
  const poolMinStake = pool?.minStakeAmount as BN | undefined
  const poolPaused = pool?.isPaused

  const { error, disabled, rawAmount } = useValidation(
    amount,
    balance ?? undefined,
    poolMinStake,
    poolPaused,
    hasActiveStake,
  )

  // Button disabled: validation disabled OR wallet not connected OR pending tx
  const buttonDisabled = disabled || !connected || stakeMutation.isPending

  // ── GSAP stagger animation on mount ─────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return
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
        },
      )
    }, containerRef)
    return () => ctx.revert()
  }, [])

  // ── Handlers ──────────────────────────────────────────────────────

  function handleMax() {
    if (balance && !balance.isZero()) {
      setAmount(balanceToInputString(balance))
    }
  }

  function handleStake() {
    if (!rawAmount || buttonDisabled) return
    stakeMutation.mutate({ amount: rawAmount })
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="border border-[#333]/40 rounded-sm bg-[#0d0d0d]/60 p-6">
      {/* Section Header */}
      <div data-wr-reveal className="flex items-center gap-2 mb-5">
        <span className="font-mono text-[10px] text-[#d4f000]/60 tracking-[0.2em] tabular-nums">05</span>
        <div className="w-3 h-px bg-[#d4f000]/30" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#888] font-bold">
          STAKE BRAIN
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#333]/40 to-transparent" />
      </div>

      {/* Balance display */}
      <div data-wr-reveal className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#777] flex items-center gap-1.5">
          <span className="text-[#d4f000]/50 text-[9px]">◆</span>
          WALLET BALANCE
        </span>
        <span className="font-mono text-[12px] tabular-nums text-[#aaa]">
          {balance ? formatBrain(balance) : '—'}{' '}
          <span className="text-[10px] text-[#666]">BRAIN</span>
        </span>
      </div>

      {/* Input row: amount + MAX button */}
      <div data-wr-reveal className="flex gap-2 mb-2">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={poolPaused || hasActiveStake}
            className={`
              w-full bg-[#0a0a0a] border rounded-sm px-4 py-3
              font-mono text-[15px] text-white tabular-nums
              placeholder:text-[#444] outline-none
              transition-colors duration-200
              disabled:opacity-40 disabled:cursor-not-allowed
              [appearance:textfield]
              [&::-webkit-outer-spin-button]:appearance-none
              [&::-webkit-inner-spin-button]:appearance-none
              ${error
                ? 'border-[#ff9e9e]/40 focus:border-[#ff9e9e]/60'
                : 'border-[#333]/50 focus:border-[#d4f000]/50'
              }
            `}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#555] pointer-events-none">
            BRAIN
          </span>
        </div>
        <button
          type="button"
          onClick={handleMax}
          disabled={!balance || balance.isZero() || poolPaused || hasActiveStake}
          className="
            font-mono text-[10px] uppercase tracking-[0.2em] px-4 py-3
            border border-[#d4f000]/20 text-[#d4f000]/70 rounded-sm
            hover:border-[#d4f000]/40 hover:text-[#d4f000] hover:bg-[#d4f000]/[0.04]
            active:bg-[#d4f000]/[0.08]
            transition-all duration-200
            disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[#d4f000]/20 disabled:hover:text-[#d4f000]/70 disabled:hover:bg-transparent
          "
        >
          MAX
        </button>
      </div>

      {/* Validation error */}
      {error && (
        <div data-wr-reveal className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#ff9e9e] mb-3 flex items-center gap-1.5">
          <span className="text-[9px]">⚠</span>
          {error}
        </div>
      )}

      {/* Stake button */}
      <button
        data-wr-reveal
        type="button"
        onClick={handleStake}
        disabled={buttonDisabled}
        className={`
          w-full font-mono text-[12px] uppercase tracking-[0.25em] font-bold
          px-6 py-3.5 rounded-sm
          transition-all duration-300
          ${buttonDisabled
            ? 'bg-[#1a1a1a] border border-[#333]/40 text-[#555] cursor-not-allowed'
            : 'bg-[#d4f000]/10 border border-[#d4f000]/30 text-[#d4f000] hover:bg-[#d4f000]/20 hover:border-[#d4f000]/50 hover:shadow-[0_0_20px_rgba(212,240,0,0.08)] active:bg-[#d4f000]/25'
          }
        `}
      >
        {stakeMutation.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-3 h-3 border border-[#d4f000]/40 border-t-[#d4f000] rounded-full animate-spin" />
            SUBMITTING...
          </span>
        ) : (
          <span>◆ STAKE BRAIN</span>
        )}
      </button>

      {/* Minimum stake note */}
      <div data-wr-reveal className="mt-3 font-mono text-[9px] uppercase tracking-[0.15em] text-[#444] text-center">
        MINIMUM STAKE: 100,000 BRAIN · 7-DAY CLIFF BEFORE REWARDS
      </div>
    </div>
  )
}
