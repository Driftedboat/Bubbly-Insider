import { Card, MarketPulse, Deck } from '@/types'
import { generateMockDeck, generateMarketPulse } from './mock-data'
import { getRecentItems, sourceItemToCard } from './ingestion'
import { fetchMarketPulse } from './scrapers/price-scraper'

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
  useMockData?: boolean
}

/**
 * Generate a daily deck of 10 cards
 * Uses real data if available, falls back to mock data
 */
export async function generateDeck(options: DeckGeneratorOptions = {}): Promise<{
  deck: Deck
  marketPulse: MarketPulse
}> {
  // Fetch real market pulse
  let marketPulse: MarketPulse
  try {
    marketPulse = await fetchMarketPulse()
    
    // If we got no price, fall back to mock
    if (marketPulse.btcPrice === 0) {
      marketPulse = generateMarketPulse()
    }
  } catch {
    marketPulse = generateMarketPulse()
  }
  
  // Check if we should use mock data
  if (options.useMockData) {
    const cards = generateMockDeck()
    return {
      deck: {
        id: generateDeckId(),
        cards: cards.slice(0, 10),
        createdAt: new Date().toISOString(),
        deckDate: new Date().toISOString().split('T')[0]
      },
      marketPulse
    }
  }
  
  // Try to get real data from database
  try {
    const { news, kol } = await getRecentItems(24)
    
    // If we have enough data, use real data
    if (news.length >= 3 || kol.length >= 5) {
      const cards = await generateRealDeck(news, kol, marketPulse)
      
      return {
        deck: {
          id: generateDeckId(),
          cards,
          createdAt: new Date().toISOString(),
          deckDate: new Date().toISOString().split('T')[0]
        },
        marketPulse
      }
    }
  } catch (error) {
    console.error('Error generating real deck, falling back to mock:', error)
  }
  
  // Fall back to mock data
  const cards = generateMockDeck()
  
  return {
    deck: {
      id: generateDeckId(),
      cards: cards.slice(0, 10),
      createdAt: new Date().toISOString(),
      deckDate: new Date().toISOString().split('T')[0]
    },
    marketPulse
  }
}

/**
 * Generate deck from real database items
 */
async function generateRealDeck(
  newsItems: Array<{
    id: string
    type: string
    sourceName: string
    url: string
    title: string
    contentSnippet: string | null
    publishedAt: Date
    rawJson: string | null
  }>,
  kolItems: Array<{
    id: string
    type: string
    sourceName: string
    url: string
    title: string
    contentSnippet: string | null
    publishedAt: Date
    rawJson: string | null
  }>,
  marketPulse: MarketPulse
): Promise<Card[]> {
  const cards: Card[] = []
  const generateId = () => Math.random().toString(36).substring(2, 15)
  
  // 1. Add price card
  const priceCard: Card = {
    id: generateId(),
    cardType: 'price',
    bullBear: marketPulse.btcChange24h >= 0 ? 'bull' : 'bear',
    confidence: 95,
    headline: `BTC ${marketPulse.btcChange24h >= 0 ? 'up' : 'down'} ${Math.abs(marketPulse.btcChange24h).toFixed(1)}% at $${marketPulse.btcPrice.toLocaleString()}`,
    sourceBadge: 'Price',
    categoryTags: ['Market'],
    brief: `Bitcoin is trading at $${marketPulse.btcPrice.toLocaleString()} with a ${marketPulse.btcChange24h >= 0 ? 'gain' : 'loss'} of ${Math.abs(marketPulse.btcChange24h).toFixed(2)}% over the past 24 hours.`,
    insight: marketPulse.btcChange24h >= 0 
      ? 'Price momentum remains positive. Watch for continuation above key resistance levels.'
      : 'Price weakness suggests caution. Monitor support levels for potential reversal.',
    primaryLinks: ['https://coingecko.com/en/coins/bitcoin'],
    secondaryLinks: [],
    originalItem: {
      id: 'price-btc',
      title: 'Bitcoin Price',
      source: 'CoinGecko',
      url: 'https://coingecko.com/en/coins/bitcoin',
      timestamp: marketPulse.timestamp
    },
    relatedItems: [],
    scoreBreakdown: {
      sourceStrength: 40,
      confirmation: 20,
      specificity: 15,
      freshness: 15,
      conflictPenalty: 0,
      total: 95
    },
    createdAt: new Date().toISOString()
  }
  cards.push(priceCard)
  
  // 2. Add news cards (3-4)
  const newsCount = newsItems.length >= 4 ? 4 : 3
  for (let i = 0; i < Math.min(newsCount, newsItems.length); i++) {
    const cardData = sourceItemToCard(newsItems[i])
    cards.push({
      ...cardData,
      id: generateId(),
      createdAt: new Date().toISOString()
    })
  }
  
  // 3. Fill remaining with KOL cards
  const remainingSlots = 10 - cards.length
  for (let i = 0; i < Math.min(remainingSlots, kolItems.length); i++) {
    const cardData = sourceItemToCard(kolItems[i])
    cards.push({
      ...cardData,
      id: generateId(),
      createdAt: new Date().toISOString()
    })
  }
  
  // 4. If still not at 10, add mock cards
  if (cards.length < 10) {
    const mockCards = generateMockDeck()
    for (let i = cards.length; i < 10; i++) {
      cards.push(mockCards[i % mockCards.length])
    }
  }
  
  // Verify composition
  const newsCardCount = cards.filter(c => c.cardType === 'news').length
  const kolCardCount = cards.filter(c => c.cardType === 'kol').length
  const priceCardCount = cards.filter(c => c.cardType === 'price').length
  
  console.log(`Deck composition: ${newsCardCount} news, ${kolCardCount} KOL, ${priceCardCount} price (from real data)`)
  
  return cards.slice(0, 10)
}

/**
 * Get a cached deck for today if available
 */
export async function getTodaysDeck(): Promise<{
  deck: Deck
  marketPulse: MarketPulse
} | null> {
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
