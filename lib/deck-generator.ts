/**
 * Deck Generator with Fair Sentiment Selection
 * 
 * Uses multi-horizon weighted selection to create balanced decks
 * that reflect actual market sentiment with proper time windows
 * for different content types.
 */

import { Card, MarketPulse, Deck, CategoryTag, SourceBadge, ScoreBreakdown } from '@/types'
import { generateMarketPulse } from './mock-data'
import { getRecentItems } from './ingestion'
import { fetchMarketPulse } from './scrapers/price-scraper'
import { scrapeAllNews, scrapeAllX } from './scrapers'
import { calculateInfluenceScore, InfluenceScoreResult, CONTENT_TYPE_CONFIG } from './influence-scorer'
import { analyzeSentiment, SentimentResult, analyzeDeckSentiment } from './sentiment-analyzer'
import { classifyPolicy, PolicyClassification, getContentTypeForPolicy, isPolicyStillRelevant } from './policy-detector'

// Card quotas
const CARD_QUOTAS = {
  price: { min: 1, max: 1 },
  policy: { min: 0, max: 2 },
  news: { min: 2, max: 4 },
  kol: { min: 3, max: 6 }
}

const TARGET_DECK_SIZE = 10

interface DeckGeneratorOptions {
  forceRefresh?: boolean
}

interface ScoredItem {
  id: string
  type: 'news' | 'kol'
  source: string
  url: string
  title: string
  content: string
  publishedAt: Date
  engagement?: { likes?: number; retweets?: number; replies?: number }
  influenceScore: InfluenceScoreResult
  sentiment: SentimentResult
  policy: PolicyClassification
  finalScore: number
}

/**
 * Generate a daily deck of 10 cards with fair sentiment selection
 */
export async function generateDeck(options: DeckGeneratorOptions = {}): Promise<{
  deck: Deck
  marketPulse: MarketPulse
}> {
  console.log('Generating deck with fair sentiment selection...')
  
  // Fetch real market pulse
  let marketPulse: MarketPulse
  try {
    marketPulse = await fetchMarketPulse()
    if (marketPulse.btcPrice === 0) {
      marketPulse = generateMarketPulse()
    }
  } catch {
    marketPulse = generateMarketPulse()
  }
  
  // Collect all candidate items
  const candidates = await collectCandidates(marketPulse.btcChange24h)
  
  if (candidates.length === 0) {
    console.log('No candidates found, returning price-only deck')
    return {
      deck: {
        id: generateDeckId(),
        cards: [createPriceCard(marketPulse)],
        createdAt: new Date().toISOString(),
        deckDate: new Date().toISOString().split('T')[0]
      },
      marketPulse
    }
  }
  
  // Select cards using quota-based algorithm
  const selectedCards = selectCardsWithQuotas(candidates, marketPulse)
  
  // Log deck statistics
  const stats = analyzeDeckSentiment(selectedCards)
  console.log(`Deck: ${selectedCards.length} cards, ${stats.bullCount} bull, ${stats.bearCount} bear (${stats.bullPercentage}% bull)`)
  
  return {
    deck: {
      id: generateDeckId(),
      cards: selectedCards,
      createdAt: new Date().toISOString(),
      deckDate: new Date().toISOString().split('T')[0]
    },
    marketPulse
  }
}

/**
 * Collect and score all candidate items from database and live scraping
 */
async function collectCandidates(btcChange24h: number): Promise<ScoredItem[]> {
  const candidates: ScoredItem[] = []
  
  // Try database first (with extended window for policy)
  try {
    const { news: dbNews, kol: dbKol } = await getRecentItems(168) // 7 days for policy items
    
    // Process database items
    for (const item of dbNews) {
      const scored = scoreItem({
        id: item.id,
        type: 'news',
        source: item.sourceName,
        url: item.url,
        title: item.title,
        content: item.contentSnippet || item.title,
        publishedAt: item.publishedAt,
      }, btcChange24h)
      
      if (scored) candidates.push(scored)
    }
    
    for (const item of dbKol) {
      const scored = scoreItem({
        id: item.id,
        type: 'kol',
        source: item.sourceName,
        url: item.url,
        title: item.title,
        content: item.contentSnippet || item.title,
        publishedAt: item.publishedAt,
      }, btcChange24h)
      
      if (scored) candidates.push(scored)
    }
  } catch (error) {
    console.log('Database not available, using live scraping only')
  }
  
  // If not enough candidates, scrape live
  if (candidates.length < TARGET_DECK_SIZE) {
    console.log('Fetching live data...')
    
    try {
      const [newsResult, kolResult] = await Promise.all([
        scrapeAllNews(),
        scrapeAllX()
      ])
      
      // Process scraped news
      for (const item of newsResult.data.slice(0, 30)) {
        const scored = scoreItem({
          id: `live-news-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          type: 'news',
          source: item.source,
          url: item.url,
          title: item.title,
          content: item.snippet || item.title,
          publishedAt: item.publishedAt,
        }, btcChange24h)
        
        if (scored && !candidates.find(c => c.url === item.url)) {
          candidates.push(scored)
        }
      }
      
      // Process scraped KOL posts
      for (const item of kolResult.data.slice(0, 50)) {
        const scored = scoreItem({
          id: `live-kol-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          type: 'kol',
          source: `@${item.authorHandle}`,
          url: item.url,
          title: item.content.slice(0, 200),
          content: item.content,
          publishedAt: item.publishedAt,
          engagement: item.metrics
        }, btcChange24h)
        
        if (scored && !candidates.find(c => c.url === item.url)) {
          candidates.push(scored)
        }
      }
    } catch (error) {
      console.error('Live scraping error:', error)
    }
  }
  
  return candidates
}

