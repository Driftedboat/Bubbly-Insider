import { NextResponse } from 'next/server'
import { fetchMarketPulse } from '@/lib/scrapers/price-scraper'
import { generateMarketPulse } from '@/lib/mock-data'

export async function GET() {
  try {
    // Try real market data first
    const marketPulse = await fetchMarketPulse()
    
    // Fall back to mock if no data
    if (marketPulse.btcPrice === 0) {
      return NextResponse.json(generateMarketPulse())
    }
    
    return NextResponse.json(marketPulse)
  } catch (error) {
    console.error('Error fetching market pulse:', error)
    // Fall back to mock data
    return NextResponse.json(generateMarketPulse())
  }
}
