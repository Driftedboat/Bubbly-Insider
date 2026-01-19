'use client'

import { motion } from 'framer-motion'
import { Card as CardType } from '@/types'

interface CardProps {
  card: CardType
  index: number
  onClick: () => void
  isRevealed: boolean
}

// Card type icons as simple SVG-like components
const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'news':
      return (
        <div className="w-12 h-12 flex items-center justify-center text-current opacity-90">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-10 h-10">
            <rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1"/>
            <rect x="4" y="4" width="8" height="2" fill="currentColor"/>
            <rect x="4" y="7" width="8" height="1" fill="currentColor"/>
            <rect x="4" y="9" width="6" height="1" fill="currentColor"/>
            <rect x="4" y="11" width="8" height="1" fill="currentColor"/>
          </svg>
        </div>
      )
    case 'kol':
      return (
        <div className="w-12 h-12 flex items-center justify-center text-current opacity-90">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-10 h-10">
            <circle cx="8" cy="5" r="3" fill="none" stroke="currentColor" strokeWidth="1"/>
            <path d="M3 14 C3 10 13 10 13 14" fill="none" stroke="currentColor" strokeWidth="1"/>
            <rect x="10" y="2" width="4" height="3" fill="currentColor"/>
            <rect x="11" y="5" width="2" height="2" fill="currentColor"/>
          </svg>
        </div>
      )
    case 'price':
      return (
        <div className="w-12 h-12 flex items-center justify-center text-current opacity-90">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-10 h-10">
            <polyline points="2,12 5,8 8,10 11,4 14,6" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="14" cy="6" r="1.5" fill="currentColor"/>
          </svg>
        </div>
      )
    default:
      return null
  }
}

// Source badge styling
const getSourceColor = (source: string) => {
  switch (source) {
    case 'Bloomberg': return 'text-orange-500 border-orange-500'
    case 'CoinDesk': return 'text-cyan-400 border-cyan-400'
    case 'X': return 'text-white border-white'
    case 'Price': return 'text-yellow-400 border-yellow-400'
    default: return 'text-terminal-green border-terminal-green'
  }
}

// Category tag styling
const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Policy': 'text-orange-400',
    'Macro': 'text-purple-400',
    'Market': 'text-cyan-400',
    'Tech': 'text-pink-400',
    'Security': 'text-red-400',
    'Funding': 'text-green-400',
    'Adoption': 'text-blue-400'
  }
  return colors[category] || 'text-terminal-green'
}

