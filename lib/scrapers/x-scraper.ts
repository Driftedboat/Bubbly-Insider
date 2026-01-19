import { ScrapedKOLPost, ScraperResult, TOP_KOLS } from './types'

/**
 * X/Twitter Scraper
 * 
 * Strategy:
 * 1. Try official API if TWITTER_BEARER_TOKEN is set
 * 2. Fall back to Nitter instances (no auth required)
 */

const TWITTER_API_BASE = 'https://api.twitter.com/2'

// Nitter instances (public, no auth needed) - updated list
const NITTER_INSTANCES = [
  'https://nitter.cz',
  'https://nitter.privacydev.net',
  'https://nitter.poast.org',
  'https://nitter.net',
  'https://nitter.1d4.us',
  'https://nitter.kavin.rocks',
  'https://nitter.unixfox.eu',
]

// Twitter syndication endpoint (public, works without auth for some users)
const TWITTER_SYNDICATION = 'https://syndication.twitter.com'

interface TwitterUser {
  id: string
  username: string
  name: string
}

interface TwitterTweet {
  id: string
  text: string
  created_at: string
  public_metrics?: {
    like_count: number
    retweet_count: number
    reply_count: number
    impression_count?: number
  }
  author_id: string
}

/**
 * Get bearer token from environment
 */
function getBearerToken(): string | null {
  return process.env.TWITTER_BEARER_TOKEN || null
}

/**
 * Make authenticated request to Twitter API
 */
async function twitterApiRequest<T>(endpoint: string, params?: Record<string, string>): Promise<T | null> {
  const token = getBearerToken()
  
  if (!token) {
    console.warn('TWITTER_BEARER_TOKEN not set')
    return null
  }
  
  const url = new URL(`${TWITTER_API_BASE}${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }
  
  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error(`Twitter API error ${response.status}:`, error)
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Twitter API request failed:', error)
    return null
  }
}

/**
 * Get user IDs for a list of usernames
 */
async function getUserIds(usernames: string[]): Promise<Map<string, TwitterUser>> {
  const userMap = new Map<string, TwitterUser>()
  
  // Twitter API allows max 100 usernames per request
  const chunks = []
  for (let i = 0; i < usernames.length; i += 100) {
    chunks.push(usernames.slice(i, i + 100))
  }
  
  for (const chunk of chunks) {
    const response = await twitterApiRequest<{
      data?: TwitterUser[]
    }>('/users/by', {
      usernames: chunk.join(','),
      'user.fields': 'id,username,name'
    })
    
    if (response?.data) {
      for (const user of response.data) {
        userMap.set(user.username.toLowerCase(), user)
      }
    }
  }
  
  return userMap
}

/**
 * Get recent tweets from a user
 */
async function getUserTweets(userId: string, maxResults: number = 10): Promise<TwitterTweet[]> {
  const response = await twitterApiRequest<{
    data?: TwitterTweet[]
  }>(`/users/${userId}/tweets`, {
    max_results: maxResults.toString(),
    'tweet.fields': 'created_at,public_metrics,author_id',
    exclude: 'retweets,replies' // Only original tweets
  })
  
  return response?.data || []
}

/**
 * Search recent tweets by query
 */
async function searchTweets(query: string, maxResults: number = 100): Promise<{
  tweets: TwitterTweet[]
  users: Map<string, TwitterUser>
}> {
  const response = await twitterApiRequest<{
    data?: TwitterTweet[]
    includes?: {
      users?: TwitterUser[]
    }
  }>('/tweets/search/recent', {
    query,
    max_results: Math.min(maxResults, 100).toString(),
    'tweet.fields': 'created_at,public_metrics,author_id',
    'user.fields': 'id,username,name',
    expansions: 'author_id'
  })
  
  const users = new Map<string, TwitterUser>()
  if (response?.includes?.users) {
    for (const user of response.includes.users) {
      users.set(user.id, user)
    }
  }
  
  return {
    tweets: response?.data || [],
    users
  }
}

/**
 * Convert Twitter tweet to our format
 */
function convertTweet(tweet: TwitterTweet, user: TwitterUser): ScrapedKOLPost {
  return {
    id: tweet.id,
    authorHandle: user.username,
    authorName: user.name,
    content: tweet.text,
    url: `https://x.com/${user.username}/status/${tweet.id}`,
    publishedAt: new Date(tweet.created_at),
    metrics: tweet.public_metrics ? {
      likes: tweet.public_metrics.like_count,
      retweets: tweet.public_metrics.retweet_count,
      replies: tweet.public_metrics.reply_count,
      views: tweet.public_metrics.impression_count
    } : undefined
  }
}

