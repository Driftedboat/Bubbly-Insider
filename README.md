# Bubbly Insider - Daily Crypto Denoise Deck

A crypto discovery copilot that denoises information by combining macro/news, top KOL discussion on X, and basic market context into 10 "insider cards." Each card is labeled Bull/Bear with a confidence percentage and expands into evidence-backed analysis.

![Bubbly Insider Screenshot](screenshot.png)

## Features

- **10 Daily Cards**: Exactly 10 curated signals per day
- **Bull/Bear Signals**: Each card labeled with direction and confidence %
- **Evidence-Backed**: Primary source tracking with "squeeze the hype" mechanism
- **Score Breakdown**: Transparent confidence scoring components
- **Game-Inspired UI**: Insider Trader-style retro aesthetic

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom pixel-art CSS
- **Database**: SQLite + Prisma ORM
- **Animation**: Framer Motion
- **LLM**: Anthropic Claude (for insights)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd bubbly-insider
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma db push
```

4. (Optional) Add API keys for enhanced features:
```bash
# Create .env.local file with your API keys
# For AI-powered insights:
ANTHROPIC_API_KEY=your_anthropic_key

# For X/Twitter KOL scraping (get at https://developer.twitter.com/):
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
bubbly-insider/
├── app/
│   ├── page.tsx              # Discovery page
│   ├── layout.tsx            # Root layout with fonts
│   ├── globals.css           # Tailwind + custom styles
│   └── api/
│       ├── discover/         # Deck generation endpoint
│       ├── cards/[id]/       # Card detail endpoint
│       └── market_pulse/     # Market data endpoint
├── components/
│   ├── Card.tsx              # Individual card component
│   ├── CardDeck.tsx          # 10-card deck container
│   ├── CardDetailPanel.tsx   # Slide-out detail panel
│   ├── MarketStrip.tsx       # Market pulse header
│   └── DiscoverButton.tsx    # Main action button
├── lib/
│   ├── mock-data.ts          # Mock data generator
│   ├── deck-generator.ts     # Deck selection logic
│   ├── confidence-scorer.ts  # Scoring algorithm
│   ├── claude.ts             # LLM integration
│   └── prisma.ts             # Database client
├── prisma/
│   └── schema.prisma         # Database schema
└── types/
    └── index.ts              # TypeScript interfaces
```

## Card Types

| Type | Count | Source |
|------|-------|--------|
| News | 3-4 | Bloomberg, CoinDesk |
| KOL | 5-7 | X/Twitter KOLs |
| Price | 1-2 | CoinGecko |

## Confidence Scoring

Confidence is calculated from:
- **Source Strength (0-40)**: Primary source = 40, secondary = 25, social = 10
- **Confirmation (0-20)**: Multiple independent sources
- **Specificity (0-15)**: Concrete details vs vague claims
- **Freshness (0-15)**: Recency of information
- **Conflict Penalty (-20-0)**: Contradictions or missing primary

## API Endpoints

### POST /api/discover
Generate a new deck of 10 cards.

```json
{
  "deckId": "deck_123",
  "marketPulse": {
    "btcPrice": 105234.67,
    "btcChange24h": 4.21,
    "timestamp": "2026-01-19T12:00:00Z"
  },
  "cards": [...]
}
```

### GET /api/market_pulse
Get current market data.

### GET /api/cards/[id]
Get detailed card information.

### POST /api/scrape
Trigger scraping of news (RSS) and KOL posts (X API).

```json
{
  "success": true,
  "results": {
    "news": { "scraped": 45, "ingested": 12, "errors": [] },
    "kol": { "scraped": 0, "ingested": 0, "errors": ["TWITTER_BEARER_TOKEN not set"] }
  }
}
```

## Data Sources

| Source | Type | API Key Required |
|--------|------|------------------|
| CoinDesk | News RSS | No |
| The Block | News RSS | No |
| Decrypt | News RSS | No |
| Bloomberg | News (limited) | No |
| X/Twitter | KOL Posts | Yes (`TWITTER_BEARER_TOKEN`) |
| CoinGecko | Prices | No (free tier) |

## MVP Roadmap

- [x] M0: UI scaffold with placeholder cards
- [x] M1: Mock data + deck generation
- [x] M2: Card detail panel
- [x] M3: Shuffle animation
- [x] M4: Claude integration
- [x] M5: Polish + mobile responsive
- [x] M6: Real API integration (CoinGecko, RSS, X)
- [ ] M7: User accounts + deck history

## Disclaimer

**Informational only, not financial advice.** This tool is for research and discovery purposes. Always do your own research (DYOR) before making investment decisions.

## License

MIT
