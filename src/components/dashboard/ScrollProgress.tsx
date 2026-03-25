'use client'

import { useEffect, useRef } from 'react'

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!barRef.current) return
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return
      const progress = scrollTop / docHeight
      barRef.current.style.transform = `scaleX(${progress})`
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Main bar */}
      <div className="h-[2px] relative">
        <div
          ref={barRef}
          className="h-full w-full bg-gradient-to-r from-[#d4f000] via-[#e4ff57] to-[#ffadad] origin-left"
          style={{
            transform: 'scaleX(0)',
            willChange: 'transform',
            boxShadow: '0 0 8px rgba(212, 240, 0, 0.4), 0 0 3px rgba(212, 240, 0, 0.7)',
            borderRadius: '0 1px 1px 0',
          }}
        />
      </div>
      {/* Glow reflection — layered */}
      <div className="h-6 bg-gradient-to-b from-[#d4f000]/[0.05] via-[#d4f000]/[0.02] to-transparent pointer-events-none" />
    </div>
  )
}
