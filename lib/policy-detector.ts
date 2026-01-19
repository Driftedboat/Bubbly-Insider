/**
 * Policy & Macro Event Detector
 * 
 * Detects policy/regulatory/macro content and assigns
 * appropriate time windows and impact levels.
 */

export type PolicyType = 'regulation' | 'macro' | 'legal' | 'government' | 'none'
export type ImpactLevel = 'high' | 'medium' | 'low'
export type Jurisdiction = 'US' | 'EU' | 'Asia' | 'Global' | 'Other'

export interface PolicyClassification {
  isPolicy: boolean
  type: PolicyType
  impactLevel: ImpactLevel
  jurisdiction: Jurisdiction
  effectiveWindowDays: number
  keywords: string[]
}

// Policy/regulatory keywords
const REGULATION_KEYWORDS = [
  'sec', 'cftc', 'regulation', 'regulatory', 'compliance', 'rule', 'ruling',
  'etf', 'approval', 'approve', 'reject', 'deny', 'filing', 'application',
  'license', 'framework', 'guidelines', 'enforcement', 'sanction',
  'stablecoin', 'cbdc', 'digital asset', 'securities', 'commodity'
]

const LEGAL_KEYWORDS = [
  'lawsuit', 'sue', 'court', 'judge', 'verdict', 'settlement', 'fine',
  'investigation', 'probe', 'subpoena', 'indictment', 'charges', 'guilty',
  'doj', 'fbi', 'justice department', 'attorney general', 'legal action'
]

const MACRO_KEYWORDS = [
  'fed', 'federal reserve', 'fomc', 'interest rate', 'rate hike', 'rate cut',
  'inflation', 'cpi', 'gdp', 'employment', 'jobs', 'unemployment', 'labor',
  'treasury', 'yield', 'bond', 'dollar', 'dxy', 'liquidity', 'qe', 'qt',
  'recession', 'economic', 'monetary policy', 'fiscal'
]

const GOVERNMENT_KEYWORDS = [
  'congress', 'senate', 'house', 'bill', 'legislation', 'law', 'act',
  'executive order', 'white house', 'president', 'administration',
  'government', 'parliament', 'minister', 'official', 'agency'
]

// Jurisdiction detection
const US_KEYWORDS = ['us', 'usa', 'united states', 'american', 'sec', 'cftc', 'fed', 'congress', 'senate', 'doj']
const EU_KEYWORDS = ['eu', 'europe', 'european', 'ecb', 'mica', 'esma', 'brussels']
const ASIA_KEYWORDS = ['china', 'japan', 'korea', 'singapore', 'hong kong', 'asia', 'asian']

// High-impact event patterns
const HIGH_IMPACT_PATTERNS = [
  /sec\s+(approv|reject|deny|ruling|decision)/i,
  /etf\s+(approv|reject|launch|delay)/i,
  /fed\s+(rate|decision|pivot|cut|hike)/i,
  /ban\s+(crypto|bitcoin|trading)/i,
  /(lawsuit|charges)\s+against/i,
  /billion\s+dollar/i,
  /record\s+fine/i,
  /cbdc\s+(launch|pilot|announce)/i,
  /stablecoin\s+(ban|regulation|framework)/i
]

// Medium-impact event patterns
const MEDIUM_IMPACT_PATTERNS = [
  /regulatory\s+(clarity|framework|guidance)/i,
  /investigation\s+(into|of)/i,
  /compliance\s+(requirement|deadline)/i,
  /tax\s+(proposal|law|rate)/i,
  /exchange\s+(license|registration)/i,
  /treasury\s+(report|statement)/i
]

/**
 * Detect policy type from text
 */
function detectPolicyType(text: string): PolicyType {
  const lowerText = text.toLowerCase()
  
  // Check each category
  const regulationScore = REGULATION_KEYWORDS.filter(k => lowerText.includes(k)).length
  const legalScore = LEGAL_KEYWORDS.filter(k => lowerText.includes(k)).length
  const macroScore = MACRO_KEYWORDS.filter(k => lowerText.includes(k)).length
  const governmentScore = GOVERNMENT_KEYWORDS.filter(k => lowerText.includes(k)).length
  
  const maxScore = Math.max(regulationScore, legalScore, macroScore, governmentScore)
  
  if (maxScore === 0) return 'none'
  
  if (regulationScore === maxScore) return 'regulation'
  if (legalScore === maxScore) return 'legal'
  if (macroScore === maxScore) return 'macro'
  if (governmentScore === maxScore) return 'government'
  
  return 'none'
}

/**
 * Detect impact level
 */
