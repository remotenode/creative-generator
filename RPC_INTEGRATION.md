# Ad Generator - Persona Generator RPC Integration

This document explains how the Ad Generator integrates with the Persona Generator using Cloudflare Workers RPC (Remote Procedure Call).

## Overview

The Ad Generator now uses RPC to communicate directly with the Persona Generator service, providing:
- **Lower latency** - Direct worker-to-worker communication
- **Better performance** - No HTTP overhead
- **Type safety** - Full TypeScript support
- **Automatic serialization** - No JSON parsing needed

## Architecture

```
┌─────────────────┐
│  Ad Generator   │
│    (Client)     │
└────────┬────────┘
         │ RPC Call
         ▼
┌─────────────────┐
│Persona Generator│
│    (Service)    │
└─────────────────┘
```

## Configuration

### Service Binding (wrangler.toml)

The Ad Generator is configured to call the Persona Generator via RPC:

```toml
[[services]]
binding = "PERSONA_GENERATOR"
service = "persona-generator-prod"
environment = "production"
entrypoint = "PersonaGeneratorEntrypoint"
```

### TypeScript Interface

The `PERSONA_GENERATOR` binding provides these RPC methods:

```typescript
interface PersonaGeneratorBinding {
  // Generate a single persona
  generateSingle(options?: {
    weighted?: boolean;
    seed?: string;
  }): Promise<PersonaResponse>;
  
  // Generate multiple personas
  generateMultiple(count: number, options?: {
    weighted?: boolean;
    seed?: string;
  }): Promise<{
    personas: PersonaResponse[];
    totalCount: number;
    timestamp: string;
    requestId: string;
  }>;
  
  // Get total persona count
  getCount(): Promise<number>;
  
  // Retrieve stored personas
  retrievePersonas(limit?: number, offset?: number): Promise<{
    personas: PersonaResponse[];
    totalCount: number;
    timestamp: string;
    requestId: string;
  }>;
  
  // Get service info
  getInfo(): Promise<any>;
}
```

## Usage in Ad Generator

The Ad Generator uses the Persona Generator in the `generateAds` method:

```typescript
// Generate personas using RPC
const personas = await this.env.PERSONA_GENERATOR.generateMultiple(adCount, {
  weighted: true,
  seed: `${request.country}-${request.language}-${Date.now()}`
});

// Use personas to generate ads
for (const persona of personas.personas) {
  const ad = await this.generateSingleAd(persona, request, requestId);
  ads.push(ad);
}
```

## Persona Data Structure

The Persona Generator returns personas with 20 characteristics:

```typescript
interface PersonaData {
  // Demographics (4)
  gender: string;
  ageRange: string;
  ethnicity: string;
  location: string;
  
  // Professional (4)
  profession: string;
  education: string;
  incomeLevel: string;
  workStyle: string;
  
  // Personality (4)
  personality: string;
  currentState: string;
  communicationStyle: string;
  decisionMaking: string;
  
  // Lifestyle & Interests (4)
  primaryInterest: string;
  technologyComfort: string;
  lifestyle: string;
  values: string;
  
  // Behavioral (4)
  problemSolving: string;
  socialBehavior: string;
  learningStyle: string;
  adaptability: string;
}
```

## API Endpoints

### POST /generate-ads

Generate ads with personas.

**Request:**
```json
{
  "prompt": "Casino gaming app",
  "country": "US",
  "language": "en",
  "count": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ads": [
      {
        "id": "ad-123-456",
        "persona": {
          "persona": { /* 20 characteristics */ },
          "id": 123,
          "createdAt": "2025-10-06T10:00:00.000Z",
          "timestamp": "2025-10-06T10:00:00.000Z",
          "requestId": "uuid",
          "characterCount": 20
        },
        "image": { /* image data */ },
        "text": { /* text data */ },
        "targeting": { /* targeting data */ },
        "qualityScore": 0.85,
        "generatedAt": "2025-10-06T10:00:00.000Z"
      }
    ],
    "totalCount": 3,
    "generatedAt": "2025-10-06T10:00:00.000Z",
    "requestId": "ad-123"
  }
}
```

### GET /health

Check service health and RPC connectivity.

**Response:**
```json
{
  "success": true,
  "data": {
    "services": {
      "personaGenerator": true,
      "imageGenerator": false,
      "textGenerator": false
    },
    "timestamp": "2025-10-06T10:00:00.000Z",
    "worker": "ad-generator"
  }
}
```

## RPC vs HTTP Comparison

| Feature | RPC | HTTP |
|---------|-----|------|
| Latency | Very Low (~1-5ms) | Low (~10-50ms) |
| Overhead | Minimal | HTTP headers/parsing |
| Type Safety | Full TypeScript | Manual typing |
| Serialization | Automatic | Manual JSON |
| Use Case | Worker-to-worker | External clients |

## Deployment

### 1. Deploy Persona Generator

```bash
cd persona-generator
wrangler deploy --env production
```

### 2. Deploy Ad Generator

```bash
cd creative-generator
wrangler deploy
```

The service binding will automatically connect the two workers.

## Testing

### Local Development

```bash
# Terminal 1: Start Persona Generator
cd persona-generator
wrangler dev

# Terminal 2: Start Ad Generator
cd creative-generator
wrangler dev
```

### Production Testing

```bash
curl -X POST https://ad-generator.aso.market/generate-ads \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Casino app",
    "country": "US", 
    "language": "en",
    "count": 3
  }'
```

## Troubleshooting

### Service Binding Not Found
- Ensure persona-generator is deployed to production
- Verify service name: `persona-generator-prod`
- Check entrypoint: `PersonaGeneratorEntrypoint`

### Type Errors
- Ensure `PersonaGeneratorBinding` interface is imported
- Verify persona data structure matches 20 characteristics

### RPC Call Failures
- Check service binding in wrangler.toml
- Verify environment is set to "production"
- Check Cloudflare dashboard for worker status

## Benefits

✅ **Performance**: Direct worker-to-worker communication eliminates HTTP overhead  
✅ **Type Safety**: Full TypeScript support with proper interfaces  
✅ **Reliability**: Cloudflare handles service discovery and routing  
✅ **Scalability**: Automatic load balancing and scaling  
✅ **Maintainability**: Clean separation of concerns between services  

## Next Steps

1. Add IMAGE_GENERATOR service binding when deployed
2. Add TEXT_GENERATOR service binding when deployed
3. Implement retry logic for RPC calls
4. Add caching layer for persona generation
5. Create end-to-end tests for the complete flow

