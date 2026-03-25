'use client'

import { useEffect, useState } from 'react'

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return
      setProgress((scrollTop / docHeight) * 100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px]">
      <div
        className="h-full bg-gradient-to-r from-[#d4f000] via-[#e4ff57] to-[#ffadad] transition-[width] duration-150 ease-out"
        style={{
          width: `${progress}%`,
          boxShadow: '0 0 8px rgba(212, 240, 0, 0.4), 0 0 2px rgba(212, 240, 0, 0.6)',
        }}
      />
    </div>
  )
}
