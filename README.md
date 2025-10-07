# AI-Powered Ad Generator

Cloudflare Worker that generates targeted ads using persona, image, and text generators via RPC.

## Features

✅ **RPC Integration** - Direct worker-to-worker communication with Persona Generator  
✅ **Type Safety** - Full TypeScript support with proper interfaces  
✅ **20 Persona Characteristics** - Rich demographic, professional, personality, and behavioral data  
✅ **High Performance** - Low latency RPC calls without HTTP overhead  

📖 **[Read the RPC Integration Guide](./RPC_INTEGRATION.md)** for detailed documentation.

## API

### Generate Ads
```bash
POST /generate-ads
{
  "prompt": "Create ads for a fitness app",
  "language": "en", 
  "country": "US",
  "count": 3
}
```

### Health Check
```bash
GET /health
```

## Usage

```bash
curl -X POST https://ad-generator.workers.dev/generate-ads \
  -H "Content-Type: application/json" \
  -d '{"prompt": "fitness app", "language": "en", "country": "US"}'
```

## Setup

```bash
npm install
npm run dev
npm run deploy
```

## Service Bindings

```toml
[[services]]
binding = "PERSONA_GENERATOR"
service = "persona-generator-prod"
entrypoint = "PersonaGeneratorEntrypoint"

[[services]]
binding = "IMAGE_GENERATOR" 
service = "image-generator-api"

[[services]]
binding = "TEXT_GENERATOR"
service = "creative-text-generator"
```