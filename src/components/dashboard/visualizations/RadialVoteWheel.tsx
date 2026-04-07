'use client'

import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'

/**
 * ④ Radial Vote Wheel — Concentric arcs per candidate
 * Arc length = vote weight proportion.
 * Winner arc pulses. Labels around perimeter.
 */

interface VoteOption {
  index: number
  label: string
  weight: bigint
  color: string
}

interface RadialVoteWheelProps {
  options: VoteOption[]
  totalWeight: bigint
  winnerIndex?: number
  size?: number
}

const VOTE_COLORS = [
  '#d4f000', '#4a90e2', '#ff9e9e', '#00d4aa', '#c084fc',
  '#e4ff57', '#ff6b35', '#87ceeb', '#ffadad', '#a8e6cf',
]

export default function RadialVoteWheel({
  options,
  totalWeight,
  winnerIndex,
  size = 200,
}: RadialVoteWheelProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hovered, setHovered] = useState<number | null>(null)

  const cx = size / 2
  const cy = size / 2
  const baseRadius = size * 0.2
  const ringSpacing = size * 0.06
  const strokeWidth = size * 0.04

  // Animate arcs
  useEffect(() => {
    if (!svgRef.current || options.length === 0) return
    const arcs = svgRef.current.querySelectorAll<SVGCircleElement>('[data-vote-arc]')
    const ctx = gsap.context(() => {
      arcs.forEach(el => {
        const full = el.getAttribute('data-circumference') ?? '0'
        gsap.set(el, { attr: { 'stroke-dashoffset': full } })
      })
      gsap.to(arcs, {
        attr: { 'stroke-dashoffset': (i: number, el: SVGCircleElement) => el.getAttribute('data-target-offset') ?? '0' },
        duration: 1.4,
        ease: 'power3.out',
        stagger: 0.12,
        delay: 0.2,
      })
    }, svgRef)
    return () => ctx.revert()
  }, [options])

  // Winner pulse
  useEffect(() => {
    if (!svgRef.current || winnerIndex === undefined) return
    const winner = svgRef.current.querySelector(`[data-winner-pulse]`)
    if (!winner) return
    gsap.to(winner, {
      opacity: 0.5,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
    return () => { gsap.killTweensOf(winner) }
  }, [winnerIndex])

  if (options.length === 0 || totalWeight <= BigInt(0)) {
    return (
      <div className="flex items-center justify-center py-6">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#555]">NO VOTES RECORDED</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <filter id="voteArcGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {options.map((opt, i) => {
          const radius = baseRadius + i * ringSpacing
          const circumference = 2 * Math.PI * radius
          const pct = Number((opt.weight * BigInt(10000)) / totalWeight) / 10000
          const dashLen = pct * circumference
          const targetOffset = circumference - dashLen
          const color = opt.color || VOTE_COLORS[i % VOTE_COLORS.length]
          const isHov = hovered === i
          const isWinner = winnerIndex === i

          return (
            <g key={i}>
              {/* Background track */}
              <circle
                cx={cx} cy={cy} r={radius}
                fill="none" stroke="#1a1a1a"
                strokeWidth={strokeWidth}
              />
              {/* Vote arc */}
              <circle
                data-vote-arc
                data-circumference={circumference.toFixed(2)}
                data-target-offset={targetOffset.toFixed(2)}
                cx={cx} cy={cy} r={radius}
                fill="none"
                stroke={color}
                strokeWidth={isHov ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={`${dashLen.toFixed(2)} ${(circumference - dashLen).toFixed(2)}`}
                strokeDashoffset={circumference}
                strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{
                  transition: 'stroke-width 0.2s ease',
                  cursor: 'pointer',
                  filter: isHov ? `drop-shadow(0 0 6px ${color})` : undefined,
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
              {/* Winner glow pulse */}
              {isWinner && (
                <circle
                  data-winner-pulse
                  cx={cx} cy={cy} r={radius}
                  fill="none" stroke={color}
                  strokeWidth={strokeWidth + 6}
                  strokeDasharray={`${dashLen.toFixed(2)} ${(circumference - dashLen).toFixed(2)}`}
                  strokeDashoffset={targetOffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${cx} ${cy})`}
                  opacity={0}
                  style={{ filter: 'blur(4px)' }}
                />
              )}
              {/* Percentage label at end of arc */}
              {pct >= 0.05 && (
                <text
                  x={cx + radius * Math.cos((-90 + pct * 360) * Math.PI / 180)}
                  y={cy + radius * Math.sin((-90 + pct * 360) * Math.PI / 180)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-mono font-bold"
                  fill={color}
                  fontSize={9}
                >
                  {(pct * 100).toFixed(0)}%
                </text>
              )}
            </g>
          )
        })}

        {/* Center text */}
        <text x={cx} y={cy - 6} textAnchor="middle" className="font-mono font-black" fill="white" fontSize={14}>
          {options.length}
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" className="font-mono" fill="#888" fontSize={8} letterSpacing={2}>
          OPTIONS
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5">
        {options.map((opt, i) => {
          const color = opt.color || VOTE_COLORS[i % VOTE_COLORS.length]
          const pct = Number((opt.weight * BigInt(10000)) / totalWeight) / 10000
          return (
            <div
              key={i}
              className="flex items-center gap-1.5 cursor-pointer transition-opacity duration-200"
              style={{ opacity: hovered !== null && hovered !== i ? 0.4 : 1 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}60` }} />
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#ccc]">
                {opt.label}
              </span>
              <span className="font-mono text-[10px] text-[#888] tabular-nums">
                {(pct * 100).toFixed(1)}%
              </span>
              {winnerIndex === i && (
                <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-[#d4f000] bg-[#d4f000]/10 px-1.5 py-0.5 rounded">
                  WIN
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
