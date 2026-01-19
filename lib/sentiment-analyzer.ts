/**
 * Multi-Signal Sentiment Analyzer
 * 
 * Analyzes sentiment using multiple signals:
 * - Keyword analysis (30%)
 * - Price context (20%)
 * - Source tone (20%)
 * - Engagement patterns (30%)
 */

import { BullBear } from '@/types'

// Sentiment keywords with weights
const BULL_KEYWORDS: Record<string, number> = {
  // Strong bullish (weight: 2)
  'approval': 2, 'approved': 2, 'breakthrough': 2, 'bullish': 2,
  'rally': 2, 'surge': 2, 'soar': 2, 'milestone': 2, 'record': 2,
  'adoption': 2, 'institutional': 2,
  
  // Moderate bullish (weight: 1.5)
  'partnership': 1.5, 'expansion': 1.5, 'growth': 1.5, 'launch': 1.5,
  'integrate': 1.5, 'accept': 1.5, 'upgrade': 1.5, 'clarity': 1.5,
  'positive': 1.5, 'gain': 1.5, 'rise': 1.5, 'increase': 1.5,
  
  // Mild bullish (weight: 1)
  'accumulation': 1, 'support': 1, 'recover': 1, 'rebound': 1,
  'optimistic': 1, 'confident': 1, 'momentum': 1, 'breakout': 1,
  'opportunity': 1, 'potential': 1, 'promising': 1
}

const BEAR_KEYWORDS: Record<string, number> = {
  // Strong bearish (weight: 2)
  'hack': 2, 'exploit': 2, 'scam': 2, 'fraud': 2, 'crash': 2,
  'investigation': 2, 'lawsuit': 2, 'ban': 2, 'crackdown': 2,
  'bearish': 2, 'collapse': 2, 'bankruptcy': 2,
  
  // Moderate bearish (weight: 1.5)
  'warning': 1.5, 'risk': 1.5, 'concern': 1.5, 'decline': 1.5,
  'drop': 1.5, 'fall': 1.5, 'plunge': 1.5, 'dump': 1.5,
  'restriction': 1.5, 'regulation': 1.5, 'scrutiny': 1.5,
  'probe': 1.5, 'subpoena': 1.5,
  
  // Mild bearish (weight: 1)
  'uncertainty': 1, 'volatile': 1, 'caution': 1, 'weak': 1,
  'resistance': 1, 'pressure': 1, 'outflow': 1, 'liquidation': 1,
  'delay': 1, 'reject': 1, 'denied': 1
}

// Neutral/policy keywords (reduce sentiment extremes)
const NEUTRAL_KEYWORDS = [
  'decision', 'proposal', 'review', 'consider', 'evaluate',
  'announce', 'report', 'update', 'statement', 'comment',
  'meeting', 'hearing', 'testimony', 'filing', 'document'
]

/**
 * Calculate keyword-based sentiment
 * Returns: -1.0 (very bearish) to +1.0 (very bullish)
 */
export function analyzeKeywordSentiment(text: string): number {
  const lowerText = text.toLowerCase()
  const words = lowerText.split(/\s+/)
  
  let bullScore = 0
  let bearScore = 0
  let neutralCount = 0
  
  for (const word of words) {
    // Check bull keywords
    for (const [keyword, weight] of Object.entries(BULL_KEYWORDS)) {
      if (word.includes(keyword) || lowerText.includes(keyword)) {
        bullScore += weight
      }
    }
    
    // Check bear keywords
    for (const [keyword, weight] of Object.entries(BEAR_KEYWORDS)) {
      if (word.includes(keyword) || lowerText.includes(keyword)) {
        bearScore += weight
      }
    }
    
    // Check neutral keywords
    for (const keyword of NEUTRAL_KEYWORDS) {
      if (word.includes(keyword)) {
        neutralCount++
      }
    }
  }
  
  // Calculate raw sentiment
  const totalScore = bullScore + bearScore
  if (totalScore === 0) return 0
  
  let sentiment = (bullScore - bearScore) / (totalScore + 1)
  
  // Dampen sentiment if many neutral keywords (policy/official content)
  if (neutralCount > 2) {
    sentiment *= 0.7
  }
  
  return Math.max(-1, Math.min(1, sentiment))
}

/**
 * Calculate price context sentiment
 * If market is down, negative news has more weight
 */
export function analyzePriceContext(
  btcChange24h: number,
  contentSentiment: number
): number {
  // Market direction
  const marketSentiment = btcChange24h > 2 ? 0.5 : 
                          btcChange24h > 0 ? 0.2 :
                          btcChange24h > -2 ? -0.2 : -0.5
  
  // If content and market align, strengthen signal
  // If they diverge, this could be contrarian (slight dampening)
  if (Math.sign(marketSentiment) === Math.sign(contentSentiment)) {
    return marketSentiment * 0.8
  } else {
    return marketSentiment * 0.5
  }
}

/**
 * Calculate source tone sentiment
 * Official/government sources tend to be more neutral
 */
export function analyzeSourceTone(source: string, isPolicy: boolean): number {
  // Government/official sources are neutral
  if (source.includes('.gov') || isPolicy) {
    return 0
  }
  
  // News outlets are slightly neutral
  if (source.includes('Bloomberg') || source.includes('CoinDesk') || 
      source.includes('Reuters') || source.includes('Block')) {
    return 0
  }
  
  // KOLs can be more opinionated, use keyword sentiment
  return 0 // Will be combined with keyword sentiment
}

