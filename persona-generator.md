# Persona Generator RPC Usage Guide

This guide explains how other Cloudflare Workers can call the Persona Generator service using RPC (Remote Procedure Call) for direct worker-to-worker communication.

## Overview

The Persona Generator Worker provides both HTTP API and RPC interfaces:

- **HTTP API**: For web browsers, external services, and REST clients
- **RPC API**: For other Cloudflare Workers (lower latency, better performance)


## Setup

### 1. Add Service Binding

In your worker's `wrangler.toml`, add a service binding to the Persona Generator:

```toml
[[services]]
binding = "PERSONA_GENERATOR"
service = "persona-generator-prod"
entrypoint = "PersonaGeneratorEntrypoint"
```

### 2. Environment Interface

Add the service binding to your TypeScript environment interface:

```typescript
interface Env {
  PERSONA_GENERATOR: {
    generateSingle(options?: {
      weighted?: boolean;
      seed?: string;
    }): Promise<PersonaResponse>;
    
    generateMultiple(count: number, options?: {
      weighted?: boolean;
      seed?: string;
    }): Promise<{
      personas: PersonaResponse[];
      totalCount: number;
      timestamp: string;
      requestId: string;
    }>;
    
    getCount(): Promise<number>;
    
    retrievePersonas(limit?: number, offset?: number): Promise<{
      personas: PersonaResponse[];
      totalCount: number;
      timestamp: string;
      requestId: string;
    }>;
    
    getInfo(): Promise<any>;
  };
}
```

## Available RPC Methods

### 1. `generateSingle(options?)`

Generate a single random persona.

**Parameters:**
- `options.weighted` (optional): Use weighted random selection for realistic distributions
- `options.seed` (optional): Seed for reproducible generation

**Returns:** `PersonaResponse`

**Example:**
```typescript
// Generate a random persona
const persona = await env.PERSONA_GENERATOR.generateSingle();

// Generate with weighted selection
const weightedPersona = await env.PERSONA_GENERATOR.generateSingle({
  weighted: true
});

// Generate with seed for reproducibility
const seededPersona = await env.PERSONA_GENERATOR.generateSingle({
  seed: "user123",
  weighted: true
});
```

### 2. `generateMultiple(count, options?)`

Generate multiple random personas.

**Parameters:**
- `count`: Number of personas to generate (1-100)
- `options.weighted` (optional): Use weighted random selection
- `options.seed` (optional): Seed for reproducible generation

**Returns:** Object with personas array and metadata

**Example:**
```typescript
// Generate 5 personas
const result = await env.PERSONA_GENERATOR.generateMultiple(5);

// Generate with options
const weightedResult = await env.PERSONA_GENERATOR.generateMultiple(3, {
  weighted: true,
  seed: "batch123"
});

console.log(`Generated ${result.totalCount} personas`);
result.personas.forEach(persona => {
  console.log(`Persona ${persona.id}: ${persona.persona.gender}, ${persona.persona.profession}`);
});
```

### 3. `getCount()`

Get the total number of personas stored in the database.

**Returns:** `number`

**Example:**
```typescript
const totalCount = await env.PERSONA_GENERATOR.getCount();
console.log(`Database contains ${totalCount} personas`);
```

### 4. `retrievePersonas(limit?, offset?)`

Retrieve previously generated personas from the database.

**Parameters:**
- `limit` (optional): Maximum number of personas to retrieve (default: 10, max: 100)
- `offset` (optional): Number of personas to skip for pagination (default: 0)

**Returns:** Object with personas array and metadata

**Example:**
```typescript
// Get first 10 personas
const personas = await env.PERSONA_GENERATOR.retrievePersonas();

// Pagination: get next 10 personas
const nextPage = await env.PERSONA_GENERATOR.retrievePersonas(10, 10);

// Get 50 personas
const manyPersonas = await env.PERSONA_GENERATOR.retrievePersonas(50);
```

### 5. `getInfo()`

Get service information and statistics.

**Returns:** Service info object

**Example:**
```typescript
const info = await env.PERSONA_GENERATOR.getInfo();
console.log(`Service: ${info.service} v${info.version}`);
console.log(`Total combinations: ${info.statistics.totalPossibleCombinations}`);
```

