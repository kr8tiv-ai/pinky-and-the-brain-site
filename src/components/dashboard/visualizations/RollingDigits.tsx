'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * ③ Rolling Digit Counter — Airport departure board style
 * Each digit rolls independently with staggered timing.
 * Handles decimals, commas, dollar signs, and percentage signs.
 */

interface RollingDigitsProps {
  value: string // Pre-formatted string like "$1,234.56" or "12.34%"
  className?: string
  digitClassName?: string
  staggerMs?: number
}

function SingleDigit({ char, index, staggerMs }: { char: string; index: number; staggerMs: number }) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const prevChar = useRef(char)
  const isNumeric = /\d/.test(char)

  useEffect(() => {
    if (!containerRef.current || !isNumeric || char === prevChar.current) {
      prevChar.current = char
      return
    }

    const el = containerRef.current
    const targetNum = parseInt(char, 10)

    // Animate: roll through digits
    el.style.transition = 'none'
    el.style.transform = `translateY(0%)`

    requestAnimationFrame(() => {
      el.style.transition = `transform ${350 + index * 30}ms cubic-bezier(0.16, 1, 0.3, 1) ${index * staggerMs}ms`
      el.style.transform = `translateY(-${targetNum * 10}%)`
    })

    prevChar.current = char
  }, [char, index, isNumeric, staggerMs])

  if (!isNumeric) {
    return (
      <span className="inline-block" style={{ width: char === ',' ? '0.3em' : char === '.' ? '0.3em' : '0.55em' }}>
        {char}
      </span>
    )
  }

  const targetNum = parseInt(char, 10)

  return (
    <span
      className="relative inline-block overflow-hidden align-bottom"
      style={{ width: '0.6em', height: '1.15em' }}
    >
      <span
        ref={containerRef}
        className="absolute left-0 top-0 flex flex-col"
        style={{
          transform: `translateY(-${targetNum * 10}%)`,
          willChange: 'transform',
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
          <span
            key={d}
            className="block text-center tabular-nums"
            style={{ height: '1.15em', lineHeight: '1.15em' }}
          >
            {d}
          </span>
        ))}
      </span>
    </span>
  )
}

export default function RollingDigits({
  value,
  className = '',
  staggerMs = 40,
}: RollingDigitsProps) {
  const chars = value.split('')

  return (
    <span className={`inline-flex items-baseline font-mono font-black tabular-nums ${className}`}>
      {chars.map((char, i) => (
        <SingleDigit key={`${i}-${chars.length}`} char={char} index={i} staggerMs={staggerMs} />
      ))}
    </span>
  )
}