/**
 * Score a single item using influence, sentiment, and policy analysis
 */
function scoreItem(
  item: {
    id: string
    type: 'news' | 'kol'
    source: string
    url: string
    title: string
    content: string
    publishedAt: Date
    engagement?: { likes?: number; retweets?: number; replies?: number }
  },
  btcChange24h: number
): ScoredItem | null {
  // Detect policy/macro content
  const policy = classifyPolicy(item.content, item.source)
  const contentType = policy.isPolicy ? getContentTypeForPolicy(policy) : item.type
  
  // Check if still relevant (policy items have extended windows)
  if (policy.isPolicy && !isPolicyStillRelevant(policy, item.publishedAt)) {
    return null
  }
  
  // Check normal time window for non-policy
  if (!policy.isPolicy) {
    const config = CONTENT_TYPE_CONFIG[item.type]
    const hoursAgo = (Date.now() - item.publishedAt.getTime()) / (1000 * 60 * 60)
    if (hoursAgo > config.extendedWindowHours) {
      return null
    }
  }
  
  // Calculate influence score
  const influenceScore = calculateInfluenceScore({
    contentType,
    source: item.source,
    url: item.url,
    publishedAt: item.publishedAt,
    engagement: item.engagement,
    baseScore: 50
  })
  
  // Calculate sentiment
  const sentiment = analyzeSentiment({
    text: `${item.title} ${item.content}`,
    source: item.source,
    isPolicy: policy.isPolicy,
    btcChange24h,
    engagement: item.engagement
  })
  
  // Calculate final score: influence × (1 + |sentiment|)
  const sentimentBoost = 1 + Math.abs(sentiment.score) * 0.5
  const finalScore = influenceScore.finalScore * sentimentBoost
  
  return {
    ...item,
    influenceScore,
    sentiment,
    policy,
    finalScore
  }
}

/**
 * Select cards using quota-based algorithm with sentiment balancing
 */