/**
 * Scrape tweets from top KOLs
 */
export async function scrapeKOLTweets(
  kols: string[] = TOP_KOLS,
  tweetsPerKol: number = 5
): Promise<ScraperResult<ScrapedKOLPost>> {
  const errors: string[] = []
  const data: ScrapedKOLPost[] = []
  
  const token = getBearerToken()
  if (!token) {
    return {
      success: false,
      data: [],
      errors: ['TWITTER_BEARER_TOKEN not set. Get your API key at https://developer.twitter.com/'],
      scrapedAt: new Date()
    }
  }
  
  try {
    // Get user IDs
    const userMap = await getUserIds(kols)
    
    if (userMap.size === 0) {
      errors.push('Could not fetch any user IDs')
      return { success: false, data, errors, scrapedAt: new Date() }
    }
    
    // Fetch tweets for each user
    for (const [username, user] of userMap) {
      try {
        const tweets = await getUserTweets(user.id, tweetsPerKol)
        
        for (const tweet of tweets) {
          data.push(convertTweet(tweet, user))
        }
        
        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        errors.push(`Failed to fetch tweets for @${username}: ${error}`)
      }
    }
    
  } catch (error) {
    errors.push(`KOL scrape failed: ${error}`)
  }
  
  // Sort by engagement (likes + retweets)
  data.sort((a, b) => {
    const aScore = (a.metrics?.likes || 0) + (a.metrics?.retweets || 0) * 2
    const bScore = (b.metrics?.likes || 0) + (b.metrics?.retweets || 0) * 2
    return bScore - aScore
  })
  
  return {
    success: data.length > 0,
    data,
    errors,
    scrapedAt: new Date()
  }
}

/**
 * Search for crypto-related tweets
 */
export async function searchCryptoTweets(
  keywords: string[] = ['$BTC', '$ETH', 'crypto', 'bitcoin', 'ethereum'],
  maxResults: number = 50
): Promise<ScraperResult<ScrapedKOLPost>> {
  const errors: string[] = []
  const data: ScrapedKOLPost[] = []
  
  const token = getBearerToken()
  if (!token) {
    return {
      success: false,
      data: [],
      errors: ['TWITTER_BEARER_TOKEN not set'],
      scrapedAt: new Date()
    }
  }
  
  try {
    // Build search query - crypto keywords with minimum engagement
    const query = `(${keywords.join(' OR ')}) -is:retweet -is:reply lang:en`
    
    const { tweets, users } = await searchTweets(query, maxResults)
    
    for (const tweet of tweets) {
      const user = users.get(tweet.author_id)
      if (user) {
        data.push(convertTweet(tweet, user))
      }
    }
    
  } catch (error) {
    errors.push(`Crypto tweet search failed: ${error}`)
  }
  
  return {
    success: data.length > 0,
    data,
    errors,
    scrapedAt: new Date()
  }
}

/**
 * Get a working Nitter instance
 */
async function getWorkingNitterInstance(): Promise<string | null> {
  for (const instance of NITTER_INSTANCES) {
    try {
      const response = await fetch(instance, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      })
      if (response.ok) {
        return instance
      }
    } catch {
      continue
    }
  }
  return null
}

/**
 * Parse tweets from Nitter HTML
 */
