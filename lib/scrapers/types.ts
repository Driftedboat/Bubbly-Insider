// Scraper types

export interface ScrapedNewsItem {
  title: string
  url: string
  source: 'Bloomberg' | 'CoinDesk' | 'TheBlock' | 'Decrypt'
  snippet?: string
  publishedAt: Date
  category?: string
}

export interface ScrapedKOLPost {
  id: string
  authorHandle: string
  authorName: string
  content: string
  url: string
  publishedAt: Date
  metrics?: {
    likes: number
    retweets: number
    replies: number
    views?: number
  }
}

export interface ScraperResult<T> {
  success: boolean
  data: T[]
  errors: string[]
  scrapedAt: Date
}

// Top Crypto KOLs to track
export const TOP_KOLS = [
  'VitalikButerin',
  'caboride',
  'CryptoHayes',
  'zachxbt',
  'punk6529',
  'GCRClassic',
  'cburniske',
  'DefiIgnas',
  'MacroAlf',
  'Anbessa100',
  'inversebrah',
  'CryptoCred',
  'CroissantEth',
  'Route2FI',
  'theaboridexyz',
  'blaboride',
  'MustStopMurad',
  'loomdart',
  'Rewkang',
  'AltcoinPsycho',
]
