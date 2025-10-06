import { PersonaData } from '../types/persona';

// Create enhanced image prompt from original request prompt
export function createImagePrompt(originalPrompt: string, persona: PersonaData, country: string): string {
  const targetAudience = buildTargetAudience(persona, country);
  
  return `Create a professional advertisement image for: ${originalPrompt}

Target Audience: ${targetAudience}
Visual Style: Professional, high-quality, ${country} market aesthetic
Setting: Professional environment with ${persona.lifestyle} lifestyle elements`;
}

// Create enhanced text prompt from original request prompt  
export function createTextPrompt(originalPrompt: string, persona: PersonaData, country: string, language: string): string {
  return `Create compelling advertisement text for: ${originalPrompt}

Target Market: ${country} (${language})

Demographics:
- Age: ${persona.ageRange}
- Gender: ${persona.gender}
- Profession: ${persona.profession}
- Location: ${persona.location}
- Income: ${persona.incomeLevel}

Psychographics:
- Lifestyle: ${persona.lifestyle}
- Values: ${persona.values}
- Interests: ${persona.primaryInterest}
- Communication Style: ${persona.communicationStyle}
- Technology Comfort: ${persona.technologyComfort}

Generate engaging ad copy that resonates with this specific persona using natural ${language} appropriate for ${country} market.`;
}

function buildTargetAudience(persona: PersonaData, country: string): string {
  return `${persona.ageRange} ${persona.gender} ${persona.profession} in ${persona.location}, ${persona.incomeLevel} income, ${persona.lifestyle} lifestyle`;
}
