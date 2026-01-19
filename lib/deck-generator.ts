import { Card, MarketPulse, Deck } from '@/types'
import { generateMockDeck, generateMarketPulse } from './mock-data'

/**
 * Deck composition rules from PRD:
 * - Total: exactly 10 cards
 * - News cards: 3-4 (policy/macro weighted)
 * - Price cards: 1-2 (BTC always, +1 if volatility > 4%)
 * - KOL cards: max 7 (unique topics, last 24h)
 * - Default: 3 news + 1 price + 6 KOL = 10
 */

interface DeckGeneratorOptions {
  forceRefresh?: boolean
}

/**
 * Generate a daily deck of 10 cards
 * In MVP, uses mock data. Later will use real data sources.
 */
export async function generateDeck(options: DeckGeneratorOptions = {}): Promise<{
  deck: Deck
  marketPulse: MarketPulse
}> {
  // Generate market pulse
  const marketPulse = generateMarketPulse()
  
  // Generate cards using mock data
  const cards = generateMockDeck()
  
  // Ensure we have exactly 10 cards
  const finalCards = cards.slice(0, 10)
  
  // Verify composition
  const newsCount = finalCards.filter(c => c.cardType === 'news').length
  const kolCount = finalCards.filter(c => c.cardType === 'kol').length
  const priceCount = finalCards.filter(c => c.cardType === 'price').length
  
  console.log(`Deck composition: ${newsCount} news, ${kolCount} KOL, ${priceCount} price`)
  
  // Create deck object
  const deck: Deck = {
    id: generateDeckId(),
    cards: finalCards,
    createdAt: new Date().toISOString(),
    deckDate: new Date().toISOString().split('T')[0]
  }
  
  return { deck, marketPulse }
}

/**
 * Get a cached deck for today if available
 * For MVP, we just generate a new deck each time
 */
export async function getTodaysDeck(): Promise<{
  deck: Deck
  marketPulse: MarketPulse
} | null> {
  // In real implementation, would check cache/database
  // For MVP, return null to force fresh generation
  return null
}

/**
 * Validate deck composition meets requirements
 */
export function validateDeckComposition(cards: Card[]): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (cards.length !== 10) {
    errors.push(`Deck has ${cards.length} cards, expected 10`)
  }
  
  const newsCount = cards.filter(c => c.cardType === 'news').length
  const kolCount = cards.filter(c => c.cardType === 'kol').length
  const priceCount = cards.filter(c => c.cardType === 'price').length
  
  if (newsCount < 3 || newsCount > 4) {
    errors.push(`News cards: ${newsCount}, expected 3-4`)
  }
  
  if (kolCount > 7) {
    errors.push(`KOL cards: ${kolCount}, max is 7`)
  }
  
  if (priceCount < 1 || priceCount > 2) {
    errors.push(`Price cards: ${priceCount}, expected 1-2`)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Generate unique deck ID
 */
function generateDeckId(): string {
  return `deck_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Selection algorithm for choosing cards from candidates
 * Implements the PRD rules for card selection priority
 */
export function selectCards(
  newsCandidates: Card[],
  kolCandidates: Card[],
  priceCandidates: Card[],
  btcVolatility: number
): Card[] {
  const selected: Card[] = []
  
  // 1. Always include BTC price card
  const btcCard = priceCandidates.find(c => c.headline.includes('BTC'))
  if (btcCard) {
    selected.push(btcCard)
  }
  
  // 2. Add second price card if high volatility (>4%)
  if (Math.abs(btcVolatility) >= 4 && priceCandidates.length > 1) {
    const secondPrice = priceCandidates.find(c => c !== btcCard)
    if (secondPrice) {
      selected.push(secondPrice)
    }
  }
  
  // 3. Select news cards (3, or 4 if high-impact policy/macro)
  const sortedNews = [...newsCandidates].sort((a, b) => b.confidence - a.confidence)
  const policyMacroNews = sortedNews.filter(c => 
    c.categoryTags.includes('Policy') || c.categoryTags.includes('Macro')
  )
  
  const newsToAdd = policyMacroNews.length >= 2 ? 4 : 3
  for (let i = 0; i < Math.min(newsToAdd, sortedNews.length); i++) {
    selected.push(sortedNews[i])
  }
  
  // 4. Fill remaining with KOL cards
  const sortedKOL = [...kolCandidates].sort((a, b) => b.confidence - a.confidence)
  const remainingSlots = 10 - selected.length
  
  for (let i = 0; i < Math.min(remainingSlots, sortedKOL.length, 7); i++) {
    selected.push(sortedKOL[i])
  }
  
  return selected.slice(0, 10)
}