## Complete Example

Here's a complete example of a worker that uses the Persona Generator:

### `wrangler.toml`
```toml
name = "my-app"
main = "src/index.ts"

[[services]]
binding = "PERSONA_GENERATOR"
service = "persona-generator-prod"
entrypoint = "PersonaGeneratorEntrypoint"
```

### `src/index.ts`
```typescript
interface Env {
  PERSONA_GENERATOR: any; // Type as shown above
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      // Generate a single persona
      const singlePersona = await env.PERSONA_GENERATOR.generateSingle({
        weighted: true,
        seed: "demo123"
      });

      // Generate multiple personas
      const multiplePersonas = await env.PERSONA_GENERATOR.generateMultiple(3, {
        weighted: true
      });

      // Get database count
      const totalCount = await env.PERSONA_GENERATOR.getCount();

      // Retrieve some stored personas
      const storedPersonas = await env.PERSONA_GENERATOR.retrievePersonas(5);

      // Get service info
      const serviceInfo = await env.PERSONA_GENERATOR.getInfo();

      return new Response(JSON.stringify({
        singlePersona,
        multiplePersonas,
        totalCount,
        storedPersonas,
        serviceInfo
      }, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(`Error: ${error}`, { status: 500 });
    }
  }
};
```

## Response Format

All methods return data in the same format as the HTTP API:

### PersonaResponse
```typescript
interface PersonaResponse {
  persona: {
    gender: string;
    ageRange: string;
    ethnicity: string;
    location: string;
    profession: string;
    education: string;
    incomeLevel: string;
    workStyle: string;
    personality: string;
    currentState: string;
    communicationStyle: string;
    decisionMaking: string;
    primaryInterest: string;
    technologyComfort: string;
    lifestyle: string;
    values: string;
    problemSolving: string;
    socialBehavior: string;
    learningStyle: string;
    adaptability: string;
  };
  id: number;                    // Database ID
  createdAt: string;             // ISO timestamp
  timestamp: string;             // Request timestamp
  requestId: string;             // Unique request ID
  characterCount: number;        // Always 20
}
```

### Multiple Personas Response
```typescript
interface MultiplePersonasResponse {
  personas: PersonaResponse[];
  totalCount: number;
  timestamp: string;
  requestId: string;
}
```

## Error Handling

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const persona = await env.PERSONA_GENERATOR.generateSingle();
      return new Response(JSON.stringify(persona));
    } catch (error) {
      console.error('Persona generation failed:', error);
      return new Response('Persona generation failed', { status: 500 });
    }
  }
};
```

## Benefits of RPC vs HTTP

### RPC Advantages
- ✅ **Lower latency** - Direct worker-to-worker communication
- ✅ **Better performance** - No HTTP overhead
- ✅ **Type safety** - Full TypeScript support
- ✅ **Simpler code** - Direct method calls
- ✅ **Automatic serialization** - No JSON parsing needed

### When to Use Each
- **Use RPC**: For other Cloudflare Workers, internal services
- **Use HTTP**: For web browsers, external services, REST clients

## Troubleshooting

### Common Issues

1. **Service binding not found**
   - Ensure the service binding is correctly configured in `wrangler.toml`
   - Check that the service name matches exactly: `persona-generator-prod`

2. **Entrypoint not found**
   - Verify the entrypoint name: `PersonaGeneratorEntrypoint`
   - Ensure the persona generator worker is deployed

3. **Type errors**
   - Add proper TypeScript interfaces for the service binding
   - Use the interfaces provided in this guide

### Testing RPC Calls

You can test RPC calls in your worker's development environment:

```bash
# Start your worker in dev mode
wrangler dev

# The service binding will be available as env.PERSONA_GENERATOR
```

## Support

For issues or questions:
- Check the [Cloudflare Workers RPC documentation](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/rpc/)
- Review the persona generator's HTTP API at `https://persona-generator.aso.market/`
- Check the OpenAPI spec at `https://persona-generator.aso.market/docs/openapi.yaml`
