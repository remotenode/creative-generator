# Using AdGeneratorEntrypoint as a Service Binding

This document shows how other Workers can call the AdGeneratorEntrypoint via RPC.

## Configuration

In your other Worker's `wrangler.toml`, add a service binding:

```toml
[[services]]
binding = "AD_GENERATOR"
service = "ad-generator"
entrypoint = "AdGeneratorEntrypoint"
```

## Usage in Code

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Call the generateAds method directly via RPC
    const result = await env.AD_GENERATOR.generateAds({
      prompt: "Create an ad for a fitness app",
      language: "en",
      country: "US",
      count: 3
    });

    return new Response(JSON.stringify(result));
  }
};

// Or call the health check method
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const health = await env.AD_GENERATOR.health();
    return new Response(JSON.stringify(health));
  }
};
```

## Available Methods

- `generateAds(request: GenerateAdsRequest): Promise<GenerateAdsResponse>`
- `health(): Promise<{ success: boolean; data: any }>`

## TypeScript Types

Make sure to include the types in your Worker:

```typescript
interface Env {
  AD_GENERATOR: {
    generateAds(request: {
      prompt: string;
      language: string;
      country: string;
      count?: number;
    }): Promise<{
      success: boolean;
      data: {
        ads: Array<{
          id: string;
          title: string;
          text: string;
          imageUrl: string;
          targeting: { country: string; language: string; };
          qualityScore: number;
          generatedAt: string;
        }>;
        totalCount: number;
        generatedAt: string;
        requestId: string;
      };
      error?: string;
    }>;
    health(): Promise<{ success: boolean; data: any }>;
  };
}
```
