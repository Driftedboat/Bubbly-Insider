import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic client (will use ANTHROPIC_API_KEY from env)
const anthropic = process.env.ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

interface ContentGenerationInput {
  headline: string
  sourceBadge: string
  cardType: 'news' | 'kol' | 'price'
  rawContent?: string
  categoryTags: string[]
}

interface GeneratedContent {
  brief: string
  insight: string
  bullBear: 'bull' | 'bear'
}

/**
 * Generate brief and insight for a card using Claude
 */
export async function generateCardContent(input: ContentGenerationInput): Promise<GeneratedContent> {
  // If no API key, return placeholder content
  if (!anthropic) {
    console.warn('ANTHROPIC_API_KEY not set, using placeholder content')
    return generatePlaceholderContent(input)
  }

  try {
    const systemPrompt = `You are a crypto analyst providing concise, factual analysis. 
You analyze crypto news, KOL posts, and market data to provide:
1. A brief (2-3 sentences) explaining what happened
2. An insight (1-2 sentences) on crypto market impact

Be direct and specific. Avoid hype language. Always state whether the impact is bullish or bearish for crypto.`

    const userPrompt = `Analyze this ${input.cardType} item:

Headline: ${input.headline}
Source: ${input.sourceBadge}
Categories: ${input.categoryTags.join(', ')}
${input.rawContent ? `Content: ${input.rawContent}` : ''}

Respond in JSON format:
{
  "brief": "2-3 sentence explanation of what happened",
  "insight": "1-2 sentence market impact analysis",
  "bullBear": "bull" or "bear"
}`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ],
      system: systemPrompt
    })

    // Extract text from response
    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : ''

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        brief: parsed.brief || 'Analysis pending.',
        insight: parsed.insight || 'Impact assessment pending.',
        bullBear: parsed.bullBear === 'bear' ? 'bear' : 'bull'
      }
    }

    // Fallback if parsing fails
    return generatePlaceholderContent(input)

  } catch (error) {
    console.error('Claude API error:', error)
    return generatePlaceholderContent(input)
  }
}

/**
 * Batch generate content for multiple cards
 */
export async function generateBatchContent(
  items: ContentGenerationInput[]
): Promise<GeneratedContent[]> {
  // Process in parallel with rate limiting
  const results: GeneratedContent[] = []
  
  for (const item of items) {
    const content = await generateCardContent(item)
    results.push(content)
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  return results
}

/**
 * Generate placeholder content when Claude is unavailable
 */
function generatePlaceholderContent(input: ContentGenerationInput): GeneratedContent {
  // Simple heuristic-based content generation
  const isBullish = determineBullishFromKeywords(input.headline)
  
  const briefTemplates = {
    news: `${input.headline}. This development has been reported by ${input.sourceBadge} and relates to ${input.categoryTags[0] || 'market'} dynamics.`,
    kol: `Crypto thought leader shares perspective on market conditions. The discussion has gained traction in the crypto community.`,
    price: `${input.headline}. Trading volume and momentum indicators suggest ${isBullish ? 'bullish continuation' : 'cautious sentiment'}.`
  }
  
  const insightTemplates = {
    bull: 'This development is generally positive for crypto market sentiment and could attract increased participation.',
    bear: 'This creates near-term uncertainty and may prompt risk-off positioning among traders.'
  }
  
  return {
    brief: briefTemplates[input.cardType],
    insight: insightTemplates[isBullish ? 'bull' : 'bear'],
    bullBear: isBullish ? 'bull' : 'bear'
  }
}

/**
 * Simple keyword-based bull/bear detection
 */
function determineBullishFromKeywords(text: string): boolean {
  const bullKeywords = ['approval', 'approved', 'expansion', 'partnership', 'adoption', 'institutional', 'etf', 'settlement', 'integration', 'bullish', 'accumulation', 'breakthrough', 'upgrade', 'milestone', 'launch', 'clarity', 'growth', 'rally', 'breakout', 'surge', 'gain']
  
  const bearKeywords = ['investigation', 'probe', 'hack', 'exploit', 'scam', 'tax', 'crackdown', 'ban', 'restriction', 'warning', 'outflow', 'dump', 'crash', 'bearish', 'liquidation', 'fraud', 'suspicious', 'vulnerability', 'lawsuit', 'subpoena', 'decline', 'drop']
  
  const lowerText = text.toLowerCase()
  
  let bullScore = 0
  let bearScore = 0
  
  for (const keyword of bullKeywords) {
    if (lowerText.includes(keyword)) bullScore++
  }
  
  for (const keyword of bearKeywords) {
    if (lowerText.includes(keyword)) bearScore++
  }
  
  return bullScore >= bearScore
}

/**
 * Extract claim from KOL post
 */
export async function extractClaim(postContent: string): Promise<string> {
  if (!anthropic) {
    // Simple extraction fallback
    const sentences = postContent.split(/[.!?]/).filter(s => s.trim().length > 20)
    return sentences[0]?.trim() || postContent.slice(0, 100)
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Extract the main claim or prediction from this crypto KOL post in one sentence:\n\n"${postContent}"`
        }
      ]
    })

    return message.content[0].type === 'text' 
      ? message.content[0].text.trim()
      : postContent.slice(0, 100)

  } catch (error) {
    console.error('Claim extraction error:', error)
    return postContent.slice(0, 100)
  }
}
