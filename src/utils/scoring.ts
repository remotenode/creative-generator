import { PersonaData } from '../types/persona';

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
