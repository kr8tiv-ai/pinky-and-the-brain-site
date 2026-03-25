---
phase: 05-treasury-intel-section
plan: 01
subsystem: dashboard-ui
tags: [react, recharts, treasury, dashboard, classified-aesthetic]
dependency_graph:
  requires:
    - 03-02 (useTreasury hook)
    - 04-01 (war-room page shell, CommandHeader aesthetic reference)
  provides:
    - TreasuryIntel.tsx component slotted into war-room/page.tsx
  affects:
    - src/app/war-room/page.tsx (slotted in)
tech_stack:
  added: []
  patterns:
    - TooltipContentProps from recharts for Recharts 3.x custom tooltip
    - h-[200px] div wrapper around ResponsiveContainer to prevent zero-height
    - TooltipValueType cast for payload value extraction
key_files:
  created:
    - src/components/dashboard/TreasuryIntel.tsx
  modified:
    - src/app/war-room/page.tsx
decisions:
  - Use TooltipContentProps (not TooltipProps) for Recharts 3.x custom tooltip component
  - Pass tooltip as render function (props) => <CustomChartTooltip {...props} /> to avoid JSX element type mismatch
  - Cast payload[0].value via TooltipValueType to handle ValueType union (number | string | array)
  - Wire TreasuryIntel into war-room/page.tsx directly below CommandHeader
metrics:
  duration: ~5 minutes
  completed_date: 2026-03-25
  tasks_completed: 2
  files_created: 1
  files_modified: 1
requirements: [R2, R10]
---

# Phase 05 Plan 01: TreasuryIntel Component Summary

**One-liner:** Full Treasury Intel dashboard section with classified aesthetic — summary bar, holdings grid (HoldingCard/ClassifiedCard/LoadingCard), Recharts 3.x AreaChart value-over-time, and divested assets section.

## What Was Built

`src/components/dashboard/TreasuryIntel.tsx` — a 490-line `'use client'` component that is the primary dashboard section for the $BRAIN War Room. Slotted directly beneath `CommandHeader` in `war-room/page.tsx`.

### Component Architecture

```
TreasuryIntel (main export)
├── Section header (TREASURY INTEL — CLASSIFIED / TS/SCI)
├── Summary bar (4-cell grid: total USD, SOL balance, portfolio SOL, holdings count)
├── Holdings grid
│   ├── HoldingCard (known tokens: name, contract copy, amount, values, dates, gain/loss, links)
│   ├── ClassifiedCard (unknown category: redacted with .flicker animation, Solscan link)
│   └── LoadingCard (all-redaction placeholder)
├── TreasuryValueChart (Recharts 3.x AreaChart with buildChartData, CustomChartTooltip)
└── DivestedSection (TREASURY_HOLDINGS sold tokens or "NO DIVESTED POSITIONS")
```

### Utility Functions (file-local)
- `formatUsd(n)` — mirrors CommandHeader pattern with sub-cent precision
- `formatSol(n)` — 4 decimal places + ◎ symbol
- `formatGainLoss(pct)` — +/- with green/red colorClass
- `buildChartData(holdings)` — cumulative cost-basis curve from purchase dates + NOW point

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Build TreasuryIntel.tsx with summary bar, holdings grid, classified cards | e5998b0 | src/components/dashboard/TreasuryIntel.tsx |
| 2 | Add TreasuryValueChart Recharts 3.x AreaChart + wire into page.tsx | 86b7de8 | src/app/war-room/page.tsx |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Recharts 3.x TooltipProps does not include active/payload/label**
- **Found during:** Task 2 (TypeScript check after initial implementation)
- **Issue:** Plan specified `TooltipProps<number, string>` for custom tooltip, but Recharts 3.x split this into `TooltipProps` (component configuration) and `TooltipContentProps` (content render function props). `TooltipProps` does not expose `active`, `payload`, `label` — those are in `TooltipContentProps`.
- **Fix:** Changed import to `TooltipContentProps` from recharts; used `TooltipValueType` cast for payload value; passed tooltip as render function `(props) => <CustomChartTooltip {...props as TooltipContentProps} />` instead of JSX element to resolve generics mismatch.
- **Files modified:** src/components/dashboard/TreasuryIntel.tsx
- **Commit:** e5998b0

**2. [Rule 1 - Bug] Recharts 3.x ValueType/NameType not exported from recharts root**
- **Found during:** Task 2 (TypeScript check after first tooltip fix)
- **Issue:** `ValueType` and `NameType` are internal types from `DefaultTooltipContent.d.ts`; they are exported from recharts root as `TooltipValueType` only (not `ValueType`/`NameType` directly).
- **Fix:** Used `TooltipContentProps` with no generic arguments (defaults to `ValueType, NameType` internally), and used `TooltipValueType` for the payload value cast. Removed the problematic explicit generic parameters.
- **Files modified:** src/components/dashboard/TreasuryIntel.tsx
- **Commit:** e5998b0

### Tasks Added

**Wire TreasuryIntel into war-room/page.tsx**
- The research doc (Pattern 1, Code Examples section) specified wiring into page.tsx as part of the deliverable.
- Added TreasuryIntel import and `<TreasuryIntel />` below CommandHeader in page layout.
- Commit: 86b7de8

## Success Criteria Verification

- [x] TreasuryIntel.tsx compiled and TypeScript-clean (0 errors)
- [x] Summary bar: 4 stats (total USD, SOL balance, portfolio SOL, holdings count) with redaction loading
- [x] Holdings grid: HoldingCard for known tokens, ClassifiedCard for unknown, LoadingCard for loading state
- [x] Each known HoldingCard: name, contract copy, amount, current value, purchase date, purchase price, ~SOL approx, gain/loss %, external links (Solscan + Bags.fm + X)
- [x] CLASSIFIED cards: flicker class applied, mint fragment visible, Solscan link present
- [x] Treasury Value chart: Recharts 3.x AreaChart with h-[200px] wrapper, custom dark tooltip, fallback for insufficient data
- [x] Divested section: conditional render, shows "NO DIVESTED POSITIONS RECORDED" when empty
- [x] No imports from lib/api/treasury.ts
- [x] No `any` types
- [x] purchasePriceSol derived as purchasePriceUsd / solPriceUsd (labeled "~PRICE (SOL) AT PURCHASE")
- [x] File is 490 lines (minimum 200)

## Self-Check

### Files exist:
- [x] `src/components/dashboard/TreasuryIntel.tsx` — FOUND (490 lines)
- [x] `src/app/war-room/page.tsx` — FOUND (modified)

### Commits exist:
- [x] e5998b0 — feat(05-01): build TreasuryIntel.tsx
- [x] 86b7de8 — feat(05-01): wire TreasuryIntel into war-room/page.tsx

### TypeScript: PASSED (0 errors)

## Self-Check: PASSED
