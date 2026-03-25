'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function SectionReveal({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Main content reveal — subtle scale + blur + fade
      gsap.fromTo(
        sectionRef.current,
        {
          y: 40,
          opacity: 0,
          scale: 0.98,
          filter: 'blur(3px)',
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 88%',
            end: 'top 50%',
            toggleActions: 'play none none none',
          },
        }
      )

      // Decorative top line sweep
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.8,
            ease: 'power2.inOut',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={sectionRef} className={`relative ${className}`}>
      {/* Animated reveal line at top */}
      <div
        ref={lineRef}
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4f000]/20 to-transparent origin-left"
        style={{ transformOrigin: 'left center' }}
      />
      {children}
    </div>
  )
}
