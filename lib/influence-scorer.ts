/**
 * Influence Scoring System
 * 
 * Calculates influence scores based on:
 * - Time decay (content-type specific)
 * - Source authority
 * - Engagement metrics
 */

import { CardType, SourceBadge } from '@/types'

// Content type configurations
export interface ContentTypeConfig {
  freshWindowHours: number      // Hot/fresh content window
  extendedWindowHours: number   // Extended relevance window
  decayHalfLifeHours: number    // Hours until 50% decay
}

export const CONTENT_TYPE_CONFIG: Record<string, ContentTypeConfig> = {
  price: {
    freshWindowHours: 1,
    extendedWindowHours: 24,
    decayHalfLifeHours: 1
  },
  kol: {
    freshWindowHours: 6,
    extendedWindowHours: 24,
    decayHalfLifeHours: 12
  },
  news: {
    freshWindowHours: 12,
    extendedWindowHours: 48,
    decayHalfLifeHours: 24
  },
  policy: {
    freshWindowHours: 24,
    extendedWindowHours: 720, // 30 days
    decayHalfLifeHours: 336   // 14 days
  },
  macro: {
    freshWindowHours: 24,
    extendedWindowHours: 336, // 14 days
    decayHalfLifeHours: 168   // 7 days
  }
}

// Source authority scores (1.0 - 2.0)
export const SOURCE_AUTHORITY: Record<string, number> = {
  // Government sources
  'sec.gov': 2.0,
  'treasury.gov': 2.0,
  'federalreserve.gov': 2.0,
  'whitehouse.gov': 2.0,
  '.gov': 1.9,
  
  // Major financial news
  'Bloomberg': 1.8,
  'Reuters': 1.8,
  'WSJ': 1.7,
  'Financial Times': 1.7,
  
  // Crypto news outlets
  'CoinDesk': 1.5,
  'The Block': 1.5,
  'TheBlock': 1.5,
  'Decrypt': 1.4,
  'Cointelegraph': 1.3,
  
  // Top KOLs (verified influential accounts)
  '@VitalikButerin': 1.8,
  '@caboride': 1.5,
  '@CryptoHayes': 1.6,
  '@zachxbt': 1.7,
  '@punk6529': 1.5,
  '@GCRClassic': 1.5,
  '@cburniske': 1.5,
  '@DefiIgnas': 1.4,
  '@MacroAlf': 1.4,
  
  // Default
  'default': 1.0
}

/**
 * Get source authority multiplier
 */
export function getSourceAuthority(source: string, url?: string): number {
  // Check URL for government sources
  if (url) {
    if (url.includes('.gov')) return SOURCE_AUTHORITY['.gov']
    
    for (const [key, value] of Object.entries(SOURCE_AUTHORITY)) {
      if (url.toLowerCase().includes(key.toLowerCase())) {
        return value
      }
    }
  }
  
  // Check source name
  for (const [key, value] of Object.entries(SOURCE_AUTHORITY)) {
    if (source.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }
  
  return SOURCE_AUTHORITY['default']
}

/**
 * Calculate time decay factor
 * Uses exponential decay: e^(-t/halfLife)
 */
export function calculateTimeDecay(
  publishedAt: Date,
  contentType: string
): number {
  const config = CONTENT_TYPE_CONFIG[contentType] || CONTENT_TYPE_CONFIG['news']
  const hoursAgo = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60)
  
  // If within fresh window, no decay
  if (hoursAgo <= config.freshWindowHours) {
    return 1.0
  }
  
  // If beyond extended window, heavy decay
  if (hoursAgo > config.extendedWindowHours) {
    return 0.1
  }
  
  // Exponential decay
  const decayFactor = Math.exp(-hoursAgo / config.decayHalfLifeHours)
  return Math.max(0.1, decayFactor)
}

/**
 * Calculate engagement multiplier for KOL posts
 * Range: 1.0 - 3.0
 */
