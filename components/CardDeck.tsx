'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Card, { CardPlaceholder } from './Card'
import CardDetailPanel from './CardDetailPanel'
import { Card as CardType } from '@/types'

interface CardDeckProps {
  cards: CardType[]
  isLoading: boolean
  isRevealed: boolean
}

export default function CardDeck({ cards, isLoading, isRevealed }: CardDeckProps) {
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null)
  
  // Sort cards: Price first, then by color (bull first), then by confidence
  const sortedCards = useMemo(() => {
    return [...cards].sort((a, b) => {
      // Price cards always first
      if (a.cardType === 'price' && b.cardType !== 'price') return -1
      if (b.cardType === 'price' && a.cardType !== 'price') return 1
      
      // Then sort by bull/bear (bull first)
      if (a.bullBear === 'bull' && b.bullBear === 'bear') return -1
      if (a.bullBear === 'bear' && b.bullBear === 'bull') return 1
      
      // Then sort by confidence (highest first)
      return b.confidence - a.confidence
    })
  }, [cards])
  
  // Separate price card from others
  const priceCard = sortedCards.find(c => c.cardType === 'price')
  const otherCards = sortedCards.filter(c => c.cardType !== 'price')
  
  const handleCardClick = (card: CardType) => {
    setSelectedCard(card)
  }
  
  const handleClosePanel = () => {
    setSelectedCard(null)
  }
  
  return (
    <>
      {/* Card Deck - Grid Layout */}
      <div className="w-full px-4 md:px-0">
        {isLoading ? (
          // Loading placeholders in grid
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <CardPlaceholder key={index} index={index} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Price Card - Full Width */}
            {priceCard && (
              <div className="max-w-md mx-auto">
                <Card
                  key={priceCard.id}
                  card={priceCard}
                  index={0}
                  onClick={() => handleCardClick(priceCard)}
                  isRevealed={isRevealed}
                />
              </div>
            )}
            
            {/* Other Cards - Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 md:gap-4">
              {otherCards.map((card, index) => (
                <Card
                  key={card.id}
                  card={card}
                  index={index + 1}
                  onClick={() => handleCardClick(card)}
                  isRevealed={isRevealed}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Detail Panel */}
      <AnimatePresence>
        {selectedCard && (
          <CardDetailPanel
            card={selectedCard}
            onClose={handleClosePanel}
          />
        )}
      </AnimatePresence>
    </>
  )
}
