# RPC Client Worker - Quick Start

## 1. Bind the Service

Add to your `wrangler.toml`:

```toml
[[services]]
binding = "PERSONA_SERVICE"
service = "persona-generator-prod"
environment = "production"
```

## 2. Define Environment Types

```typescript
import { PersonaGeneratorEntrypoint } from './index';

export interface Env {
  PERSONA_SERVICE: Service<PersonaGeneratorEntrypoint>;
}
```

## 3. Call RPC Methods

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Call RPC methods directly - no HTTP!
    const persona = await env.PERSONA_SERVICE.generateSingle({
      weighted: true
    });
    
    return new Response(JSON.stringify(persona));
  }
}
```

## Available RPC Methods

The PersonaGeneratorEntrypoint exposes the following RPC methods:

```typescript
// Generate single persona
const persona = await env.PERSONA_SERVICE.generateSingle({
  weighted: true,
  seed: 'optional'
});

// Generate multiple personas
const result = await env.PERSONA_SERVICE.generateMultiple(5, {
  weighted: true
});

// Get count
const count = await env.PERSONA_SERVICE.getCount();

// Retrieve personas
const personas = await env.PERSONA_SERVICE.retrievePersonas(10, 0);

// Get info
const info = await env.PERSONA_SERVICE.getInfo();
```

## Complete Example

```typescript
import { PersonaGeneratorEntrypoint } from './index';

export interface Env {
  PERSONA_SERVICE: Service<PersonaGeneratorEntrypoint>;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    switch (url.pathname) {
      case '/generate':
        // RPC call - clean and type-safe
        const persona = await env.PERSONA_SERVICE.generateSingle({
          weighted: true
        });
        return Response.json(persona);

      case '/count':
        const count = await env.PERSONA_SERVICE.getCount();
        return Response.json({ count });

      default:
        return new Response('Not Found', { status: 404 });
    }
  }
} satisfies ExportedHandler<Env>;
```

## Deploy

```bash
npx wrangler deploy --config wrangler-client.toml
```

## Why RPC vs HTTP?

```typescript
// ✅ RPC - Simple, type-safe
const persona = await env.PERSONA_SERVICE.generateSingle({ weighted: true });

// ❌ HTTP - Verbose, no types
const res = await fetch('https://api.example.com/persona?weighted=true');
const persona = await res.json();
```

## Reference

[Cloudflare RPC Docs](https://developers.cloudflare.com/durable-objects/best-practices/create-durable-object-stubs-and-send-requests/#invoke-rpc-methods)

