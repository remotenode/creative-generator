import { Env, GenerateAdsRequest } from '../types';
import { AdGeneratorEntrypoint } from '../services/ad-generator';

export class RouteHandler {
  private corsHeaders = { 
    'Access-Control-Allow-Origin': '*', 
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' 
  };

  constructor(private env: Env) {}

  async handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: this.corsHeaders });
    }

    try {
      if (url.pathname === '/generate-ads' && request.method === 'POST') {
        return await this.handleGenerateAds(request);
      }

      if (url.pathname === '/health' && request.method === 'GET') {
        return await this.handleHealth();
      }

      return new Response(JSON.stringify({ success: false, error: 'Not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json', ...this.corsHeaders }
      });
    } catch (error) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Server error' 
      }), {
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...this.corsHeaders }
      });
    }
  }

  private async handleGenerateAds(request: Request): Promise<Response> {
    const body: GenerateAdsRequest = await request.json();
    
    if (!body.prompt || !body.language || !body.country) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        status: 400, 
        headers: { 'Content-Type': 'application/json', ...this.corsHeaders }
      });
    }

    const adGenerator = new AdGeneratorEntrypoint(this.env);
    const result = await adGenerator.generateAds(body);
    
    return new Response(JSON.stringify(result), { 
      headers: { 'Content-Type': 'application/json', ...this.corsHeaders } 
    });
  }

  private async handleHealth(): Promise<Response> {
    const adGenerator = new AdGeneratorEntrypoint(this.env);
    const result = await adGenerator.health();
    
    return new Response(JSON.stringify(result), { 
      headers: { 'Content-Type': 'application/json', ...this.corsHeaders } 
    });
  }
}
