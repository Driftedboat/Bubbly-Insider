import { NextResponse } from 'next/server'
import { generateMarketPulse } from '@/lib/mock-data'

export async function GET() {
  try {
    const marketPulse = generateMarketPulse()
    return NextResponse.json(marketPulse)
  } catch (error) {
    console.error('Error fetching market pulse:', error)
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    )
  }
}
