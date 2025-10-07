import { WorkerEntrypoint } from 'cloudflare:workers';
import { Env, GenerateAdsRequest, GenerateAdsResponse, GeneratedAd } from '../types';
import { createImagePrompt, createTextPrompt, calculateQualityScore, generateTargetingDescription } from '../utils';

export class AdGeneratorEntrypoint extends WorkerEntrypoint<Env> {
  async generateAds(request: GenerateAdsRequest): Promise<GenerateAdsResponse> {
    try {
      const requestId = this.generateRequestId();
      const adCount = this.calculateAdCount(request);

      // Generate personas using RPC
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
          console.error('Ad generation failed for persona:', persona.id, 'Error:', error);
          if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
          }
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

    // Generate image using RPC
    const imageResponse = await this.env.IMAGE_GENERATOR.generateImage(imagePrompt, { 
      count: 1, 
      size: "1024x1024" 
    });

    // Generate text using RPC
    const textResponse = await this.env.TEXT_GENERATOR.generate({ 
      prompt: textPrompt, 
      adTitleLimit: 30, 
      adTextLimit: 90 
    });

    // Handle nested text generator response format
    // RPC returns: {success, data: {success, data: {variants}}}
    const variants = textResponse?.data?.data?.variants || textResponse?.data?.variants || [];
    if (variants.length === 0) {
      console.error('No variants found in text response');
      throw new Error('Text generator returned no variants');
    }

    const bestText = variants.reduce((best: any, current: any) => 
      current.qualityScore > best.qualityScore ? current : best
    );

    // Map image response to expected format
    const imageData = {
      url: imageResponse.images[0].url,
      prompt: imageResponse.images[0].prompt,
      size: "1024x1024",
      provider: "ideogram"
    };

    // Map all text variants to expected format
    const textVariants = variants.map((v: any) => ({
      variant: (v.type || 'benefit') as 'urgency' | 'benefit' | 'ease',
      adTitle: v.title || v.adTitle,
      adText: v.text || v.adText,
      qualityScore: v.qualityScore,
      hasCallToAction: v.hasCallToAction !== undefined ? v.hasCallToAction : true
    }));

    // Best text variant
    const textData = {
      variant: (bestText.type || 'benefit') as 'urgency' | 'benefit' | 'ease',
      adTitle: bestText.title || bestText.adTitle,
      adText: bestText.text || bestText.adText,
      qualityScore: bestText.qualityScore,
      hasCallToAction: bestText.hasCallToAction !== undefined ? bestText.hasCallToAction : true
    };

    return {
      id: `${requestId}-${persona.id}`,
      persona,
      image: imageData,
      textVariants,  // All 3 text options
      text: textData,  // Best text option
      targeting: {
        country: request.country,
        language: request.language,
        demographics: generateTargetingDescription(persona.persona, request.country)
      },
      qualityScore: calculateQualityScore(persona.persona, textData.adText),
      generatedAt: new Date().toISOString()
    };
  }

  async health(): Promise<{ success: boolean; data: any }> {
    const services = { personaGenerator: false, imageGenerator: false, textGenerator: false };
    
    try { 
      const info = await this.env.PERSONA_GENERATOR.getInfo(); 
      services.personaGenerator = !!info; 
    } catch (e) {
      console.error('Persona generator health check failed:', e);
    }
    
    try { 
      const h = await this.env.TEXT_GENERATOR.health(); 
      services.textGenerator = h.success; 
    } catch (e) {
      console.error('Text generator health check failed:', e);
    }
    
    try { 
      await this.env.IMAGE_GENERATOR.healthCheck(); 
      services.imageGenerator = true; 
    } catch (e) {
      console.error('Image generator health check failed:', e);
    }

    return {
      success: Object.values(services).every(s => s),
      data: { services, timestamp: new Date().toISOString(), worker: 'ad-generator' }
    };
  }

  /**
   * HTTP fetch handler for direct requests
   */
  override async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = { 
      'Access-Control-Allow-Origin': '*', 
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      if (url.pathname === '/generate-ads' && request.method === 'POST') {
        const body: GenerateAdsRequest = await request.json();
        
        if (!body.prompt || !body.language || !body.country) {
          return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
            status: 400, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const result = await this.generateAds(body);
        return new Response(JSON.stringify(result), { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        });
      }

      if (url.pathname === '/health' && request.method === 'GET') {
        const result = await this.health();
        return new Response(JSON.stringify(result), { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        });
      }

      if (url.pathname === '/' && request.method === 'GET') {
        return this.serveSwaggerUI(corsHeaders);
      }

      if (url.pathname === '/docs/openapi.yaml' && request.method === 'GET') {
        return await this.serveOpenAPISpec(corsHeaders);
      }

      if (url.pathname === '/info' && request.method === 'GET') {
        return new Response(JSON.stringify({
          service: 'Ad Generator',
          version: '1.0.0',
          description: 'AI-powered ad generator using persona, image, and text generators via RPC',
          endpoints: {
            'POST /generate-ads': 'Generate ads with personas',
            'GET /health': 'Health check',
            'GET /': 'Swagger UI documentation',
            'GET /docs/openapi.yaml': 'OpenAPI specification'
          }
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      return new Response(JSON.stringify({ success: false, error: 'Not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    } catch (error) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Server error' 
      }), {
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }

  private serveSwaggerUI(corsHeaders: any): Response {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Ad Generator API - Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
  <style>html{box-sizing:border-box}*,*:before,*:after{box-sizing:inherit}body{margin:0;background:#fafafa}</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload=function(){SwaggerUIBundle({url:'/docs/openapi.yaml',dom_id:'#swagger-ui',deepLinking:true,presets:[SwaggerUIBundle.presets.apis,SwaggerUIStandalonePreset],plugins:[SwaggerUIBundle.plugins.DownloadUrl],layout:"StandaloneLayout"})};
  </script>
</body>
</html>`;
    return new Response(html, { headers: { 'Content-Type': 'text/html', ...corsHeaders } });
  }

  private async serveOpenAPISpec(corsHeaders: any): Promise<Response> {
    // Serve OpenAPI spec from external file
    // Note: The full spec is maintained in openapi.yaml at the root
    try {
      const spec = await import('../../openapi.yaml');
      return new Response(spec.default, { 
        headers: { 'Content-Type': 'application/x-yaml', ...corsHeaders } 
      });
    } catch {
      // Fallback: serve a minimal spec if import fails
      const minimalSpec = `openapi: 3.0.3
info:
  title: Ad Generator API
  version: 1.0.0
  description: AI-powered ad generator (see /info for details)
servers:
  - url: https://ad-generator-prod.artsyom-avanesov.workers.dev
paths:
  /generate-ads:
    post:
      summary: Generate ads
      description: Full spec available in repository at openapi.yaml`;
      return new Response(minimalSpec, { 
        headers: { 'Content-Type': 'application/x-yaml', ...corsHeaders } 
      });
    }
  }
}