function parseNitterHTML(html: string, username: string): ScrapedKOLPost[] {
  const posts: ScrapedKOLPost[] = []
  
  // Match tweet containers - Nitter uses timeline-item class
  const tweetMatches = html.match(/<div class="timeline-item[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g) || []
  
  for (const tweetHtml of tweetMatches.slice(0, 10)) {
    try {
      // Extract tweet content
      const contentMatch = tweetHtml.match(/<div class="tweet-content[^"]*"[^>]*>([\s\S]*?)<\/div>/)
      const content = contentMatch?.[1]
        ?.replace(/<[^>]*>/g, ' ')
        ?.replace(/\s+/g, ' ')
        ?.trim() || ''
      
      if (!content || content.length < 10) continue
      
      // Extract tweet link/ID
      const linkMatch = tweetHtml.match(/href="\/([^/]+)\/status\/(\d+)"/)
      const tweetId = linkMatch?.[2] || `nitter_${Date.now()}_${Math.random().toString(36).slice(2)}`
      const handle = linkMatch?.[1] || username
      
      // Extract timestamp
      const timeMatch = tweetHtml.match(/<span class="tweet-date"[^>]*><a[^>]*title="([^"]*)"/)
      let publishedAt = new Date()
      if (timeMatch?.[1]) {
        try {
          publishedAt = new Date(timeMatch[1])
        } catch {}
      }
      
      // Extract display name
      const nameMatch = tweetHtml.match(/<a class="fullname"[^>]*>([^<]*)</)
      const authorName = nameMatch?.[1]?.trim() || handle
      
      // Extract stats
      const likesMatch = tweetHtml.match(/<span class="icon-heart"[^>]*><\/span>\s*(\d+)/)
      const retweetsMatch = tweetHtml.match(/<span class="icon-retweet"[^>]*><\/span>\s*(\d+)/)
      const repliesMatch = tweetHtml.match(/<span class="icon-comment"[^>]*><\/span>\s*(\d+)/)
      
      posts.push({
        id: tweetId,
        authorHandle: handle,
        authorName,
        content,
        url: `https://x.com/${handle}/status/${tweetId}`,
        publishedAt,
        metrics: {
          likes: parseInt(likesMatch?.[1] || '0'),
          retweets: parseInt(retweetsMatch?.[1] || '0'),
          replies: parseInt(repliesMatch?.[1] || '0'),
        }
      })
    } catch (e) {
      console.error('Error parsing Nitter tweet:', e)
    }
  }
  
  return posts
}

/**
 * Scrape user tweets via Nitter
 */
async function scrapeViaNitter(username: string, nitterBase: string): Promise<ScrapedKOLPost[]> {
  try {
    const response = await fetch(`${nitterBase}/${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(10000)
    })
    
    if (!response.ok) {
      return []
    }
    
    const html = await response.text()
    return parseNitterHTML(html, username)
  } catch (error) {
    console.error(`Nitter scrape failed for @${username}:`, error)
    return []
  }
}

/**
 * Scrape via Twitter's syndication API (works for public profiles)
 */
async function scrapeViaSyndication(username: string): Promise<ScrapedKOLPost[]> {
  try {
    // Twitter's syndication timeline endpoint
    const response = await fetch(
      `${TWITTER_SYNDICATION}/srv/timeline-profile/screen-name/${username}?showReplies=false`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*',
        },
        signal: AbortSignal.timeout(10000)
      }
    )
    
    if (!response.ok) {
      return []
    }
    
    const html = await response.text()
    
    // Parse the embedded JSON data
    const jsonMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)
    if (!jsonMatch) return []
    
    const data = JSON.parse(jsonMatch[1])
    const tweets = data?.props?.pageProps?.timeline?.entries || []
    
    return tweets.slice(0, 10).map((entry: {
      content?: {
        tweet?: {
          id_str?: string
          full_text?: string
          created_at?: string
          favorite_count?: number
          retweet_count?: number
          user?: {
            screen_name?: string
            name?: string
          }
        }
      }
    }) => {
      const tweet = entry?.content?.tweet
      if (!tweet) return null
      
      return {
        id: tweet.id_str || `syn_${Date.now()}`,
        authorHandle: tweet.user?.screen_name || username,
        authorName: tweet.user?.name || username,
        content: tweet.full_text || '',
        url: `https://x.com/${username}/status/${tweet.id_str}`,
        publishedAt: new Date(tweet.created_at || Date.now()),
        metrics: {
          likes: tweet.favorite_count || 0,
          retweets: tweet.retweet_count || 0,
          replies: 0,
        }
      }
    }).filter(Boolean) as ScrapedKOLPost[]
  } catch (error) {
    console.error(`Syndication scrape failed for @${username}:`, error)
    return []
  }
}

/**
 * Scrape via RSSHub (public RSS service for Twitter)
 */
