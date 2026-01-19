// Card Types
export type CardType = 'news' | 'kol' | 'price';
export type BullBear = 'bull' | 'bear';
export type SourceBadge = 'Bloomberg' | 'CoinDesk' | 'X' | 'Price';
export type CategoryTag = 'Policy' | 'Macro' | 'Market' | 'Tech' | 'Security' | 'Funding' | 'Adoption';

// Score Breakdown
export interface ScoreBreakdown {
  sourceStrength: number;      // 0-40
  confirmation: number;         // 0-20
  specificity: number;          // 0-15
  freshness: number;            // 0-15
  conflictPenalty: number;      // -20 to 0
  total: number;
}

// Related Item
export interface RelatedItem {
  id: string;
  title: string;
  source: string;
  url: string;
  timestamp: string;
}

// Card Interface
export interface Card {
  id: string;
  cardType: CardType;
  bullBear: BullBear;
  confidence: number;
  headline: string;
  sourceBadge: SourceBadge;
  categoryTags: CategoryTag[];
  brief: string;
  insight: string;
  primaryLinks: string[];
  secondaryLinks: string[];
  originalItem: RelatedItem | null;
  relatedItems: RelatedItem[];
  scoreBreakdown: ScoreBreakdown;
  createdAt: string;
}

// Deck Interface
export interface Deck {
  id: string;
  cards: Card[];
  createdAt: string;
  deckDate: string;
}

// Market Pulse Interface
export interface MarketPulse {
  btcPrice: number;
  btcChange24h: number;
  ethPrice?: number;
  ethChange24h?: number;
  sparkline?: number[];
  timestamp: string;
}

// API Response Types
export interface DiscoverResponse {
  deckId: string;
  marketPulse: MarketPulse;
  cards: Card[];
}

export interface CardDetailResponse {
  card: Card;
}

// Source Item (for backend)
export interface SourceItem {
  id: string;
  type: CardType;
  sourceName: string;
  url: string;
  title: string;
  contentSnippet?: string;
  publishedAt: string;
  fetchedAt: string;
}

// Extended Card with scoring metadata
export interface ScoredCard extends Card {
  influenceScore: number;
  sentimentScore: number;
  finalScore: number;
  isPolicy: boolean;
  policyType?: string;
  isFresh: boolean;
}

// Deck statistics
export interface DeckStats {
  totalCards: number;
  bullCount: number;
  bearCount: number;
  bullPercentage: number;
  bearPercentage: number;
  policyCount: number;
  newsCount: number;
  kolCount: number;
  priceCount: number;
  freshCount: number;
  isBalanced: boolean;
}

// Scraper engagement metrics
export interface EngagementMetrics {
  likes?: number;
  retweets?: number;
  replies?: number;
  views?: number;
}
