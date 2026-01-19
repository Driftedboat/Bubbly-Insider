'use client'

import { motion } from 'framer-motion'

interface DiscoverButtonProps {
  onClick: () => void
  isLoading: boolean
  lastUpdated: string | null
}

export default function DiscoverButton({ onClick, isLoading, lastUpdated }: DiscoverButtonProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    }) + ' UTC'
  }
  
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Discover Button */}
      <motion.button
        onClick={onClick}
        disabled={isLoading}
        className={`
          btn-primary relative overflow-hidden
          ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
        `}
        whileHover={!isLoading ? { scale: 1.02 } : {}}
        whileTap={!isLoading ? { scale: 0.98 } : {}}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <motion.span
              className="inline-block w-2 h-2 bg-terminal-green"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            Shuffling...
          </span>
        ) : (
          'Discover'
        )}
        
        {/* Animated border effect */}
        {!isLoading && (
          <motion.div
            className="absolute inset-0 border-2 border-terminal-green opacity-0"
            animate={{
              opacity: [0, 0.5, 0],
              scale: [1, 1.05, 1.1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut'
            }}
          />
        )}
      </motion.button>
      
      {/* Status Text */}
      <div className="text-center">
        {lastUpdated ? (
          <p className="text-xs font-terminal text-terminal-green/50">
            Last updated: {formatTime(lastUpdated)}
          </p>
        ) : (
          <p className="text-xs font-terminal text-terminal-green/50">
            Click to discover today&apos;s top signals
          </p>
        )}
        <p className="text-[10px] font-terminal text-terminal-green/30 mt-1">
          Sources: Bloomberg, CoinDesk, X (KOLs), Price feeds
        </p>
      </div>
    </div>
  )
}
