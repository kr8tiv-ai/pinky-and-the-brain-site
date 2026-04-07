'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'

/**
 * ⑥ Arc Gauge — 180° instrument panel gauge with animated needle
 * Tick marks at 25/50/75/100%, danger zone glow above 80%.
 * Spring physics overshoot on the needle.
 */

interface ArcGaugeProps {
  value: number      // Current value
  max: number        // Maximum value (threshold)
  label?: string     // Center label
  unit?: string      // e.g. "SOL"
  size?: number
  accentColor?: string
  dangerColor?: string
}

export default function ArcGauge({
  value,
  max,
  label = '',
  unit = '',
  size = 200,
  accentColor = '#d4f000',
  dangerColor = '#ff6b35',
}: ArcGaugeProps) {
  const needleRef = useRef<SVGGElement>(null)
  const glowRef = useRef<SVGCircleElement>(null)
  const pct = Math.min(value / (max || 1), 1)
  const isHot = pct > 0.8

  const cx = size / 2
  const cy = size / 2 + 10
  const radius = size * 0.38
  const strokeWidth = size * 0.06
  const needleLength = radius - strokeWidth - 4

  // Arc path helper (180° arc from left to right)
  const arcPath = (r: number, startAngle: number, endAngle: number) => {
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)
    const largeArc = endAngle - startAngle > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
  }

  // Needle animation with spring overshoot
  useEffect(() => {
    if (!needleRef.current) return
    const targetAngle = -180 + pct * 180
    gsap.fromTo(
      needleRef.current,
      { rotation: -180, transformOrigin: `${cx}px ${cy}px` },
      {
        rotation: targetAngle,
        duration: 1.8,
        ease: 'elastic.out(1, 0.4)',
        delay: 0.3,
      }
    )
  }, [pct, cx, cy])

  // Danger glow pulse
  useEffect(() => {
    if (!glowRef.current || !isHot) return
    gsap.to(glowRef.current, {
      opacity: 0.6,
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
    return () => { gsap.killTweensOf(glowRef.current) }
  }, [isHot])

  // Tick marks at 0%, 25%, 50%, 75%, 100%
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => {
    const angle = -180 + t * 180
    const rad = (angle * Math.PI) / 180
    const innerR = radius + strokeWidth / 2 + 3
    const outerR = innerR + (t % 0.5 === 0 ? 10 : 6)
    return {
      x1: cx + innerR * Math.cos(rad),
      y1: cy + innerR * Math.sin(rad),
      x2: cx + outerR * Math.cos(rad),
      y2: cy + outerR * Math.sin(rad),
      label: `${Math.round(t * 100)}%`,
      labelX: cx + (outerR + 10) * Math.cos(rad),
      labelY: cy + (outerR + 10) * Math.sin(rad),
      major: t % 0.5 === 0,
    }
  })

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg width={size} height={size * 0.58} viewBox={`0 0 ${size} ${size * 0.62}`}>
        <defs>
          {/* Gauge gradient */}
          <linearGradient id="gaugeGrad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor={accentColor} stopOpacity={0.3} />
            <stop offset="75%" stopColor={accentColor} />
            <stop offset="100%" stopColor={isHot ? dangerColor : accentColor} />
          </linearGradient>
          {/* Danger zone gradient */}
          <linearGradient id="dangerGrad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor={dangerColor} stopOpacity={0.2} />
            <stop offset="100%" stopColor={dangerColor} />
          </linearGradient>
          <filter id="needleGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background track */}
        <path
          d={arcPath(radius, -180, 0)}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Danger zone (80-100%) */}
        <path
          d={arcPath(radius, -180 + 0.8 * 180, 0)}
          fill="none"
          stroke={dangerColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={0.15}
        />

        {/* Danger glow */}
        {isHot && (
          <circle
            ref={glowRef}
            cx={cx + radius * Math.cos((-180 + 0.9 * 180) * Math.PI / 180)}
            cy={cy + radius * Math.sin((-180 + 0.9 * 180) * Math.PI / 180)}
            r={12}
            fill={dangerColor}
            opacity={0}
            style={{ filter: `blur(8px)` }}
          />
        )}

        {/* Filled arc */}
        <path
          d={arcPath(radius, -180, -180 + pct * 180)}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{
            filter: isHot ? `drop-shadow(0 0 6px ${dangerColor})` : `drop-shadow(0 0 4px ${accentColor}40)`,
          }}
        />

        {/* Tick marks */}
        {ticks.map((tick, i) => (
          <g key={i}>
            <line
              x1={tick.x1} y1={tick.y1}
              x2={tick.x2} y2={tick.y2}
              stroke={tick.major ? '#555' : '#333'}
              strokeWidth={tick.major ? 1.5 : 1}
            />
            {tick.major && (
              <text
                x={tick.labelX}
                y={tick.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-mono"
                fill="#555"
                fontSize={8}
              >
                {tick.label}
              </text>
            )}
          </g>
        ))}

        {/* Needle */}
        <g ref={needleRef} filter="url(#needleGlow)">
          <line
            x1={cx}
            y1={cy}
            x2={cx - needleLength}
            y2={cy}
            stroke={isHot ? dangerColor : accentColor}
            strokeWidth={2}
            strokeLinecap="round"
          />
          {/* Needle hub */}
          <circle
            cx={cx}
            cy={cy}
            r={4}
            fill={isHot ? dangerColor : accentColor}
            style={{ filter: `drop-shadow(0 0 4px ${isHot ? dangerColor : accentColor})` }}
          />
        </g>

        {/* Center value */}
        <text
          x={cx}
          y={cy - 14}
          textAnchor="middle"
          className="font-mono font-black"
          fill="white"
          fontSize={18}
        >
          {value.toFixed(2)}
        </text>
        <text
          x={cx}
          y={cy - 1}
          textAnchor="middle"
          className="font-mono"
          fill="#888"
          fontSize={9}
          letterSpacing={2}
        >
          {label ? `${label} ${unit}`.trim() : `/ ${max} ${unit}`.trim()}
        </text>
      </svg>
    </div>
  )
}
