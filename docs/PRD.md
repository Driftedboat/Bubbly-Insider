# Product Requirements Document (PRD)

## Bubbly Insider — Daily Crypto Denoise Deck

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** MVP Complete

---

## 1. Executive Summary

Bubbly Insider is a daily "discovery deck" that denoises crypto information by combining macro/news, top KOL discussion on X, and basic market context into 10 square "insider cards." Each card is labeled Bull/Bear with a confidence percentage, and expands into an evidence-backed analysis with original sources, related discussion, links, and impact insights.

The product is designed for crypto investors/participants who want early awareness with accountability (source trace), not endless scrolling.

---

## 2. Problem Statement

Crypto information is high volume, high noise, and socially amplified. Users waste time:

- Chasing hype without evidence
- Reading duplicates of the same story
- Missing early signals because they're buried in timelines
- Not knowing whether something is real (primary source exists) or merely social echo
- Getting overwhelmed by 24/7 news cycle without prioritization

---

## 3. Goals & Non-Goals

### Goals

| Goal | Description |
|------|-------------|
| **Denoise** | Compress the day's most important items into exactly 10 cards |
| **Early + Accountable** | Show "original/first seen" and links to reputable/primary sources |
| **Fast Comprehension** | User understands what matters in under 2 minutes |
| **Fair Representation** | Reflect actual market sentiment, not forced balance |
| **Policy Awareness** | Surface regulatory/macro news with appropriate time windows |

### Non-Goals (Explicit)

- ❌ No financial advice or "buy/sell" calls
- ❌ No portfolio tracking or trading execution
- ❌ No attempt to be comprehensive news coverage
- ❌ No social features (comments, sharing) in MVP

---

## 4. Target Users

### Primary User: Crypto Participant "Kris"

- Starts day wanting early signals with verifiable sources
- Interested in macro/policy + market structure changes
- Wants to track major narratives from top KOLs without getting pulled into hype cycles
- Values time efficiency over comprehensiveness

### Secondary Users (Future)

- Crypto PMs/researchers who need a daily brief with receipts
- Founders/BD who monitor narrative and policy shifts
- Journalists seeking signal in noise

---

## 5. Key Use Cases

| Use Case | Description |
|----------|-------------|
| **Morning Scan** | "What should I know today?" — 2-minute deck review |
| **Verification** | "Is this real? What's the primary source? Who started it?" |
| **Context** | "How does this affect crypto risk environment (bull/bear)?" |
| **Narrative Audit** | "Is this just loud or backed by facts?" |
| **Policy Tracking** | "What regulations are still impacting the market?" |

---

## 6. Product Experience

### 6.1 Discovery Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  BUBBLY INSIDER                              [Settings] v0.1│
├─────────────────────────────────────────────────────────────┤
│  MARKET PULSE   BTC $93,126 (-2.3%)   ETH $3,450 (+1.2%)   │
│                 ═══════════════════   refreshes hourly      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    [ DISCOVER ]                             │
│              Last updated: 12:00 UTC                        │
│         Sources: Bloomberg, CoinDesk, X, CoinGecko          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │     PRICE CARD (Special Design - Full Width)        │    │
│  │  ₿  BTC $93,126  -2.3%              95% confidence  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                   │
│  │BULL │ │BULL │ │BEAR │ │BULL │ │BEAR │  (9 cards grid)   │
│  │ 82% │ │ 76% │ │ 71% │ │ 68% │ │ 65% │                   │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                   │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                           │
│  │BULL │ │BEAR │ │BULL │ │BULL │                           │
│  │ 62% │ │ 58% │ │ 55% │ │ 52% │                           │
│  └─────┘ └─────┘ └─────┘ └─────┘                           │
│                                                             │
│         6 Bull · 4 Bear · Click any card for details        │
├─────────────────────────────────────────────────────────────┤
│  Informational only, not financial advice. DYOR.            │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Card Face (Front)

Each square card displays:

| Element | Description |
|---------|-------------|
| **Background** | Green (Bull) or Red (Bear) gradient |
| **Confidence %** | Top-right, prominent (0-100) |
| **Type Icon** | News (document), KOL (speech bubble), Price (chart) |
| **Category Tag** | Policy, Macro, Market, Tech, Security, Funding, Adoption |
| **Source Badge** | Bloomberg, CoinDesk, X, Price |
| **Headline** | Max 2 lines, bottom of card |

### 6.3 Card Detail Panel (On Click)

Slide-out right panel containing:

1. **Header** — Headline + Bull/Bear badge + Confidence %
2. **Brief** — 2-3 sentences: what happened / what is being claimed
3. **Evidence Links**
   - Primary links (if available)
   - Secondary links (reputable news)
   - Warning if no primary source found
4. **Original / First Seen** — Earliest item + timestamp + source + link
5. **Related Discussion** — 3-5 additional items (if available)
6. **Insight** — 1-2 sentences on market impact (directional)
7. **Score Breakdown** — Visual component breakdown of confidence score

