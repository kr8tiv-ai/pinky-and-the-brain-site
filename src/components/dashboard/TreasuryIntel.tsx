'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
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
        { y: 20, opacity: 0, scale: 0.97, filter: 'blur(4px)' },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.5,
          ease: 'power3.out',
          stagger: { amount: 0.4, from: 'start' },
          delay: 0.2,
        }
      )
    }, containerRef)
    return () => ctx.revert()
  }, [containerRef])
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
  points.push({ label: 'NOW', valueUsd: totalCurrent })
  return points
}

// ─── Custom Chart Tooltip ─────────────────────────────────────────────────────

function CustomChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  const rawValue = (payload[0] as { value?: TooltipValueType }).value
  const numericValue = typeof rawValue === 'number' ? rawValue : 0
  return (
    <div className="wr-tooltip px-4 py-3 font-mono text-xs">
      <div className="text-[#666] mb-1 text-[10px] uppercase tracking-[0.15em] font-bold">{label}</div>
      <div className="text-[#d4f000] font-black text-sm">{formatUsd(numericValue)}</div>
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
    <div className="px-5 lg:px-8 py-6">
      <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#666] font-bold mb-5 flex items-center gap-3">
        <span>TREASURY VALUE OVER TIME</span>
        <div className="flex-1 h-px bg-[#333]/30" />
      </div>
      {isLoading ? (
        <div className="h-[220px] flex items-center justify-center">
          <div className="wr-skeleton h-[180px] w-full rounded" />
        </div>
      ) : chartData.length < 2 ? (
        <div className="h-[220px] flex items-center justify-center">
          <span className="text-[#333] font-mono text-xs tracking-[0.2em]">INSUFFICIENT DATA</span>
        </div>
      ) : (
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="treasuryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4f000" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#d4f000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 8" stroke="rgba(51,51,51,0.3)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#444', fontSize: 9, fontFamily: 'var(--font-mono)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#444', fontSize: 9, fontFamily: 'var(--font-mono)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                width={45}
              />
              <Tooltip content={(props) => <CustomChartTooltip {...(props as TooltipContentProps)} />} cursor={{ stroke: 'rgba(212, 240, 0, 0.15)' }} />
              <Area
                type="monotone"
                dataKey="valueUsd"
                stroke="#d4f000"
                strokeWidth={2}
                fill="url(#treasuryGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: '#d4f000',
                  stroke: '#0a0a0a',
                  strokeWidth: 2,
                }}
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
  return (
    <div className="px-5 lg:px-6 py-5">
      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#666] mb-2 font-bold">
        {label}
      </div>
      <div className="font-mono text-xl lg:text-2xl font-black text-white tabular-nums leading-none">
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

function LoadingCard() {
  return (
    <div className="wr-card p-5">
      <div className="flex justify-between items-start mb-4">
        <div className="wr-skeleton h-4 w-24" />
        <div className="wr-skeleton h-4 w-12" />
      </div>
      <div className="wr-skeleton h-3 w-32 mb-4" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="wr-skeleton h-2 w-16 mb-1.5" />
            <div className="wr-skeleton h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Classified Card ──────────────────────────────────────────────────────────

function ClassifiedCard({ mint }: { mint: string }) {
  return (
    <div data-wr-reveal className="wr-card p-5 relative overflow-hidden">
      {/* Diagonal line pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 9px)',
        }}
      />
      <div className="relative">
        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#444] mb-3 font-bold">
          ASSET #{mint.slice(0, 8)}
        </div>
        <div className="text-xl font-black text-[#1a1a1a] tracking-widest select-none flicker mb-4 leading-none">
          ████████████████
        </div>
        <div className="wr-tag border-[#333]/50 text-[#444] inline-block mb-4">
          CLASSIFIED
        </div>
        <div className="pt-3 border-t border-[#333]/20">
          <a
            href={`https://solscan.io/token/${mint}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] text-[#d4f000]/60 hover:text-[#d4f000] transition-colors"
          >
            SOLSCAN ↗
          </a>
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
    <div data-wr-reveal className="wr-card p-5 group/card">
      {/* Accent border left */}
      <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-[#d4f000] via-[#d4f000]/50 to-transparent" />

      {/* Header: token name + gain/loss */}
      <div className="flex justify-between items-start mb-3 pl-2">
        <div>
          <div className="text-[#d4f000] font-black text-sm uppercase tracking-wider font-mono">
            {holding.name}
          </div>
          {holding.symbol && holding.symbol !== holding.name && (
            <div className="text-[#444] text-[10px] font-mono mt-0.5">${holding.symbol}</div>
          )}
        </div>
        <span className={`text-xs font-black tabular-nums font-mono ${gainLoss.colorClass}`}>
          {gainLoss.text}
        </span>
      </div>

      {/* Contract address */}
      <div className="flex items-center gap-2 mb-4 pl-2">
        <button
          onClick={handleCopy}
          className="font-mono text-[10px] text-[#444] hover:text-[#d4f000] transition-colors flex items-center gap-1.5"
          title="Copy full address"
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" className="opacity-50">
            <path d="M4 4V1h11v11h-3v3H1V4h3zm1-1V1.5a.5.5 0 01.5-.5h9a.5.5 0 01.5.5v9a.5.5 0 01-.5.5H13V4.5a.5.5 0 00-.5-.5H5z" />
            <path d="M1.5 5a.5.5 0 00-.5.5v9a.5.5 0 00.5.5h9a.5.5 0 00.5-.5v-9a.5.5 0 00-.5-.5h-9z" />
          </svg>
          {copied
            ? <span className="text-[#d4f000]">COPIED</span>
            : `${holding.mint.slice(0, 6)}…${holding.mint.slice(-4)}`}
        </button>
      </div>

      {/* Data grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-[10px] mb-4 pl-2">
        {[
          { label: 'AMOUNT', value: holding.uiAmount.toLocaleString(undefined, { maximumFractionDigits: 4 }) },
          { label: 'VALUE (USD)', value: formatUsd(holding.currentValueUsd) },
          { label: 'VALUE (SOL)', value: formatSol(holding.currentValueSol) },
          { label: 'ACQUIRED', value: purchaseDateStr },
          { label: 'COST (USD)', value: holding.purchasePriceUsd !== undefined ? formatUsd(holding.purchasePriceUsd) : '—' },
          { label: '~PRICE (SOL)', value: purchasePriceSol !== undefined ? formatSol(purchasePriceSol) : '—' },
        ].map(({ label, value }) => (
          <div key={label}>
            <div className="uppercase tracking-[0.15em] text-[#444] mb-0.5 font-bold font-mono">{label}</div>
            <div className="text-white tabular-nums font-bold font-mono">{value}</div>
          </div>
        ))}
      </div>

      {/* Description */}
      {holding.description && (
        <div className="text-[#555] text-[10px] italic mb-3 border-t border-[#333]/20 pt-3 pl-2 leading-relaxed font-mono">
          {holding.description}
        </div>
      )}

      {/* External links */}
      <div className="flex flex-wrap gap-4 pt-3 border-t border-[#333]/20 pl-2">
        <a
          href={`https://solscan.io/token/${holding.mint}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[10px] text-[#d4f000]/60 hover:text-[#d4f000] transition-colors"
        >
          SOLSCAN ↗
        </a>
        {holding.bagsLink && (
          <a
            href={holding.bagsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] text-[#d4f000]/60 hover:text-[#d4f000] transition-colors"
          >
            BAGS.FM ↗
          </a>
        )}
        {holding.xAccount && (
          <a
            href={holding.xAccount}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] text-[#d4f000]/60 hover:text-[#d4f000] transition-colors"
          >
            𝕏 ↗
          </a>
        )}
      </div>
    </div>
  )
}

// ─── Divested Assets Section ──────────────────────────────────────────────────

function DivestedSection() {
  const soldTokens = TREASURY_HOLDINGS.filter(h => h.soldDate !== undefined)

  return (
    <div className="px-5 lg:px-8 py-6">
      <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#666] font-bold mb-4 flex items-center gap-3">
        <span>DIVESTED ASSETS</span>
        <div className="flex-1 h-px bg-[#333]/30" />
      </div>
      {soldTokens.length === 0 ? (
        <div className="text-center py-6">
          <span className="text-[#333] font-mono text-xs tracking-[0.2em]">
            NO DIVESTED POSITIONS RECORDED
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto wr-scroll">
          <table className="w-full font-mono text-[10px]">
            <thead>
              <tr className="border-b border-[#333]/30">
                <th className="text-left uppercase tracking-[0.15em] text-[#444] pb-2 pr-6 font-bold">TOKEN</th>
                <th className="text-left uppercase tracking-[0.15em] text-[#444] pb-2 pr-6 font-bold">SOLD DATE</th>
                <th className="text-left uppercase tracking-[0.15em] text-[#444] pb-2 pr-6 font-bold">AMOUNT</th>
                <th className="text-left uppercase tracking-[0.15em] text-[#444] pb-2 font-bold">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {soldTokens.map(h => (
                <tr key={h.mint} className="border-b border-[#333]/15 wr-row-hover">
                  <td className="py-3 pr-6 text-white font-black uppercase">{h.symbol}</td>
                  <td className="py-3 pr-6 text-[#666]">
                    {h.soldDate ? format(fromUnixTime(h.soldDate), 'yyyy-MM-dd') : '—'}
                  </td>
                  <td className="py-3 pr-6 text-[#666] tabular-nums">
                    {h.soldAmount !== undefined
                      ? h.soldAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })
                      : '—'}
                  </td>
                  <td className="py-3">
                    <span className="wr-tag border-[#ff9e9e]/30 text-[#ff9e9e]">
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
  const { data, isLoading, isError } = useTreasury()
  const gridRef = useRef<HTMLDivElement>(null)
  useStaggerReveal(gridRef)

  return (
    <section className="w-full bg-[#0a0a0a]">
      {/* Section header */}
      <div className="flex justify-between items-center px-5 lg:px-8 py-4 border-b border-[#333]/20">
        <div className="flex items-center gap-3">
          <div className="w-1 h-4 bg-[#d4f000]" />
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#888] font-bold">
            Treasury Intel
          </div>
        </div>
        <div className="wr-tag border-[#d4f000]/20 text-[#d4f000]/60">
          TS/SCI
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#333]/20 border-b border-[#333]/20">
        <SummaryCell label="Total Value (USD)" isLoading={isLoading} isError={isError}>
          {formatUsd(data?.totalValueUsd ?? 0)}
        </SummaryCell>
        <SummaryCell label="SOL Balance" isLoading={isLoading} isError={isError}>
          {formatSol(data?.solBalance ?? 0)}
        </SummaryCell>
        <SummaryCell label="Portfolio (SOL)" isLoading={isLoading} isError={isError}>
          {formatSol(data?.totalValueSol ?? 0)}
        </SummaryCell>
        <SummaryCell label="Active Holdings" isLoading={isLoading} isError={isError}>
          {data?.holdings.length ?? 0}
        </SummaryCell>
      </div>

      {/* Holdings grid */}
      <div className="px-5 lg:px-8 py-6">
        <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#666] font-bold mb-5 flex items-center gap-3">
          <span>ACTIVE POSITIONS</span>
          <div className="flex-1 h-px bg-[#333]/30" />
        </div>
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <LoadingCard key={i} />)
            : (data?.holdings ?? []).map(h =>
                h.category === 'unknown' ? (
                  <ClassifiedCard key={h.mint} mint={h.mint} />
                ) : (
                  <HoldingCard key={h.mint} holding={h} solPriceUsd={data?.solPriceUsd ?? 0} />
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
