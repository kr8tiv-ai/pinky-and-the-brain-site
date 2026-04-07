'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function EcosystemVenture() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const bagsCardRef = useRef<HTMLDivElement>(null)
  const pinkbrainCardRef = useRef<HTMLDivElement>(null)
  const connectorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading entrance — rises up with slight scale
      gsap.fromTo(
        headingRef.current,
        { y: 80, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      )

      // Subtitle fades in after heading
      gsap.fromTo(
        subtitleRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          delay: 0.3,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      )

      // bags.fm card slides in from left with playful rotation
      gsap.fromTo(
        bagsCardRef.current,
        { x: -120, opacity: 0, rotationZ: -4 },
        {
          x: 0,
          opacity: 1,
          rotationZ: 0,
          duration: 1,
          delay: 0.5,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: bagsCardRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      )

      // PinkBrain card slides in from right
      gsap.fromTo(
        pinkbrainCardRef.current,
        { x: 120, opacity: 0, rotationZ: 4 },
        {
          x: 0,
          opacity: 1,
          rotationZ: 0,
          duration: 1,
          delay: 0.5,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: pinkbrainCardRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      )

      // Connector line draws in
      gsap.fromTo(
        connectorRef.current,
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1,
          opacity: 1,
          duration: 1.2,
          delay: 0.8,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: connectorRef.current,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative py-28 md:py-36 overflow-hidden border-t border-[#333]"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      {/* Noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'url(/noise.gif)', backgroundSize: '128px' }}
      />

      {/* Decorative glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#e4ff57] rounded-full mix-blend-screen blur-[160px] opacity-[0.06]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#ffadad] rounded-full mix-blend-screen blur-[140px] opacity-[0.05]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div ref={headingRef} className="text-center mb-8">
          <p className="text-[#e4ff57] font-mono tracking-[0.3em] text-xs uppercase mb-6">
            // Beyond the Meme
          </p>
          <h2 className="text-[2.8rem] md:text-[5rem] lg:text-[6.5rem] leading-[0.85] font-black uppercase tracking-tighter drop-shadow-[4px_4px_0px_#1a1a1a]">
            Decentralized
            <br />
            <span className="text-[#ffadad]">Venture</span>{' '}
            <span className="text-[#e4ff57]">Capital</span>
          </h2>
        </div>

        <p
          ref={subtitleRef}
          className="text-center text-[#999] text-base md:text-lg max-w-3xl mx-auto mb-20 leading-relaxed"
        >
          $BRAIN isn&apos;t just a meme token &mdash; it&apos;s a{' '}
          <span className="text-white font-semibold">
            decentralized venture capital mechanism
          </span>{' '}
          powering the{' '}
          <span className="text-[#e4ff57] font-semibold">bags.fm</span>{' '}
          ecosystem. We build apps for bags to keep our machine working &mdash;
          even when volume is lacking.
        </p>

        {/* Two-column cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">
          {/* ─── bags.fm Ecosystem Card ─── */}
          <div ref={bagsCardRef}>
            <a
              href="https://bags.fm"
              target="_blank"
              rel="noopener noreferrer"
              className="group block h-full"
            >
              <div className="relative h-full rounded-2xl border-2 border-[#222] bg-[#111]/80 backdrop-blur-sm p-8 md:p-10 transition-all duration-500 hover:border-[#e4ff57]/40 hover:shadow-[0_0_40px_rgba(228,255,87,0.08)]">
                {/* Conic gradient border glow */}
                <div className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10"
                  style={{
                    background: 'conic-gradient(from 180deg, transparent 60%, #e4ff57 80%, transparent 100%)',
                    filter: 'blur(1px)',
                  }}
                />

                {/* Logo */}
                <div className="flex items-center gap-5 mb-8">
                  <div className="relative w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(228,255,87,0.15)] group-hover:shadow-[0_0_50px_rgba(228,255,87,0.25)] transition-shadow duration-500">
                    <Image
                      src="/art/bags-logo.png"
                      alt="bags.fm"
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
                      bags.fm
                    </h3>
                    <p className="text-[#e4ff57] font-mono text-xs tracking-widest uppercase mt-1">
                      The Ecosystem
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[#aaa] leading-relaxed mb-6">
                  bags.fm is the launchpad platform where $BRAIN lives and
                  thrives. Our treasury actively invests in the ecosystem,
                  building tools and applications that generate revenue and
                  drive volume &mdash; creating a self-sustaining flywheel for
                  holders.
                </p>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="rounded-xl bg-[#0d0d0d] border border-[#1a1a1a] p-4 text-center">
                    <p className="text-[#e4ff57] font-mono text-xs uppercase tracking-wider mb-1">
                      Role
                    </p>
                    <p className="text-white font-bold text-sm">VC Engine</p>
                  </div>
                  <div className="rounded-xl bg-[#0d0d0d] border border-[#1a1a1a] p-4 text-center">
                    <p className="text-[#e4ff57] font-mono text-xs uppercase tracking-wider mb-1">
                      Strategy
                    </p>
                    <p className="text-white font-bold text-sm">Build &amp; Earn</p>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 text-[#e4ff57] font-mono text-sm group-hover:gap-4 transition-all duration-300">
                  <span>Visit bags.fm</span>
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>
            </a>
          </div>

          {/* ─── PinkBrain LP Card ─── */}
          <div ref={pinkbrainCardRef}>
            <div className="relative h-full rounded-2xl border-2 border-[#222] bg-[#111]/80 backdrop-blur-sm p-8 md:p-10 transition-all duration-500 hover:border-[#ffadad]/40 hover:shadow-[0_0_40px_rgba(255,173,173,0.08)]">
              {/* Badge */}
              <div className="absolute -top-3 right-6 bg-[#ffadad] text-[#0d0d0d] font-mono text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-[0_0_20px_rgba(255,173,173,0.3)]">
                First App
              </div>

              {/* Logo — circular crop to isolate the PinkBrain circle */}
              <div className="flex items-center gap-5 mb-8">
                <div className="relative w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-full overflow-hidden border-4 border-[#ffadad]/30 shadow-[0_0_30px_rgba(255,173,173,0.15)]">
                  <Image
                    src="/art/pinkbrain-logo.jpg"
                    alt="PinkBrain LP"
                    fill
                    className="object-cover scale-[1.4]"
                    sizes="96px"
                  />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
                    PinkBrain <span className="text-[#ffadad]">LP</span>
                  </h3>
                  <p className="text-[#ffadad] font-mono text-xs tracking-widest uppercase mt-1">
                    App #001
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-[#aaa] leading-relaxed mb-6">
                Our first venture-built application for the bags ecosystem.
                PinkBrain LP generates liquidity and revenue flows that feed
                directly back into the $BRAIN treasury &mdash; proof that
                building beats waiting.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {['Revenue Generator', 'LP Management', 'Treasury Fed'].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="inline-block rounded-full bg-[#ffadad]/10 border border-[#ffadad]/20 text-[#ffadad] font-mono text-[10px] uppercase tracking-wider px-3 py-1"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>

              {/* Status + GitHub */}
              <div className="rounded-xl bg-[#0d0d0d] border border-[#1a1a1a] p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#e4ff57] shadow-[0_0_8px_#e4ff57] animate-pulse" />
                  <p className="text-white font-mono text-sm">
                    <span className="text-[#e4ff57]">Active</span> &mdash;
                    Building for the ecosystem
                  </p>
                </div>
                <a
                  href="https://github.com/kr8tiv-ai/PinkBrain-lp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-[#ffadad]/70 hover:text-[#ffadad] transition-colors"
                >
                  GitHub
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Connector line between cards ─── */}
        <div
          ref={connectorRef}
          className="hidden lg:block mx-auto mt-16 origin-center"
        >
          <div className="relative h-[2px] max-w-md mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-[#e4ff57]/0 via-[#e4ff57]/60 to-[#ffadad]/60 rounded-full" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#e4ff57]/0 via-[#e4ff57]/30 to-[#ffadad]/30 rounded-full blur-sm" />
            {/* Center glow dot */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
          </div>
        </div>

        {/* ─── Bottom tagline ─── */}
        <p className="text-center mt-16 text-[#555] font-mono text-xs tracking-[0.25em] uppercase">
          The machine never stops &mdash; volume or no volume
        </p>
      </div>
    </section>
  )
}
