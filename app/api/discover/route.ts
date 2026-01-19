import { NextResponse } from 'next/server'
import { generateDeck, getTodaysDeck } from '@/lib/deck-generator'
import { DiscoverResponse } from '@/types'

export async function POST() {
  try {
    // Check for cached deck
    let result = await getTodaysDeck()
    
    // Generate fresh deck if no cache
    if (!result) {
      result = await generateDeck()
    }
    
    const response: DiscoverResponse = {
      deckId: result.deck.id,
      marketPulse: result.marketPulse,
      cards: result.deck.cards
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error generating deck:', error)
    return NextResponse.json(
      { error: 'Failed to generate deck' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // GET returns the same as POST for convenience
  return POST()
}
