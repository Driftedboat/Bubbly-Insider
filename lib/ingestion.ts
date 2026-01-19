import { prisma } from './prisma'

// Check if database is available
const isDbAvailable = () => prisma !== null
import { scrapeAllNews, scrapeAllX, fetchMarketPulse, ScrapedNewsItem, ScrapedKOLPost } from './scrapers'
import { calculateConfidence, determineBullBear } from './confidence-scorer'
import { Card, CategoryTag, SourceBadge } from '@/types'

/**
 * Ingest news items into database
 */
export async function ingestNews(items: ScrapedNewsItem[]): Promise<number> {
  if (!isDbAvailable() || !prisma) {
    console.warn('Database not available, skipping news ingestion')
    return 0
  }
  
  let ingested = 0
  
  for (const item of items) {
    try {
      // Check if already exists
      const existing = await prisma.sourceItem.findFirst({
        where: { url: item.url }
      })
      
      if (existing) continue
      
      await prisma.sourceItem.create({
        data: {
          type: 'news',
          sourceName: item.source,
          url: item.url,
          title: item.title,
          contentSnippet: item.snippet,
          publishedAt: item.publishedAt,
          rawJson: JSON.stringify(item)
        }
      })
      
      ingested++
    } catch (error) {
      console.error('Error ingesting news item:', error)
    }
  }
  
  return ingested
}

/**
 * Ingest KOL posts into database
 */
export async function ingestKOLPosts(posts: ScrapedKOLPost[]): Promise<number> {
  if (!isDbAvailable() || !prisma) {
    console.warn('Database not available, skipping KOL ingestion')
    return 0
  }
  
  let ingested = 0
  
  for (const post of posts) {
    try {
      // Check if already exists
      const existing = await prisma.sourceItem.findFirst({
        where: { url: post.url }
      })
      
      if (existing) continue
      
      await prisma.sourceItem.create({
        data: {
          type: 'kol',
          sourceName: `@${post.authorHandle}`,
          url: post.url,
          title: post.content.slice(0, 200),
          contentSnippet: post.content,
          publishedAt: post.publishedAt,
          rawJson: JSON.stringify(post)
        }
      })
      
      ingested++
    } catch (error) {
      console.error('Error ingesting KOL post:', error)
    }
  }
  
  return ingested
}

/**
 * Run full ingestion pipeline
 */
export async function runIngestion(): Promise<{
  news: { scraped: number; ingested: number; errors: string[] }
  kol: { scraped: number; ingested: number; errors: string[] }
}> {
  // Scrape news
  const newsResult = await scrapeAllNews()
  const newsIngested = await ingestNews(newsResult.data)
  
  // Scrape KOL posts
  const kolResult = await scrapeAllX()
  const kolIngested = await ingestKOLPosts(kolResult.data)
  
  return {
    news: {
      scraped: newsResult.data.length,
      ingested: newsIngested,
      errors: newsResult.errors
    },
    kol: {
      scraped: kolResult.data.length,
      ingested: kolIngested,
      errors: kolResult.errors
    }
  }
}

/**
 * Map news source to our SourceBadge type
 */
function mapSourceBadge(source: string): SourceBadge {
  if (source.toLowerCase().includes('bloomberg')) return 'Bloomberg'
  if (source.toLowerCase().includes('coindesk')) return 'CoinDesk'
  if (source.startsWith('@')) return 'X'
  return 'CoinDesk' // Default
}

/**
 * Detect category from title/content
 */
function detectCategory(title: string, content?: string): CategoryTag {
  const text = `${title} ${content || ''}`.toLowerCase()
  
  if (text.match(/sec|regulation|law|legal|policy|congress|senate|bill/)) return 'Policy'
  if (text.match(/fed|rate|inflation|macro|treasury|gdp|employment/)) return 'Macro'
  if (text.match(/hack|exploit|vulnerability|scam|fraud|attack/)) return 'Security'
  if (text.match(/funding|raise|venture|investment|series/)) return 'Funding'
  if (text.match(/adoption|partnership|launch|integrate|accept/)) return 'Adoption'
  if (text.match(/upgrade|protocol|layer|scaling|eip|fork/)) return 'Tech'
  
  return 'Market'
}

/**
 * Convert source item to card format
 */
export function sourceItemToCard(item: {
  id: string
  type: string
  sourceName: string
  url: string
  title: string
  contentSnippet: string | null
  publishedAt: Date
  rawJson: string | null
}): Omit<Card, 'id' | 'createdAt'> {
  const isNews = item.type === 'news'
  const isKOL = item.type === 'kol'
  
  // Calculate hours ago
  const hoursAgo = Math.floor((Date.now() - item.publishedAt.getTime()) / (1000 * 60 * 60))
  
  // Parse raw JSON for additional data
  let rawData: ScrapedNewsItem | ScrapedKOLPost | null = null
  try {
    if (item.rawJson) {
      rawData = JSON.parse(item.rawJson)
    }
  } catch {}
  
  // Determine bull/bear
  const keywords = `${item.title} ${item.contentSnippet || ''}`.split(/\s+/)
  const bullBear = determineBullBear(
    isNews ? 'news' : 'kol',
    keywords
  )
  
  // Calculate confidence
  const confidence = calculateConfidence({
    cardType: isNews ? 'news' : 'kol',
    sourceBadge: mapSourceBadge(item.sourceName),
    hasPrimarySource: isNews && item.url.includes('.gov'),
    hasSecondarySource: true,
    confirmationCount: 1,
    hasSpecificDetails: item.title.match(/\d/) !== null,
    hoursAgo,
    hasConflict: false,
    isContested: false
  })
  
  const category = detectCategory(item.title, item.contentSnippet || undefined)
  
  return {
    cardType: isNews ? 'news' : 'kol',
    bullBear,
    confidence: confidence.total,
    headline: item.title.slice(0, 120),
    sourceBadge: mapSourceBadge(item.sourceName),
    categoryTags: [category],
    brief: item.contentSnippet || item.title,
    insight: `${bullBear === 'bull' ? 'Positive' : 'Negative'} signal for crypto markets based on ${category.toLowerCase()} developments.`,
    primaryLinks: isNews && item.url.includes('.gov') ? [item.url] : [],
    secondaryLinks: [item.url],
    originalItem: {
      id: item.id,
      title: item.title,
      source: item.sourceName,
      url: item.url,
      timestamp: item.publishedAt.toISOString()
    },
    relatedItems: [],
    scoreBreakdown: confidence
  }
}

/**
 * Get recent items from database for deck generation
 */
export async function getRecentItems(hoursBack: number = 24): Promise<{
  news: Array<{
    id: string
    type: string
    sourceName: string
    url: string
    title: string
    contentSnippet: string | null
    publishedAt: Date
    rawJson: string | null
  }>
  kol: Array<{
    id: string
    type: string
    sourceName: string
    url: string
    title: string
    contentSnippet: string | null
    publishedAt: Date
    rawJson: string | null
  }>
}> {
  if (!isDbAvailable() || !prisma) {
    return { news: [], kol: [] }
  }
  
  const cutoff = new Date(Date.now() - hoursBack * 60 * 60 * 1000)
  
  const [news, kol] = await Promise.all([
    prisma.sourceItem.findMany({
      where: {
        type: 'news',
        publishedAt: { gte: cutoff }
      },
      orderBy: { publishedAt: 'desc' },
      take: 50
    }),
    prisma.sourceItem.findMany({
      where: {
        type: 'kol',
        publishedAt: { gte: cutoff }
      },
      orderBy: { publishedAt: 'desc' },
      take: 100
    })
  ])
  
  return { news, kol }
}
