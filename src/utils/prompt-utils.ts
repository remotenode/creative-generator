import { PersonaData } from '../types/persona';

// Create enhanced image prompt from original request prompt
export function createImagePrompt(originalPrompt: string, persona: PersonaData, country: string): string {
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

function extractKeywords(prompt: string): string {
  // Common stop words to filter out
  const stopWords = new Set(['for', 'with', 'that', 'this', 'they', 'them', 'their', 'help', 'make', 'create', 'build', 'app', 'service', 'product', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'under', 'over', 'within', 'without', 'against', 'across', 'behind', 'beyond', 'inside', 'outside']);
  
  const keywords = prompt
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => 
      word.length > 3 && 
      !stopWords.has(word)
    )
    .slice(0, 5)
    .join(', ');
    
  return keywords || 'key, features, benefits';
}

function identifyProductType(prompt: string): string {
  // Extract key nouns from the prompt to identify the product type
  const words = prompt.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 3);
  
  return words.length > 0 ? words.join(' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Product/Service';
}

function extractKeyBenefits(prompt: string): string {
  // Extract descriptive adjectives and action verbs that indicate benefits
  const words = prompt.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  // Find words that end with common benefit suffixes or are action verbs
  const benefitWords = words
    .filter(word => {
      // Check for action verb patterns (ending in -ing, -ed, -ize, -ify, etc.)
      const actionPatterns = /(ing|ed|ize|ify|en|ate|fy|ise)$/;
      // Check for descriptive adjective patterns (ending in -ive, -al, -ful, -less, -able, etc.)
      const descriptivePatterns = /(ive|al|ful|less|able|ible|ous|ious|ent|ant|ic|ical)$/;
      // Check for comparative/superlative forms
      const comparativePatterns = /(er|est|ier|iest)$/;
      
      return actionPatterns.test(word) || descriptivePatterns.test(word) || comparativePatterns.test(word);
    })
    .slice(0, 3);
  
  return benefitWords.length > 0 ? benefitWords.join(', ') : 'value, quality, convenience';
}

function buildTargetAudience(persona: PersonaData, country: string): string {
  return `${persona.ageRange} ${persona.gender} ${persona.profession} in ${persona.location}, ${persona.incomeLevel} income, ${persona.lifestyle} lifestyle`;
}

function getProfessionContext(profession: string): string {
  // Generate a generic professional context based on profession characteristics
  const professionLower = profession.toLowerCase();
  
  // Extract key descriptive words from the profession
  const professionWords = professionLower.split(/\s+/);
  
  // Find the most descriptive word (usually the longest or most specific)
  const descriptiveWord = professionWords
    .filter(word => word.length > 4)
    .sort((a, b) => b.length - a.length)[0] || professionWords[0];
  
  // Generate context based on the descriptive word
  if (descriptiveWord) {
    return `${descriptiveWord} professional environment`;
  }
  
  return 'professional work environment';
}
