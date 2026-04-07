'use client'

import { useMemo, useState } from 'react'
import {
  SELL_PROPOSAL_TYPE,
  validateCreateProposalDraft,
  type CreateProposalDraft,
} from './model'

interface CreateProposalPanelProps {
  isOwner: boolean
  ownerGateReason: string
  walletConnected: boolean
  isSubmitting: boolean
  onConnectWallet: () => void
  onSubmit: (payload: {
    title: string
    descriptionUri: string
    proposalType: number
    options: string[]
    votingStarts: number
    votingEnds: number
  }) => Promise<unknown>
}

const DEFAULT_OPTIONS = ['EXECUTE SELL', 'KEEP POSITION OPEN']

function toLocalDateTimeInput(tsSeconds: number): string {
  const date = new Date(tsSeconds * 1000)
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 16)
}

function parseInputToUnix(value: string): number {
  const ms = Date.parse(value)
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : Number.NaN
}

function createValidationMessage(code: string): string {
  switch (code) {
    case 'empty_title':
      return 'TITLE IS REQUIRED.'
    case 'insufficient_options':
      return 'AT LEAST TWO OPTIONS ARE REQUIRED.'
    case 'empty_option':
      return 'OPTION LABELS CANNOT BE EMPTY.'
    case 'invalid_voting_window':
      return 'VOTING WINDOW IS NOT A VALID TIMESTAMP.'
    case 'invalid_voting_bounds':
      return 'VOTING END TIME MUST BE AFTER START TIME.'
    default:
      return 'PROPOSAL INPUT FAILED VALIDATION.'
  }
}

export default function CreateProposalPanel({
  isOwner,
  ownerGateReason,
  walletConnected,
  isSubmitting,
  onConnectWallet,
  onSubmit,
}: CreateProposalPanelProps) {
  const now = Math.floor(Date.now() / 1000)
  const [title, setTitle] = useState('')
  const [descriptionUri, setDescriptionUri] = useState('')
  const [optionA, setOptionA] = useState(DEFAULT_OPTIONS[0])
  const [optionB, setOptionB] = useState(DEFAULT_OPTIONS[1])
  const [votingStartsInput, setVotingStartsInput] = useState(toLocalDateTimeInput(now + 300))
  const [votingEndsInput, setVotingEndsInput] = useState(toLocalDateTimeInput(now + 86_400))
  const [validationMessage, setValidationMessage] = useState<string | null>(null)

  const draft: CreateProposalDraft = useMemo(
    () => ({
      title,
      options: [optionA, optionB],
      votingStarts: parseInputToUnix(votingStartsInput),
      votingEnds: parseInputToUnix(votingEndsInput),
    }),
    [title, optionA, optionB, votingStartsInput, votingEndsInput]
  )

  const validationErrors = validateCreateProposalDraft(draft)

  const handleCreate = async () => {
    if (!isOwner) return

    if (validationErrors.length > 0) {
      setValidationMessage(createValidationMessage(validationErrors[0]))
      return
    }

    setValidationMessage(null)

    await onSubmit({
      title: title.trim(),
      descriptionUri: descriptionUri.trim() || 'https://pinkyandthebrain.fun/war-room',
      proposalType: SELL_PROPOSAL_TYPE,
      options: [optionA.trim(), optionB.trim()],
      votingStarts: draft.votingStarts,
      votingEnds: draft.votingEnds,
    })

    setTitle('')
    setDescriptionUri('')
    setOptionA(DEFAULT_OPTIONS[0])
    setOptionB(DEFAULT_OPTIONS[1])
  }

  return (
    <section className="mt-6 border border-[#333]/40 rounded-sm bg-[#0d0d0d]/60 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="font-mono text-[10px] text-[#d4f000]/60 tracking-[0.2em] tabular-nums">07</span>
        <div className="w-3 h-px bg-[#d4f000]/30" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#888] font-bold">
          OWNER PROPOSAL CONTROLS
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#333]/40 to-transparent" />
      </div>

      {!isOwner ? (
        <div className="border border-[#444]/30 bg-[#0a0a0a]/70 rounded-sm px-4 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-[#777]">
          OWNER ACTIONS LOCKED ({ownerGateReason.replace(/_/g, ' ').toUpperCase()})
        </div>
      ) : !walletConnected ? (
        <button onClick={onConnectWallet} className="wr-vote-btn w-full">
          CONNECT OWNER WALLET
        </button>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[#777] mb-1.5">
              PROPOSAL TITLE
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={80}
              placeholder="SELL PROPOSAL TITLE"
              className="w-full font-mono text-[12px] text-[#ddd] bg-[#0a0a0a] border border-[#333]/40 rounded-sm px-3 py-2 placeholder-[#555] focus:border-[#d4f000]/35 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[#777] mb-1.5">
              DESCRIPTION URI
            </label>
            <input
              value={descriptionUri}
              onChange={(event) => setDescriptionUri(event.target.value)}
              placeholder="https://..."
              className="w-full font-mono text-[12px] text-[#ddd] bg-[#0a0a0a] border border-[#333]/40 rounded-sm px-3 py-2 placeholder-[#555] focus:border-[#d4f000]/35 outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[#777] mb-1.5">
                OPTION 1 (SELL)
              </label>
              <input
                value={optionA}
                onChange={(event) => setOptionA(event.target.value)}
                className="w-full font-mono text-[12px] text-[#ddd] bg-[#0a0a0a] border border-[#333]/40 rounded-sm px-3 py-2 placeholder-[#555] focus:border-[#d4f000]/35 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[#777] mb-1.5">
                OPTION 2 (NO SELL)
              </label>
              <input
                value={optionB}
                onChange={(event) => setOptionB(event.target.value)}
                className="w-full font-mono text-[12px] text-[#ddd] bg-[#0a0a0a] border border-[#333]/40 rounded-sm px-3 py-2 placeholder-[#555] focus:border-[#d4f000]/35 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[#777] mb-1.5">
                VOTING START
              </label>
              <input
                type="datetime-local"
                value={votingStartsInput}
                onChange={(event) => setVotingStartsInput(event.target.value)}
                className="w-full font-mono text-[12px] text-[#ddd] bg-[#0a0a0a] border border-[#333]/40 rounded-sm px-3 py-2 focus:border-[#d4f000]/35 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[#777] mb-1.5">
                VOTING END
              </label>
              <input
                type="datetime-local"
                value={votingEndsInput}
                onChange={(event) => setVotingEndsInput(event.target.value)}
                className="w-full font-mono text-[12px] text-[#ddd] bg-[#0a0a0a] border border-[#333]/40 rounded-sm px-3 py-2 focus:border-[#d4f000]/35 outline-none transition-colors"
              />
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={isSubmitting}
            className="w-full font-mono text-[11px] sm:text-[12px] uppercase tracking-[0.2em] font-bold border border-[#d4f000]/30 text-[#d4f000] bg-[#d4f000]/[0.03] hover:bg-[#d4f000]/[0.08] rounded-sm px-6 py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '◇ SUBMITTING PROPOSAL...' : '◆ CREATE SELL PROPOSAL'}
          </button>

          {validationMessage && (
            <div className="font-mono text-[10px] text-[#ff9e9e] uppercase tracking-[0.15em]">
              {validationMessage}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