function selectCardsWithQuotas(candidates: ScoredItem[], marketPulse: MarketPulse): Card[] {
  const cards: Card[] = []
  const usedUrls = new Set<string>()
  
  // 1. Always add price card
  cards.push(createPriceCard(marketPulse))
  
  // 2. Separate candidates into pools
  const policyPool = candidates
    .filter(c => c.policy.isPolicy)
    .sort((a, b) => b.finalScore - a.finalScore)
  
  const newsPool = candidates
    .filter(c => c.type === 'news' && !c.policy.isPolicy)
    .sort((a, b) => b.finalScore - a.finalScore)
  
  const kolPool = candidates
    .filter(c => c.type === 'kol')
    .sort((a, b) => b.finalScore - a.finalScore)
  
  // Helper to add card and track URL
  const addCard = (item: ScoredItem): boolean => {
    if (usedUrls.has(item.url)) return false
    cards.push(scoredItemToCard(item))
    usedUrls.add(item.url)
    return true
  }
  
  // 3. Select high-impact policy cards first (0-2)
  const highImpactPolicy = policyPool.filter(c => c.policy.impactLevel === 'high')
  for (const item of highImpactPolicy.slice(0, 2)) {
    if (cards.length >= TARGET_DECK_SIZE) break
    addCard(item)
  }
  
  // 4. Select news cards (2-4)
  let newsAdded = 0
  for (const item of newsPool) {
    if (newsAdded >= CARD_QUOTAS.news.max) break
    if (cards.length >= TARGET_DECK_SIZE) break
    if (addCard(item)) newsAdded++
  }
  
  // 5. Add medium-impact policy if we have room and need more
  if (cards.length < 5) {
    const mediumPolicy = policyPool.filter(c => 
      c.policy.impactLevel === 'medium' && !usedUrls.has(c.url)
    )
    for (const item of mediumPolicy.slice(0, 1)) {
      if (cards.length >= TARGET_DECK_SIZE) break
      addCard(item)
    }
  }
  
  // 6. Fill remaining with KOL cards
  for (const item of kolPool) {
    if (cards.length >= TARGET_DECK_SIZE) break
    addCard(item)
  }
  
  // 7. FALLBACK: If still under 10 cards, relax time windows
  if (cards.length < TARGET_DECK_SIZE) {
    console.log(`Only ${cards.length} cards, applying fallback rules...`)
    
    // Get all remaining candidates sorted by score
    const remaining = [...policyPool, ...newsPool, ...kolPool]
      .filter(c => !usedUrls.has(c.url))
      .sort((a, b) => b.finalScore - a.finalScore)
    
    for (const item of remaining) {
      if (cards.length >= TARGET_DECK_SIZE) break
      addCard(item)
    }
  }
  
  // 8. Check sentiment balance and adjust if needed
  if (cards.length >= 3) {
    const deckStats = analyzeDeckSentiment(cards)
    
    // If unbalanced (>80% one direction), try to add opposing card
    if (!deckStats.isBalanced) {
      const dominantSentiment = deckStats.bullPercentage > 80 ? 'bull' : 'bear'
      const opposingSentiment = dominantSentiment === 'bull' ? 'bear' : 'bull'
      
      // Find best opposing card from remaining candidates
      const opposingCard = [...policyPool, ...newsPool, ...kolPool]
        .filter(c => c.sentiment.classification === opposingSentiment)
        .filter(c => !usedUrls.has(c.url))
        .sort((a, b) => b.finalScore - a.finalScore)[0]
      
      if (opposingCard) {
        if (cards.length < TARGET_DECK_SIZE) {
          addCard(opposingCard)
          console.log(`Added opposing ${opposingSentiment} card for balance`)
        } else {
          // Replace lowest scoring non-price card
          let lowestIdx = -1
          let lowestScore = Infinity
          for (let i = 1; i < cards.length; i++) {
            if (cards[i].confidence < lowestScore) {
              lowestScore = cards[i].confidence
              lowestIdx = i
            }
          }
          if (lowestIdx > 0 && opposingCard.finalScore > lowestScore) {
            cards[lowestIdx] = scoredItemToCard(opposingCard)
            console.log(`Replaced card for sentiment balance`)
          }
        }
      }
    }
  }
  
  // Final log
  const finalStats = analyzeDeckSentiment(cards)
  console.log(`Final deck: ${cards.length} cards, sentiment: ${finalStats.bullPercentage}% bull / ${finalStats.bearPercentage}% bear`)
  
  return cards.slice(0, TARGET_DECK_SIZE)
}

/**
 * Convert scored item to Card format
 */
function scoredItemToCard(item: ScoredItem): Card {
  const generateId = () => Math.random().toString(36).substring(2, 15)
  
  // Determine category
  let category: CategoryTag = 'Market'
  if (item.policy.isPolicy) {
    category = item.policy.type === 'macro' ? 'Macro' : 'Policy'
  } else {
    category = detectCategory(item.content)
  }
  
  // Map source to badge
  const sourceBadge = mapSourceBadge(item.source)
  
  // Calculate confidence from influence score
  const confidence = Math.round(item.influenceScore.finalScore)
  
  // Build insight
  const sentiment = item.sentiment.classification
  const insight = buildInsight(item, category)
  
  return {
    id: generateId(),
    cardType: item.type === 'kol' ? 'kol' : 'news',
    bullBear: sentiment,
    confidence,
    headline: item.title.slice(0, 120),
    sourceBadge,
    categoryTags: [category],
    brief: item.content.slice(0, 300),
    insight,
    primaryLinks: item.url.includes('.gov') ? [item.url] : [],
    secondaryLinks: [item.url],
    originalItem: {
      id: item.id,
      title: item.title,
      source: item.source,
      url: item.url,
      timestamp: item.publishedAt.toISOString()
    },
    relatedItems: [],
    scoreBreakdown: buildScoreBreakdown(item),
    createdAt: new Date().toISOString()
  }
}

/**
 * Build insight text based on sentiment and category
 */
