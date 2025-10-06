# WorkerEntrypoint Integration Guide

## Overview

The Creative Text Generator Worker exposes RPC methods via WorkerEntrypoint for inter-worker communication. Other Workers can call these methods directly without HTTP overhead.

## Available RPC Methods

- `generate(params)` - Generate creative ads
- `health()` - Health check
- `testAI()` - Test AI connection

## Integration Examples

### 1. Configure Service Binding

In your Worker's `wrangler.toml`:

```toml
name = "my-app"

[[services]]
binding = "CREATIVE_ADS"
service = "creative-text-generator"
```

### 2. Call RPC Methods

```javascript
export default {
  async fetch(request, env) {
    // Generate creative ads (prompt is self-sufficient)
    const ads = await env.CREATIVE_ADS.generate({
      prompt: "For the US App Store, write compliant ads for a task manager used by busy professionals. Include specifics like project boards, recurring reminders, file sharing. Natural American English.",
      adTitleLimit: 30,
      adTextLimit: 90
    });

    // Health check
    const health = await env.CREATIVE_ADS.health();

    // Test AI connection
    const aiStatus = await env.CREATIVE_ADS.testAI();

    return new Response(JSON.stringify({
      ads: ads.data,
      health: health.data,
      ai: aiStatus.data
    }));
  }
};
```

### 3. Error Handling

```javascript
export default {
  async fetch(request, env) {
    try {
      const result = await env.CREATIVE_ADS.generate({
        prompt: "Your self-sufficient prompt here",
        adTitleLimit: 30,
        adTextLimit: 90
      });
      
      return new Response(JSON.stringify(result));
    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 400 });
    }
  }
};
```

### 4. TypeScript Support

```typescript
interface CreativeAdsService {
  generate(params: {
    prompt: string; // self-sufficient prompt (include any market/platform context you need)
    adTitleLimit: number;
    adTextLimit: number;
  }): Promise<{ success: boolean; data: { variants: Array<{ variant: 'urgency'|'benefit'|'ease'; adTitle: string; adText: string; qualityScore: number; hasCallToAction: boolean; optimized: boolean }>; generatedAt: string } }>;

  health(): { success: boolean; data: any };
  testAI(): Promise<{ success: boolean; data: any }>;
}

export default {
  async fetch(request: Request, env: { CREATIVE_ADS: CreativeAdsService }) {
    const ads = await env.CREATIVE_ADS.generate({
      prompt: "For the US App Store, write compliant ads for a language-learning app with spaced repetition and speech practice.",
      adTitleLimit: 30,
      adTextLimit: 90
    });
    
    return new Response(JSON.stringify(ads));
  }
};
```

## Benefits

- **Performance**: Direct RPC calls are faster than HTTP requests
- **Type Safety**: Full TypeScript support across Workers
- **Simplicity**: Call methods as if they were local functions
- **Reliability**: Built-in error handling and validation

## Production URLs

- **Worker**: https://creative-text-generator.artsyom-avanesov.workers.dev
- **Custom Domain**: creative-text-generator-api.aso.market
