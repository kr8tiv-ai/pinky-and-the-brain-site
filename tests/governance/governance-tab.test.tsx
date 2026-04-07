import { describe, expect, it } from 'vitest'
import {
  deriveExecuteEligibility,
  evaluateOwnerGate,
  getProposalPresentation,
  validateCreateProposalDraft,
  validateVoteOptionIndex,
} from '../../src/components/dashboard/governance/model'

describe('governance tab model', () => {
  it('gates owner controls to verified owner wallet only', () => {
    const owner = '7r9RJw6gWbj6s1N9pGKrdzzd5H7oK1sauuwkUDVKBAGS'
    const sameWallet = '7r9RJw6gWbj6s1N9pGKrdzzd5H7oK1sauuwkUDVKBAGS'
    const nonOwnerWallet = '5o2uBwvKUy4oF78ziR4tEiqz59k7XBXuZBwiZFqCfca2'

    expect(evaluateOwnerGate(owner, sameWallet)).toEqual({
      isOwner: true,
      reason: 'owner_verified',
    })

    expect(evaluateOwnerGate(owner, nonOwnerWallet)).toEqual({
      isOwner: false,
      reason: 'owner_mismatch',
    })

    expect(evaluateOwnerGate('not-a-public-key', sameWallet)).toEqual({
      isOwner: false,
      reason: 'owner_data_unavailable',
    })
  })

  it('marks only passed unexecuted SELL proposals as executable', () => {
    const executable = deriveExecuteEligibility({
      id: 9,
      status: 1,
      proposalType: 1,
      options: ['SELL', 'KEEP'],
      voteCounts: [BigInt(100), BigInt(12)],
      winningOptionIndex: 0,
      executed: false,
    })

    expect(executable).toEqual({
      executable: true,
      reason: 'executable',
    })

    const rejected = deriveExecuteEligibility({
      id: 10,
      status: 2,
      proposalType: 1,
      options: ['SELL', 'KEEP'],
      voteCounts: [BigInt(10), BigInt(12)],
      winningOptionIndex: 1,
      executed: false,
    })

    expect(rejected).toEqual({
      executable: false,
      reason: 'status_not_passed',
    })

    const alreadyExecuted = deriveExecuteEligibility({
      id: 11,
      status: 1,
      proposalType: 1,
      options: ['SELL', 'KEEP'],
      voteCounts: [BigInt(200), BigInt(20)],
      winningOptionIndex: 0,
      executed: true,
    })

    expect(alreadyExecuted).toEqual({
      executable: false,
      reason: 'already_executed',
    })

    const noSellWin = deriveExecuteEligibility({
      id: 12,
      status: 1,
      proposalType: 1,
      options: ['SELL', 'KEEP'],
      voteCounts: [BigInt(20), BigInt(200)],
      winningOptionIndex: 1,
      executed: false,
    })

    expect(noSellWin).toEqual({
      executable: false,
      reason: 'winning_option_not_sell',
    })
  })

  it('validates malformed proposal creation input', () => {
    const invalid = validateCreateProposalDraft({
      title: '   ',
      options: ['SELL', '   '],
      votingStarts: 200,
      votingEnds: 100,
    })

    expect(invalid).toContain('empty_title')
    expect(invalid).toContain('insufficient_options')
    expect(invalid).toContain('empty_option')
    expect(invalid).toContain('invalid_voting_bounds')
  })

  it('rejects out-of-range vote option index', () => {
    expect(validateVoteOptionIndex(-1, 2)).toContain('option_index_out_of_range')
    expect(validateVoteOptionIndex(3, 2)).toContain('option_index_out_of_range')
    expect(validateVoteOptionIndex(1, 2)).toEqual([])
  })

  it('returns read-only presentation for passed+executed proposals', () => {
    const presentation = getProposalPresentation({
      id: 44,
      status: 1,
      proposalType: 1,
      options: ['SELL', 'KEEP'],
      voteCounts: [BigInt(99), BigInt(1)],
      winningOptionIndex: 0,
      executed: true,
    })

    expect(presentation.statusLabel).toBe('PASSED')
    expect(presentation.execute).toEqual({
      executable: false,
      reason: 'already_executed',
    })
  })
})
