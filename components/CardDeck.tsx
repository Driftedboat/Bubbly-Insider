'use client'

import { useState } from 'react'
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
  
  const handleCardClick = (card: CardType) => {
    setSelectedCard(card)
  }
  
  const handleClosePanel = () => {
    setSelectedCard(null)
  }
  
  return (
    <>
      {/* Card Deck */}
      <div className="w-full overflow-x-auto pb-4">
        <div className="deck-scroll flex gap-3 md:gap-4 px-4 md:px-0 md:justify-center min-w-min">
          {isLoading ? (
            // Loading placeholders
            Array.from({ length: 10 }).map((_, index) => (
              <CardPlaceholder key={index} index={index} />
            ))
          ) : (
            // Actual cards
            cards.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                index={index}
                onClick={() => handleCardClick(card)}
                isRevealed={isRevealed}
              />
            ))
          )}
        </div>
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
