'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAdminResults, useAdminAction } from '@/hooks/useGovernance'
import type { CandidateWithTally } from '@/hooks/useGovernance'

// ─── Formatters ──────────────────────────────────────────────────────────────

function formatWeight(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

// ─── Duration Options ────────────────────────────────────────────────────────

const DURATIONS = [
  { label: '1 DAY', seconds: 86400 },
  { label: '3 DAYS', seconds: 259200 },
  { label: '7 DAYS', seconds: 604800 },
  { label: '14 DAYS', seconds: 1209600 },
]

// ─── Results Table ───────────────────────────────────────────────────────────

function ResultsTable({ candidates, totalWeight }: { candidates: CandidateWithTally[]; totalWeight: number }) {
  const sorted = [...candidates].sort((a, b) => b.voteWeight - a.voteWeight)

  return (
    <div className="border border-[#333]/15 divide-y divide-[#333]/10">
      <div className="grid grid-cols-4 gap-2 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#555]">
        <span>TOKEN</span>
        <span className="text-right">WALLETS</span>
        <span className="text-right">WEIGHT</span>
        <span className="text-right">%</span>
      </div>
      {sorted.map((c, i) => {
        const pct = totalWeight > 0 ? (c.voteWeight / totalWeight) * 100 : 0
        return (
          <div
            key={c.id}
            className={`grid grid-cols-4 gap-2 px-4 py-2.5 font-mono text-[11px] ${i === 0 && c.voteWeight > 0 ? 'bg-[#d4f000]/[0.03] text-white' : 'text-[#888]'}`}
          >
            <span className="font-bold tracking-wide">{c.symbol}</span>
            <span className="text-right tabular-nums">{c.voteCount}</span>
            <span className="text-right tabular-nums">{formatWeight(c.voteWeight)}</span>
            <span className="text-right tabular-nums text-[#d4f000]/60">{pct.toFixed(1)}%</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── New Round Form ──────────────────────────────────────────────────────────

function NewRoundForm({
  password,
  onCreated,
}: {
  password: string
  onCreated: () => void
}) {
  const [mints, setMints] = useState<string[]>(['', '', '', '', ''])
  const [duration, setDuration] = useState(604800)
  const [title, setTitle] = useState('')
  const [resolvedTokens, setResolvedTokens] = useState<{ mint: string; symbol: string; name: string }[]>([])
  const [isResolving, setIsResolving] = useState(false)
  const adminAction = useAdminAction(password)

  const updateMint = (index: number, value: string) => {
    const updated = [...mints]
    updated[index] = value.trim()
    setMints(updated)
    setResolvedTokens([]) // Clear resolved when mints change
  }

  const handleResolve = useCallback(async () => {
    const validMints = mints.filter(m => m.length > 20)
    if (validMints.length < 2) return
    setIsResolving(true)
    try {
      const res = await fetch('/api/governance/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify({ action: 'resolve-mints', mints: validMints }),
      })
      const data = await res.json()
      if (data.tokens) setResolvedTokens(data.tokens)
    } catch {
      // Ignore resolve errors
    }
    setIsResolving(false)
  }, [mints, password])

  const handleDeploy = useCallback(() => {
    const validMints = mints.filter(m => m.length > 20)
    if (validMints.length < 2) return
    adminAction.mutate(
      { action: 'create-round', mints: validMints, durationSeconds: duration, title: title || undefined },
      { onSuccess: onCreated }
    )
  }, [mints, duration, title, adminAction, onCreated])

  return (
    <div className="space-y-4">
      <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#666] font-bold flex items-center gap-3">
        <span className="text-[#d4f000]/30 text-[12px]">◆</span>
        <span>DEPLOY NEW ROUND</span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#d4f000]/15 to-transparent" />
      </div>

      {/* Title */}
      <input
        type="text"
        placeholder="Round title (optional)"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full bg-transparent border border-[#333]/20 px-3 py-2 font-mono text-[11px] text-[#888] placeholder-[#444] focus:border-[#d4f000]/30 focus:outline-none transition-colors"
      />

      {/* Mint inputs */}
      <div className="space-y-2">
        {mints.map((mint, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#555] w-3">{i + 1}</span>
            <input
              type="text"
              placeholder={`Token mint address ${i + 1}${i >= 2 ? ' (optional)' : ''}`}
              value={mint}
              onChange={e => updateMint(i, e.target.value)}
              className="flex-1 bg-transparent border border-[#333]/20 px-3 py-1.5 font-mono text-[10px] text-[#888] placeholder-[#444] focus:border-[#d4f000]/30 focus:outline-none transition-colors"
            />
            {resolvedTokens.find(t => t.mint === mint) && (
              <span className="font-mono text-[10px] text-[#d4f000]/60 font-bold min-w-[60px]">
                {resolvedTokens.find(t => t.mint === mint)?.symbol}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Resolve button */}
      <button
        onClick={handleResolve}
        disabled={isResolving || mints.filter(m => m.length > 20).length < 2}
        className="wr-vote-btn text-[10px]"
      >
        {isResolving ? 'RESOLVING...' : 'LOOKUP TOKEN NAMES'}
      </button>

      {/* Duration selector */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-[#555] tracking-wide">DURATION:</span>
        {DURATIONS.map(d => (
          <button
            key={d.seconds}
            onClick={() => setDuration(d.seconds)}
            className={`font-mono text-[10px] px-2 py-1 border transition-all duration-200 ${
              duration === d.seconds
                ? 'border-[#d4f000]/30 text-[#d4f000] bg-[#d4f000]/[0.05]'
                : 'border-[#333]/15 text-[#555] hover:border-[#555]/30'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Deploy */}
      <button
        onClick={handleDeploy}
        disabled={adminAction.isPending || mints.filter(m => m.length > 20).length < 2}
        className="wr-vote-btn w-full py-2.5 text-[11px] font-bold"
      >
        {adminAction.isPending ? 'DEPLOYING...' : 'DEPLOY ROUND'}
      </button>

      {adminAction.isError && (
        <div className="font-mono text-[10px] text-[#ff9e9e]">
          {adminAction.error?.message}
        </div>
      )}
    </div>
  )
}

// ─── Main Admin Panel ────────────────────────────────────────────────────────

export default function GovernanceAdmin() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')

  const { data, refetch } = useAdminResults(authenticated ? password : null)

  const handleAuth = useCallback(async () => {
    setAuthError('')
    try {
      const res = await fetch('/api/governance/admin', {
        headers: { 'x-admin-password': passwordInput },
      })
      if (res.ok) {
        setPassword(passwordInput)
        setAuthenticated(true)
        sessionStorage.setItem('gov-admin', passwordInput)
      } else {
        setAuthError('INVALID CREDENTIALS')
      }
    } catch {
      setAuthError('CONNECTION FAILED')
    }
  }, [passwordInput])

  // Auto-restore from session on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('gov-admin')
      if (stored) {
        setPassword(stored)
        setPasswordInput(stored)
        setAuthenticated(true)
      }
    } catch {
      // sessionStorage unavailable (SSR)
    }
  }, [])

  const adminAction = useAdminAction(password)

  const handleEndRound = useCallback(() => {
    adminAction.mutate({ action: 'end-round' }, {
      onSuccess: () => refetch(),
    })
  }, [adminAction, refetch])

  return (
    <section className="w-full bg-[#0a0a0a] py-12 relative overflow-hidden border-t border-[#333]/10">
      <div className="relative z-10 px-5 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-px bg-[#ff9e9e]/30" />
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#ff9e9e]/50 font-bold">
            ADMIN CONTROL
          </div>
          <div className="w-6 h-px bg-[#ff9e9e]/30" />
        </div>

        {!authenticated ? (
          /* Password gate */
          <div className="max-w-sm">
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Admin password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAuth()}
                className="flex-1 bg-transparent border border-[#333]/20 px-3 py-2 font-mono text-[11px] text-[#888] placeholder-[#444] focus:border-[#ff9e9e]/30 focus:outline-none transition-colors"
              />
              <button onClick={handleAuth} className="wr-vote-btn border-[#ff9e9e]/20 text-[#ff9e9e]/70 hover:border-[#ff9e9e]/40 hover:text-[#ff9e9e]">
                AUTHENTICATE
              </button>
            </div>
            {authError && (
              <div className="font-mono text-[10px] text-[#ff9e9e] mt-2">{authError}</div>
            )}
          </div>
        ) : (
          /* Admin Dashboard */
          <div className="space-y-8">
            {/* Current Round Status */}
            {data?.round ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-[12px] text-white font-bold tracking-wide">
                      {data.round.title}
                    </div>
                    <div className="font-mono text-[10px] text-[#555] mt-1">
                      Status: <span className={data.round.status === 'active' ? 'text-[#d4f000]' : 'text-[#ff9e9e]'}>{data.round.status.toUpperCase()}</span>
                      <span className="mx-2 text-[#333]">·</span>
                      {data.totalVoters} voters
                      <span className="mx-2 text-[#333]">·</span>
                      {formatWeight(data.totalWeight)} weight
                    </div>
                  </div>
                  {data.round.status === 'active' && (
                    <button
                      onClick={handleEndRound}
                      disabled={adminAction.isPending}
                      className="wr-vote-btn border-[#ff9e9e]/20 text-[#ff9e9e]/70 hover:border-[#ff9e9e]/40 hover:text-[#ff9e9e] text-[10px]"
                    >
                      {adminAction.isPending ? 'ENDING...' : 'END ROUND'}
                    </button>
                  )}
                </div>

                {/* Results */}
                <ResultsTable candidates={data.candidates} totalWeight={data.totalWeight} />
              </div>
            ) : (
              <div className="font-mono text-[11px] text-[#555] tracking-wide">
                NO ACTIVE ROUND
              </div>
            )}

            {/* New Round Form */}
            <NewRoundForm password={password} onCreated={() => refetch()} />

            {/* Logout */}
            <button
              onClick={() => {
                setAuthenticated(false)
                setPassword('')
                setPasswordInput('')
                sessionStorage.removeItem('gov-admin')
              }}
              className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#555] hover:text-[#ff9e9e] transition-colors"
            >
              DISCONNECT ADMIN
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
