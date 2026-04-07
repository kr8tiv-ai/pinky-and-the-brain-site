import { describe, expect, it } from 'vitest'
import { deriveExitProvenanceMeta } from '../../src/components/dashboard/staking/DlmmExits'

describe('proposal id provenance badges', () => {
  it('renders manual provenance for proposal id 0', () => {
    expect(deriveExitProvenanceMeta('0')).toMatchObject({
      label: 'MANUAL',
    })

    expect(deriveExitProvenanceMeta(BigInt(0))).toMatchObject({
      label: 'MANUAL',
    })
  })

  it('renders governance provenance for proposal id > 0', () => {
    expect(deriveExitProvenanceMeta('12')).toMatchObject({
      label: 'GOVERNANCE #12',
    })
  })

  it('falls back to unknown source for missing proposal id', () => {
    expect(deriveExitProvenanceMeta(undefined)).toMatchObject({
      label: 'UNKNOWN SOURCE',
      diagnostic: 'missing_proposal_id',
    })
  })

  it('falls back to unknown source for malformed proposal id', () => {
    expect(deriveExitProvenanceMeta('nan')).toMatchObject({
      label: 'UNKNOWN SOURCE',
      diagnostic: 'invalid_proposal_id',
    })
  })
})
