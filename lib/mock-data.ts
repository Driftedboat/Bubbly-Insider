import { Card, MarketPulse, CardType, BullBear, SourceBadge, CategoryTag, ScoreBreakdown, RelatedItem } from '@/types'

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15)

// Get timestamp from hours ago
const hoursAgo = (hours: number): string => {
  const date = new Date()
  date.setHours(date.getHours() - hours)
  return date.toISOString()
}

// Mock News Items
const mockNewsItems: Omit<Card, 'id' | 'createdAt'>[] = [
  {
    cardType: 'news',
    bullBear: 'bull',
    confidence: 85,
    headline: 'SEC approves first spot Bitcoin ETF options trading',
    sourceBadge: 'Bloomberg',
    categoryTags: ['Policy', 'Market'],
    brief: 'The Securities and Exchange Commission has approved options trading on spot Bitcoin ETFs, marking a significant milestone for institutional crypto adoption. This enables sophisticated hedging strategies and could increase ETF liquidity.',
    insight: 'Options availability typically increases institutional participation and can reduce volatility long-term. Bull signal for market maturity.',
    primaryLinks: ['https://sec.gov/news/press-release/2026-01'],
    secondaryLinks: ['https://bloomberg.com/crypto/bitcoin-etf-options'],
    originalItem: {
      id: 'orig-1',
      title: 'SEC Press Release: Bitcoin ETF Options',
      source: 'SEC.gov',
      url: 'https://sec.gov/news/press-release/2026-01',
      timestamp: hoursAgo(4)
    },
    relatedItems: [
      { id: 'rel-1', title: 'BlackRock welcomes ETF options approval', source: 'CoinDesk', url: '#', timestamp: hoursAgo(3) },
      { id: 'rel-2', title: 'CME Group prepares for BTC ETF options', source: 'Bloomberg', url: '#', timestamp: hoursAgo(2) },
      { id: 'rel-3', title: 'Analysts predict $5B options volume in first month', source: 'The Block', url: '#', timestamp: hoursAgo(1) }
    ],
    scoreBreakdown: { sourceStrength: 40, confirmation: 20, specificity: 15, freshness: 15, conflictPenalty: 0, total: 85 }
  },
  {
    cardType: 'news',
    bullBear: 'bull',
    confidence: 78,
    headline: 'NYSE parent ICE files for 24/7 crypto trading platform',
    sourceBadge: 'Bloomberg',
    categoryTags: ['Policy', 'Market'],
    brief: 'Intercontinental Exchange has submitted regulatory filings for a new digital asset trading platform operating around the clock. The platform would leverage existing NYSE infrastructure.',
    insight: 'Traditional finance expanding crypto access hours signals mainstream integration. Increases liquidity windows for institutional traders.',
    primaryLinks: ['https://sec.gov/filings/ice-digital'],
    secondaryLinks: ['https://bloomberg.com/ice-crypto-platform'],
    originalItem: {
      id: 'orig-2',
      title: 'ICE SEC Filing Form S-1',
      source: 'SEC.gov',
      url: 'https://sec.gov/filings/ice-digital',
      timestamp: hoursAgo(6)
    },
    relatedItems: [
      { id: 'rel-4', title: 'ICE CEO discusses crypto strategy', source: 'CNBC', url: '#', timestamp: hoursAgo(5) },
      { id: 'rel-5', title: 'Bakkt shares surge on news', source: 'CoinDesk', url: '#', timestamp: hoursAgo(4) }
    ],
    scoreBreakdown: { sourceStrength: 40, confirmation: 15, specificity: 10, freshness: 15, conflictPenalty: -2, total: 78 }
  },
  {
    cardType: 'news',
    bullBear: 'bear',
    confidence: 72,
    headline: 'DOJ launches investigation into major stablecoin issuer',
    sourceBadge: 'Bloomberg',
    categoryTags: ['Policy', 'Security'],
    brief: 'The Department of Justice has opened a formal investigation into reserve management practices of a top-5 stablecoin issuer. No charges have been filed, but subpoenas have been issued.',
    insight: 'Regulatory scrutiny on stablecoins creates uncertainty. Could accelerate push for regulated alternatives but causes short-term risk-off.',
    primaryLinks: [],
    secondaryLinks: ['https://bloomberg.com/doj-stablecoin-probe'],
    originalItem: {
      id: 'orig-3',
      title: 'DOJ Opens Stablecoin Investigation',
      source: 'Bloomberg',
      url: 'https://bloomberg.com/doj-stablecoin-probe',
      timestamp: hoursAgo(8)
    },
    relatedItems: [
      { id: 'rel-6', title: 'Stablecoin outflows spike post-news', source: 'The Block', url: '#', timestamp: hoursAgo(6) },
      { id: 'rel-7', title: 'Issuer denies wrongdoing', source: 'CoinDesk', url: '#', timestamp: hoursAgo(5) }
    ],
    scoreBreakdown: { sourceStrength: 25, confirmation: 15, specificity: 10, freshness: 12, conflictPenalty: -5, total: 72 }
  },
  {
    cardType: 'news',
    bullBear: 'bull',
    confidence: 81,
    headline: 'Visa expands USDC settlement to 10 new markets',
    sourceBadge: 'CoinDesk',
    categoryTags: ['Adoption', 'Market'],
    brief: 'Visa has announced expansion of its USDC settlement capabilities to include Europe, LATAM, and Southeast Asia. Merchants can now receive stablecoin settlements directly.',
    insight: 'Payment rail adoption of stablecoins validates crypto infrastructure. Reduces friction for cross-border commerce and DeFi on-ramps.',
    primaryLinks: ['https://visa.com/press/usdc-expansion-2026'],
    secondaryLinks: ['https://coindesk.com/visa-usdc-global'],
    originalItem: {
      id: 'orig-4',
      title: 'Visa Press Release: USDC Global Expansion',
      source: 'Visa.com',
      url: 'https://visa.com/press/usdc-expansion-2026',
      timestamp: hoursAgo(3)
    },
    relatedItems: [
      { id: 'rel-8', title: 'Circle CEO praises partnership', source: 'X', url: '#', timestamp: hoursAgo(2) },
      { id: 'rel-9', title: 'USDC market cap hits new high', source: 'CoinGecko', url: '#', timestamp: hoursAgo(1) }
    ],
    scoreBreakdown: { sourceStrength: 40, confirmation: 18, specificity: 12, freshness: 15, conflictPenalty: 0, total: 81 }
  },
  {
    cardType: 'news',
    bullBear: 'bear',
    confidence: 68,
    headline: 'South Korea proposes 25% crypto capital gains tax',
    sourceBadge: 'CoinDesk',
    categoryTags: ['Policy', 'Macro'],
    brief: 'South Korean lawmakers have proposed a 25% capital gains tax on cryptocurrency profits exceeding 2.5M KRW (~$1,800). The bill has broad support and could pass by Q2.',
    insight: 'Korean retail is a major crypto market. Tax implementation may reduce speculative trading and cause short-term outflows.',
    primaryLinks: ['https://korea.kr/policy/crypto-tax-2026'],
    secondaryLinks: ['https://coindesk.com/korea-crypto-tax'],
    originalItem: {
      id: 'orig-5',
      title: 'Korean Assembly Crypto Tax Bill',
      source: 'Korea.kr',
      url: 'https://korea.kr/policy/crypto-tax-2026',
      timestamp: hoursAgo(12)
    },
    relatedItems: [
      { id: 'rel-10', title: 'Korean exchanges report outflows', source: 'The Block', url: '#', timestamp: hoursAgo(8) }
    ],
    scoreBreakdown: { sourceStrength: 35, confirmation: 10, specificity: 12, freshness: 10, conflictPenalty: -5, total: 68 }
  }
]

