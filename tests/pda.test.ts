import { describe, it, expect } from 'vitest'
import { PublicKey } from '@solana/web3.js'
import {
  findStakingPool,
  findStakerAccount,
  findBrainVault,
  findRewardVault,
  findDlmmExit,
} from '../src/lib/staking/pda'
import { PROGRAM_ID } from '../src/lib/staking/constants'

describe('PDA derivation', () => {
  it('findStakingPool returns a valid PDA', () => {
    const [pda, bump] = findStakingPool()
    expect(pda).toBeInstanceOf(PublicKey)
    expect(bump).toBeGreaterThanOrEqual(0)
    expect(bump).toBeLessThanOrEqual(255)
  })

  it('findStakingPool is deterministic', () => {
    const [pda1] = findStakingPool()
    const [pda2] = findStakingPool()
    expect(pda1.toBase58()).toBe(pda2.toBase58())
  })

  it('findStakerAccount is deterministic for same user', () => {
    const user = PublicKey.unique()
    const [pda1] = findStakerAccount(user)
    const [pda2] = findStakerAccount(user)
    expect(pda1.toBase58()).toBe(pda2.toBase58())
  })

  it('findStakerAccount differs for different users', () => {
    const user1 = PublicKey.unique()
    const user2 = PublicKey.unique()
    const [pda1] = findStakerAccount(user1)
    const [pda2] = findStakerAccount(user2)
    expect(pda1.toBase58()).not.toBe(pda2.toBase58())
  })

  it('findBrainVault returns a valid PDA', () => {
    const [pda, bump] = findBrainVault()
    expect(pda).toBeInstanceOf(PublicKey)
    expect(bump).toBeGreaterThanOrEqual(0)
  })

  it('findRewardVault returns a valid PDA', () => {
    const [pda, bump] = findRewardVault()
    expect(pda).toBeInstanceOf(PublicKey)
    expect(bump).toBeGreaterThanOrEqual(0)
  })

  it('all singleton PDAs are distinct', () => {
    const [pool] = findStakingPool()
    const [brainVault] = findBrainVault()
    const [rewardVault] = findRewardVault()

    const addresses = [pool.toBase58(), brainVault.toBase58(), rewardVault.toBase58()]
    expect(new Set(addresses).size).toBe(3)
  })

  it('findDlmmExit is deterministic', () => {
    const assetMint = PublicKey.unique()
    const dlmmPool = PublicKey.unique()
    const [pda1] = findDlmmExit(assetMint, dlmmPool)
    const [pda2] = findDlmmExit(assetMint, dlmmPool)
    expect(pda1.toBase58()).toBe(pda2.toBase58())
  })

  it('findDlmmExit differs for different inputs', () => {
    const mint1 = PublicKey.unique()
    const mint2 = PublicKey.unique()
    const pool = PublicKey.unique()
    const [pda1] = findDlmmExit(mint1, pool)
    const [pda2] = findDlmmExit(mint2, pool)
    expect(pda1.toBase58()).not.toBe(pda2.toBase58())
  })

  it('uses correct program ID', () => {
    expect(PROGRAM_ID.toBase58()).toBe('5o2uBwvKUy4oF78ziR4tEiqz59k7XBXuZBwiZFqCfca2')
  })

  it('custom programId changes PDA', () => {
    const custom = PublicKey.unique()
    const [defaultPda] = findStakingPool()
    const [customPda] = findStakingPool(custom)
    expect(defaultPda.toBase58()).not.toBe(customPda.toBase58())
  })
})
