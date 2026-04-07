'use client'

/**
 * ② Inline Sparkline — Pure SVG micro-chart
 * 48px wide, 20px tall, no dependencies.
 * Renders a polyline from an array of numbers.
 * Trend color: lime if up, pink if down.
 */

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  colorUp?: string
  colorDown?: string
  className?: string
}

export default function Sparkline({
  data,
  width = 48,
  height = 20,
  colorUp = '#d4f000',
  colorDown = '#ff9e9e',
  className = '',
}: SparklineProps) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const padding = 1

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2)
    const y = padding + (1 - (v - min) / range) * (height - padding * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  // Fill area path
  const firstX = padding
  const lastX = padding + ((data.length - 1) / (data.length - 1)) * (width - padding * 2)
  const fillPoints = `${firstX},${height} ${points} ${lastX},${height}`

  const trending = data[data.length - 1] >= data[0]
  const color = trending ? colorUp : colorDown

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`inline-block align-middle ${className}`}
      aria-hidden="true"
    >
      {/* Gradient fill beneath the line */}
      <defs>
        <linearGradient id={`spark-fill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon
        points={fillPoints}
        fill={`url(#spark-fill-${color.replace('#', '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={parseFloat(points.split(' ').pop()?.split(',')[0] ?? '0')}
        cy={parseFloat(points.split(' ').pop()?.split(',')[1] ?? '0')}
        r={1.5}
        fill={color}
        style={{ filter: `drop-shadow(0 0 2px ${color})` }}
      />
    </svg>
  )
}