export default function Card({ card, index, onClick, isRevealed }: CardProps) {
  const isBull = card.bullBear === 'bull'
  const isPriceCard = card.cardType === 'price'
  
  // Special styling for price card
  if (isPriceCard) {
    return (
      <motion.div
        className="card-container cursor-pointer"
        initial={{ rotateY: 180, opacity: 0 }}
        animate={isRevealed ? { rotateY: 0, opacity: 1 } : { rotateY: 180, opacity: 0 }}
        transition={{ 
          duration: 0.5, 
          delay: index * 0.08,
          ease: 'easeOut'
        }}
        whileHover={{ 
          scale: 1.03, 
          transition: { duration: 0.2 } 
        }}
        onClick={onClick}
      >
        <div className={`
          w-full h-[100px] md:h-[110px]
          relative overflow-hidden rounded-lg
          card-price
          transition-all duration-200
          hover:shadow-glow-amber
        `}>
          {/* Bitcoin Icon */}
          <div className="absolute top-3 left-3">
            <div className="w-10 h-10 rounded-full bg-terminal-amber/20 border-2 border-terminal-amber flex items-center justify-center">
              <span className="font-pixel text-terminal-amber text-lg">₿</span>
            </div>
          </div>
          
          {/* Price Display */}
          <div className="absolute top-3 right-3 text-right">
            <div className="text-white font-terminal text-xl md:text-2xl">
              {card.headline.match(/\$[\d,]+/)?.[0] || '$--'}
            </div>
            <div className={`text-sm font-terminal ${isBull ? 'text-bull-green' : 'text-bear-red'}`}>
              {card.headline.match(/[+-]?\d+\.?\d*%/)?.[0] || '0%'}
            </div>
          </div>
          
          {/* Bottom: Label + Confidence */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
            <div>
              <span className="text-[10px] font-pixel text-terminal-amber/70 uppercase">BTC/USD</span>
              <span className="text-[8px] font-terminal text-white/40 ml-2">24h</span>
            </div>
            <div className={`
              text-sm font-pixel
              ${isBull ? 'text-bull-green' : 'text-bear-red'}
            `}>
              {card.confidence}%
            </div>
          </div>
          
          {/* Trend Line Decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-terminal-amber/50 via-terminal-amber to-terminal-amber/50" />
        </div>
      </motion.div>
    )
  }
  
  // Regular card
  return (
    <motion.div
      className="card-container cursor-pointer"
      initial={{ rotateY: 180, opacity: 0 }}
      animate={isRevealed ? { rotateY: 0, opacity: 1 } : { rotateY: 180, opacity: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.08,
        ease: 'easeOut'
      }}
      whileHover={{ 
        scale: 1.05, 
        transition: { duration: 0.2 } 
      }}
      onClick={onClick}
    >
      <div 
        className={`
          w-full h-[140px] md:h-[150px] lg:h-[160px]
          relative overflow-hidden rounded-lg
          ${isBull ? 'card-bull' : 'card-bear'}
          transition-all duration-200
          hover:shadow-lg
          ${isBull ? 'hover:shadow-glow-green' : 'hover:shadow-glow-red'}
        `}
      >
        {/* Top Row: Category + Confidence */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          {/* Category Tag */}
          <div className={`text-[8px] font-pixel uppercase ${getCategoryColor(card.categoryTags[0])}`}>
            {card.categoryTags[0]}
          </div>
          
          {/* Confidence Badge */}
          <div className={`
            text-lg font-pixel font-bold
            ${isBull ? 'text-bull-green' : 'text-bear-red'}
            glow-text-subtle
          `}>
            {card.confidence}%
          </div>
        </div>
        
        {/* Center: Type Icon */}
        <div className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%]
          ${isBull ? 'text-bull-green' : 'text-bear-red'}
        `}>
          <TypeIcon type={card.cardType} />
        </div>
        
        {/* Bottom: Headline + Source */}
        <div className="absolute bottom-2 left-2 right-2">
          {/* Source Badge */}
          <div className={`
            text-[7px] font-pixel uppercase mb-1
            px-1 py-0.5 inline-block
            border
            ${getSourceColor(card.sourceBadge)}
            bg-black/50
          `}>
            {card.sourceBadge}
          </div>
          
          {/* Headline */}
          <p className={`
            text-[9px] md:text-[10px] font-terminal leading-tight
            line-clamp-2
            ${isBull ? 'text-bull-green' : 'text-bear-red'}
          `}>
            {card.headline}
          </p>
        </div>
        
        {/* Bull/Bear Indicator Bar */}
        <div className={`
          absolute bottom-0 left-0 right-0 h-1
          ${isBull ? 'bg-bull-green' : 'bg-bear-red'}
        `} />
      </div>
    </motion.div>
  )
}

// Placeholder card for loading state
export function CardPlaceholder({ index }: { index: number }) {
  return (
    <motion.div
      className="w-full h-[140px] md:h-[150px] lg:h-[160px]"
      initial={{ opacity: 0.3 }}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ 
        duration: 1.5, 
        repeat: Infinity,
        delay: index * 0.1 
      }}
    >
      <div className="w-full h-full bg-bg-card border-2 border-terminal-green/30 rounded-lg flex items-center justify-center">
        <div className="text-terminal-green/50 font-pixel text-xs">?</div>
      </div>
    </motion.div>
  )
}
