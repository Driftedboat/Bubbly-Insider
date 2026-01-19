'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import MarketStrip from '@/components/MarketStrip'
import DiscoverButton from '@/components/DiscoverButton'
import CardDeck from '@/components/CardDeck'
import { Card, MarketPulse, DiscoverResponse } from '@/types'

export default function DiscoveryPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [marketPulse, setMarketPulse] = useState<MarketPulse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDiscover = useCallback(async () => {
    setIsLoading(true)
    setIsRevealed(false)
    setError(null)

    try {
      const response = await fetch('/api/discover', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch deck')
      }

      const data: DiscoverResponse = await response.json()
      
      setCards(data.cards)
      setMarketPulse(data.marketPulse)
      setLastUpdated(new Date().toISOString())

      // Trigger reveal animation after a short delay
      setTimeout(() => {
        setIsRevealed(true)
      }, 300)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      console.error('Discover error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-terminal-green/20 py-4 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.h1 
            className="font-pixel text-lg md:text-xl text-terminal-green glow-text tracking-wider"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            BUBBLY INSIDER
          </motion.h1>
          
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-xs font-terminal text-terminal-green/50">
              Daily Crypto Denoise Deck
            </span>
            {/* Settings icon placeholder */}
            <button className="w-8 h-8 flex items-center justify-center text-terminal-green/50 hover:text-terminal-green transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Market Strip */}
      <MarketStrip marketPulse={marketPulse} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12">
        {/* Discover Button */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <DiscoverButton 
            onClick={handleDiscover}
            isLoading={isLoading}
            lastUpdated={lastUpdated}
          />
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div 
            className="mb-6 p-3 bg-bear-red/20 border border-bear-red text-bear-red font-terminal text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {/* Card Deck */}
        <motion.div 
          className="w-full max-w-7xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {(cards.length > 0 || isLoading) && (
            <CardDeck 
              cards={cards}
              isLoading={isLoading}
              isRevealed={isRevealed}
            />
          )}

          {/* Empty State */}
          {cards.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="inline-block p-8 border border-dashed border-terminal-green/30">
                <p className="font-terminal text-terminal-green/50 text-lg mb-2">
                  Your daily deck awaits
                </p>
                <p className="font-terminal text-terminal-green/30 text-sm">
                  Click Discover to reveal 10 insider cards
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Deck Info */}
        {cards.length > 0 && !isLoading && (
          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p className="text-xs font-terminal text-terminal-green/40">
              {cards.filter(c => c.bullBear === 'bull').length} Bull · {cards.filter(c => c.bullBear === 'bear').length} Bear · Click any card for details
            </p>
          </motion.div>
        )}
      </main>
    </div>
  )
}
