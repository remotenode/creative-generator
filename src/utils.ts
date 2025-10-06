import { PersonaData } from './types';

// Create enhanced image prompt from original request prompt
export function createImagePrompt(originalPrompt: string, persona: PersonaData, country: string): string {
  // Extract key elements from original prompt
  const keywords = extractKeywords(originalPrompt);
  const productType = identifyProductType(originalPrompt);
  const targetAudience = buildTargetAudience(persona, country);
  
  return `Create a professional advertisement image for: ${originalPrompt}

Product/Service: ${productType}
Target Audience: ${targetAudience}
Visual Style: Professional, high-quality, ${country} market aesthetic
Keywords: ${keywords}
Setting: ${getProfessionContext(persona.profession)} with ${persona.lifestyle} lifestyle elements`;
}

// Create enhanced text prompt from original request prompt  
export function createTextPrompt(originalPrompt: string, persona: PersonaData, country: string, language: string): string {
  const productType = identifyProductType(originalPrompt);
  const keyBenefits = extractKeyBenefits(originalPrompt);
  const targetAudience = buildTargetAudience(persona, country);
  
  return `Create compelling advertisement text for: ${originalPrompt}

Product/Service: ${productType}
Key Benefits: ${keyBenefits}
Target Market: ${country} (${language})
Target Audience: ${targetAudience}

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

// Helper functions
function extractKeywords(prompt: string): string {
  const keywords = prompt
    .toLowerCase()
    .split(' ')
    .filter(word => 
      word.length > 3 && 
      !['for', 'with', 'that', 'this', 'they', 'them', 'their', 'help', 'make', 'create', 'build', 'app', 'service', 'product'].includes(word)
    )
    .slice(0, 5)
    .join(', ');
    
  return keywords || 'professional, innovative, quality';
}

function identifyProductType(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('app') || lower.includes('mobile') || lower.includes('software')) return 'Mobile App/Software';
  if (lower.includes('fitness') || lower.includes('health') || lower.includes('workout')) return 'Fitness/Health Service';
  if (lower.includes('food') || lower.includes('restaurant') || lower.includes('delivery')) return 'Food Service';
  if (lower.includes('fashion') || lower.includes('clothing') || lower.includes('style')) return 'Fashion/Clothing';
  if (lower.includes('education') || lower.includes('learning') || lower.includes('course')) return 'Education Service';
  if (lower.includes('travel') || lower.includes('trip') || lower.includes('vacation')) return 'Travel Service';
  if (lower.includes('finance') || lower.includes('banking') || lower.includes('money')) return 'Financial Service';
  return 'Product/Service';
}

function extractKeyBenefits(prompt: string): string {
  const benefits = [];
  const lower = prompt.toLowerCase();
  
  if (lower.includes('help') || lower.includes('assist')) benefits.push('assistance');
  if (lower.includes('save') || lower.includes('time')) benefits.push('time-saving');
  if (lower.includes('easy') || lower.includes('simple')) benefits.push('ease of use');
  if (lower.includes('fast') || lower.includes('quick')) benefits.push('speed');
  if (lower.includes('professional') || lower.includes('expert')) benefits.push('professional quality');
  if (lower.includes('healthy') || lower.includes('fitness')) benefits.push('health benefits');
  if (lower.includes('convenient') || lower.includes('convenience')) benefits.push('convenience');
  
  return benefits.length > 0 ? benefits.join(', ') : 'value, quality, convenience';
}

function buildTargetAudience(persona: PersonaData, country: string): string {
  return `${persona.ageRange} ${persona.gender} ${persona.profession} in ${persona.location}, ${persona.incomeLevel} income, ${persona.lifestyle} lifestyle`;
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
