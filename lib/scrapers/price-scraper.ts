import { MarketPulse } from '@/types'

/**
 * Fetch real-time crypto prices from CoinGecko API
 * Free tier: 10-30 calls/minute
 */

const COINGECKO_API = 'https://api.coingecko.com/api/v3'

interface CoinGeckoPrice {
  usd: number
  usd_24h_change: number
}

interface CoinGeckoMarketData {
  id: string
  symbol: string
  current_price: number
  price_change_percentage_24h: number
  sparkline_in_7d?: {
    price: number[]
  }
}

/**
 * Get simple price for BTC and ETH
 */
export async function getSimplePrices(): Promise<{
  bitcoin: CoinGeckoPrice
  ethereum: CoinGeckoPrice
} | null> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 60 } // Cache for 1 minute
      }
    )
    
    if (!response.ok) {
      console.error('CoinGecko API error:', response.status)
      return null
    }
    
    const data = await response.json()
    
    return {
      bitcoin: {
        usd: data.bitcoin?.usd || 0,
        usd_24h_change: data.bitcoin?.usd_24h_change || 0
      },
      ethereum: {
        usd: data.ethereum?.usd || 0,
        usd_24h_change: data.ethereum?.usd_24h_change || 0
      }
    }
  } catch (error) {
    console.error('Failed to fetch prices:', error)
    return null
  }
}

/**
 * Get market data with sparkline
 */
export async function getMarketData(): Promise<CoinGeckoMarketData[] | null> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=bitcoin,ethereum&order=market_cap_desc&sparkline=true&price_change_percentage=24h`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 300 } // Cache for 5 minutes (sparkline doesn't need to be real-time)
      }
    )
    
    if (!response.ok) {
      console.error('CoinGecko markets API error:', response.status)
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch market data:', error)
    return null
  }
}

/**
 * Get full market pulse with sparkline
 */
export async function fetchMarketPulse(): Promise<MarketPulse> {
  // Try to get full market data with sparkline
  const marketData = await getMarketData()
  
  if (marketData && marketData.length >= 2) {
    const btc = marketData.find(c => c.id === 'bitcoin')
    const eth = marketData.find(c => c.id === 'ethereum')
    
    // Get last 24 data points from 7-day sparkline (approx every 7 hours)
    const sparkline = btc?.sparkline_in_7d?.price
      ? btc.sparkline_in_7d.price.slice(-24)
      : undefined
    
    return {
      btcPrice: btc?.current_price || 0,
      btcChange24h: btc?.price_change_percentage_24h || 0,
      ethPrice: eth?.current_price,
      ethChange24h: eth?.price_change_percentage_24h,
      sparkline,
      timestamp: new Date().toISOString()
    }
  }
  
  // Fallback to simple prices
  const prices = await getSimplePrices()
  
  if (prices) {
    return {
      btcPrice: prices.bitcoin.usd,
      btcChange24h: prices.bitcoin.usd_24h_change,
      ethPrice: prices.ethereum.usd,
      ethChange24h: prices.ethereum.usd_24h_change,
      timestamp: new Date().toISOString()
    }
  }
  
  // Last resort fallback
  return {
    btcPrice: 0,
    btcChange24h: 0,
    timestamp: new Date().toISOString()
  }
}

/**
 * Get trending coins
 */
export async function getTrendingCoins(): Promise<string[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/search/trending`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 600 } // Cache for 10 minutes
      }
    )
    
    if (!response.ok) {
      return []
    }
    
    const data = await response.json()
    return data.coins?.map((c: { item: { symbol: string } }) => c.item.symbol) || []
  } catch (error) {
    console.error('Failed to fetch trending:', error)
    return []
  }
}
