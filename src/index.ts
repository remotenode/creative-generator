import { WorkerEntrypoint } from 'cloudflare:workers';
import { 
  Env, 
  GenerateAdsRequest, 
  GenerateAdsResponse, 
  GeneratedAd,
  PersonaResponse,
  ImageResponse,
  TextResponse
} from './types';
import { 
  generateImagePrompt, 
  generateTextPrompt, 
  calculateQualityScore,
  generateTargetingDescription 
} from './utils';

export class AdGeneratorEntrypoint extends WorkerEntrypoint<Env> {
  // Main ad generation method
  async generateAds(request: GenerateAdsRequest): Promise<GenerateAdsResponse> {
    try {
      const requestId = this.generateRequestId();
      const adCount = Math.min(
        request.count || parseInt(this.env.DEFAULT_AD_COUNT),
        parseInt(this.env.MAX_AD_COUNT)
      );

      // Generate personas
      const personas = await this.generatePersonas(adCount, request.country, request.language);
      
      // Generate ads for each persona
      const ads: GeneratedAd[] = [];
      
      for (let i = 0; i < personas.length; i++) {
        try {
          const ad = await this.generateSingleAd(
            personas[i], 
            request, 
            requestId
          );
          ads.push(ad);
        } catch (error) {
          console.error(`Failed to generate ad ${i + 1}:`, error);
          // Continue with other ads even if one fails
        }
      }

      return {
        success: true,
        data: {
          ads,
          totalCount: ads.length,
          generatedAt: new Date().toISOString(),
          requestId,
          targeting: {
            country: request.country,
            language: request.language,
            originalPrompt: request.prompt
          }
        }
      };

    } catch (error) {
      console.error('Ad generation failed:', error);
      return {
        success: false,
        data: {
          ads: [],
          totalCount: 0,
          generatedAt: new Date().toISOString(),
          requestId: this.generateRequestId(),
          targeting: {
            country: request.country,
            language: request.language,
            originalPrompt: request.prompt
          }
        },
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Generate personas with country/language targeting
  private async generatePersonas(count: number, country: string, language: string): Promise<PersonaResponse[]> {
    try {
      // Use weighted selection for more realistic personas
      const result = await this.env.PERSONA_GENERATOR.generateMultiple(count, {
        weighted: true,
        seed: `${country}-${language}-${Date.now()}`
      });
      
      return result.personas;
    } catch (error) {
      console.error('Persona generation failed:', error);
      // Fallback to single persona generation
      const personas: PersonaResponse[] = [];
      for (let i = 0; i < count; i++) {
        try {
          const persona = await this.env.PERSONA_GENERATOR.generateSingle({
            weighted: true,
            seed: `${country}-${language}-${i}`
          });
          personas.push(persona);
        } catch (fallbackError) {
          console.error(`Persona generation fallback ${i} failed:`, fallbackError);
        }
      }
      return personas;
    }
  }

  // Generate a single ad with persona, image, and text
  private async generateSingleAd(
    persona: PersonaResponse, 
    request: GenerateAdsRequest, 
    requestId: string
  ): Promise<GeneratedAd> {
    // Generate image
    const imagePrompt = generateImagePrompt(
      request.prompt, 
      persona.persona, 
      request.country, 
      request.language
    );
    
    const imageResponse = await this.env.IMAGE_GENERATOR.generateImage(imagePrompt, {
      count: 1,
      size: "1024x1024",
      style: request.imageStyle || this.env.DEFAULT_IMAGE_STYLE,
      quality: request.imageQuality || this.env.DEFAULT_IMAGE_QUALITY
    });

    if (!imageResponse.success || !imageResponse.images.length) {
      throw new Error('Image generation failed');
    }

    // Generate ad text
    const textPrompt = generateTextPrompt(
      request.prompt,
      persona.persona,
      request.country,
      request.language
    );

    const textResponse = await this.env.TEXT_GENERATOR.generate({
      prompt: textPrompt,
      adTitleLimit: 30,
      adTextLimit: 90
    });

    if (!textResponse.success || !textResponse.data.variants.length) {
      throw new Error('Text generation failed');
    }

    // Select best text variant
    const bestTextVariant = textResponse.data.variants.reduce((best, current) => 
      current.qualityScore > best.qualityScore ? current : best
    );

    // Calculate overall quality score
    const qualityScore = calculateQualityScore(
      persona.persona,
      imagePrompt,
      bestTextVariant.adText,
      request.prompt
    );

    return {
      id: `${requestId}-${persona.id}`,
      persona,
      image: imageResponse.images[0],
      text: bestTextVariant,
      targeting: {
        country: request.country,
        language: request.language,
        demographics: generateTargetingDescription(persona.persona, request.country, request.language),
        psychographics: `${persona.persona.personality}, ${persona.persona.values}, ${persona.persona.lifestyle}`
      },
      qualityScore,
      generatedAt: new Date().toISOString()
    };
  }

  // Health check across all services
  async health(): Promise<{ success: boolean; data: any }> {
    const healthChecks = {
      personaGenerator: false,
      imageGenerator: false,
      textGenerator: false
    };

    try {
      await this.env.PERSONA_GENERATOR.getInfo();
      healthChecks.personaGenerator = true;
    } catch (error) {
      console.error('Persona generator health check failed:', error);
    }

    try {
      const textHealth = this.env.TEXT_GENERATOR.health();
      healthChecks.textGenerator = textHealth.success;
    } catch (error) {
      console.error('Text generator health check failed:', error);
    }

    // Image generator doesn't have explicit health check, so we'll test with a simple call
    try {
      await this.env.IMAGE_GENERATOR.generateImage("test", { count: 1 });
      healthChecks.imageGenerator = true;
    } catch (error) {
      console.error('Image generator health check failed:', error);
    }

    const allHealthy = Object.values(healthChecks).every(status => status);

    return {
      success: allHealthy,
      data: {
        services: healthChecks,
        timestamp: new Date().toISOString(),
        worker: 'ad-generator'
      }
    };
  }

  // Get generation statistics
  async getStats(): Promise<{ success: boolean; data: any }> {
    try {
      const personaCount = await this.env.PERSONA_GENERATOR.getCount();
      const personaInfo = await this.env.PERSONA_GENERATOR.getInfo();
      
      return {
        success: true,
        data: {
          personaDatabase: {
            totalPersonas: personaCount,
            totalCombinations: personaInfo.statistics?.totalPossibleCombinations || 0
          },
          services: {
            personaGenerator: 'active',
            imageGenerator: 'active',
            textGenerator: 'active'
          },
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // Generate unique request ID
  private generateRequestId(): string {
    return `ad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// HTTP handler for REST API
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const adGenerator = new AdGeneratorEntrypoint(env);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      // Route requests
      if (url.pathname === '/generate-ads' && request.method === 'POST') {
        const body: GenerateAdsRequest = await request.json();
        
        // Validate required fields
        if (!body.prompt || !body.language || !body.country) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Missing required fields: prompt, language, country'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const result = await adGenerator.generateAds(body);
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      if (url.pathname === '/health' && request.method === 'GET') {
        const result = await adGenerator.health();
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      if (url.pathname === '/stats' && request.method === 'GET') {
        const result = await adGenerator.getStats();
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // 404 for unknown routes
      return new Response(JSON.stringify({
        success: false,
        error: 'Not found',
        availableEndpoints: [
          'POST /generate-ads',
          'GET /health',
          'GET /stats'
        ]
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

    } catch (error) {
      console.error('Request handling error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};