'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import gsap from 'gsap'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useProposals, useCreateProposal, useProposalVote } from '@/hooks/useGovernance'
import type { ProposalWithTally } from '@/hooks/useGovernance'

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

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`
}

function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
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

// ─── Proposal Card ───────────────────────────────────────────────────────────

function ProposalCard({
  proposal,
  canVote,
  onVote,
  isVoting,
}: {
  proposal: ProposalWithTally
  canVote: boolean
  onVote: (proposalId: string, vote: 'yes' | 'no') => void
  isVoting: boolean
}) {
  const yesBarRef = useRef<HTMLDivElement>(null)
  const noBarRef = useRef<HTMLDivElement>(null)
  const countdown = useCountdown(proposal.votingEndsAt)
  const totalWeight = proposal.yesWeight + proposal.noWeight
  const yesPct = totalWeight > 0 ? (proposal.yesWeight / totalWeight) * 100 : 0
  const noPct = totalWeight > 0 ? (proposal.noWeight / totalWeight) * 100 : 0
  const isActive = proposal.status === 'active'
  const hasVoted = !!proposal.userVote

  useEffect(() => {
    if (yesBarRef.current) {
      gsap.to(yesBarRef.current, { width: `${yesPct}%`, duration: 1.2, ease: 'power2.out' })
    }
  }, [yesPct])

  useEffect(() => {
    if (noBarRef.current) {
      gsap.to(noBarRef.current, { width: `${noPct}%`, duration: 1.2, ease: 'power2.out' })
    }
  }, [noPct])

  return (
    <div
      data-wr-reveal
      className={`relative border transition-all duration-300 p-5
        ${isActive
          ? 'border-[#444]/25 hover:border-[#d4f000]/15 bg-[#0d0d0d]/60'
          : 'border-[#333]/20 bg-[#0a0a0a]/40 opacity-75'}
      `}
    >
      {/* Header row: title + status badge */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-mono text-[13px] font-bold text-white tracking-wide leading-snug">
          {proposal.title}
        </h3>
        <div className={`wr-tag wr-tag-glow shrink-0 ${
          isActive
            ? 'border-[#d4f000]/65 text-[#d4f000]'
            : 'border-[#ff9e9e]/65 text-[#ff9e9e]'
        }`}>
          {isActive ? 'ACTIVE' : 'CLOSED'}
        </div>
      </div>

      {/* Creator + timestamp */}
      <div className="font-mono text-[10px] text-[#bbb] tracking-[0.15em] uppercase mb-3 flex items-center gap-2">
        <span>{shortenAddress(proposal.createdBy)}</span>
        <span className="text-[#555]">|</span>
        <span>{formatTimestamp(proposal.createdAt)}</span>
      </div>

      {/* Description */}
      <p className="font-mono text-[10px] text-[#bbb] mb-3 leading-relaxed whitespace-pre-wrap">
        {proposal.description}
      </p>

      {/* Reference links */}
      {proposal.referenceLinks.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {proposal.referenceLinks.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#d4f000]/70 hover:text-[#d4f000] transition-colors inline-flex items-center gap-1"
            >
              {link.label} <span className="text-[9px]">&#8599;</span>
            </a>
          ))}
        </div>
      )}

      {/* Countdown */}
      {isActive && (
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e0e0e0] flex items-center gap-2 mb-3">
          <span className="text-[#d4f000]/55 wr-breathe" style={{ animationDuration: '4s' }}>&#9670;</span>
          <span>CLOSES IN:</span>
          <span className="tabular-nums text-[#d4f000] font-bold tracking-wider">
            {countdown}
          </span>
        </div>
      )}

      {/* YES vote bar */}
      <div className="mb-1">
        <div className="flex items-center justify-between mb-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#d4f000]/80 font-bold flex items-center gap-1.5">
            YES
            {proposal.userVote?.vote === 'yes' && (
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#d4f000]/90 border border-[#d4f000]/25 px-1.5 py-px">
                YOUR VOTE
              </span>
            )}
          </div>
          <div className="font-mono text-[10px] text-[#ccc] tracking-wide">
            <span className="text-[#d4f000]/80 font-bold">{formatWeight(proposal.yesWeight)}</span>
            <span className="text-[#bbb] mx-1">&#183;</span>
            <span>{yesPct.toFixed(1)}%</span>
            <span className="text-[#bbb] mx-1">&#183;</span>
            <span>{proposal.yesWallets} wallet{proposal.yesWallets !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="wr-vote-bar">
          <div ref={yesBarRef} className="wr-vote-bar-fill" style={{ width: 0 }} />
        </div>
      </div>

      {/* NO vote bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#ff9e9e]/80 font-bold flex items-center gap-1.5">
            NO
            {proposal.userVote?.vote === 'no' && (
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#ff9e9e]/90 border border-[#ff9e9e]/25 px-1.5 py-px">
                YOUR VOTE
              </span>
            )}
          </div>
          <div className="font-mono text-[10px] text-[#ccc] tracking-wide">
            <span className="text-[#ff9e9e]/80 font-bold">{formatWeight(proposal.noWeight)}</span>
            <span className="text-[#bbb] mx-1">&#183;</span>
            <span>{noPct.toFixed(1)}%</span>
            <span className="text-[#bbb] mx-1">&#183;</span>
            <span>{proposal.noWallets} wallet{proposal.noWallets !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="relative h-[3px] rounded-[3px] overflow-hidden" style={{ background: 'rgba(51, 51, 51, 0.22)' }}>
          <div
            ref={noBarRef}
            className="h-full rounded-[3px]"
            style={{
              width: 0,
              background: 'linear-gradient(90deg, #ff9e9e 0%, #ffb8b8 35%, #ff9e9e 65%, #ffb8b8 100%)',
              backgroundSize: '200% 100%',
            }}
          />
        </div>
      </div>

      {/* Vote buttons */}
      {canVote && !hasVoted && isActive && (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onVote(proposal.id, 'yes')}
            disabled={isVoting}
            className="wr-vote-btn"
          >
            {isVoting ? 'SIGNING...' : 'YES'}
          </button>
          <button
            onClick={() => onVote(proposal.id, 'no')}
            disabled={isVoting}
            className="wr-vote-btn"
            style={{ borderColor: 'rgba(255, 158, 158, 0.25)', color: '#ff9e9e' }}
          >
            {isVoting ? 'SIGNING...' : 'NO'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Create Proposal Form ────────────────────────────────────────────────────

function CreateProposalForm() {
  const { connected } = useWallet()
  const { setVisible } = useWalletModal()
  const createMutation = useCreateProposal()

  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [referenceLinks, setReferenceLinks] = useState<{ label: string; url: string }[]>([])
  const [duration, setDuration] = useState<3 | 7>(3)

  const resetForm = useCallback(() => {
    setTitle('')
    setDescription('')
    setReferenceLinks([])
    setDuration(3)
  }, [])

  const handleAddLink = useCallback(() => {
    if (referenceLinks.length >= 5) return
    setReferenceLinks(prev => [...prev, { label: '', url: '' }])
  }, [referenceLinks.length])

  const handleRemoveLink = useCallback((index: number) => {
    setReferenceLinks(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleLinkChange = useCallback((index: number, field: 'label' | 'url', value: string) => {
    setReferenceLinks(prev => prev.map((link, i) => i === index ? { ...link, [field]: value } : link))
  }, [])

  const handleSubmit = useCallback(() => {
    if (!title.trim() || !description.trim()) return
    const validLinks = referenceLinks.filter(l => l.label.trim() && l.url.trim())
    createMutation.mutate(
      { title: title.trim(), description: description.trim(), referenceLinks: validLinks, duration },
      {
        onSuccess: () => {
          resetForm()
          setIsOpen(false)
        },
      }
    )
  }, [title, description, referenceLinks, duration, createMutation, resetForm])

  return (
    <div className="px-5 lg:px-8 mb-6" data-wr-reveal>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="wr-vote-btn mb-4"
      >
        {isOpen ? 'CLOSE FORM' : 'NEW PROPOSAL'}
      </button>

      {isOpen && (
        <div className="border border-[#444]/25 bg-[#0d0d0d]/60 p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#bbb] block mb-1.5">
              TITLE ({title.length}/100)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))}
              placeholder="Proposal title..."
              className="w-full bg-[#111] border border-[#444]/30 focus:border-[#d4f000]/50 outline-none px-3 py-2 font-mono text-[12px] text-white tracking-wide placeholder:text-[#555] transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#bbb] block mb-1.5">
              DESCRIPTION ({description.length}/500)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              placeholder="Describe your proposal..."
              rows={4}
              className="w-full bg-[#111] border border-[#444]/30 focus:border-[#d4f000]/50 outline-none px-3 py-2 font-mono text-[12px] text-white tracking-wide placeholder:text-[#555] transition-colors resize-none"
            />
          </div>

          {/* Reference links */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#bbb] block mb-1.5">
              REFERENCE LINKS ({referenceLinks.length}/5)
            </label>
            {referenceLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => handleLinkChange(i, 'label', e.target.value)}
                  placeholder="Label"
                  className="flex-1 bg-[#111] border border-[#444]/30 focus:border-[#d4f000]/50 outline-none px-3 py-1.5 font-mono text-[11px] text-white tracking-wide placeholder:text-[#555] transition-colors"
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => handleLinkChange(i, 'url', e.target.value)}
                  placeholder="https://..."
                  className="flex-[2] bg-[#111] border border-[#444]/30 focus:border-[#d4f000]/50 outline-none px-3 py-1.5 font-mono text-[11px] text-white tracking-wide placeholder:text-[#555] transition-colors"
                />
                <button
                  onClick={() => handleRemoveLink(i)}
                  className="font-mono text-[10px] text-[#ff9e9e]/70 hover:text-[#ff9e9e] transition-colors px-2 py-1"
                >
                  &#10005;
                </button>
              </div>
            ))}
            {referenceLinks.length < 5 && (
              <button
                onClick={handleAddLink}
                className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#d4f000]/70 hover:text-[#d4f000] transition-colors"
              >
                + ADD LINK
              </button>
            )}
          </div>

          {/* Duration toggle */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#bbb] block mb-1.5">
              VOTING DURATION
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setDuration(3)}
                className={`wr-tag transition-all ${
                  duration === 3
                    ? 'border-[#d4f000]/65 text-[#d4f000] bg-[#d4f000]/[0.06]'
                    : 'border-[#444]/30 text-[#bbb] hover:border-[#d4f000]/25'
                }`}
              >
                3 DAYS
              </button>
              <button
                onClick={() => setDuration(7)}
                className={`wr-tag transition-all ${
                  duration === 7
                    ? 'border-[#d4f000]/65 text-[#d4f000] bg-[#d4f000]/[0.06]'
                    : 'border-[#444]/30 text-[#bbb] hover:border-[#d4f000]/25'
                }`}
              >
                7 DAYS
              </button>
            </div>
          </div>

          {/* Submit */}
          {!connected ? (
            <button
              onClick={() => setVisible(true)}
              className="wr-vote-btn w-full"
            >
              CONNECT WALLET
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending || !title.trim() || !description.trim()}
              className="wr-vote-btn w-full"
            >
              {createMutation.isPending ? 'SIGNING...' : 'CREATE PROPOSAL'}
            </button>
          )}

          {/* Error message */}
          {createMutation.isError && (
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#ff9e9e] mt-2">
              {createMutation.error?.message}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Proposals() {
  const sectionRef = useRef<HTMLElement>(null)
  const { publicKey, connected } = useWallet()
  const walletAddress = publicKey?.toBase58() ?? null

  const { data, isLoading } = useProposals(walletAddress)
  const voteMutation = useProposalVote()

  const proposals = data?.proposals ?? []
  const isReady = !isLoading && !!data

  // Sort: active first (newest first), then closed (newest first)
  const sortedProposals = [...proposals].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1
    if (a.status !== 'active' && b.status === 'active') return 1
    return b.createdAt - a.createdAt
  })

  useStaggerReveal(sectionRef, isReady)

  const handleVote = useCallback(
    (proposalId: string, vote: 'yes' | 'no') => {
      voteMutation.mutate({ proposalId, vote })
    },
    [voteMutation]
  )

  // Toast state
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
      className="w-full bg-[#0a0a0a] py-16 relative overflow-clip wr-section-fade-top wr-section-fade-bottom wr-noise wr-classified-border wr-vignette-corners"
      aria-label="Community proposals"
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
      <div className="wr-scan-line" style={{ animationDelay: '3s' }} />

      {/* Watermark */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[14rem] font-black text-white/[0.02] leading-none select-none pointer-events-none font-sans tracking-tighter wr-breathe wr-watermark" style={{ animationDuration: '6s' }}>
        CP
      </div>

      {/* Registration marks */}
      <div className="absolute top-4 left-4 text-[#bbb]/50 text-[11px] font-mono select-none pointer-events-none">+</div>
      <div className="absolute top-4 right-4 text-[#bbb]/50 text-[11px] font-mono select-none pointer-events-none">+</div>
      <div className="absolute bottom-4 left-4 text-[#bbb]/50 text-[11px] font-mono select-none pointer-events-none">+</div>
      <div className="absolute bottom-4 right-4 text-[#bbb]/50 text-[11px] font-mono select-none pointer-events-none">+</div>

      {/* Content */}
      <div className="relative z-10">
        {/* Section Header */}
        <div className="px-5 lg:px-8 mb-8" data-wr-reveal>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#d4f000]/80" />
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#d4f000] font-bold wr-section-num">
              COMMUNITY PROPOSALS
            </div>
            <div className="w-8 h-px bg-[#d4f000]/80" />
          </div>

          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white font-sans mb-3">
            Community Proposals
          </h2>
          <p className="font-mono text-[11px] text-[#bbb] tracking-[0.15em] uppercase">
            SUBMIT AND VOTE ON COMMUNITY-DRIVEN PROPOSALS &#8212; 1 BRAIN = 1 VOTE
          </p>
        </div>

        {/* Create Proposal Form */}
        <CreateProposalForm />

        {/* Proposals List */}
        <div className="px-5 lg:px-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#e0e0e0] font-bold mb-4 flex items-center gap-3">
            <span className="text-[#d4f000]/90 text-[12px]">&#9670;</span>
            <span>PROPOSALS ({sortedProposals.length})</span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#d4f000]/50 to-transparent" />
          </div>

          {sortedProposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16" data-wr-reveal>
              <div className="font-mono text-[12px] uppercase tracking-[0.3em] text-[#bbb]">
                NO PROPOSALS YET
              </div>
              <div className="wr-burn-bar w-36" style={{ height: '3px' }}>
                <div className="wr-burn-bar-fill" style={{ width: '0%' }} />
              </div>
              <div className="font-mono text-[10px] text-[#bbb] tracking-[0.2em]">
                BE THE FIRST TO CREATE A PROPOSAL
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {sortedProposals.map(proposal => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  canVote={connected}
                  onVote={handleVote}
                  isVoting={voteMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
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