---

## 7. Card Composition Rules

### 7.1 Deck Quotas

| Card Type | Min | Max | Source |
|-----------|-----|-----|--------|
| Price | 1 | 1 | CoinGecko |
| Policy/Macro | 0 | 2 | News (extended time window) |
| News | 2 | 4 | CoinDesk, Bloomberg, Decrypt, The Block |
| KOL | 3 | 6 | X/Twitter via RSSHub |
| **Total** | **10** | **10** | — |

### 7.2 Time Horizons by Content Type

| Content Type | Fresh Window | Extended Window | Decay Half-Life |
|--------------|--------------|-----------------|-----------------|
| Price | Real-time | 24h | Instant |
| KOL/Twitter | 0-6h (hot) | 6-24h (warm) | 12 hours |
| Breaking News | 0-12h | 12-48h | 24 hours |
| Policy/Regulation | 0-24h (hot) | 1-30 days | 14 days |
| Macro Events | 0-24h | 1-14 days | 7 days |

### 7.3 Sentiment Balance Rule

- Calculate overall deck sentiment
- If >80% one direction, include top opposing card for perspective
- This reflects reality while ensuring diverse viewpoints

---

## 8. Scoring System

### 8.1 Influence Score Formula

```
InfluenceScore = BaseScore × TimeDecay × SourceAuthority × EngagementMultiplier
```

**Components:**

| Component | Range | Description |
|-----------|-------|-------------|
| BaseScore | 0-100 | Initial relevance |
| TimeDecay | 0.1-1.0 | Exponential decay based on content type |
| SourceAuthority | 1.0-2.0 | Gov=2.0, Bloomberg=1.8, CoinDesk=1.5, KOL=1.0-1.8 |
| EngagementMultiplier | 1.0-3.0 | For KOLs: `1 + log10(likes + retweets×2 + 1) / 5` |

### 8.2 Sentiment Score Formula

```
Sentiment = weighted_avg(
  keyword_sentiment × 0.35,
  price_context × 0.20,
  source_tone × 0.15,
  engagement_patterns × 0.30
)
```

**Classification:**
- **Bull**: score > 0.15
- **Bear**: score < -0.15
- **Neutral**: use keyword sentiment as tiebreaker

### 8.3 Final Card Score

```
FinalScore = InfluenceScore × (1 + |SentimentScore| × 0.5)
```

---

## 9. Policy Impact Detection

### 9.1 Policy Types

| Type | Keywords | Impact Window |
|------|----------|---------------|
| Regulation | SEC, CFTC, ETF, approval, framework | Up to 30 days |
| Legal | Lawsuit, investigation, charges, settlement | Up to 30 days |
| Macro | Fed, rates, inflation, GDP, employment | Up to 14 days |
| Government | Congress, bill, legislation, executive order | Up to 30 days |

### 9.2 Impact Levels

| Level | Examples | Window |
|-------|----------|--------|
| High | SEC ETF ruling, Fed rate decision, major ban | 14-30 days |
| Medium | Exchange compliance, tax proposals | 7-14 days |
| Low | Minor regulatory comments | 3-7 days |

---

## 10. Data Sources

### 10.1 News Sources

| Source | Method | Rate Limit | Reliability |
|--------|--------|------------|-------------|
| CoinDesk | RSS Feed | None | High |
| The Block | RSS Feed | None | High |
| Decrypt | RSS Feed | None | High |
| Bloomberg | Limited scraping | Rate limited | High (when available) |

### 10.2 KOL Sources

| Source | Method | API Key Required |
|--------|--------|------------------|
| X/Twitter | RSSHub fallback | No |
| X/Twitter | Official API | Yes (optional) |

**Top KOLs Tracked:**
- @VitalikButerin, @CryptoHayes, @zachxbt, @punk6529, @GCRClassic
- @cburniske, @DefiIgnas, @MacroAlf, @inversebrah, @CryptoCred

### 10.3 Price Sources

| Source | Method | Rate Limit |
|--------|--------|------------|
| CoinGecko | Free API | 10-30 calls/min |

---

## 11. Technical Architecture

### 11.1 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom pixel-art CSS |
| Database | SQLite + Prisma ORM |
| Animation | Framer Motion |
| LLM (optional) | Anthropic Claude |

### 11.2 Key Components

```
lib/
├── scrapers/
│   ├── news-scraper.ts      # RSS feed scraping
│   ├── x-scraper.ts         # Twitter/X scraping
│   └── price-scraper.ts     # CoinGecko API
├── influence-scorer.ts       # Time decay & source authority
├── sentiment-analyzer.ts     # Multi-signal sentiment
├── policy-detector.ts        # Policy/macro classification
├── deck-generator.ts         # Quota-based card selection
└── ingestion.ts              # Database storage
```

### 11.3 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/discover` | POST | Generate new deck |
| `/api/scrape` | POST | Trigger data scraping |
| `/api/market_pulse` | GET | Get current prices |
| `/api/cards/[id]` | GET | Get card details |