async function scrapeViaRSSHub(username: string): Promise<ScrapedKOLPost[]> {
  const rsshubInstances = [
    'https://rsshub.app',
    'https://rsshub.rssforever.com',
    'https://hub.slarker.me',
  ]
  
  for (const instance of rsshubInstances) {
    try {
      const response = await fetch(
        `${instance}/twitter/user/${username}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; BubblyInsider/1.0)',
            'Accept': 'application/rss+xml, application/xml',
          },
          signal: AbortSignal.timeout(8000)
        }
      )
      
      if (!response.ok) continue
      
      const xml = await response.text()
      const posts: ScrapedKOLPost[] = []
      
      // Parse RSS items
      const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || []
      
      for (const itemXml of itemMatches.slice(0, 10)) {
        const title = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1]
          || itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1] || ''
        
        const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1] || ''
        const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || ''
        
        // Extract tweet ID from link
        const tweetId = link.match(/status\/(\d+)/)?.[1] || `rss_${Date.now()}`
        
        if (title && title.length > 10) {
          posts.push({
            id: tweetId,
            authorHandle: username,
            authorName: username,
            content: title.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
            url: link || `https://x.com/${username}/status/${tweetId}`,
            publishedAt: pubDate ? new Date(pubDate) : new Date(),
            metrics: { likes: 0, retweets: 0, replies: 0 }
          })
        }
      }
      
      if (posts.length > 0) {
        return posts
      }
    } catch {
      continue
    }
  }
  
  return []
}

/**
 * Try multiple scraping methods for a single user
 */
async function scrapeUserTweets(username: string, nitterBase: string | null): Promise<ScrapedKOLPost[]> {
  // Try syndication first (most reliable)
  let posts = await scrapeViaSyndication(username)
  if (posts.length > 0) return posts
  
  // Try RSSHub
  posts = await scrapeViaRSSHub(username)
  if (posts.length > 0) return posts
  
  // Try Nitter if available
  if (nitterBase) {
    posts = await scrapeViaNitter(username, nitterBase)
    if (posts.length > 0) return posts
  }
  
  return []
}

/**
 * Scrape KOL tweets using multiple methods (no API key needed)
 */
export async function scrapeKOLsViaNitter(
  kols: string[] = TOP_KOLS.slice(0, 10) // Limit to avoid rate limiting
): Promise<ScraperResult<ScrapedKOLPost>> {
  const errors: string[] = []
  const data: ScrapedKOLPost[] = []
  
  // Try to find a working Nitter instance (but don't fail if none available)
  const nitterBase = await getWorkingNitterInstance()
  
  if (nitterBase) {
    console.log(`Using Nitter instance: ${nitterBase}`)
  } else {
    console.log('No Nitter instance available, using syndication only')
  }
  
  // Scrape each KOL with rate limiting
  let successCount = 0
  for (const kol of kols) {
    try {
      const posts = await scrapeUserTweets(kol, nitterBase)
      if (posts.length > 0) {
        data.push(...posts)
        successCount++
      }
      
      // Rate limiting - wait between requests
      await new Promise(resolve => setTimeout(resolve, 800))
    } catch (error) {
      errors.push(`Failed to scrape @${kol}: ${error}`)
    }
  }
  
  console.log(`Successfully scraped ${successCount}/${kols.length} KOLs, got ${data.length} posts`)
  
  // Sort by engagement
  data.sort((a, b) => {
    const aScore = (a.metrics?.likes || 0) + (a.metrics?.retweets || 0) * 2
    const bScore = (b.metrics?.likes || 0) + (b.metrics?.retweets || 0) * 2
    return bScore - aScore
  })
  
  if (data.length === 0) {
    errors.push('Could not scrape any KOL tweets. Twitter may be blocking requests.')
  }
  
  return {
    success: data.length > 0,
    data,
    errors,
    scrapedAt: new Date()
  }
}

/**
 * Scrape all X/Twitter data
 * Tries official API first, falls back to Nitter
 */
export async function scrapeAllX(): Promise<ScraperResult<ScrapedKOLPost>> {
  const token = getBearerToken()
  
  // If we have a token, try the official API
  if (token) {
    const [kolResult, searchResult] = await Promise.all([
      scrapeKOLTweets(),
      searchCryptoTweets()
    ])
    
    const allData = [...kolResult.data, ...searchResult.data]
    const allErrors = [...kolResult.errors, ...searchResult.errors]
    
    if (allData.length > 0) {
      // Deduplicate by tweet ID
      const seen = new Set<string>()
      const dedupedData = allData.filter(post => {
        if (seen.has(post.id)) return false
        seen.add(post.id)
        return true
      })
      
      dedupedData.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      
      return {
        success: true,
        data: dedupedData,
        errors: allErrors,
        scrapedAt: new Date()
      }
    }
  }
  
  // Fall back to Nitter scraping (no API key needed)
  console.log('Using Nitter fallback for Twitter scraping...')
  const nitterResult = await scrapeKOLsViaNitter()
  
  if (!token && nitterResult.data.length === 0) {
    nitterResult.errors.push('Tip: Set TWITTER_BEARER_TOKEN for more reliable scraping')
  }
  
  return nitterResult
}
