import { ScoreBreakdown, CardType, SourceBadge } from '@/types'

interface ScoringInput {
  cardType: CardType
  sourceBadge: SourceBadge
  hasPrimarySource: boolean
  hasSecondarySource: boolean
  confirmationCount: number
  hasSpecificDetails: boolean
  hoursAgo: number
  hasConflict: boolean
  isContested: boolean
}

/**
 * Calculate confidence score for a card based on the PRD rules:
 * - Source strength (0-40): Primary source = 40, reputable secondary = 25, social only = 10
 * - Confirmation (0-20): 2+ sources = 20, 1 source = 10
 * - Specificity (0-15): Concrete details = 15, vague = 5
 * - Freshness (0-15): <6h = 15, <24h = 10, <72h = 5
 * - Conflict penalty (-20 to 0): Contradictions or missing primary for strong claims
 */
export function calculateConfidence(input: ScoringInput): ScoreBreakdown {
  let sourceStrength = 0
  let confirmation = 0
  let specificity = 0
  let freshness = 0
  let conflictPenalty = 0

  // Source Strength (0-40)
  if (input.hasPrimarySource) {
    sourceStrength = 40
  } else if (input.hasSecondarySource && (input.sourceBadge === 'Bloomberg' || input.sourceBadge === 'CoinDesk')) {
    sourceStrength = 25
  } else if (input.cardType === 'kol') {
    sourceStrength = 10
  } else if (input.cardType === 'price') {
    sourceStrength = 40 // Price data is always verifiable
  } else {
    sourceStrength = 10
  }

  // Confirmation (0-20)
  if (input.confirmationCount >= 2) {
    confirmation = 20
  } else if (input.confirmationCount >= 1) {
    confirmation = 10
  } else {
    confirmation = 0
  }

  // Specificity (0-15)
  if (input.hasSpecificDetails) {
    specificity = 15
  } else {
    specificity = 5
  }

  // Freshness (0-15)
  if (input.hoursAgo <= 6) {
    freshness = 15
  } else if (input.hoursAgo <= 24) {
    freshness = 10
  } else if (input.hoursAgo <= 72) {
    freshness = 5
  } else {
    freshness = 0
  }

  // Conflict Penalty (-20 to 0)
  if (input.hasConflict) {
    conflictPenalty = -20
  } else if (input.isContested || (!input.hasPrimarySource && input.cardType === 'news')) {
    conflictPenalty = -10
  }

  const total = Math.max(0, Math.min(100, 
    sourceStrength + confirmation + specificity + freshness + conflictPenalty
  ))

  return {
    sourceStrength,
    confirmation,
    specificity,
    freshness,
    conflictPenalty,
    total
  }
}

/**
 * Determine bull/bear direction based on card content analysis
 */
export function determineBullBear(
  cardType: CardType,
  keywords: string[],
  priceChange?: number
): 'bull' | 'bear' {
  // Price cards - simple: up = bull, down = bear
  if (cardType === 'price') {
    return (priceChange ?? 0) >= 0 ? 'bull' : 'bear'
  }

  // News and KOL - keyword analysis
  const bullKeywords = [
    'approval', 'approved', 'expansion', 'partnership', 'adoption',
    'institutional', 'etf', 'settlement', 'integration', 'bullish',
    'accumulation', 'breakthrough', 'upgrade', 'milestone', 'launch',
    'clarity', 'framework', 'growth', 'rally', 'breakout'
  ]

  const bearKeywords = [
    'investigation', 'probe', 'hack', 'exploit', 'scam',
    'tax', 'crackdown', 'ban', 'restriction', 'warning',
    'outflow', 'dump', 'crash', 'bearish', 'liquidation',
    'fraud', 'suspicious', 'vulnerability', 'lawsuit', 'subpoena'
  ]

  const text = keywords.join(' ').toLowerCase()
  
  let bullScore = 0
  let bearScore = 0

  for (const keyword of bullKeywords) {
    if (text.includes(keyword)) bullScore++
  }

  for (const keyword of bearKeywords) {
    if (text.includes(keyword)) bearScore++
  }

  return bullScore >= bearScore ? 'bull' : 'bear'
}