// Mock KOL Items
const mockKOLItems: Omit<Card, 'id' | 'createdAt'>[] = [
  {
    cardType: 'kol',
    bullBear: 'bull',
    confidence: 65,
    headline: '@VitalikButerin hints at major L2 scaling breakthrough',
    sourceBadge: 'X',
    categoryTags: ['Tech'],
    brief: 'Ethereum co-founder shared cryptic hints about a new data availability solution that could 10x L2 throughput. No technical details yet, but devs are speculating about danksharding improvements.',
    insight: 'Vitalik signals carry weight in ETH ecosystem. If real, could reignite L2 season and ETH beta plays.',
    primaryLinks: [],
    secondaryLinks: ['https://x.com/VitalikButerin/status/123'],
    originalItem: {
      id: 'orig-6',
      title: 'Cryptic L2 hint thread',
      source: '@VitalikButerin',
      url: 'https://x.com/VitalikButerin/status/123',
      timestamp: hoursAgo(5)
    },
    relatedItems: [
      { id: 'rel-11', title: 'Thread analyzing Vitalik hints', source: '@polynya', url: '#', timestamp: hoursAgo(4) },
      { id: 'rel-12', title: 'L2 tokens pumping on speculation', source: '@DefiIgnas', url: '#', timestamp: hoursAgo(3) }
    ],
    scoreBreakdown: { sourceStrength: 10, confirmation: 15, specificity: 5, freshness: 15, conflictPenalty: -10, total: 65 }
  },
  {
    cardType: 'kol',
    bullBear: 'bull',
    confidence: 71,
    headline: '@CryptoHayes predicts Fed pivot in Q2, risk-on for crypto',
    sourceBadge: 'X',
    categoryTags: ['Macro'],
    brief: 'Arthur Hayes published a lengthy thread arguing that deteriorating labor market data will force the Fed to cut rates by April. Historical correlation shows BTC rallies 60-90 days post-pivot signals.',
    insight: 'Macro thesis from credible voice. Fed pivot narrative historically bullish for risk assets including crypto.',
    primaryLinks: [],
    secondaryLinks: ['https://x.com/CryptoHayes/status/456'],
    originalItem: {
      id: 'orig-7',
      title: 'Fed Pivot Thread',
      source: '@CryptoHayes',
      url: 'https://x.com/CryptoHayes/status/456',
      timestamp: hoursAgo(8)
    },
    relatedItems: [
      { id: 'rel-13', title: 'Supporting jobs data analysis', source: '@MacroAlf', url: '#', timestamp: hoursAgo(6) },
      { id: 'rel-14', title: 'Counter-argument on inflation', source: '@NorthmanTrader', url: '#', timestamp: hoursAgo(5) }
    ],
    scoreBreakdown: { sourceStrength: 10, confirmation: 18, specificity: 12, freshness: 12, conflictPenalty: -5, total: 71 }
  },
  {
    cardType: 'kol',
    bullBear: 'bear',
    confidence: 58,
    headline: '@ZachXBT flags suspicious wallet activity on trending token',
    sourceBadge: 'X',
    categoryTags: ['Security'],
    brief: 'On-chain investigator identified a cluster of wallets receiving 40% of a trending meme token supply from team wallets. Pattern consistent with planned dump.',
    insight: 'ZachXBT has strong track record on scam detection. Warning sign for the specific token and sentiment indicator for meme season.',
    primaryLinks: [],
    secondaryLinks: ['https://x.com/zachxbt/status/789'],
    originalItem: {
      id: 'orig-8',
      title: 'Wallet cluster analysis thread',
      source: '@zachxbt',
      url: 'https://x.com/zachxbt/status/789',
      timestamp: hoursAgo(2)
    },
    relatedItems: [
      { id: 'rel-15', title: 'Project team response', source: '@SuspectToken', url: '#', timestamp: hoursAgo(1) }
    ],
    scoreBreakdown: { sourceStrength: 10, confirmation: 10, specificity: 15, freshness: 15, conflictPenalty: -8, total: 58 }
  },
  {
    cardType: 'kol',
    bullBear: 'bull',
    confidence: 62,
    headline: '@coaboride reports major protocol approaching $1B TVL milestone',
    sourceBadge: 'X',
    categoryTags: ['Market', 'Adoption'],
    brief: 'DeFi analyst tracking a restaking protocol nearing $1B TVL with 400% growth in 30 days. Organic deposit patterns suggest real adoption vs incentive farming.',
    insight: 'TVL milestones attract attention and often precede token catalysts. Watch for announcements around the milestone.',
    primaryLinks: ['https://defillama.com/protocol/example'],
    secondaryLinks: ['https://x.com/coaboride/status/321'],
    originalItem: {
      id: 'orig-9',
      title: 'Protocol TVL thread',
      source: '@coaboride',
      url: 'https://x.com/coaboride/status/321',
      timestamp: hoursAgo(4)
    },
    relatedItems: [
      { id: 'rel-16', title: 'DefiLlama confirms data', source: 'DefiLlama', url: '#', timestamp: hoursAgo(4) },
      { id: 'rel-17', title: 'Team teases announcement', source: '@ProtocolOfficial', url: '#', timestamp: hoursAgo(2) }
    ],
    scoreBreakdown: { sourceStrength: 10, confirmation: 15, specificity: 12, freshness: 15, conflictPenalty: 0, total: 62 }
  },
  {
    cardType: 'kol',
    bullBear: 'bull',
    confidence: 69,
    headline: '@punk6529 announces major NFT collection partnership',
    sourceBadge: 'X',
    categoryTags: ['Adoption', 'Funding'],
    brief: 'Prominent NFT collector revealed partnership between his collection and a major fashion brand for physical merchandise and metaverse integration.',
    insight: 'Brand partnerships signal NFT market maturation. Could spark renewed interest in blue-chip NFT collections.',
    primaryLinks: [],
    secondaryLinks: ['https://x.com/punk6529/status/654'],
    originalItem: {
      id: 'orig-10',
      title: 'Partnership announcement',
      source: '@punk6529',
      url: 'https://x.com/punk6529/status/654',
      timestamp: hoursAgo(6)
    },
    relatedItems: [
      { id: 'rel-18', title: 'Brand confirms partnership', source: '@LuxuryBrand', url: '#', timestamp: hoursAgo(5) },
      { id: 'rel-19', title: 'NFT floor price spike', source: 'OpenSea', url: '#', timestamp: hoursAgo(4) }
    ],
    scoreBreakdown: { sourceStrength: 10, confirmation: 18, specificity: 10, freshness: 12, conflictPenalty: -5, total: 69 }
  },
  {
    cardType: 'kol',
    bullBear: 'bear',
    confidence: 55,
    headline: '@GCRClassic warns of overleveraged long positions',
    sourceBadge: 'X',
    categoryTags: ['Market'],
    brief: 'Veteran trader notes extremely high funding rates and crowded long positions across perpetual markets. Historical pattern suggests liquidation cascade risk.',
    insight: 'Funding rate signals are lagging indicators but GCR has called several major moves. Suggests caution on leveraged longs.',
    primaryLinks: [],
    secondaryLinks: ['https://x.com/GCRClassic/status/987'],
    originalItem: {
      id: 'orig-11',
      title: 'Leverage warning thread',
      source: '@GCRClassic',
      url: 'https://x.com/GCRClassic/status/987',
      timestamp: hoursAgo(3)
    },
    relatedItems: [
      { id: 'rel-20', title: 'Funding rate data', source: '@coaboride', url: '#', timestamp: hoursAgo(3) }
    ],
    scoreBreakdown: { sourceStrength: 10, confirmation: 10, specificity: 10, freshness: 15, conflictPenalty: -5, total: 55 }
  },
  {
    cardType: 'kol',
    bullBear: 'bull',
    confidence: 67,
    headline: '@cburniske identifies accumulation pattern in SOL',
    sourceBadge: 'X',
    categoryTags: ['Market', 'Tech'],
    brief: 'Placeholder Ventures partner shares on-chain analysis showing whale accumulation in Solana over past 2 weeks. Exchange outflows at yearly highs.',
    insight: 'Whale accumulation often precedes price moves. SOL ecosystem activity also showing renewed strength.',
    primaryLinks: [],
    secondaryLinks: ['https://x.com/cburniske/status/147'],
    originalItem: {
      id: 'orig-12',
      title: 'SOL accumulation thread',
      source: '@cburniske',
      url: 'https://x.com/cburniske/status/147',
      timestamp: hoursAgo(7)
    },
    relatedItems: [
      { id: 'rel-21', title: 'Exchange flow confirmation', source: '@glaboride', url: '#', timestamp: hoursAgo(5) },
      { id: 'rel-22', title: 'Solana ecosystem update', source: '@aaboridanat', url: '#', timestamp: hoursAgo(4) }
    ],
    scoreBreakdown: { sourceStrength: 10, confirmation: 15, specificity: 12, freshness: 12, conflictPenalty: -5, total: 67 }
  }
]

