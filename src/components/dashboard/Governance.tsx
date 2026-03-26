'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import gsap from 'gsap'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useGovernanceResults, useVote } from '@/hooks/useGovernance'
import type { CandidateWithTally } from '@/hooks/useGovernance'

// ─── Formatters ──────────────────────────────────────────────────────────────

function formatWeight(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function formatCountdown(closesAt: number): string {
  const diff = closesAt - Math.floor(Date.now() / 1000)
  if (diff <= 0) return '00:00:00:00'
  const d = Math.floor(diff / 86400)
  const h = Math.floor((diff % 86400) / 3600)
  const m = Math.floor((diff % 3600) / 60)
  const s = diff % 60
  return `${String(d).padStart(2, '0')}:${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ─── Countdown Hook ──────────────────────────────────────────────────────────

function useCountdown(closesAt: number) {
  const [time, setTime] = useState(() => formatCountdown(closesAt))
  useEffect(() => {
    const iv = setInterval(() => setTime(formatCountdown(closesAt)), 1000)
    return () => clearInterval(iv)
  }, [closesAt])
  return time
}

// ─── GSAP Stagger Reveal ─────────────────────────────────────────────────────

function useStaggerReveal(
  containerRef: React.RefObject<HTMLElement | null>,
  ready: boolean
) {
  useEffect(() => {
    if (!ready || !containerRef.current) return
    const els = containerRef.current.querySelectorAll('[data-wr-reveal]')
    if (!els.length) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        els,
        { y: 24, opacity: 0, scale: 0.97, filter: 'blur(3px)' },
        { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out', stagger: 0.08 }
      )
    }, containerRef)
    return () => ctx.revert()
  }, [ready, containerRef])
}

// ─── Candidate Card ──────────────────────────────────────────────────────────

function CandidateCard({
  candidate,
  totalWeight,
  isUserVote,
  canVote,
  onVote,
  isVoting,
}: {
  candidate: CandidateWithTally
  totalWeight: number
  isUserVote: boolean
  canVote: boolean
  onVote: (id: string) => void
  isVoting: boolean
}) {
  const barRef = useRef<HTMLDivElement>(null)
  const pct = totalWeight > 0 ? (candidate.voteWeight / totalWeight) * 100 : 0

  useEffect(() => {
    if (!barRef.current) return
    gsap.to(barRef.current, { width: `${pct}%`, duration: 1.2, ease: 'power2.out' })
  }, [pct])

  return (
    <div
      data-wr-reveal
      className={`relative border transition-all duration-300 p-4 group/card
        ${isUserVote
          ? 'border-[#d4f000]/30 bg-[#d4f000]/[0.04]'
          : 'border-[#333]/15 hover:border-[#d4f000]/15 bg-[#0d0d0d]/60'}
      `}
    >
      {/* Token symbol + name */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="font-mono text-[14px] font-black text-white tracking-wide">
            {candidate.symbol}
          </span>
          <span className="font-mono text-[11px] text-[#666] ml-2 tracking-wide">
            {candidate.name}
          </span>
        </div>
        {isUserVote && (
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#d4f000]/70 border border-[#d4f000]/25 px-2 py-0.5">
            YOUR VOTE
          </div>
        )}
      </div>

      {/* Description */}
      {candidate.description && (
        <p className="font-mono text-[10px] text-[#555] mb-3 leading-relaxed">
          {candidate.description}
        </p>
      )}

      {/* Vote bar */}
      <div className="wr-vote-bar mb-2">
        <div ref={barRef} className="wr-vote-bar-fill" style={{ width: 0 }} />
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between mb-3">
        <div className="font-mono text-[10px] text-[#666] tracking-wide">
          <span className="text-[#d4f000]/60 font-bold">{formatWeight(candidate.voteWeight)}</span>
          <span className="text-[#444] mx-1">·</span>
          <span>{pct.toFixed(1)}%</span>
        </div>
        <div className="font-mono text-[10px] text-[#555]">
          {candidate.voteCount} wallet{candidate.voteCount !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Vote button */}
      {canVote && !isUserVote && (
        <button
          onClick={() => onVote(candidate.id)}
          disabled={isVoting}
          className="wr-vote-btn w-full"
        >
          {isVoting ? 'SIGNING...' : 'CAST VOTE'}
        </button>
      )}
    </div>
  )
}

// ─── No Round State ──────────────────────────────────────────────────────────

function NoActiveRound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="font-mono text-[12px] uppercase tracking-[0.3em] text-[#555]">
        NO ACTIVE VOTING ROUND
      </div>
      <div className="wr-burn-bar w-36" style={{ height: '3px' }}>
        <div className="wr-burn-bar-fill" style={{ width: '0%' }} />
      </div>
      <div className="font-mono text-[10px] text-[#444] tracking-[0.2em]">
        NEXT ROUND PENDING DEPLOYMENT
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Governance() {
  const sectionRef = useRef<HTMLElement>(null)
  const { publicKey, connected } = useWallet()
  const { setVisible } = useWalletModal()
  const walletAddress = publicKey?.toBase58() ?? null

  const { data, isLoading } = useGovernanceResults(walletAddress)
  const voteMutation = useVote()

  const round = data?.round
  const countdown = useCountdown(round?.votingClosesAt ?? 0)
  const isReady = !isLoading && !!data
  const isActive = round?.status === 'active'
  const userHasVoted = !!data?.userVote

  useStaggerReveal(sectionRef, isReady)

  const handleVote = useCallback(
    (candidateId: string) => {
      if (!round) return
      voteMutation.mutate({ candidateId, roundId: round.id })
    },
    [voteMutation, round]
  )

  // Toast auto-dismiss
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    if (voteMutation.isSuccess) {
      setToastMsg(`VOTE RECORDED — ${formatWeight(voteMutation.data?.weight ?? 0)} BRAIN WEIGHT`)
      setToastType('success')
      setShowToast(true)
      const t = setTimeout(() => setShowToast(false), 5000)
      return () => clearTimeout(t)
    }
  }, [voteMutation.isSuccess, voteMutation.data])

  useEffect(() => {
    if (voteMutation.isError) {
      setToastMsg(voteMutation.error?.message ?? 'VOTE FAILED')
      setToastType('error')
      setShowToast(true)
      const t = setTimeout(() => setShowToast(false), 5000)
      return () => clearTimeout(t)
    }
  }, [voteMutation.isError, voteMutation.error])

  return (
    <section
      ref={sectionRef}
      className="w-full bg-[#0a0a0a] py-16 relative overflow-hidden wr-section-fade-top wr-section-fade-bottom wr-noise wr-classified-border wr-vignette-corners"
      aria-label="Governance voting"
    >
      {/* Atmospheric layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <video
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-[0.08] mix-blend-screen"
          src="/videos/war-room-bg.mp4"
        />
        <div className="absolute inset-0 bg-[#0a0a0a]/65" />
      </div>
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 26px, rgba(255,255,255,0.06) 26px, rgba(255,255,255,0.06) 27px)' }}
      />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_40%_40%_at_50%_50%,rgba(212,240,0,0.03),transparent_70%)]" />
      <div className="wr-scan-line" style={{ animationDelay: '2s' }} />

      {/* Watermark */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[14rem] font-black text-white/[0.02] leading-none select-none pointer-events-none font-sans tracking-tighter wr-breathe wr-watermark" style={{ animationDuration: '6s' }}>
        03
      </div>

      {/* Registration marks */}
      <div className="absolute top-4 left-4 text-[#333]/35 text-[11px] font-mono select-none pointer-events-none">+</div>
      <div className="absolute top-4 right-4 text-[#333]/35 text-[11px] font-mono select-none pointer-events-none">+</div>
      <div className="absolute bottom-4 left-4 text-[#333]/35 text-[11px] font-mono select-none pointer-events-none">+</div>
      <div className="absolute bottom-4 right-4 text-[#333]/35 text-[11px] font-mono select-none pointer-events-none">+</div>

      {/* Content */}
      <div className="relative z-10">
        {/* Section Header */}
        <div className="px-5 lg:px-8 mb-8" data-wr-reveal>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#d4f000]/40" />
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#d4f000]/70 font-bold wr-section-num">
              SECTION 03 — GOVERNANCE
            </div>
            <div className="w-8 h-px bg-[#d4f000]/40" />
          </div>

          {round ? (
            <>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white font-sans mb-3">
                {round.title}
              </h2>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <div className={`wr-tag wr-tag-glow ${
                  isActive
                    ? 'border-[#d4f000]/30 text-[#d4f000]/70'
                    : round.status === 'closed'
                      ? 'border-[#ff9e9e]/30 text-[#ff9e9e]/70'
                      : 'border-[#555]/30 text-[#555]'
                }`}>
                  {round.status === 'active' ? 'ACTIVE' : round.status === 'closed' ? 'CLOSED' : 'UPCOMING'}
                </div>
                <span className="w-1 h-px bg-[#555]/25" />
                <div className="wr-tag wr-tag-glow border-[#ff9e9e]/30 text-[#ff9e9e]/60">
                  {round.treasuryAmount}
                </div>
              </div>

              {/* Countdown */}
              {isActive && (
                <div className="font-mono text-[12px] uppercase tracking-[0.25em] text-[#888] flex items-center gap-2">
                  <span className="text-[#d4f000]/30 wr-breathe" style={{ animationDuration: '4s' }}>◆</span>
                  <span>TIME REMAINING:</span>
                  <span className="tabular-nums text-[#d4f000] font-bold tracking-wider">
                    {countdown}
                  </span>
                </div>
              )}
            </>
          ) : (
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#555] font-sans">
              Treasury Purchase Vote
            </h2>
          )}
        </div>

        {/* Wallet Connection Bar */}
        <div className="px-5 lg:px-8 mb-6" data-wr-reveal>
          <div className="flex items-center gap-4 py-3 border-t border-b border-[#333]/10">
            {connected ? (
              <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d4f000] wr-breathe" style={{ boxShadow: '0 0 5px #d4f000', animationDuration: '3s' }} />
                  <span className="text-[#d4f000]/70">CONNECTED</span>
                </div>
                <span className="text-[#555]">{walletAddress?.slice(0, 4)}...{walletAddress?.slice(-4)}</span>
                {userHasVoted && (
                  <span className="wr-tag border-[#d4f000]/25 text-[#d4f000]/60 text-[9px]">VOTED</span>
                )}
              </div>
            ) : (
              <button
                onClick={() => setVisible(true)}
                className="wr-vote-btn"
              >
                CONNECT WALLET TO VOTE
              </button>
            )}
          </div>
        </div>

        {/* Candidates or empty state */}
        {!round ? (
          <NoActiveRound />
        ) : (
          <>
            {/* Candidate Grid */}
            <div className="px-5 lg:px-8">
              <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#666] font-bold mb-4 flex items-center gap-3">
                <span className="text-[#d4f000]/30 text-[12px]">◆</span>
                <span>CANDIDATES</span>
                <div className="flex-1 h-px bg-gradient-to-r from-[#d4f000]/15 to-transparent" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data?.candidates.map(candidate => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    totalWeight={data.totalWeight}
                    isUserVote={data.userVote?.candidateId === candidate.id}
                    canVote={connected && !userHasVoted && isActive}
                    onVote={handleVote}
                    isVoting={voteMutation.isPending}
                  />
                ))}
              </div>
            </div>

            {/* Results Summary */}
            <div className="px-5 lg:px-8 mt-6" data-wr-reveal>
              <div className="flex flex-wrap items-center gap-5 font-mono text-[11px] uppercase tracking-[0.15em] text-[#666] py-3 border-t border-[#333]/10">
                <span className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-[#d4f000]/25 rounded-full" />
                  {data?.totalVoters ?? 0} WALLETS
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-[#d4f000]/25 rounded-full" />
                  {formatWeight(data?.totalWeight ?? 0)} TOTAL VOTES
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-[#ff9e9e]/20 rounded-full" />
                  1 BRAIN = 1 VOTE
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Toast */}
      {showToast && (
        <div className={`fixed bottom-6 right-6 z-50 font-mono text-[11px] uppercase tracking-[0.2em] px-4 py-3 border
          ${toastType === 'success'
            ? 'text-[#d4f000] bg-[#0a0a0a] border-[#d4f000]/30'
            : 'text-[#ff9e9e] bg-[#0a0a0a] border-[#ff9e9e]/30'}
        `}>
          {toastMsg}
        </div>
      )}
    </section>
  )
}
