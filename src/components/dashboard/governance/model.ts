import { PublicKey } from '@solana/web3.js'

export const SELL_PROPOSAL_TYPE = 1
export const PASSING_SELL_OPTION_INDEX = 0

export const PROPOSAL_STATUS = {
  Active: 0,
  Passed: 1,
  Rejected: 2,
  Cancelled: 3,
} as const

export type ExecuteEligibilityReason =
  | 'executable'
  | 'status_not_passed'
  | 'unsupported_type'
  | 'already_executed'
  | 'options_invalid'
  | 'vote_counts_invalid'
  | 'winning_option_missing'
  | 'winning_option_out_of_range'
  | 'winning_option_not_sell'

export interface ProposalLike {
  id: number
  status: number
  proposalType: number
  options: string[]
  voteCounts: Array<number | bigint>
  winningOptionIndex: number
  executed: boolean
}

export interface ExecuteEligibility {
  executable: boolean
  reason: ExecuteEligibilityReason
}

export interface OwnerGateResult {
  isOwner: boolean
  reason: 'owner_verified' | 'wallet_missing' | 'owner_data_unavailable' | 'owner_mismatch'
}

export interface CreateProposalDraft {
  title: string
  options: string[]
  votingStarts: number
  votingEnds: number
}

export interface ProposalPresentation {
  statusLabel: string
  statusTone: 'active' | 'passed' | 'rejected' | 'cancelled' | 'unknown'
  execute: ExecuteEligibility
}

export function deriveExecuteEligibility(proposal: ProposalLike): ExecuteEligibility {
  if (proposal.status !== PROPOSAL_STATUS.Passed) {
    return { executable: false, reason: 'status_not_passed' }
  }

  if (proposal.proposalType !== SELL_PROPOSAL_TYPE) {
    return { executable: false, reason: 'unsupported_type' }
  }

  if (proposal.executed) {
    return { executable: false, reason: 'already_executed' }
  }

  if (!Array.isArray(proposal.options) || proposal.options.length < 2) {
    return { executable: false, reason: 'options_invalid' }
  }

  if (!Array.isArray(proposal.voteCounts) || proposal.voteCounts.length !== proposal.options.length) {
    return { executable: false, reason: 'vote_counts_invalid' }
  }

  if (!Number.isInteger(proposal.winningOptionIndex)) {
    return { executable: false, reason: 'winning_option_missing' }
  }

  if (proposal.winningOptionIndex < 0 || proposal.winningOptionIndex >= proposal.options.length) {
    return { executable: false, reason: 'winning_option_out_of_range' }
  }

  if (proposal.winningOptionIndex !== PASSING_SELL_OPTION_INDEX) {
    return { executable: false, reason: 'winning_option_not_sell' }
  }

  return { executable: true, reason: 'executable' }
}

export function getProposalStatusLabel(status: number): string {
  switch (status) {
    case PROPOSAL_STATUS.Active:
      return 'ACTIVE'
    case PROPOSAL_STATUS.Passed:
      return 'PASSED'
    case PROPOSAL_STATUS.Rejected:
      return 'REJECTED'
    case PROPOSAL_STATUS.Cancelled:
      return 'CANCELLED'
    default:
      return 'UNKNOWN'
  }
}

export function getProposalPresentation(proposal: ProposalLike): ProposalPresentation {
  const statusLabel = getProposalStatusLabel(proposal.status)
  const execute = deriveExecuteEligibility(proposal)

  const statusTone: ProposalPresentation['statusTone'] =
    proposal.status === PROPOSAL_STATUS.Active
      ? 'active'
      : proposal.status === PROPOSAL_STATUS.Passed
        ? 'passed'
        : proposal.status === PROPOSAL_STATUS.Rejected
          ? 'rejected'
          : proposal.status === PROPOSAL_STATUS.Cancelled
            ? 'cancelled'
            : 'unknown'

  return {
    statusLabel,
    statusTone,
    execute,
  }
}

export function evaluateOwnerGate(poolOwner: string | null | undefined, walletAddress: string | null | undefined): OwnerGateResult {
  if (!walletAddress) {
    return { isOwner: false, reason: 'wallet_missing' }
  }

  if (!poolOwner) {
    return { isOwner: false, reason: 'owner_data_unavailable' }
  }

  try {
    const ownerKey = new PublicKey(poolOwner).toBase58()
    const walletKey = new PublicKey(walletAddress).toBase58()

    if (ownerKey === walletKey) {
      return { isOwner: true, reason: 'owner_verified' }
    }

    return { isOwner: false, reason: 'owner_mismatch' }
  } catch {
    return { isOwner: false, reason: 'owner_data_unavailable' }
  }
}

export function validateCreateProposalDraft(draft: CreateProposalDraft): string[] {
  const errors: string[] = []
  const trimmedTitle = draft.title.trim()
  const trimmedOptions = draft.options.map((option) => option.trim()).filter(Boolean)

  if (!trimmedTitle) {
    errors.push('empty_title')
  }

  if (trimmedOptions.length < 2) {
    errors.push('insufficient_options')
  }

  if (draft.options.some((option) => !option.trim())) {
    errors.push('empty_option')
  }

  if (!Number.isFinite(draft.votingStarts) || !Number.isFinite(draft.votingEnds)) {
    errors.push('invalid_voting_window')
    return errors
  }

  if (draft.votingStarts >= draft.votingEnds) {
    errors.push('invalid_voting_bounds')
  }

  return errors
}

export function validateVoteOptionIndex(optionIndex: number, optionCount: number): string[] {
  if (!Number.isInteger(optionIndex)) {
    return ['invalid_option_index']
  }

  if (optionIndex < 0 || optionIndex >= optionCount) {
    return ['option_index_out_of_range']
  }

  return []
}

export function executeEligibilityLabel(reason: ExecuteEligibilityReason): string {
  switch (reason) {
    case 'executable':
      return 'READY FOR GOVERNANCE EXECUTION'
    case 'status_not_passed':
      return 'NOT PASSED'
    case 'unsupported_type':
      return 'NON-SELL PROPOSAL'
    case 'already_executed':
      return 'ALREADY EXECUTED'
    case 'options_invalid':
      return 'OPTIONS INVALID'
    case 'vote_counts_invalid':
      return 'VOTE DATA INVALID'
    case 'winning_option_missing':
      return 'WINNING OPTION UNKNOWN'
    case 'winning_option_out_of_range':
      return 'WINNING OPTION INVALID'
    case 'winning_option_not_sell':
      return 'SELL OPTION DID NOT WIN'
    default:
      return 'NOT EXECUTABLE'
  }
}