function buildInsight(item: ScoredItem, category: CategoryTag): string {
  const direction = item.sentiment.classification === 'bull' ? 'Positive' : 'Negative'
  const confidence = item.sentiment.confidence > 60 ? 'strong' : 'moderate'
  
  if (item.policy.isPolicy) {
    const jurisdiction = item.policy.jurisdiction !== 'Other' ? ` in ${item.policy.jurisdiction}` : ''
    return `${direction} regulatory signal${jurisdiction} with ${confidence} conviction. Impact window: ${item.policy.effectiveWindowDays} days.`
  }
  
  const categoryInsights: Record<CategoryTag, string> = {
    'Policy': `${direction} policy development with ${confidence} market implications.`,
    'Macro': `${direction} macro signal suggesting ${item.sentiment.classification === 'bull' ? 'risk-on' : 'risk-off'} environment.`,
    'Market': `${direction} market signal with ${confidence} conviction based on ${item.type === 'kol' ? 'community sentiment' : 'news flow'}.`,
    'Tech': `${direction} technical development with ${confidence} ecosystem impact.`,
    'Security': `Security-related ${item.sentiment.classification === 'bull' ? 'positive resolution' : 'concern'} requiring attention.`,
    'Funding': `${direction} capital flow signal indicating ${item.sentiment.classification === 'bull' ? 'growing' : 'cautious'} institutional interest.`,
    'Adoption': `${direction} adoption signal with ${confidence} mainstream impact potential.`
  }
  
  return categoryInsights[category]
}

/**
 * Build score breakdown from scored item
 */
function buildScoreBreakdown(item: ScoredItem): ScoreBreakdown {
  const total = Math.round(item.influenceScore.finalScore)
  return {
    sourceStrength: Math.round(item.influenceScore.sourceAuthority * 20),
    confirmation: item.policy.isPolicy ? 15 : 10,
    specificity: item.content.match(/\d/) ? 12 : 5,
    freshness: item.influenceScore.isFresh ? 15 : Math.round(item.influenceScore.timeDecay * 15),
    conflictPenalty: 0,
    total
  }
}

/**
 * Detect category from content
 */
function detectCategory(text: string): CategoryTag {
  const lowerText = text.toLowerCase()
  
  if (lowerText.match(/sec|regulation|law|legal|policy|congress|senate|bill/)) return 'Policy'
  if (lowerText.match(/fed|rate|inflation|macro|treasury|gdp|employment/)) return 'Macro'
  if (lowerText.match(/hack|exploit|vulnerability|scam|fraud|attack/)) return 'Security'
  if (lowerText.match(/funding|raise|venture|investment|series/)) return 'Funding'
  if (lowerText.match(/adoption|partnership|launch|integrate|accept/)) return 'Adoption'
  if (lowerText.match(/upgrade|protocol|layer|scaling|eip|fork/)) return 'Tech'
  
  return 'Market'
}

/**
 * Map source to badge
 */
function mapSourceBadge(source: string): SourceBadge {
  if (source.toLowerCase().includes('bloomberg')) return 'Bloomberg'
  if (source.toLowerCase().includes('coindesk')) return 'CoinDesk'
  if (source.startsWith('@')) return 'X'
  return 'CoinDesk'
}

/**
 * Create price card
 */
function createPriceCard(marketPulse: MarketPulse): Card {
  const generateId = () => Math.random().toString(36).substring(2, 15)
  const isBull = marketPulse.btcChange24h >= 0
  
  return {
    id: generateId(),
    cardType: 'price',
    bullBear: isBull ? 'bull' : 'bear',
    confidence: 95,
    headline: `BTC ${isBull ? 'up' : 'down'} ${Math.abs(marketPulse.btcChange24h).toFixed(1)}% at $${marketPulse.btcPrice.toLocaleString()}`,
    sourceBadge: 'Price',
    categoryTags: ['Market'],
    brief: `Bitcoin is trading at $${marketPulse.btcPrice.toLocaleString()} with a ${isBull ? 'gain' : 'loss'} of ${Math.abs(marketPulse.btcChange24h).toFixed(2)}% over the past 24 hours.${marketPulse.ethPrice ? ` ETH at $${marketPulse.ethPrice.toLocaleString()} (${(marketPulse.ethChange24h || 0) >= 0 ? '+' : ''}${(marketPulse.ethChange24h || 0).toFixed(2)}%).` : ''}`,
    insight: isBull 
      ? 'Price momentum remains positive. Watch for continuation above key resistance levels.'
      : 'Price weakness suggests caution. Monitor support levels for potential reversal.',
    primaryLinks: ['https://www.coingecko.com/en/coins/bitcoin'],
    secondaryLinks: ['https://www.coinmarketcap.com/currencies/bitcoin/'],
    originalItem: {
      id: 'price-btc',
      title: 'Bitcoin Price',
      source: 'CoinGecko',
      url: 'https://www.coingecko.com/en/coins/bitcoin',
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
}

/**
 * Generate unique deck ID
 */
function generateDeckId(): string {
  return `deck_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Get cached deck (placeholder for future caching)
 */
export async function getTodaysDeck(): Promise<{
  deck: Deck
  marketPulse: MarketPulse
} | null> {
  return null
}

/**
 * Validate deck composition
 */
export function validateDeckComposition(cards: Card[]): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (cards.length < 1) {
    errors.push('Deck has no cards')
  }
  
  const priceCount = cards.filter(c => c.cardType === 'price').length
  if (priceCount < 1) {
    errors.push('Missing price card')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