// Mock Price Card
const mockPriceCard: Omit<Card, 'id' | 'createdAt'> = {
  cardType: 'price',
  bullBear: 'bull',
  confidence: 95,
  headline: 'BTC breaks $105,000 resistance, +4.2% in 24h',
  sourceBadge: 'Price',
  categoryTags: ['Market'],
  brief: 'Bitcoin has broken through the key $105,000 resistance level that has held since mid-December. Volume is 40% above 30-day average, suggesting genuine breakout momentum.',
  insight: 'Clean breakout above multi-week resistance. Next major resistance at $115K. Bull momentum intact.',
  primaryLinks: ['https://coingecko.com/bitcoin'],
  secondaryLinks: [],
  originalItem: {
    id: 'orig-13',
    title: 'BTC Price Data',
    source: 'CoinGecko',
    url: 'https://coingecko.com/bitcoin',
    timestamp: hoursAgo(0)
  },
  relatedItems: [],
  scoreBreakdown: { sourceStrength: 40, confirmation: 20, specificity: 15, freshness: 15, conflictPenalty: 0, total: 95 }
}

// Generate Market Pulse
export function generateMarketPulse(): MarketPulse {
  const basePrice = 105234.67
  const change = 4.21
  
  // Generate sparkline (24 data points for 24 hours)
  const sparkline: number[] = []
  let price = basePrice * 0.96
  for (let i = 0; i < 24; i++) {
    price = price + (Math.random() - 0.4) * 1000
    sparkline.push(Math.round(price))
  }
  sparkline[sparkline.length - 1] = basePrice
  
  return {
    btcPrice: basePrice,
    btcChange24h: change,
    ethPrice: 3847.23,
    ethChange24h: 2.85,
    sparkline,
    timestamp: new Date().toISOString()
  }
}

