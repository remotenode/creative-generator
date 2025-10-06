import { WorkerEntrypoint } from 'cloudflare:workers';
import { Env, GenerateAdsRequest, GenerateAdsResponse, GeneratedAd } from '../types';
import { createImagePrompt, createTextPrompt, calculateQualityScore, generateTargetingDescription } from '../utils';

export class AdGeneratorEntrypoint extends WorkerEntrypoint<Env> {
  async generateAds(request: GenerateAdsRequest): Promise<GenerateAdsResponse> {
    try {
      const requestId = this.generateRequestId();
      const adCount = this.calculateAdCount(request);

      // Generate personas
      const personas = await this.env.PERSONA_GENERATOR.generateMultiple(adCount, {
        weighted: true,
        seed: `${request.country}-${request.language}-${Date.now()}`
      });
      
      // Generate ads
      const ads: GeneratedAd[] = [];
      for (const persona of personas.personas) {
        try {
          const ad = await this.generateSingleAd(persona, request, requestId);
          ads.push(ad);
        } catch (error) {
          console.error('Ad generation failed:', error);
        }
      }

      return {
        success: true,
        data: { ads, totalCount: ads.length, generatedAt: new Date().toISOString(), requestId }
      };
    } catch (error) {
      return {
        success: false,
        data: { ads: [], totalCount: 0, generatedAt: new Date().toISOString(), requestId: `ad-${Date.now()}` },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private generateRequestId(): string {
    return `ad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateAdCount(request: GenerateAdsRequest): number {
    return Math.min(request.count || parseInt(this.env.DEFAULT_AD_COUNT), parseInt(this.env.MAX_AD_COUNT));
  }

  private async generateSingleAd(persona: any, request: GenerateAdsRequest, requestId: string): Promise<GeneratedAd> {
    // Create enhanced prompts from original request prompt
    const imagePrompt = createImagePrompt(request.prompt, persona.persona, request.country);
    const textPrompt = createTextPrompt(request.prompt, persona.persona, request.country, request.language);

    // Generate image using enhanced prompt
    const imageResponse = await this.env.IMAGE_GENERATOR.generateImage(imagePrompt, { count: 1, size: "1024x1024" });

    // Generate text using enhanced prompt
    const textResponse = await this.env.TEXT_GENERATOR.generate({ prompt: textPrompt, adTitleLimit: 30, adTextLimit: 90 });

    const bestText = textResponse.data.variants.reduce((best, current) => 
      current.qualityScore > best.qualityScore ? current : best
    );

    return {
      id: `${requestId}-${persona.id}`,
      persona,
      image: imageResponse.images[0],
      text: bestText,
      targeting: {
        country: request.country,
        language: request.language,
        demographics: generateTargetingDescription(persona.persona, request.country)
      },
      qualityScore: calculateQualityScore(persona.persona, bestText.adText),
      generatedAt: new Date().toISOString()
    };
  }
}
