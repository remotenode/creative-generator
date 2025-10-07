#!/bin/bash

# Test script for Ad Generator RPC integration with Persona Generator
# This script tests the ad generator endpoints to verify RPC connectivity

set -e

echo "🧪 Testing Ad Generator RPC Integration with Persona Generator"
echo "=============================================================="
echo ""

# Configuration
BASE_URL="${1:-http://localhost:8787}"
echo "📍 Base URL: $BASE_URL"
echo ""

# Test 1: Health Check
echo "1️⃣ Testing Health Endpoint..."
echo "GET $BASE_URL/health"
echo ""
curl -s "$BASE_URL/health" | jq '.' || echo "Failed to parse JSON response"
echo ""
echo "✅ Health check complete"
echo ""

# Test 2: Root endpoint info
echo "2️⃣ Testing Root Endpoint..."
echo "GET $BASE_URL/"
echo ""
curl -s "$BASE_URL/" | jq '.' || echo "Failed to parse JSON response"
echo ""
echo "✅ Root endpoint check complete"
echo ""

# Test 3: Generate Ads (Basic)
echo "3️⃣ Testing Ad Generation (Basic)..."
echo "POST $BASE_URL/generate-ads"
echo ""
curl -s -X POST "$BASE_URL/generate-ads" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Casino gaming app",
    "country": "US",
    "language": "en",
    "count": 2
  }' | jq '.' || echo "Failed to parse JSON response"
echo ""
echo "✅ Basic ad generation complete"
echo ""

# Test 4: Generate Ads (Multiple)
echo "4️⃣ Testing Ad Generation (Multiple personas)..."
echo "POST $BASE_URL/generate-ads"
echo ""
curl -s -X POST "$BASE_URL/generate-ads" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Fitness tracking app",
    "country": "UK",
    "language": "en",
    "count": 3
  }' | jq '.' || echo "Failed to parse JSON response"
echo ""
echo "✅ Multiple persona ad generation complete"
echo ""

# Test 5: Invalid Request
echo "5️⃣ Testing Error Handling (Missing fields)..."
echo "POST $BASE_URL/generate-ads"
echo ""
curl -s -X POST "$BASE_URL/generate-ads" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Test app"
  }' | jq '.' || echo "Failed to parse JSON response"
echo ""
echo "✅ Error handling test complete"
echo ""

echo "=============================================================="
echo "🎉 All tests completed!"
echo ""
echo "💡 Tips:"
echo "  - For local testing: ./test-rpc-integration.sh http://localhost:8787"
echo "  - For production: ./test-rpc-integration.sh https://ad-generator.aso.market"
echo "  - Make sure persona-generator is running before testing"