---

## 12. User Interface

### 12.1 Visual Design

- **Theme**: Insider Trader game aesthetic
- **Colors**: Matrix green (#00ff41), Bear red (#ff3333), Amber (#ffb000)
- **Background**: Dark (#0a0a0a) with CRT scanline overlay
- **Fonts**: Press Start 2P (pixel), VT323 (terminal)
- **Cards**: Rounded corners, gradient backgrounds, glow effects

### 12.2 Responsive Behavior

| Breakpoint | Cards Layout | Price Card |
|------------|--------------|------------|
| Mobile (<640px) | 2 columns | Full width |
| Tablet (640-1024px) | 3-4 columns | Full width |
| Desktop (>1024px) | 5 columns | Full width, centered |

### 12.3 Animations

- **Discover click**: Card flip/shuffle animation (300-600ms)
- **Card hover**: Scale + glow effect
- **Detail panel**: Slide-in from right
- **Price refresh**: Subtle pulse on update

---

## 13. Success Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| Time-to-signal | <5 seconds | From scrape to deck display |
| Evidence coverage | >50% | Cards with primary source link |
| Sentiment accuracy | >70% | Deck sentiment matches market direction |
| Freshness | >70% | Cards from last 24h |
| Diversity | <80% | No single sentiment dominance |
| Completeness | 100% | Always 10 cards |

---

## 14. Roadmap

### Phase 1: MVP ✅ (Complete)

- [x] UI scaffold with Insider Trader aesthetic
- [x] News scraping (RSS feeds)
- [x] Twitter/X scraping (RSSHub fallback)
- [x] Real-time price data (CoinGecko)
- [x] Card detail panel with all sections
- [x] Shuffle animation
- [x] Fair sentiment selection algorithm
- [x] Policy/macro extended time windows

### Phase 2: Enhancement (Planned)

- [ ] User accounts + deck history
- [ ] Push notifications for high-impact alerts
- [ ] Custom KOL watchlist
- [ ] Topic clustering for related cards
- [ ] AI-powered brief/insight generation (Claude)

### Phase 3: Scale (Future)

- [ ] Real-time WebSocket updates
- [ ] Mobile app (React Native)
- [ ] Premium tier with deeper analysis
- [ ] API access for developers

---

## 15. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Twitter API rate limits | KOL data unavailable | RSSHub fallback + caching |
| Bloomberg paywall | Limited news coverage | Store headline/metadata + link |
| Misinfo amplification | Trust damage | "Squeeze the hype" mechanism + source verification |
| Sentiment model bias | Skewed deck | Multi-signal approach + balance rules |
| Scraper blocking | Data gaps | Multiple sources + graceful degradation |

---

## 16. Compliance & Disclaimers

- **Disclaimer**: "Informational only, not financial advice"
- **Data**: Store only required data; respect source terms of service
- **Privacy**: No user tracking in MVP; future versions will require consent

---

## 17. Appendix

### A. Source Authority Scores

```typescript
const SOURCE_AUTHORITY = {
  // Government (2.0)
  '.gov': 2.0,
  
  // Major Financial (1.7-1.8)
  'Bloomberg': 1.8,
  'Reuters': 1.8,
  
  // Crypto News (1.3-1.5)
  'CoinDesk': 1.5,
  'The Block': 1.5,
  'Decrypt': 1.4,
  
  // Top KOLs (1.3-1.8)
  '@VitalikButerin': 1.8,
  '@zachxbt': 1.7,
  '@CryptoHayes': 1.6,
  
  // Default
  'default': 1.0
}
```

### B. Sentiment Keywords (Subset)

**Bull Keywords**: approval, breakthrough, bullish, rally, surge, adoption, institutional, partnership, expansion, growth

**Bear Keywords**: hack, exploit, scam, fraud, crash, investigation, lawsuit, ban, crackdown, bearish

### C. Example Deck Output

| # | Type | Sentiment | Score | Content |
|---|------|-----------|-------|---------|
| 1 | Price | Bear | 95% | BTC -2.3% at $93,126 |
| 2 | Policy | Neutral | 88% | SEC delays ETF decision (3 days old) |
| 3 | News | Bull | 82% | BlackRock adds $500M to BTC ETF |
| 4 | News | Bear | 76% | Binance faces new DOJ scrutiny |
| 5 | KOL | Bull | 71% | @CryptoHayes: Fed pivot incoming |
| 6 | KOL | Bear | 68% | @GCRClassic: Leverage too high |
| 7 | KOL | Bull | 65% | @cburniske: SOL accumulation |
| 8 | News | Bull | 62% | Visa expands USDC settlement |
| 9 | KOL | Neutral | 58% | @VitalikButerin: L2 update |
| 10 | Policy | Bear | 55% | Korea crypto tax (5 days old) |

**Deck Sentiment**: 50% Bull, 40% Bear, 10% Neutral ✓

---

*Document maintained by the Bubbly Insider team.*
