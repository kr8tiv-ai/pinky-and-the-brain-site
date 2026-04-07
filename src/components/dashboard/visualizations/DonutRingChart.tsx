'use client'

import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'

/**
 * ① Animated Donut Ring Chart — Multi-segment ring with hover expand
 * Replaces flat stacked bars with a radial visualization.
 * Animated arc entrance, hover glow per segment, center total.
 */

interface Segment {
  key: string
  label: string
  value: number
  pct: number
  color: string
  glow: string
}

interface DonutRingChartProps {
  segments: Segment[]
  totalLabel?: string
  totalValue?: string
  size?: number
  strokeWidth?: number
  isLoading?: boolean
}

export default function DonutRingChart({
  segments,
  totalLabel = 'TOTAL',
  totalValue = '',
  size = 240,
  strokeWidth = 22,
  isLoading = false,
}: DonutRingChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

  const cx = size / 2
  const cy = size / 2
  const radius = (size - strokeWidth * 2) / 2 - 4
  const circumference = 2 * Math.PI * radius
  const gap = 3 // Gap between segments in px

  // Animate arcs on mount
  useEffect(() => {
    if (!svgRef.current || isLoading || segments.length === 0) return
    const arcs = svgRef.current.querySelectorAll<SVGCircleElement>('[data-donut-arc]')
    if (!arcs.length) return

    const ctx = gsap.context(() => {
      arcs.forEach(el => {
        const dashLen = el.getAttribute('data-arc-len') ?? '0'
        gsap.set(el, { attr: { 'stroke-dashoffset': dashLen } })
      })
      gsap.to(arcs, {
        attr: { 'stroke-dashoffset': 0 },
        duration: 1.6,
        ease: 'power3.out',
        stagger: 0.1,
        delay: 0.2,
      })
    }, svgRef)
    return () => ctx.revert()
  }, [segments, isLoading])

  // Build arc data
  const totalGapDeg = (gap / circumference) * 360 * segments.length
  const availableDeg = 360 - totalGapDeg
  let accumulatedDeg = -90 // Start from top

  const arcs = segments.map(seg => {
    const segDeg = (seg.pct / 100) * availableDeg
    const dashLen = (segDeg / 360) * circumference
    const gapLen = circumference - dashLen
    const rotDeg = accumulatedDeg
    accumulatedDeg += segDeg + (gap / circumference) * 360

    return {
      ...seg,
      dashLen,
      gapLen,
      rotDeg,
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="wr-skeleton rounded-full" style={{ width: size * 0.8, height: size * 0.8 }} />
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row items-center gap-8">
      {/* Ring */}
      <div className="relative flex-shrink-0">
        <svg
          ref={svgRef}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform"
        >
          <defs>
            {segments.map(seg => (
              <filter key={`glow-${seg.key}`} id={`donut-glow-${seg.key}`} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="g" />
                <feMerge>
                  <feMergeNode in="g" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>

          {/* Background track */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke="#1a1a1a"
            strokeWidth={strokeWidth - 2}
          />

          {/* Segments */}
          {arcs.map(arc => {
            const isHovered = hoveredKey === arc.key
            const sw = isHovered ? strokeWidth + 4 : strokeWidth
            return (
              <circle
                key={arc.key}
                data-donut-arc
                data-arc-len={arc.dashLen.toFixed(2)}
                cx={cx} cy={cy} r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={sw}
                strokeDasharray={`${arc.dashLen.toFixed(2)} ${arc.gapLen.toFixed(2)}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                transform={`rotate(${arc.rotDeg} ${cx} ${cy})`}
                style={{
                  filter: isHovered ? `url(#donut-glow-${arc.key})` : undefined,
                  transition: 'stroke-width 0.3s ease, filter 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHoveredKey(arc.key)}
                onMouseLeave={() => setHoveredKey(null)}
              />
            )
          })}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {hoveredKey ? (
            <>
              <span className="font-mono text-lg font-black text-white tabular-nums">
                {arcs.find(a => a.key === hoveredKey)?.pct.toFixed(0)}%
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#bbb] mt-0.5">
                {arcs.find(a => a.key === hoveredKey)?.label}
              </span>
            </>
          ) : (
            <>
              <span className="font-mono text-lg font-black text-white tabular-nums">
                {totalValue}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#888] mt-0.5">
                {totalLabel}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-x-6 gap-y-2.5">
        {segments.map(seg => (
          <div
            key={seg.key}
            className="flex items-center gap-2.5 py-1 cursor-pointer group/legend transition-all duration-200"
            onMouseEnter={() => setHoveredKey(seg.key)}
            onMouseLeave={() => setHoveredKey(null)}
            style={{ opacity: hoveredKey && hoveredKey !== seg.key ? 0.4 : 1 }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200 group-hover/legend:scale-125"
              style={{
                backgroundColor: seg.color,
                boxShadow: hoveredKey === seg.key ? `0 0 8px ${seg.glow}` : `0 0 4px ${seg.glow}`,
              }}
            />
            <div className="min-w-0">
              <div className="font-mono text-[11px] text-[#ccc] font-bold truncate group-hover/legend:text-white transition-colors">
                {seg.label}
              </div>
              <div className="font-mono text-[10px] text-[#888] tabular-nums">
                {seg.pct.toFixed(0)}% &middot; {seg.value.toFixed(2)} SOL
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
