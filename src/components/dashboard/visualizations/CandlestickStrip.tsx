'use client'

import { useMemo } from 'react'

/**
 * ⑧ Mini Candlestick Strip — Inline 24H price visualization
 * Pure SVG, no library. Green/lime candles up, pink down.
 */

interface Candle {
  open: number
  high: number
  low: number
  close: number
}

interface CandlestickStripProps {
  candles: Candle[]
  width?: number
  height?: number
  colorUp?: string
  colorDown?: string
  className?: string
}

export default function CandlestickStrip({
  candles,
  width = 200,
  height = 40,
  colorUp = '#d4f000',
  colorDown = '#ff9e9e',
  className = '',
}: CandlestickStripProps) {
  const elements = useMemo(() => {
    if (!candles || candles.length < 2) return null

    const allValues = candles.flatMap(c => [c.high, c.low])
    const min = Math.min(...allValues)
    const max = Math.max(...allValues)
    const range = max - min || 1
    const padding = 2

    const candleWidth = Math.max(1.5, ((width - padding * 2) / candles.length) * 0.6)
    const gapWidth = ((width - padding * 2) / candles.length) * 0.4

    const toY = (v: number) => padding + (1 - (v - min) / range) * (height - padding * 2)

    return candles.map((c, i) => {
      const x = padding + i * (candleWidth + gapWidth) + candleWidth / 2
      const isUp = c.close >= c.open
      const color = isUp ? colorUp : colorDown
      const bodyTop = toY(Math.max(c.open, c.close))
      const bodyBottom = toY(Math.min(c.open, c.close))
      const bodyHeight = Math.max(0.5, bodyBottom - bodyTop)

      return (
        <g key={i}>
          {/* Wick */}
          <line
            x1={x} y1={toY(c.high)}
            x2={x} y2={toY(c.low)}
            stroke={color}
            strokeWidth={0.5}
            opacity={0.6}
          />
          {/* Body */}
          <rect
            x={x - candleWidth / 2}
            y={bodyTop}
            width={candleWidth}
            height={bodyHeight}
            fill={isUp ? color : 'transparent'}
            stroke={color}
            strokeWidth={0.5}
            rx={0.3}
          />
        </g>
      )
    })
  }, [candles, width, height, colorUp, colorDown])

  if (!elements) return null

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`inline-block align-middle ${className}`}
      aria-hidden="true"
    >
      {/* Subtle zero line */}
      <line
        x1={0} y1={height / 2}
        x2={width} y2={height / 2}
        stroke="#333"
        strokeWidth={0.5}
        strokeDasharray="2 4"
        opacity={0.3}
      />
      {elements}
    </svg>
  )
}

/**
 * Generate synthetic candle data from a price + change for demo purposes.
 * In production, replace with actual OHLC data from API.
 */
export function generateSyntheticCandles(
  currentPrice: number,
  change24h: number,
  count: number = 24
): Candle[] {
  if (currentPrice <= 0) return []

  const startPrice = currentPrice / (1 + change24h / 100)
  const priceStep = (currentPrice - startPrice) / count
  const candles: Candle[] = []

  let price = startPrice
  for (let i = 0; i < count; i++) {
    const volatility = price * 0.015
    const trend = priceStep + (Math.random() - 0.5) * volatility * 2
    const open = price
    const close = price + trend
    const high = Math.max(open, close) + Math.random() * volatility
    const low = Math.min(open, close) - Math.random() * volatility

    candles.push({ open, high, low, close })
    price = close
  }

  return candles
}
