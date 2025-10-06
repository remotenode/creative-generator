import { PersonaData } from './types';

export function generateImagePrompt(originalPrompt: string, persona: PersonaData, country: string): string {
  return `${originalPrompt}. Target: ${persona.ageRange} ${persona.profession} from ${persona.location}, ${persona.lifestyle} lifestyle. Professional, high-quality, ${country} market aesthetic.`;
}

export function generateTextPrompt(originalPrompt: string, persona: PersonaData, country: string, language: string): string {
  return `For ${country} market in ${language}, write ads for: ${originalPrompt}

Target: ${persona.ageRange} ${persona.gender} ${persona.profession} from ${persona.location}
- Income: ${persona.incomeLevel}
- Lifestyle: ${persona.lifestyle} 
- Values: ${persona.values}
- Interests: ${persona.primaryInterest}

Generate ads that resonate with this persona using natural ${language} for ${country} market.`;
}

export function calculateQualityScore(persona: PersonaData, adText: string): number {
  let score = 5;
  if (persona.profession && persona.ageRange) score += 1;
  if (persona.primaryInterest && persona.values) score += 1;
  if (adText.length > 20 && adText.length < 200) score += 1;
  if (adText.includes('!') || adText.includes('?')) score += 1;
  return Math.min(10, Math.max(1, score));
}

export function generateTargetingDescription(persona: PersonaData, country: string): string {
  return `${persona.ageRange} ${persona.gender} ${persona.profession} in ${persona.location}, ${persona.incomeLevel} income, ${persona.lifestyle} lifestyle.`;
}