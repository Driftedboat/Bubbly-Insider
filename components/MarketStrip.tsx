'use client'

import { MarketPulse } from '@/types'

interface MarketStripProps {
  marketPulse: MarketPulse | null
}

// Mini sparkline component
function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length < 2) return null
  
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((value - min) / range) * 100
    return `${x},${y}`
  }).join(' ')
  
  const isUp = data[data.length - 1] > data[0]
  
  return (
    <svg 
      viewBox="0 0 100 100" 
      className="w-20 h-6 opacity-60"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke={isUp ? '#00ff41' : '#ff3333'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function MarketStrip({ marketPulse }: MarketStripProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }
  
  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}%`
  }
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    }) + ' UTC'
  }
  
  if (!marketPulse) {
    return (
      <div className="market-strip py-3 px-4">
        <div className="flex items-center justify-center gap-2 text-terminal-green/40 font-terminal">
          <span className="animate-pulse">Loading market data...</span>
        </div>
      </div>
    )
  }
  
  const btcIsUp = marketPulse.btcChange24h >= 0
  const ethIsUp = (marketPulse.ethChange24h ?? 0) >= 0
  
  return (
    <div className="market-strip py-3 px-4 md:px-6">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Label */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-terminal-green/50 font-pixel text-[10px] uppercase tracking-wider">
            Market Pulse
          </span>
        </div>
        
        {/* BTC Price */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-terminal-amber font-pixel text-xs">BTC</span>
            <span className="text-white/90 font-terminal text-lg">
              {formatPrice(marketPulse.btcPrice)}
            </span>
            <span className={`font-terminal text-sm ${btcIsUp ? 'text-bull-green' : 'text-bear-red'}`}>
              {formatChange(marketPulse.btcChange24h)}
            </span>
          </div>
          
          {/* Sparkline */}
          {marketPulse.sparkline && (
            <Sparkline data={marketPulse.sparkline} />
          )}
        </div>
        
        {/* ETH Price (optional) */}
        {marketPulse.ethPrice && (
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-terminal-cyan font-pixel text-xs">ETH</span>
            <span className="text-white/70 font-terminal text-base">
              {formatPrice(marketPulse.ethPrice)}
            </span>
            <span className={`font-terminal text-sm ${ethIsUp ? 'text-bull-green' : 'text-bear-red'}`}>
              {formatChange(marketPulse.ethChange24h ?? 0)}
            </span>
          </div>
        )}
        
        {/* Timestamp */}
        <div className="text-terminal-green/40 font-terminal text-xs">
          as of {formatTime(marketPulse.timestamp)}
        </div>
      </div>
    </div>
  )
}
