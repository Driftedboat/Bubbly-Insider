import { NextResponse } from 'next/server'
import { runIngestion } from '@/lib/ingestion'

/**
 * POST /api/scrape
 * Trigger scraping of news and KOL posts
 */
export async function POST() {
  try {
    console.log('Starting scrape...')
    const result = await runIngestion()
    
    console.log('Scrape complete:', result)
    
    return NextResponse.json({
      success: true,
      results: result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Scrape error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Scrape failed' 
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/scrape
 * Get scrape status / last run info
 */
export async function GET() {
  return NextResponse.json({
    message: 'Use POST to trigger a scrape',
    endpoints: {
      scrape: 'POST /api/scrape - Run full scrape',
      discover: 'POST /api/discover - Generate deck',
      market: 'GET /api/market_pulse - Get prices'
    },
    setup: {
      news: 'RSS feeds (no API key needed)',
      kol: 'Requires TWITTER_BEARER_TOKEN env var',
      prices: 'CoinGecko free tier (no API key needed)'
    }
  })
}