function detectImpactLevel(text: string): ImpactLevel {
  // Check high-impact patterns
  for (const pattern of HIGH_IMPACT_PATTERNS) {
    if (pattern.test(text)) {
      return 'high'
    }
  }
  
  // Check medium-impact patterns
  for (const pattern of MEDIUM_IMPACT_PATTERNS) {
    if (pattern.test(text)) {
      return 'medium'
    }
  }
  
  return 'low'
}

/**
 * Detect jurisdiction
 */
function detectJurisdiction(text: string): Jurisdiction {
  const lowerText = text.toLowerCase()
  
  const usScore = US_KEYWORDS.filter(k => lowerText.includes(k)).length
  const euScore = EU_KEYWORDS.filter(k => lowerText.includes(k)).length
  const asiaScore = ASIA_KEYWORDS.filter(k => lowerText.includes(k)).length
  
  const maxScore = Math.max(usScore, euScore, asiaScore)
  
  if (maxScore === 0) return 'Global'
  
  // If multiple jurisdictions mentioned, it's global
  const aboveThreshold = [usScore, euScore, asiaScore].filter(s => s >= maxScore - 1).length
  if (aboveThreshold > 1) return 'Global'
  
  if (usScore === maxScore) return 'US'
  if (euScore === maxScore) return 'EU'
  if (asiaScore === maxScore) return 'Asia'
  
  return 'Other'
}

/**
 * Get effective time window based on policy type and impact
 */
function getEffectiveWindow(type: PolicyType, impact: ImpactLevel): number {
  const windows: Record<PolicyType, Record<ImpactLevel, number>> = {
    regulation: { high: 30, medium: 14, low: 7 },
    legal: { high: 30, medium: 14, low: 7 },
    macro: { high: 14, medium: 7, low: 3 },
    government: { high: 30, medium: 14, low: 7 },
    none: { high: 2, medium: 1, low: 1 }
  }
  
  return windows[type][impact]
}

/**
 * Extract matched keywords
 */
function extractKeywords(text: string): string[] {
  const lowerText = text.toLowerCase()
  const allKeywords = [
    ...REGULATION_KEYWORDS,
    ...LEGAL_KEYWORDS,
    ...MACRO_KEYWORDS,
    ...GOVERNMENT_KEYWORDS
  ]
  
  return [...new Set(allKeywords.filter(k => lowerText.includes(k)))]
}

/**
 * Main policy classification function
 */
export function classifyPolicy(text: string, source?: string): PolicyClassification {
  const combinedText = `${text} ${source || ''}`
  
  const type = detectPolicyType(combinedText)
  
  if (type === 'none') {
    return {
      isPolicy: false,
      type: 'none',
      impactLevel: 'low',
      jurisdiction: 'Other',
      effectiveWindowDays: 1,
      keywords: []
    }
  }
  
  const impactLevel = detectImpactLevel(combinedText)
  const jurisdiction = detectJurisdiction(combinedText)
  const effectiveWindowDays = getEffectiveWindow(type, impactLevel)
  const keywords = extractKeywords(combinedText)
  
  return {
    isPolicy: true,
    type,
    impactLevel,
    jurisdiction,
    effectiveWindowDays,
    keywords
  }
}

/**
 * Check if a policy item is still within its effective window
 */
export function isPolicyStillRelevant(
  classification: PolicyClassification,
  publishedAt: Date
): boolean {
  if (!classification.isPolicy) return true // Non-policy uses normal time windows
  
  const daysAgo = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60 * 24)
  return daysAgo <= classification.effectiveWindowDays
}

/**
 * Get content type for influence scoring
 * Maps policy types to content types with appropriate time windows
 */
export function getContentTypeForPolicy(classification: PolicyClassification): string {
  if (!classification.isPolicy) return 'news'
  
  switch (classification.type) {
    case 'regulation':
    case 'government':
    case 'legal':
      return 'policy'
    case 'macro':
      return 'macro'
    default:
      return 'news'
  }
}

/**
 * Filter and rank policy items
 * Returns policy items that are still relevant, sorted by impact
 */
export function filterRelevantPolicyItems<T extends { text: string; publishedAt: Date; source?: string }>(
  items: T[]
): Array<T & { policyClassification: PolicyClassification }> {
  return items
    .map(item => ({
      ...item,
      policyClassification: classifyPolicy(item.text, item.source)
    }))
    .filter(item => 
      item.policyClassification.isPolicy && 
      isPolicyStillRelevant(item.policyClassification, item.publishedAt)
    )
    .sort((a, b) => {
      // Sort by impact level (high > medium > low)
      const impactOrder = { high: 3, medium: 2, low: 1 }
      const impactDiff = impactOrder[b.policyClassification.impactLevel] - 
                         impactOrder[a.policyClassification.impactLevel]
      if (impactDiff !== 0) return impactDiff
      
      // Then by recency
      return b.publishedAt.getTime() - a.publishedAt.getTime()
    })
}
