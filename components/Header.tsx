'use client'

import { motion } from 'framer-motion'

interface HeaderProps {
  onSettingsClick?: () => void
}

export default function Header({ onSettingsClick }: HeaderProps) {
  return (
    <header className="border-b border-terminal-green/20 py-4 px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo Icon */}
          <div className="w-8 h-8 border-2 border-terminal-green flex items-center justify-center bg-terminal-green/10">
            <span className="font-pixel text-terminal-green text-xs">BI</span>
          </div>
          
          <div>
            <h1 className="font-pixel text-sm md:text-lg text-terminal-green glow-text tracking-wider">
              BUBBLY INSIDER
            </h1>
            <p className="hidden md:block text-[10px] font-terminal text-terminal-green/40">
              Daily Crypto Denoise Deck
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Version Badge */}
          <span className="hidden lg:inline px-2 py-1 text-[10px] font-pixel text-terminal-green/50 border border-terminal-green/30">
            v0.1.0 MVP
          </span>
          
          {/* Settings Button */}
          <button 
            onClick={onSettingsClick}
            className="w-8 h-8 flex items-center justify-center text-terminal-green/50 hover:text-terminal-green hover:bg-terminal-green/10 transition-all border border-transparent hover:border-terminal-green/30"
            aria-label="Settings"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </motion.div>
      </div>
    </header>
  )
}
