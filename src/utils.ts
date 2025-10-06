import { PersonaData, GenerateAdsRequest } from './types';

// Country-specific persona targeting
export function getCountrySpecificTargeting(country: string, language: string) {
  const targeting = {
    US: {
      en: {
        culturalContext: 'American lifestyle, professional success, individualism',
        commonInterests: ['technology', 'fitness', 'entrepreneurship', 'work-life balance'],
        communicationStyle: 'direct, confident, results-oriented',
        values: ['freedom', 'achievement', 'innovation', 'efficiency']
      }
    },
    UK: {
      en: {
        culturalContext: 'British culture, work-life balance, understated confidence',
        commonInterests: ['sports', 'technology', 'sustainability', 'work-life balance'],
        communicationStyle: 'polite, understated, dry humor',
        values: ['fairness', 'tradition', 'innovation', 'sustainability']
      }
    },
    DE: {
      de: {
        culturalContext: 'German efficiency, quality focus, work-life balance',
        commonInterests: ['engineering', 'sustainability', 'quality', 'work-life balance'],
        communicationStyle: 'direct, precise, quality-focused',
        values: ['quality', 'efficiency', 'reliability', 'sustainability']
      }
    },
    FR: {
      fr: {
        culturalContext: 'French lifestyle, work-life balance, quality of life',
        commonInterests: ['culture', 'food', 'sustainability', 'work-life balance'],
        communicationStyle: 'elegant, sophisticated, quality-focused',
        values: ['quality', 'culture', 'sustainability', 'work-life balance']
      }
    },
    JP: {
      ja: {
        culturalContext: 'Japanese work culture, precision, group harmony',
        commonInterests: ['technology', 'efficiency', 'quality', 'innovation'],
        communicationStyle: 'polite, respectful, group-oriented',
        values: ['harmony', 'quality', 'efficiency', 'innovation']
      }
    }
  };

  return targeting[country]?.[language] || targeting.US.en;
}

// Generate image prompt based on persona and original prompt
export function generateImagePrompt(
  originalPrompt: string, 
  persona: PersonaData, 
  country: string, 
  language: string
): string {
  const targeting = getCountrySpecificTargeting(country, language);
  
  // Extract key elements from original prompt
  const promptKeywords = extractKeywords(originalPrompt);
  
  // Build persona-specific image description
  const personaContext = buildPersonaImageContext(persona, targeting);
  
  // Combine with original prompt
  return `${originalPrompt}. ${personaContext} ${promptKeywords}. Professional, high-quality, ${targeting.culturalContext} aesthetic.`;
}

// Extract keywords from user prompt
function extractKeywords(prompt: string): string {
  const keywords = prompt
    .toLowerCase()
    .split(' ')
    .filter(word => 
      word.length > 3 && 
      !['for', 'with', 'that', 'this', 'they', 'them', 'their', 'help', 'make', 'create', 'build'].includes(word)
    )
    .slice(0, 5)
    .join(', ');
    
  return keywords ? `Keywords: ${keywords}` : '';
}

// Build persona-specific image context
function buildPersonaImageContext(persona: PersonaData, targeting: any): string {
  const ageContext = getAgeContext(persona.ageRange);
  const professionContext = getProfessionContext(persona.profession);
  const lifestyleContext = getLifestyleContext(persona.lifestyle);
  
  return `Target audience: ${ageContext} ${persona.profession.toLowerCase()}, ${lifestyleContext}. ${professionContext} Professional setting with ${targeting.culturalContext} aesthetic.`;
}

function getAgeContext(ageRange: string): string {
  const ageMap = {
    '18-24': 'young adult',
    '25-34': 'millennial professional',
    '35-44': 'experienced professional',
    '45-54': 'senior professional',
    '55-64': 'mature professional',
    '65+': 'senior adult'
  };
  return ageMap[ageRange] || 'professional';
}

function getProfessionContext(profession: string): string {
  const professionMap = {
    'Software Engineer': 'modern tech office environment',
    'Marketing Manager': 'creative workspace with marketing materials',
    'Sales Representative': 'dynamic sales environment',
    'Healthcare Professional': 'clean, medical professional setting',
    'Teacher': 'educational environment',
    'Consultant': 'sophisticated business setting',
    'Entrepreneur': 'innovative startup atmosphere',
    'Student': 'academic or learning environment'
  };
  return professionMap[profession] || 'professional business setting';
}

function getLifestyleContext(lifestyle: string): string {
  const lifestyleMap = {
    'Urban Professional': 'modern city lifestyle',
    'Suburban Family': 'family-oriented suburban setting',
    'Digital Nomad': 'flexible remote work environment',
    'Health Conscious': 'wellness-focused lifestyle',
    'Tech Savvy': 'technology-integrated lifestyle',
    'Minimalist': 'clean, simple aesthetic',
    'Luxury Oriented': 'premium, high-quality setting'
  };
  return lifestyleMap[lifestyle] || 'professional lifestyle';
}

// Generate enhanced text prompt for ad generation
export function generateTextPrompt(
  originalPrompt: string,
  persona: PersonaData,
  country: string,
  language: string
): string {
  const targeting = getCountrySpecificTargeting(country, language);
  
  return `For the ${country} market in ${language}, write compliant ads for: ${originalPrompt}

Target audience: ${persona.ageRange} ${persona.gender} ${persona.profession} from ${persona.location}
- Income level: ${persona.incomeLevel}
- Lifestyle: ${persona.lifestyle}
- Values: ${persona.values}
- Communication style: ${persona.communicationStyle}
- Primary interests: ${persona.primaryInterest}
- Technology comfort: ${persona.technologyComfort}

Cultural context: ${targeting.culturalContext}
Communication style: ${targeting.communicationStyle}
Values to emphasize: ${targeting.values.join(', ')}

Generate ads that resonate with this specific persona and cultural context. Use natural ${language} language appropriate for ${country} market.`;
}

// Calculate quality score for generated ad
export function calculateQualityScore(
  persona: PersonaData,
  imagePrompt: string,
  adText: string,
  originalPrompt: string
): number {
  let score = 5; // Base score
  
  // Persona relevance (0-2 points)
  if (persona.profession && persona.ageRange) score += 1;
  if (persona.primaryInterest && persona.values) score += 1;
  
  // Image prompt quality (0-2 points)
  if (imagePrompt.length > 50 && imagePrompt.includes(originalPrompt.toLowerCase())) score += 1;
  if (imagePrompt.includes('professional') || imagePrompt.includes('quality')) score += 1;
  
  // Ad text quality (0-2 points)
  if (adText.length > 20 && adText.length < 200) score += 1;
  if (adText.includes('!') || adText.includes('?')) score += 1;
  
  // Targeting alignment (0-1 point)
  if (persona.incomeLevel && persona.lifestyle) score += 1;
  
  return Math.min(10, Math.max(1, score));
}

// Generate targeting description
export function generateTargetingDescription(persona: PersonaData, country: string, language: string): string {
  const targeting = getCountrySpecificTargeting(country, language);
  
  return `${persona.ageRange} ${persona.gender} ${persona.profession} in ${persona.location}, ${persona.incomeLevel} income, ${persona.lifestyle} lifestyle. Interested in ${persona.primaryInterest}. ${targeting.culturalContext} cultural background.`;
}