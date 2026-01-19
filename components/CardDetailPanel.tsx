'use client'

import { motion } from 'framer-motion'
import { Card as CardType, RelatedItem, ScoreBreakdown } from '@/types'

interface CardDetailPanelProps {
  card: CardType
  onClose: () => void
}

// Score component visualization
function ScoreBreakdownView({ breakdown }: { breakdown: ScoreBreakdown }) {
  const items = [
    { label: 'Source Strength', value: breakdown.sourceStrength, max: 40, color: 'bg-blue-500' },
    { label: 'Confirmation', value: breakdown.confirmation, max: 20, color: 'bg-green-500' },
    { label: 'Specificity', value: breakdown.specificity, max: 15, color: 'bg-purple-500' },
    { label: 'Freshness', value: breakdown.freshness, max: 15, color: 'bg-yellow-500' },
  ]
  
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className="text-xs font-terminal text-white/60 w-28">{item.label}</span>
          <div className="flex-1 h-2 bg-black/50 border border-white/10 overflow-hidden">
            <div 
              className={`h-full ${item.color}`}
              style={{ width: `${(item.value / item.max) * 100}%` }}
            />
          </div>
          <span className="text-xs font-terminal text-white/80 w-8 text-right">
            {item.value}/{item.max}
          </span>
        </div>
      ))}
      {breakdown.conflictPenalty !== 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-terminal text-red-400 w-28">Conflict Penalty</span>
          <span className="text-xs font-terminal text-red-400">
            {breakdown.conflictPenalty}
          </span>
        </div>
      )}
      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
        <span className="text-xs font-terminal text-terminal-green w-28">Total Score</span>
        <span className="text-sm font-pixel text-terminal-green">
          {breakdown.total}%
        </span>
      </div>
    </div>
  )
}

// Related item component
function RelatedItemView({ item }: { item: RelatedItem }) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }
  
  return (
    <a 
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-2 bg-black/30 border border-white/10 hover:border-terminal-green/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-terminal text-white/80 line-clamp-2">{item.title}</p>
        <span className="text-xs font-terminal text-white/40 whitespace-nowrap">
          {formatTime(item.timestamp)}
        </span>
      </div>
      <span className="text-xs font-terminal text-terminal-green/60">{item.source}</span>
    </a>
  )
}

export default function CardDetailPanel({ card, onClose }: CardDetailPanelProps) {
  const isBull = card.bullBear === 'bull'
  
  const hasPrimarySource = card.primaryLinks && card.primaryLinks.length > 0
  
  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/60 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      
      {/* Panel */}
      <motion.div
        className="fixed right-0 top-0 bottom-0 w-full md:w-[480px] z-50 panel overflow-y-auto"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <div className="p-6 pb-20">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-terminal-green hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Header */}
          <div className="mb-6">
            {/* Bull/Bear Badge + Confidence */}
            <div className="flex items-center gap-3 mb-3">
              <span className={`
                px-3 py-1 font-pixel text-sm uppercase
                ${isBull ? 'bg-bull-green/20 text-bull-green border border-bull-green' : 'bg-bear-red/20 text-bear-red border border-bear-red'}
              `}>
                {card.bullBear}
              </span>
              <span className={`font-pixel text-2xl ${isBull ? 'text-bull-green' : 'text-bear-red'} glow-text-subtle`}>
                {card.confidence}%
              </span>
            </div>
            
            {/* Headline */}
            <h2 className="text-xl font-terminal text-white leading-tight mb-2">
              {card.headline}
            </h2>
            
            {/* Meta */}
            <div className="flex items-center gap-3 text-sm">
              <span className={`
                px-2 py-0.5 font-pixel text-[10px] uppercase border
                ${card.sourceBadge === 'Bloomberg' ? 'text-orange-500 border-orange-500' : ''}
                ${card.sourceBadge === 'CoinDesk' ? 'text-cyan-400 border-cyan-400' : ''}
                ${card.sourceBadge === 'X' ? 'text-white border-white' : ''}
                ${card.sourceBadge === 'Price' ? 'text-yellow-400 border-yellow-400' : ''}
              `}>
                {card.sourceBadge}
              </span>
              {card.categoryTags.map((tag) => (
                <span key={tag} className="font-terminal text-white/50">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          
          {/* Brief */}
          <section className="mb-6">
            <h3 className="text-terminal-green font-pixel text-xs uppercase mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-terminal-green" />
              Brief
            </h3>
            <p className="font-terminal text-white/80 leading-relaxed">
              {card.brief}
            </p>
          </section>
          
          {/* Evidence / Links */}
          <section className="mb-6">
            <h3 className="text-terminal-green font-pixel text-xs uppercase mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-terminal-green" />
              Evidence
            </h3>
            
            {/* Primary Source Warning */}
            {!hasPrimarySource && (
              <div className="p-2 mb-3 bg-yellow-500/10 border border-yellow-500/50">
                <p className="text-xs font-terminal text-yellow-500">
                  ⚠ No primary source found. Confidence reduced accordingly.
                </p>
              </div>
            )}
            
            {/* Primary Links */}
            {hasPrimarySource && (
              <div className="mb-3">
                <span className="text-xs font-terminal text-terminal-green mb-1 block">Primary Sources</span>
                {card.primaryLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm font-terminal text-cyan-400 hover:text-cyan-300 truncate mb-1"
                  >
                    🔗 {link}
                  </a>
                ))}
              </div>
            )}
            
            {/* Secondary Links */}
            {card.secondaryLinks && card.secondaryLinks.length > 0 && (
              <div>
                <span className="text-xs font-terminal text-white/50 mb-1 block">Secondary Sources</span>
                {card.secondaryLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm font-terminal text-white/60 hover:text-white truncate mb-1"
                  >
                    → {link}
                  </a>
                ))}
              </div>
            )}
          </section>
          
          {/* Original / First Seen */}
          {card.originalItem && (
            <section className="mb-6">
              <h3 className="text-terminal-green font-pixel text-xs uppercase mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-terminal-green" />
                Original / First Seen
              </h3>
              <RelatedItemView item={card.originalItem} />
            </section>
          )}
          
          {/* Related Discussion */}
          {card.relatedItems && card.relatedItems.length > 0 && (
            <section className="mb-6">
              <h3 className="text-terminal-green font-pixel text-xs uppercase mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-terminal-green" />
                Related Discussion ({card.relatedItems.length})
              </h3>
              <div className="space-y-2">
                {card.relatedItems.map((item) => (
                  <RelatedItemView key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
          
          {/* Insight */}
          <section className="mb-6">
            <h3 className="text-terminal-green font-pixel text-xs uppercase mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-terminal-green" />
              Insight
            </h3>
            <div className={`
              p-3 border-l-4
              ${isBull ? 'border-bull-green bg-bull-green/5' : 'border-bear-red bg-bear-red/5'}
            `}>
              <p className={`font-terminal ${isBull ? 'text-bull-green' : 'text-bear-red'}`}>
                {card.insight}
              </p>
            </div>
          </section>
          
          {/* Score Breakdown */}
          <section>
            <h3 className="text-terminal-green font-pixel text-xs uppercase mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-terminal-green" />
              Confidence Breakdown
            </h3>
            <ScoreBreakdownView breakdown={card.scoreBreakdown} />
          </section>
        </div>
      </motion.div>
    </>
  )
}