export function calculateEngagementMultiplier(metrics?: {
  likes?: number
  retweets?: number
  replies?: number
  views?: number
}): number {
  if (!metrics) return 1.0
  
  const likes = metrics.likes || 0
  const retweets = metrics.retweets || 0
  const replies = metrics.replies || 0
  
  // Weighted engagement score
  const engagementScore = likes + (retweets * 2) + (replies * 0.5)
  
  if (engagementScore === 0) return 1.0
  
  // Logarithmic scale: 1 + log10(score + 1) / 5
  // This gives ~1.6 for 1000 engagement, ~2.0 for 10000, ~2.4 for 100000
  const multiplier = 1 + Math.log10(engagementScore + 1) / 5
  
  return Math.min(3.0, Math.max(1.0, multiplier))
}

/**
 * Calculate engagement multiplier for news
 * Based on source reputation
 */
export function calculateNewsEngagementMultiplier(source: string): number {
  if (source.includes('Bloomberg') || source.includes('Reuters')) {
    return 1.5
  }
  if (source.includes('CoinDesk') || source.includes('Block')) {
    return 1.2
  }
  return 1.0
}

/**
 * Main influence score calculation
 */
export interface InfluenceScoreInput {
  contentType: string           // 'price' | 'kol' | 'news' | 'policy' | 'macro'
  source: string                // Source name or handle
  url?: string                  // URL for government detection
  publishedAt: Date
  engagement?: {
    likes?: number
    retweets?: number
    replies?: number
    views?: number
  }
  baseScore?: number            // Optional base relevance score (0-100)
}

export interface InfluenceScoreResult {
  finalScore: number            // 0-100 final influence score
  timeDecay: number             // Time decay factor
  sourceAuthority: number       // Source authority multiplier
  engagementMultiplier: number  // Engagement multiplier
  contentType: string           // Detected/assigned content type
  isFresh: boolean              // Within fresh window
  isExpired: boolean            // Beyond extended window
}

export function calculateInfluenceScore(input: InfluenceScoreInput): InfluenceScoreResult {
  const baseScore = input.baseScore ?? 50
  
  // Calculate components
  const timeDecay = calculateTimeDecay(input.publishedAt, input.contentType)
  const sourceAuthority = getSourceAuthority(input.source, input.url)
  
  // Engagement multiplier depends on content type
  let engagementMultiplier: number
  if (input.contentType === 'kol') {
    engagementMultiplier = calculateEngagementMultiplier(input.engagement)
  } else {
    engagementMultiplier = calculateNewsEngagementMultiplier(input.source)
  }
  
  // Calculate final score
  const rawScore = baseScore * timeDecay * sourceAuthority * engagementMultiplier
  const finalScore = Math.min(100, Math.max(0, rawScore))
  
  // Determine freshness
  const config = CONTENT_TYPE_CONFIG[input.contentType] || CONTENT_TYPE_CONFIG['news']
  const hoursAgo = (Date.now() - input.publishedAt.getTime()) / (1000 * 60 * 60)
  
  return {
    finalScore: Math.round(finalScore * 10) / 10,
    timeDecay: Math.round(timeDecay * 1000) / 1000,
    sourceAuthority,
    engagementMultiplier: Math.round(engagementMultiplier * 100) / 100,
    contentType: input.contentType,
    isFresh: hoursAgo <= config.freshWindowHours,
    isExpired: hoursAgo > config.extendedWindowHours
  }
}

/**
 * Batch calculate influence scores and sort by score
 */
export function rankByInfluence<T extends { publishedAt: Date; source: string; url?: string }>(
  items: T[],
  contentType: string,
  getEngagement?: (item: T) => { likes?: number; retweets?: number; replies?: number }
): Array<T & { influenceScore: InfluenceScoreResult }> {
  return items
    .map(item => ({
      ...item,
      influenceScore: calculateInfluenceScore({
        contentType,
        source: item.source,
        url: item.url,
        publishedAt: item.publishedAt,
        engagement: getEngagement?.(item)
      })
    }))
    .filter(item => !item.influenceScore.isExpired)
    .sort((a, b) => b.influenceScore.finalScore - a.influenceScore.finalScore)
}