// Generate a deck of 10 cards
export function generateMockDeck(): Card[] {
  const cards: Card[] = []
  
  // Always include 1 price card
  cards.push({
    ...mockPriceCard,
    id: generateId(),
    createdAt: new Date().toISOString()
  })
  
  // Add 3 news cards
  const shuffledNews = [...mockNewsItems].sort(() => Math.random() - 0.5)
  for (let i = 0; i < 3; i++) {
    cards.push({
      ...shuffledNews[i],
      id: generateId(),
      createdAt: new Date().toISOString()
    })
  }
  
  // Add 6 KOL cards
  const shuffledKOL = [...mockKOLItems].sort(() => Math.random() - 0.5)
  for (let i = 0; i < 6; i++) {
    cards.push({
      ...shuffledKOL[i],
      id: generateId(),
      createdAt: new Date().toISOString()
    })
  }
  
  // Shuffle final deck
  return cards.sort(() => Math.random() - 0.5)
}

// Get a specific card by ID (for detail view)
export function getMockCardById(id: string): Card | null {
  const allCards = [
    ...mockNewsItems,
    ...mockKOLItems,
    mockPriceCard
  ]
  
  // Since we generate IDs dynamically, this is for demo purposes
  // In real app, would fetch from database
  const randomCard = allCards[Math.floor(Math.random() * allCards.length)]
  return {
    ...randomCard,
    id,
    createdAt: new Date().toISOString()
  }
}

// Export raw items for testing
export const mockData = {
  news: mockNewsItems,
  kol: mockKOLItems,
  price: mockPriceCard
}
