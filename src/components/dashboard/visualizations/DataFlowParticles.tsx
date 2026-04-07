'use client'

import { useRef, useEffect, useCallback } from 'react'

/**
 * ⑩ Data Flow Particles — Subtle particle stream along tab bar
 * Tiny lime dots flow left-to-right showing money flow:
 * TREASURY → REFLECTIONS → BURNS
 * Accelerates on hover with labels.
 */

interface DataFlowParticlesProps {
  width?: number
  height?: number
  particleCount?: number
  color?: string
  speed?: number
  className?: string
}

interface Particle {
  x: number
  y: number
  vx: number
  size: number
  opacity: number
  trail: number
}

export default function DataFlowParticles({
  width = 800,
  height = 3,
  particleCount = 15,
  color = '#d4f000',
  speed = 0.8,
  className = '',
}: DataFlowParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number>(0)
  const hoveredRef = useRef(false)

  // Initialize particles
  useEffect(() => {
    const particles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: height * 0.2 + Math.random() * height * 0.6,
        vx: speed * (0.5 + Math.random() * 0.5),
        size: 1 + Math.random() * 1.5,
        opacity: 0.15 + Math.random() * 0.35,
        trail: 4 + Math.random() * 8,
      })
    }
    particlesRef.current = particles
  }, [width, height, particleCount, speed])

  // Render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, width, height)

    const multiplier = hoveredRef.current ? 2.5 : 1

    // Parse color to RGB
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)

    for (const p of particlesRef.current) {
      // Update position
      p.x += p.vx * multiplier

      // Wrap around
      if (p.x > width + p.trail) {
        p.x = -p.trail
        p.y = height * 0.2 + Math.random() * height * 0.6
      }

      // Draw trail
      const gradient = ctx.createLinearGradient(
        p.x - p.trail, p.y,
        p.x, p.y
      )
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`)
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${p.opacity * multiplier * 0.6})`)

      ctx.beginPath()
      ctx.moveTo(p.x - p.trail, p.y)
      ctx.lineTo(p.x, p.y)
      ctx.strokeStyle = gradient
      ctx.lineWidth = p.size * 0.6
      ctx.stroke()

      // Draw particle head
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity * multiplier})`
      ctx.fill()
    }

    animFrameRef.current = requestAnimationFrame(render)
  }, [width, height, color])

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [render])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`pointer-events-auto ${className}`}
      style={{ imageRendering: 'pixelated' }}
      onMouseEnter={() => { hoveredRef.current = true }}
      onMouseLeave={() => { hoveredRef.current = false }}
    />
  )
}
