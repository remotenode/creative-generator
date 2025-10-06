# Worker-to-Worker RPC Communication Guide

This guide explains how to call the Image Generator Worker's RPC methods directly from other Cloudflare Workers using Service Bindings.

## Overview

The Image Generator Worker exposes an RPC method that can be called directly from other Workers:

- `generateImage(prompt, options)` - Generate images using AI

## Setup

### 1. Configure Service Binding

In your client worker's `wrangler.toml`, add a service binding:

```toml
name = "my-client-worker"
main = "src/client.js"

# Service binding to Image Generator Worker
[[services]]
binding = "IMAGE_GENERATOR"  # This becomes env.IMAGE_GENERATOR
service = "image-generator-api"  # Your deployed worker name
```

### 2. Deploy Both Workers

Make sure both workers are deployed:

```bash
# Deploy the image generator worker
cd image-generator
npx wrangler deploy --env production

# Deploy your client worker
cd my-client-worker
npx wrangler deploy
```

## RPC Method

### Generate Images

```javascript
export default {
  async fetch(request, env) {
    try {
      // Call the RPC method directly
      const result = await env.IMAGE_GENERATOR.generateImage(
        "a beautiful sunset over mountains",
        {
          count: 2,
          size: "1024x1024",
          style: "REALISTIC",
          quality: "HIGH"
        }
      );
      
      return new Response(JSON.stringify(result, null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  }
};
```

**Parameters:**
- `prompt` (string, required): The image generation prompt
- `options` (object, optional):
  - `count` (number): Number of images to generate (default: 1)
  - `size` (string): Image size - "1024x1024" (default)
  - `style` (string): Generation style - "REALISTIC", "ANIME", etc.
  - `quality` (string): Image quality - "HIGH", "MEDIUM", "LOW"

**Response:**
```json
{
  "success": true,
  "images": [
    {
      "url": "https://ideogram.ai/api/images/ephemeral/...",
      "prompt": "a beautiful sunset over mountains",
      "size": "1024x1024",
      "provider": "ideogram",
      "metadata": {
        "resolution": "1024x1024",
        "seed": 852403941,
        "style_type": "REALISTIC",
        "is_image_safe": true
      }
    }
  ],
  "usage": {
    "provider": "ideogram",
    "count": 2,
    "cost": 0.04
  }
}
```


## Complete Example Client Worker

Here's a complete example of a client worker that demonstrates the generateImage RPC method:

```javascript
export default {
  async fetch(request, env) {
    try {
      // Call the Image Generator Worker's RPC method directly
      const result = await env.IMAGE_GENERATOR.generateImage(
        "a majestic eagle flying over snow-capped mountains",
        {
          count: 2,
          size: "1024x1024",
          style: "REALISTIC",
          quality: "HIGH"
        }
      );
      
      return new Response(JSON.stringify(result, null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  }
};
```

### Advanced Example with Request Handling

```javascript
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    
    try {
      const body = await request.json();
      const { prompt, count = 1, size = "1024x1024", style = "REALISTIC", quality = "HIGH" } = body;
      
      if (!prompt) {
        return new Response('Prompt is required', { status: 400 });
      }
      
      // Call the Image Generator Worker's RPC method
      const result = await env.IMAGE_GENERATOR.generateImage(prompt, {
        count,
        size,
        style,
        quality
      });
      
      return new Response(JSON.stringify(result, null, 2), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: error.message 
      }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
```

## Error Handling

RPC calls can throw errors. Always wrap them in try-catch blocks:

```javascript
try {
  const result = await env.IMAGE_GENERATOR.generateImage("test prompt");
  // Handle success
  console.log('Generated images:', result.images);
} catch (error) {
  // Handle error
  console.error('RPC call failed:', error.message);
  
  // Common error types:
  // - Network errors
  // - Validation errors (invalid prompt, parameters)
  // - Provider errors (API key issues, rate limits, etc.)
  // - Configuration errors
}
```

## Benefits of RPC vs HTTP

### RPC Advantages:
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Performance**: No HTTP overhead
- ✅ **Reliability**: No network timeouts between workers
- ✅ **Simplicity**: Direct function calls
- ✅ **Error Handling**: Native JavaScript exceptions

### When to Use RPC:
- Worker-to-Worker communication within the same Cloudflare account
- Internal API calls that don't need external access
- Performance-critical applications
- When you need type safety and better error handling

### When to Use HTTP:
- External API access
- Cross-account communication
- When you need standard HTTP features (caching, headers, etc.)

## Deployment Checklist

1. ✅ Deploy the Image Generator Worker:
   ```bash
   cd image-generator
   npx wrangler deploy --env production
   ```

2. ✅ Configure service binding in client worker's `wrangler.toml`:
   ```toml
   [[services]]
   binding = "IMAGE_GENERATOR"
   service = "image-generator-api"
   ```

3. ✅ Deploy client worker:
   ```bash
   cd my-client-worker
   npx wrangler deploy
   ```

4. ✅ Test RPC calls:
   ```bash
   curl -X POST https://my-client-worker.your-subdomain.workers.dev \
     -H "Content-Type: application/json" \
     -d '{"prompt": "a beautiful sunset"}'
   ```

## Troubleshooting

### Common Issues:

1. **"Service binding not found"**
   - Check that the service name in wrangler.toml matches the deployed worker name
   - Ensure both workers are deployed

2. **"Method not found"**
   - Verify the Image Generator Worker extends WorkerEntrypoint
   - Check that the method is public (not private)

3. **"Network error"**
   - Both workers must be in the same Cloudflare account
   - Check that the service binding is correctly configured

4. **"Rate limit exceeded"**
   - The Ideogram API has rate limits
   - Implement exponential backoff in your client

### Debug Tips:

- Use `console.log()` in both workers to trace execution
- Check Cloudflare Workers logs in the dashboard
- Test with simple prompts first (e.g., "a simple test image")
- Verify service binding configuration in wrangler.toml

## TypeScript Support

For full TypeScript support, define the service binding type:

```typescript
interface Env {
  IMAGE_GENERATOR: {
    generateImage(prompt: string, options?: {
      count?: number;
      size?: string;
      style?: string;
      quality?: string;
    }): Promise<GenerationResponse>;
  };
}

export default {
  async fetch(request: Request, env: Env) {
    // Now you have full type safety!
    const result = await env.IMAGE_GENERATOR.generateImage("test prompt");
    return new Response(JSON.stringify(result));
  }
};
```

This provides full IntelliSense and compile-time type checking for the `generateImage` RPC method call.
