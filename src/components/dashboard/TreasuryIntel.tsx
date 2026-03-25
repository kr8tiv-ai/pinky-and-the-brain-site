'use client'

import { useState, useRef, useEffect, useCallback, type MouseEvent as ReactMouseEvent } from 'react'
import { format, fromUnixTime } from 'date-fns'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { TooltipContentProps, TooltipValueType } from 'recharts'
import gsap from 'gsap'
import { useTreasury } from '@/hooks/useTreasury'
import { TREASURY_HOLDINGS } from '@/lib/investments.config'
import type { TreasuryResponse } from '@/lib/api/types'

// ─── Utility formatters ───────────────────────────────────────────────────────

function formatUsd(n: number): string {
  if (n < 0.01) return `$${n.toFixed(6)}`
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatSol(n: number): string {
  return `${n.toFixed(4)} ◎`
}

function formatGainLoss(pct: number | undefined): { text: string; colorClass: string } {
  if (pct === undefined) return { text: '—', colorClass: 'text-[#666]' }
  const sign = pct >= 0 ? '+' : ''
  return { text: `${sign}${pct.toFixed(2)}%`, colorClass: pct >= 0 ? 'text-[#d4f000]' : 'text-[#ff9e9e]' }
}

// ─── GSAP Stagger Reveal Hook ─────────────────────────────────────────────────

function useStaggerReveal(containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!containerRef.current) return
    const cards = containerRef.current.querySelectorAll('[data-wr-reveal]')
    if (!cards.length) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { y: 30, opacity: 0, scale: 0.95, rotationX: 8, filter: 'blur(4px)', transformPerspective: 800 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotationX: 0,
          filter: 'blur(0px)',
          duration: 0.6,
          ease: 'power3.out',
          stagger: { amount: 0.5, from: 'start' },
          delay: 0.2,
        }
      )
    }, containerRef)
    return () => ctx.revert()
  }, [containerRef])
}

// ─── Magnetic Hover Hook ─────────────────────────────────────────────────────

function useMagneticHover(ref: React.RefObject<HTMLElement | null>, strength = 0.3) {
  const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const normalX = x / (rect.width / 2)
    const normalY = y / (rect.height / 2)
    // Set CSS custom props for spotlight
    ref.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    ref.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
    gsap.to(ref.current, {
      x: x * strength,
      y: y * strength,
      rotationY: normalX * 4,
      rotationX: -normalY * 4,
      duration: 0.4,
      ease: 'power2.out',
      transformPerspective: 800,
    })
  }, [ref, strength])

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return
    gsap.to(ref.current, {
      x: 0,
      y: 0,
      rotationY: 0,
      rotationX: 0,
      duration: 0.7,
      ease: 'elastic.out(1, 0.3)',
    })
  }, [ref])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.addEventListener('mousemove', handleMouseMove)
    el.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      el.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [ref, handleMouseMove, handleMouseLeave])
}

// ─── Chart utilities ──────────────────────────────────────────────────────────

interface ChartPoint { label: string; valueUsd: number }

function buildChartData(holdings: TreasuryResponse['holdings']): ChartPoint[] {
  const withDates = holdings
    .filter(h => h.purchaseDate && h.costBasisUsd !== undefined)
    .sort((a, b) => (a.purchaseDate ?? 0) - (b.purchaseDate ?? 0))

  if (withDates.length === 0) return []

  let cumulative = 0
  const points: ChartPoint[] = withDates.map(h => {
    cumulative += h.costBasisUsd ?? 0
    return { label: format(fromUnixTime(h.purchaseDate!), 'MMM dd'), valueUsd: cumulative }
  })

  const totalCurrent = holdings.reduce((s, h) => s + h.currentValueUsd, 0)
  points.push({ label: '● NOW', valueUsd: totalCurrent })
  return points
}

// ─── Custom Chart Tooltip ─────────────────────────────────────────────────────

function CustomChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  const rawValue = (payload[0] as { value?: TooltipValueType }).value
  const numericValue = typeof rawValue === 'number' ? rawValue : 0
  return (
    <div className="wr-tooltip-enhanced wr-tooltip-caret wr-tooltip-entrance px-5 py-4 font-mono text-xs">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-1.5 h-1.5 bg-[#d4f000] rounded-full" style={{ boxShadow: '0 0 6px #d4f000' }} />
        <span className="text-[#666] text-[8px] uppercase tracking-[0.25em] font-black">{label}</span>
      </div>
      <div className="text-[#d4f000] font-black text-lg tabular-nums wr-gradient-text-lime leading-tight">{formatUsd(numericValue)}</div>
      <div className="mt-1.5 font-mono text-[7px] text-[#333]/60 uppercase tracking-[0.2em]">PORTFOLIO VALUE</div>
    </div>
  )
}

// ─── Treasury Value Chart ─────────────────────────────────────────────────────

function TreasuryValueChart({
  holdings,
  isLoading,
}: {
  holdings: TreasuryResponse['holdings']
  isLoading: boolean
}) {
  const chartData = buildChartData(holdings)

  return (
    <div className="px-5 lg:px-8 py-6 relative">
      {/* Subtle glow behind chart */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_60%,rgba(212,240,0,0.015),transparent_70%)]" />

      <div className="relative font-mono text-[9px] uppercase tracking-[0.25em] text-[#666] font-bold mb-5 flex items-center gap-3 wr-sub-header">
        <span className="text-[#d4f000]/30 text-[6px] wr-sub-diamond">◆</span>
        <span>TREASURY VALUE OVER TIME</span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#333]/30 to-transparent" />
        <span className="text-[#333]">CUMULATIVE</span>
      </div>
      {isLoading ? (
        <div className="h-[240px] flex items-center justify-center">
          <div className="wr-skeleton h-[200px] w-full rounded" />
        </div>
      ) : chartData.length < 2 ? (
        <div className="h-[240px] flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border border-[#333]/30 flex items-center justify-center wr-float wr-empty-ring hover:border-[#d4f000]/20 transition-colors duration-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#333]">
              <path d="M3 3v18h18" />
              <path d="M7 16l4-4 4 4 5-5" />
            </svg>
          </div>
          <span className="text-[#333] font-mono text-[10px] tracking-[0.2em]">INSUFFICIENT DATA POINTS</span>
        </div>
      ) : (
        <div className="h-[260px] relative border border-[#333]/10 bg-[#0a0a0a]/50 p-3 rounded wr-chart-frame wr-chart-entrance">
          {/* Animated corner brackets */}
          <div className="wr-chart-corner wr-chart-corner--tl" />
          <div className="wr-chart-corner wr-chart-corner--tr" />
          <div className="wr-chart-corner wr-chart-corner--bl" />
          <div className="wr-chart-corner wr-chart-corner--br" />
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 6, left: 0, bottom: 2 }}>
              <defs>
                <linearGradient id="treasuryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4f000" stopOpacity={0.3} />
                  <stop offset="25%" stopColor="#d4f000" stopOpacity={0.12} />
                  <stop offset="60%" stopColor="#d4f000" stopOpacity={0.04} />
                  <stop offset="100%" stopColor="#d4f000" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="treasuryStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#d4f000" stopOpacity={0.25} />
                  <stop offset="30%" stopColor="#d4f000" stopOpacity={0.75} />
                  <stop offset="60%" stopColor="#e4ff57" stopOpacity={1} />
                  <stop offset="100%" stopColor="#d4f000" stopOpacity={0.6} />
                </linearGradient>
                <filter id="chartGlow">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="4 8" stroke="rgba(51,51,51,0.12)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#555', fontSize: 8, fontFamily: 'var(--font-mono)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#555', fontSize: 8, fontFamily: 'var(--font-mono)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`}
                width={42}
              />
              <Tooltip content={(props) => <CustomChartTooltip {...(props as TooltipContentProps)} />} cursor={{ stroke: 'rgba(212, 240, 0, 0.15)', strokeDasharray: '2 4', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="valueUsd"
                stroke="url(#treasuryStroke)"
                strokeWidth={1.5}
                fill="url(#treasuryGradient)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: '#d4f000',
                  stroke: '#0a0a0a',
                  strokeWidth: 2,
                  style: { filter: 'drop-shadow(0 0 6px rgba(212, 240, 0, 0.5)) drop-shadow(0 0 12px rgba(212, 240, 0, 0.2))' },
                }}
                style={{ filter: 'url(#chartGlow)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

// ─── Summary Stat Cell ───────────────────────────────────────────────────────

function SummaryCell({
  label,
  children,
  isLoading,
  isError,
}: {
  label: string
  children: React.ReactNode
  isLoading: boolean
  isError: boolean
}) {
  const valueRef = useRef<HTMLDivElement>(null)
  const hasFlashed = useRef(false)

  // Flash animation when value first loads
  useEffect(() => {
    if (isLoading || isError || hasFlashed.current || !valueRef.current) return
    hasFlashed.current = true
    gsap.fromTo(
      valueRef.current,
      { color: '#d4f000', textShadow: '0 0 12px rgba(212, 240, 0, 0.5)' },
      { color: '#ffffff', textShadow: '0 0 0px transparent', duration: 1.2, ease: 'power2.out' }
    )
  }, [isLoading, isError])

  return (
    <div className="px-5 lg:px-6 py-5 group/cell relative transition-colors duration-300 hover:bg-white/[0.015] wr-stat-scale">
      {/* Hover accent top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[#d4f000]/0 group-hover/cell:bg-[#d4f000]/10 transition-colors duration-300" />
      {/* Hover accent bottom gradient */}
      <div className="absolute bottom-0 left-[5%] right-[5%] h-px bg-[#d4f000]/0 group-hover/cell:bg-[#d4f000]/[0.06] transition-colors duration-500" />
      <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#555] mb-2 font-bold group-hover/cell:text-[#888] transition-colors flex items-center gap-1.5">
        <span className="text-[#d4f000]/20 text-[5px]" aria-hidden="true">◆</span>
        {label}
      </div>
      <div ref={valueRef} className="font-mono text-xl lg:text-2xl font-black text-white tabular-nums leading-none">
        {isLoading ? (
          <div className="wr-skeleton h-6 w-28" />
        ) : isError ? (
          <span className="text-[#ff9e9e]">&mdash;</span>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

// ─── Loading Card ─────────────────────────────────────────────────────────────

function LoadingCard({ index = 0 }: { index?: number }) {
  return (
    <div className="relative p-[1px] overflow-hidden rounded-sm">
      {/* Subtle scanning border */}
      <div
        className="absolute inset-[-100%] animate-spin opacity-10 pointer-events-none"
        style={{
          background: 'conic-gradient(from 0deg, transparent 80%, #333 95%, transparent 100%)',
          animationDuration: '5s',
          animationDelay: `${index * 0.3}s`,
        }}
      />
      <div className="relative bg-[#0d0d0d] p-5 border border-[#333]/5" style={{ boxShadow: 'inset 0 0 40px rgba(51, 51, 51, 0.04)' }}>
        {/* Accent bar */}
        <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-[#333]/40 via-[#333]/20 to-transparent" />
        <div className="pl-2">
          <div className="flex justify-between items-start mb-4">
            <div className="wr-skeleton-diagonal h-4 w-24" style={{ animationDelay: `${index * 150}ms` }} />
            <div className="wr-skeleton-diagonal h-4 w-12" style={{ animationDelay: `${index * 150 + 100}ms` }} />
          </div>
          <div className="wr-skeleton-diagonal h-3 w-32 mb-4" style={{ animationDelay: `${index * 150 + 200}ms` }} />
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="wr-skeleton h-2 w-16 mb-1.5" style={{ animationDelay: `${index * 150 + 300 + i * 80}ms` }} />
                <div className="wr-skeleton h-3 w-20" style={{ animationDelay: `${index * 150 + 340 + i * 80}ms` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Classified Card ──────────────────────────────────────────────────────────

function ClassifiedCard({ mint }: { mint: string }) {
  return (
    <div data-wr-reveal className="relative p-[1px] overflow-hidden group/classified wr-card-lift rounded-sm">
      {/* Conic gradient spinner — pulsing red/dark */}
      <div
        className="absolute inset-[-100%] animate-spin opacity-[0.08] group-hover/classified:opacity-40 transition-opacity duration-700 pointer-events-none"
        style={{
          background: 'conic-gradient(from 0deg, transparent 60%, #ff9e9e 80%, #333 90%, transparent 100%)',
          animationDuration: '6s',
        }}
      />

      {/* Inner card */}
      <div className="relative h-full w-full bg-[#0d0d0d] p-5 overflow-hidden z-10">
        {/* Diagonal line pattern */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(255,158,158,0.1) 8px, rgba(255,158,158,0.1) 9px)',
          }}
        />

        {/* Redaction bars — animated on hover */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {[15, 35, 55, 75].map((top, i) => (
            <div
              key={i}
              className="absolute left-2 right-2 h-[5px] bg-[#111]/90 group-hover/classified:translate-x-[-110%] transition-transform duration-700"
              style={{
                top: `${top}%`,
                transitionDelay: `${i * 100}ms`,
                transitionTimingFunction: 'cubic-bezier(0.7, 0, 0.3, 1)',
              }}
            />
          ))}
        </div>

        <div className="relative">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#444] mb-3 font-bold flex items-center gap-2">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#ff9e9e]/30">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            ASSET #{mint.slice(0, 8)}
          </div>
          <div className="text-xl font-black text-[#1a1a1a] tracking-[0.15em] select-none flicker mb-1 leading-none group-hover/classified:text-[#222] transition-colors duration-700">
            ████████████████
          </div>
          {/* Peek reveal — faded mint on hover */}
          <div className="font-mono text-[8px] text-[#333]/40 mb-4 truncate wr-peek-reveal">
            {mint}
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="wr-tag wr-tag-glow border-[#ff9e9e]/20 text-[#ff9e9e]/40">
              CLASSIFIED
            </div>
            <div className="wr-tag wr-tag-glow border-[#333]/30 text-[#333]">
              REDACTED
            </div>
          </div>
          <div className="pt-3 border-t border-[#333]/20">
            <a
              href={`https://solscan.io/token/${mint}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[9px] text-[#d4f000]/50 hover:text-[#d4f000] transition-all duration-200 wr-link-hover flex items-center gap-1 group/link"
            >
              SOLSCAN
              <span className="text-[7px] opacity-50 group-hover/link:opacity-100 transition-opacity">↗</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Holding Card ─────────────────────────────────────────────────────────────

type HoldingData = TreasuryResponse['holdings'][number]

function HoldingCard({
  holding,
  solPriceUsd,
}: {
  holding: HoldingData
  solPriceUsd: number
}) {
  const [copied, setCopied] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  useMagneticHover(cardRef, 0.15)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(holding.mint)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [holding.mint])

  const gainLoss = formatGainLoss(holding.gainLossPct)
  const purchasePriceSol =
    holding.purchasePriceUsd !== undefined && solPriceUsd > 0
      ? holding.purchasePriceUsd / solPriceUsd
      : undefined
  const purchaseDateStr = holding.purchaseDate
    ? format(fromUnixTime(holding.purchaseDate), 'yyyy-MM-dd')
    : 'UNKNOWN'

  return (
    <div ref={cardRef} data-wr-reveal className="relative p-[1px] overflow-hidden group/card wr-brackets wr-shine wr-card-lift wr-card-spotlight rounded-sm">
      {/* Mouse-tracking spotlight */}
      <div className="wr-spotlight-layer bg-[radial-gradient(350px_circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(212,240,0,0.035),transparent_60%)]" />
      {/* Conic gradient spinner — like Tokenomics cards */}
      <div
        className="absolute inset-[-100%] animate-spin opacity-0 group-hover/card:opacity-60 transition-opacity duration-700 pointer-events-none"
        style={{
          background: 'conic-gradient(from 0deg, transparent 60%, #e4ff57 80%, #ffadad 100%)',
          animationDuration: '7s',
        }}
      />

      {/* Inner card */}
      <div className="relative h-full w-full bg-[#0d0d0d] p-5 overflow-hidden z-10 wr-border-shimmer wr-card-inner-glow wr-card-top-line">
      {/* Accent border left — color reflects position status */}
      <div className="absolute top-0 left-0 w-[2px] md:w-[3px] h-full bg-gradient-to-b to-transparent" style={{
        backgroundImage: holding.gainLossPct !== undefined && holding.gainLossPct < -5
          ? 'linear-gradient(to bottom, #ff9e9e, rgba(255, 158, 158, 0.5), transparent)'
          : 'linear-gradient(to bottom, #d4f000, rgba(212, 240, 0, 0.5), transparent)',
      }} />

      {/* Header: token name + gain/loss */}
      <div className="flex justify-between items-start mb-3.5 pl-2">
        <div className="flex items-center gap-2.5">
          {/* Monogram avatar */}
          <div className="w-8 h-8 flex items-center justify-center font-black text-xs font-mono shrink-0 wr-monogram">
            <span className="wr-gradient-text-lime">{(holding.symbol || holding.name).charAt(0)}</span>
          </div>
          <div>
            <div className="text-[#d4f000] font-black text-sm uppercase tracking-wider font-mono transition-all duration-300 group-hover/card:text-shadow-[0_0_12px_rgba(212,240,0,0.3)]">
              {holding.name}
            </div>
            {holding.symbol && holding.symbol !== holding.name && (
              <span className="wr-symbol-badge mt-1 inline-block">${holding.symbol}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-[10px] font-black tabular-nums font-mono px-2 py-0.5 rounded-sm flex items-center gap-1.5 transition-all duration-300 group-hover/card:shadow-sm ${gainLoss.colorClass} ${
            !holding.gainLossPct ? '' : holding.gainLossPct >= 0 ? 'bg-[#d4f000]/[0.06] group-hover/card:bg-[#d4f000]/[0.1]' : 'bg-[#ff9e9e]/[0.06] group-hover/card:bg-[#ff9e9e]/[0.1]'
          }`}>
            {/* Mini spark bars */}
            {holding.gainLossPct !== undefined && (
              <span className="flex items-end gap-[1px]">
                {[2, 5, holding.gainLossPct >= 0 ? 8 : 2].map((h, i) => (
                  <span key={i} className={`w-[2px] rounded-sm ${holding.gainLossPct! >= 0 ? 'bg-[#d4f000]/40' : 'bg-[#ff9e9e]/40'}`} style={{ height: `${h}px` }} />
                ))}
              </span>
            )}
            {gainLoss.text}
          </span>
          {holding.gainLossPct !== undefined && (
            <span className={`text-[7px] font-bold font-mono uppercase tracking-[0.15em] transition-opacity duration-300 ${
              holding.gainLossPct >= 0 ? 'text-[#d4f000]/30 group-hover/card:text-[#d4f000]/50' : 'text-[#ff9e9e]/30 group-hover/card:text-[#ff9e9e]/50'
            }`}>
              {holding.gainLossPct > 5 ? '▲ RISING' : holding.gainLossPct < -5 ? '▼ DECLINING' : '● STABLE'}
            </span>
          )}
        </div>
      </div>

      {/* Contract address */}
      <div className="flex items-center gap-2 mb-4 pl-2">
        <button
          onClick={handleCopy}
          className="font-mono text-[10px] text-[#444] hover:text-[#d4f000] transition-all duration-200 flex items-center gap-1.5 group/copy active:scale-95"
          title="Copy full address"
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" className="opacity-40 group-hover/copy:opacity-100 group-hover/copy:drop-shadow-[0_0_3px_rgba(212,240,0,0.2)] transition-all duration-200">
            <path d="M4 4V1h11v11h-3v3H1V4h3zm1-1V1.5a.5.5 0 01.5-.5h9a.5.5 0 01.5.5v9a.5.5 0 01-.5.5H13V4.5a.5.5 0 00-.5-.5H5z" />
            <path d="M1.5 5a.5.5 0 00-.5.5v9a.5.5 0 00.5.5h9a.5.5 0 00.5-.5v-9a.5.5 0 00-.5-.5h-9z" />
          </svg>
          {copied
            ? <span className="text-[#d4f000] font-bold" style={{ textShadow: '0 0 6px rgba(212, 240, 0, 0.25)' }}>COPIED ✓</span>
            : `${holding.mint.slice(0, 4)}…${holding.mint.slice(-4)}`}
        </button>
      </div>

      {/* Data grid */}
      <div className="grid grid-cols-2 gap-x-3 md:gap-x-4 gap-y-0 text-[9px] md:text-[10px] mb-4 pl-2">
        {[
          { label: 'AMOUNT', value: holding.uiAmount.toLocaleString(undefined, { maximumFractionDigits: 4 }), highlight: false },
          { label: 'VALUE (USD)', value: formatUsd(holding.currentValueUsd), highlight: true },
          { label: 'VALUE (SOL)', value: formatSol(holding.currentValueSol), highlight: false },
          { label: 'ACQUIRED', value: purchaseDateStr, highlight: false },
          { label: 'COST (USD)', value: holding.purchasePriceUsd !== undefined ? formatUsd(holding.purchasePriceUsd) : '—', highlight: false },
          { label: '~PRICE (SOL)', value: purchasePriceSol !== undefined ? formatSol(purchasePriceSol) : '—', highlight: false },
        ].map(({ label, value, highlight }, i) => (
          <div key={label} className={`py-2.5 relative wr-data-cell ${i >= 2 ? 'border-t border-[#333]/8' : ''}`}>
            <div className="uppercase tracking-[0.15em] text-[#444] mb-1 font-bold font-mono flex items-center gap-1.5">
              <span className="text-[#d4f000]/10 text-[6px] group-hover/card:text-[#d4f000]/25 transition-colors duration-300">▸</span>
              {label}
            </div>
            <div className={`tabular-nums font-bold font-mono wr-data-cell-value ${highlight ? 'text-[#d4f000] wr-value-highlight' : 'text-white'}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Description */}
      {holding.description && (
        <div className="relative border-t border-[#333]/15 pt-3 pl-4 mb-3 wr-desc-accent rounded-b-sm">
          <div className="absolute top-3 left-0 w-[2px] h-[calc(100%-16px)] bg-gradient-to-b from-[#d4f000]/20 via-[#d4f000]/10 to-transparent" />
          <div className="text-[#555] text-[10px] italic leading-relaxed font-mono wr-desc-clamp group-hover/card:text-[#666] transition-colors duration-300">
            <span className="text-[#d4f000]/20 not-italic group-hover/card:text-[#d4f000]/40 transition-colors duration-300">&ldquo;</span>{holding.description}<span className="text-[#d4f000]/20 not-italic group-hover/card:text-[#d4f000]/40 transition-colors duration-300">&rdquo;</span>
          </div>
        </div>
      )}

      {/* Corner timestamp — visible on hover */}
      <div className="wr-corner-ts">{purchaseDateStr}</div>

      {/* Hover cue */}
      <div className="wr-hover-cue">● EXPAND ●</div>

      {/* External links — reveal on hover */}
      <div className="flex flex-wrap gap-3 pt-3 border-t border-[#333]/15 pl-2 wr-links-reveal">
        {[
          { label: 'SOLSCAN', href: `https://solscan.io/token/${holding.mint}` },
          ...(holding.bagsLink ? [{ label: 'BAGS.FM', href: holding.bagsLink }] : []),
          ...(holding.xAccount ? [{ label: '𝕏', href: holding.xAccount }] : []),
        ].map(({ label, href }, i) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[9px] text-[#d4f000]/50 hover:text-[#d4f000] transition-all duration-200 wr-link-hover wr-arrow-hover flex items-center gap-1 group/link"
            style={{ transitionDelay: `${i * 50}ms` }}
          >
            {label}
            <span className="text-[7px] opacity-50 wr-arrow">↗</span>
          </a>
        ))}
      </div>
      </div>{/* end inner card */}
    </div>
  )
}

// ─── Divested Assets Section ──────────────────────────────────────────────────

function DivestedSection() {
  const soldTokens = TREASURY_HOLDINGS.filter(h => h.soldDate !== undefined)

  return (
    <div className="px-5 lg:px-8 py-6 border-t border-[#333]/10 wr-divested-gradient">
      <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#666] font-bold mb-4 flex items-center gap-3 wr-sub-header">
        <span className="text-[#ff9e9e]/30 text-[6px] wr-sub-diamond">◆</span>
        <span className="text-[#ff9e9e]/50">DIVESTED ASSETS</span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#ff9e9e]/10 to-transparent" />
        {soldTokens.length > 0 && (
          <span className="text-[#444] tabular-nums">{soldTokens.length} EXITED</span>
        )}
      </div>
      {soldTokens.length === 0 ? (
        <div className="text-center py-6">
          <span className="text-[#333]/80 font-mono text-xs tracking-[0.25em]">
            NO DIVESTED POSITIONS RECORDED
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto wr-scroll">
          <table className="w-full font-mono text-[10px]" aria-label="Divested assets">
            <thead>
              <tr className="border-b border-[#ff9e9e]/10 relative">
                {['TOKEN', 'SOLD DATE', 'AMOUNT', 'STATUS'].map((h, i) => (
                  <th key={h} scope="col" className="text-left uppercase tracking-[0.15em] text-[#444] pb-2.5 pr-6 font-bold text-[9px]">
                    <span className="flex items-center gap-1.5">
                      {i === 0 && <span className="text-[#ff9e9e]/15 text-[6px]" aria-hidden="true">◆</span>}
                      {h}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {soldTokens.map((h, i) => (
                <tr key={h.mint} className={`border-b border-[#333]/10 transition-all duration-200 hover:bg-[#ff9e9e]/[0.02] hover:border-l-2 hover:border-l-[#ff9e9e]/20 ${i % 2 === 1 ? 'bg-white/[0.008]' : ''}`}>
                  <td className="py-3.5 pr-6">
                    <span className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-[#ff9e9e]/20 rounded-full" />
                      <span className="text-[#ff9e9e]/80 font-black uppercase">{h.symbol}</span>
                    </span>
                  </td>
                  <td className="py-3.5 pr-6 text-[#555] tabular-nums">
                    {h.soldDate ? format(fromUnixTime(h.soldDate), 'yyyy-MM-dd') : '—'}
                  </td>
                  <td className="py-3.5 pr-6 text-[#555] tabular-nums">
                    {h.soldAmount !== undefined
                      ? h.soldAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })
                      : '—'}
                  </td>
                  <td className="py-3.5">
                    <span className="wr-tag border-[#ff9e9e]/20 text-[#ff9e9e]/60">
                      DIVESTED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Main TreasuryIntel Component ─────────────────────────────────────────────

export default function TreasuryIntel() {
  const { data, isLoading, isError, dataUpdatedAt } = useTreasury()
  const gridRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
  useStaggerReveal(gridRef)

  // Mouse-tracking lime spotlight
  const handleMouseMove = useCallback((e: ReactMouseEvent) => {
    if (!spotlightRef.current || !sectionRef.current) return
    const rect = sectionRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    spotlightRef.current.style.background = `radial-gradient(400px circle at ${x}px ${y}px, rgba(212, 240, 0, 0.03), transparent 60%)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!spotlightRef.current) return
    spotlightRef.current.style.background = 'transparent'
  }, [])

  return (
    <section ref={sectionRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="w-full bg-[#0a0a0a] relative overflow-hidden wr-noise wr-section-tint wr-inner-shadow wr-section-enter-accent" aria-label="Treasury Intelligence">
      {/* Mouse-tracking lime spotlight */}
      <div ref={spotlightRef} className="absolute inset-0 pointer-events-none z-[1] transition-opacity duration-300" />

      {/* Edge marker */}
      <div className="wr-edge-marker text-[#d4f000]" />

      {/* Section badge */}
      <div className="wr-section-badge hidden lg:block">SEC 01</div>

      {/* Scanning line */}
      <div className="wr-scan-line" />

      {/* Unique section background — dot grid + gradient mesh */}
      <div className="absolute inset-0 wr-dot-grid opacity-40 pointer-events-none" />
      <div className="absolute inset-0 wr-bg-treasury pointer-events-none" />

      {/* Watermark section number */}
      <div className="absolute -right-4 -top-8 text-[12rem] font-black text-white/[0.012] leading-none select-none pointer-events-none font-sans wr-watermark" style={{ WebkitTextStroke: '1px rgba(212, 240, 0, 0.02)' }}>
        01
      </div>

      {/* Section header */}
      <div className="px-5 lg:px-8 py-6 border-b border-[#333]/20 wr-brackets wr-header-line text-[#d4f000] wr-glass">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-1 bg-[#d4f000] wr-accent-bar wr-accent-bar-pulse" />
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#555] font-bold mb-0.5 wr-section-num">
                SECTION 01
              </div>
              <h2 className="text-lg md:text-xl font-black uppercase tracking-wide text-[#cccccc] font-sans wr-cursor">
                Treasury <span className="wr-gradient-text-lime">Intel</span>
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {dataUpdatedAt > 0 && (
              <span className="font-mono text-[7px] uppercase tracking-[0.15em] text-[#333] hover:text-[#555] tabular-nums hidden md:inline flex items-center gap-1.5 transition-colors duration-300 cursor-default">
                <span className="wr-data-dot" />
                {new Date(dataUpdatedAt).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })} UTC
              </span>
            )}
            <div className="wr-tag wr-tag-glow border-[#d4f000]/20 text-[#d4f000]/60">
              TS/SCI
            </div>
          </div>
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#333]/20 border-b border-[#333]/20 wr-summary-accent wr-summary-glow-divider" role="region" aria-label="Treasury summary statistics">
        <SummaryCell label="Total Value (USD)" isLoading={isLoading} isError={isError}>
          <span className="flex items-center">
            {formatUsd(data?.totalValueUsd ?? 0)}
            <span className="wr-micro-spark text-[#d4f000]">
              {[4, 6, 5, 8, 7, 10, 9, 12].map((h, i) => (
                <span key={i} className="wr-micro-spark-bar" style={{ height: `${h}px` }} />
              ))}
            </span>
          </span>
        </SummaryCell>
        <SummaryCell label="SOL Balance" isLoading={isLoading} isError={isError}>
          {formatSol(data?.solBalance ?? 0)}
        </SummaryCell>
        <SummaryCell label="Portfolio (SOL)" isLoading={isLoading} isError={isError}>
          {formatSol(data?.totalValueSol ?? 0)}
        </SummaryCell>
        <SummaryCell label="Active Holdings" isLoading={isLoading} isError={isError}>
          <span className="flex items-center gap-2">
            {data?.holdings.length ?? 0}
            {!isLoading && data && data.holdings.length > 0 && (
              <span className="text-[8px] text-[#d4f000]/40 font-mono font-bold px-1.5 py-0.5 bg-[#d4f000]/[0.04] border border-[#d4f000]/10 rounded-sm wr-count-badge">
                LIVE
              </span>
            )}
          </span>
        </SummaryCell>
      </div>

      {/* Holdings grid */}
      <div className="px-5 lg:px-8 py-6">
        <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#666] font-bold mb-5 flex items-center gap-3 wr-sub-header">
          <span className="text-[#d4f000]/30 text-[6px] wr-sub-diamond">◆</span>
          <span>ACTIVE POSITIONS</span>
          <div className="flex-1 h-px bg-gradient-to-r from-[#333]/30 to-transparent" />
          {!isLoading && data && (
            <span className="text-[#d4f000]/40 tabular-nums">{data.holdings.length} ASSETS</span>
          )}
        </div>
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <LoadingCard key={i} index={i} />)
            : (data?.holdings ?? []).map((h, idx) =>
                h.category === 'unknown' ? (
                  <div key={h.mint} style={{ '--stagger-i': idx } as React.CSSProperties} className="wr-card-stagger">
                    <ClassifiedCard mint={h.mint} />
                  </div>
                ) : (
                  <div key={h.mint} style={{ '--stagger-i': idx } as React.CSSProperties} className="wr-card-stagger">
                    <HoldingCard holding={h} solPriceUsd={data?.solPriceUsd ?? 0} />
                  </div>
                )
              )}
        </div>
      </div>

      {/* Treasury value chart */}
      <TreasuryValueChart holdings={data?.holdings ?? []} isLoading={isLoading} />

      {/* Divested assets */}
      <DivestedSection />
    </section>
  )
}