/**
 * Calculate engagement-based sentiment
 * High engagement on negative content = bearish signal
 */
export function analyzeEngagementSentiment(
  engagement: { likes?: number; retweets?: number; replies?: number },
  keywordSentiment: number
): number {
  const likes = engagement.likes || 0
  const retweets = engagement.retweets || 0
  const replies = engagement.replies || 0
  
  const totalEngagement = likes + retweets + replies
  
  if (totalEngagement < 100) {
    return 0 // Not enough signal
  }
  
  // High reply ratio often indicates controversy
  const replyRatio = replies / (totalEngagement + 1)
  const controversyFactor = replyRatio > 0.3 ? -0.2 : 0
  
  // High retweet ratio indicates agreement/spread
  const retweetRatio = retweets / (totalEngagement + 1)
  const spreadFactor = retweetRatio > 0.3 ? 0.2 : 0
  
  // Combine with keyword sentiment direction
  const engagementSentiment = (spreadFactor + controversyFactor) * Math.sign(keywordSentiment || 1)
  
  return Math.max(-0.5, Math.min(0.5, engagementSentiment))
}

/**
 * Main sentiment analysis function
 * Combines all signals with weights
 */
export interface SentimentInput {
  text: string
  source: string
  isPolicy?: boolean
  btcChange24h?: number
  engagement?: {
    likes?: number
    retweets?: number
    replies?: number
  }
}

export interface SentimentResult {
  score: number              // -1.0 to +1.0
  classification: BullBear   // 'bull' | 'bear'
  confidence: number         // 0-100, how confident in the classification
  signals: {
    keyword: number
    priceContext: number
    sourceTone: number
    engagement: number
  }
}

export function analyzeSentiment(input: SentimentInput): SentimentResult {
  // Calculate individual signals
  const keywordSentiment = analyzeKeywordSentiment(input.text)
  
  const priceContext = input.btcChange24h !== undefined
    ? analyzePriceContext(input.btcChange24h, keywordSentiment)
    : 0
  
  const sourceTone = analyzeSourceTone(input.source, input.isPolicy || false)
  
  const engagementSentiment = input.engagement
    ? analyzeEngagementSentiment(input.engagement, keywordSentiment)
    : 0
  
  // Weighted combination
  // Keywords: 30%, Price Context: 20%, Source Tone: 20%, Engagement: 30%
  const weights = {
    keyword: 0.35,
    priceContext: 0.20,
    sourceTone: 0.15,
    engagement: 0.30
  }
  
  // If no engagement data, redistribute weight
  const effectiveWeights = input.engagement 
    ? weights 
    : { keyword: 0.50, priceContext: 0.30, sourceTone: 0.20, engagement: 0 }
  
  const weightedScore = 
    keywordSentiment * effectiveWeights.keyword +
    priceContext * effectiveWeights.priceContext +
    sourceTone * effectiveWeights.sourceTone +
    engagementSentiment * effectiveWeights.engagement
  
  // Clamp to -1 to 1
  const score = Math.max(-1, Math.min(1, weightedScore))
  
  // Classification thresholds
  // Bull: score > 0.15
  // Bear: score < -0.15
  // Neutral: use keyword sentiment as tiebreaker
  let classification: BullBear
  if (score > 0.15) {
    classification = 'bull'
  } else if (score < -0.15) {
    classification = 'bear'
  } else {
    // Neutral zone - use keyword sentiment as tiebreaker
    classification = keywordSentiment >= 0 ? 'bull' : 'bear'
  }
  
  // Confidence based on signal strength and agreement
  const signalStrength = Math.abs(score)
  const signalAgreement = [keywordSentiment, priceContext, engagementSentiment]
    .filter(s => s !== 0)
    .every(s => Math.sign(s) === Math.sign(score)) ? 1.2 : 0.8
  
  const confidence = Math.min(100, Math.round(signalStrength * 100 * signalAgreement))
  
  return {
    score: Math.round(score * 1000) / 1000,
    classification,
    confidence,
    signals: {
      keyword: Math.round(keywordSentiment * 1000) / 1000,
      priceContext: Math.round(priceContext * 1000) / 1000,
      sourceTone: Math.round(sourceTone * 1000) / 1000,
      engagement: Math.round(engagementSentiment * 1000) / 1000
    }
  }
}

/**
 * Analyze deck sentiment balance
 */
export function analyzeDeckSentiment(
  cards: Array<{ bullBear: BullBear; confidence: number }>
): {
  bullCount: number
  bearCount: number
  bullPercentage: number
  bearPercentage: number
  isBalanced: boolean
  recommendation: string
} {
  const bullCount = cards.filter(c => c.bullBear === 'bull').length
  const bearCount = cards.filter(c => c.bullBear === 'bear').length
  const total = cards.length
  
  const bullPercentage = Math.round((bullCount / total) * 100)
  const bearPercentage = Math.round((bearCount / total) * 100)
  
  // Balanced if neither exceeds 80%
  const isBalanced = bullPercentage <= 80 && bearPercentage <= 80
  
  let recommendation = ''
  if (bullPercentage > 80) {
    recommendation = 'Consider adding a bear card for perspective'
  } else if (bearPercentage > 80) {
    recommendation = 'Consider adding a bull card for perspective'
  } else {
    recommendation = 'Deck sentiment is balanced'
  }
  
  return {
    bullCount,
    bearCount,
    bullPercentage,
    bearPercentage,
    isBalanced,
    recommendation
  }
}
