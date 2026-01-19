import { ScrapedNewsItem, ScraperResult } from './types'

/**
 * Scrape crypto news from multiple sources
 */

// RSS Feed URLs
const RSS_FEEDS = {
  coindesk: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
  theblock: 'https://www.theblock.co/rss.xml',
  decrypt: 'https://decrypt.co/feed',
}

// Bloomberg Crypto page (we'll scrape headlines)
const BLOOMBERG_CRYPTO_URL = 'https://www.bloomberg.com/crypto'

/**
 * Parse RSS XML to extract news items
 */
function parseRSSXML(xml: string, source: ScrapedNewsItem['source']): ScrapedNewsItem[] {
  const items: ScrapedNewsItem[] = []
  
  // Simple regex-based XML parsing (works for RSS)
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || []
  
  for (const itemXml of itemMatches.slice(0, 20)) { // Limit to 20 items
    try {
      const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)?.[1] 
        || itemXml.match(/<title>(.*?)<\/title>/)?.[1] 
        || ''
      
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || ''
      
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
      
      const description = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/)?.[1]
        || itemXml.match(/<description>(.*?)<\/description>/)?.[1]
        || ''
      
      // Extract category if available
      const category = itemXml.match(/<category>(.*?)<\/category>/)?.[1] || undefined
      
      if (title && link) {
        items.push({
          title: cleanText(title),
          url: link.trim(),
          source,
          snippet: cleanText(description).slice(0, 300),
          publishedAt: pubDate ? new Date(pubDate) : new Date(),
          category: category ? cleanText(category) : undefined
        })
      }
    } catch (e) {
      console.error('Error parsing RSS item:', e)
    }
  }
  
  return items
}

/**
 * Clean HTML entities and tags from text
 */
function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Scrape CoinDesk RSS feed
 */
export async function scrapeCoinDesk(): Promise<ScraperResult<ScrapedNewsItem>> {
  const errors: string[] = []
  let data: ScrapedNewsItem[] = []
  
  try {
    const response = await fetch(RSS_FEEDS.coindesk, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BubblyInsider/1.0)',
      },
      next: { revalidate: 600 } // Cache for 10 minutes
    })
    
    if (!response.ok) {
      throw new Error(`CoinDesk RSS returned ${response.status}`)
    }
    
    const xml = await response.text()
    data = parseRSSXML(xml, 'CoinDesk')
    
  } catch (error) {
    errors.push(`CoinDesk scrape failed: ${error}`)
  }
  
  return {
    success: errors.length === 0,
    data,
    errors,
    scrapedAt: new Date()
  }
}

/**
 * Scrape The Block RSS feed
 */
export async function scrapeTheBlock(): Promise<ScraperResult<ScrapedNewsItem>> {
  const errors: string[] = []
  let data: ScrapedNewsItem[] = []
  
  try {
    const response = await fetch(RSS_FEEDS.theblock, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BubblyInsider/1.0)',
      },
      next: { revalidate: 600 }
    })
    
    if (!response.ok) {
      throw new Error(`The Block RSS returned ${response.status}`)
    }
    
    const xml = await response.text()
    data = parseRSSXML(xml, 'TheBlock')
    
  } catch (error) {
    errors.push(`The Block scrape failed: ${error}`)
  }
  
  return {
    success: errors.length === 0,
    data,
    errors,
    scrapedAt: new Date()
  }
}

/**
 * Scrape Decrypt RSS feed
 */
export async function scrapeDecrypt(): Promise<ScraperResult<ScrapedNewsItem>> {
  const errors: string[] = []
  let data: ScrapedNewsItem[] = []
  
  try {
    const response = await fetch(RSS_FEEDS.decrypt, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BubblyInsider/1.0)',
      },
      next: { revalidate: 600 }
    })
    
    if (!response.ok) {
      throw new Error(`Decrypt RSS returned ${response.status}`)
    }
    
    const xml = await response.text()
    data = parseRSSXML(xml, 'Decrypt')
    
  } catch (error) {
    errors.push(`Decrypt scrape failed: ${error}`)
  }
  
  return {
    success: errors.length === 0,
    data,
    errors,
    scrapedAt: new Date()
  }
}

/**
 * Scrape Bloomberg Crypto headlines (limited due to paywall)
 * This uses a proxy-friendly approach with public metadata
 */
export async function scrapeBloomberg(): Promise<ScraperResult<ScrapedNewsItem>> {
  const errors: string[] = []
  const data: ScrapedNewsItem[] = []
  
  try {
    // Bloomberg blocks most scrapers, so we use their public API endpoints
    // that power their frontend (found via network inspection)
    const response = await fetch('https://www.bloomberg.com/lineup-next/api/paginated?id=702ee5ee-f3c6-4f61-bf5d-3e498e6a34e5&page=0', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 600 }
    })
    
    if (response.ok) {
      const json = await response.json()
      
      // Parse Bloomberg's JSON structure
      const items = json?.items || []
      for (const item of items.slice(0, 15)) {
        if (item.headline && item.url) {
          data.push({
            title: item.headline,
            url: `https://www.bloomberg.com${item.url}`,
            source: 'Bloomberg',
            snippet: item.summary || item.abstract || '',
            publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
            category: 'Crypto'
          })
        }
      }
    } else {
      // Fallback: try to scrape the HTML page
      const htmlResponse = await fetch(BLOOMBERG_CRYPTO_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })
      
      if (htmlResponse.ok) {
        const html = await htmlResponse.text()
        
        // Extract headlines from meta tags and structured data
        const titleMatches = html.match(/<h3[^>]*class="[^"]*Story[^"]*"[^>]*>(.*?)<\/h3>/g) || []
        const linkMatches = html.match(/href="(\/news\/articles\/[^"]+)"/g) || []
        
        for (let i = 0; i < Math.min(titleMatches.length, linkMatches.length, 10); i++) {
          const title = cleanText(titleMatches[i])
          const url = linkMatches[i]?.match(/href="([^"]+)"/)?.[1] || ''
          
          if (title && url) {
            data.push({
              title,
              url: `https://www.bloomberg.com${url}`,
              source: 'Bloomberg',
              publishedAt: new Date(),
              category: 'Crypto'
            })
          }
        }
      }
    }
    
    if (data.length === 0) {
      errors.push('Bloomberg scrape returned no data (may be rate limited)')
    }
    
  } catch (error) {
    errors.push(`Bloomberg scrape failed: ${error}`)
  }
  
  return {
    success: data.length > 0,
    data,
    errors,
    scrapedAt: new Date()
  }
}

/**
 * Scrape all news sources
 */
export async function scrapeAllNews(): Promise<ScraperResult<ScrapedNewsItem>> {
  const results = await Promise.all([
    scrapeCoinDesk(),
    scrapeTheBlock(),
    scrapeDecrypt(),
    scrapeBloomberg(),
  ])
  
  const allData: ScrapedNewsItem[] = []
  const allErrors: string[] = []
  
  for (const result of results) {
    allData.push(...result.data)
    allErrors.push(...result.errors)
  }
  
  // Sort by publishedAt (newest first)
  allData.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
  
  // Deduplicate by title similarity
  const seen = new Set<string>()
  const dedupedData = allData.filter(item => {
    const normalizedTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 50)
    if (seen.has(normalizedTitle)) return false
    seen.add(normalizedTitle)
    return true
  })
  
  return {
    success: dedupedData.length > 0,
    data: dedupedData,
    errors: allErrors,
    scrapedAt: new Date()
  }
}
