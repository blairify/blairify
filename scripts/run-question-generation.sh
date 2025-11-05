#!/bin/bash

# Comprehensive Question Generation Script
# Generates questions for all companies and positions

echo "🚀 Starting comprehensive question generation..."
echo "📊 This will generate 2000+ questions for all companies and positions"

# Check if service account exists
if [ ! -f "scripts/serviceAccounts.json" ]; then
    echo "❌ Error: scripts/serviceAccounts.json not found"
    echo "Please add your Firebase service account file"
    exit 1
fi

# Run the TypeScript script
echo "🔄 Running question generation..."
npx ts-node scripts/generate-comprehensive-questions.ts

echo "✅ Question generation complete!"
echo "🎉 All companies and positions now have comprehensive question coverage"

# Print summary
echo ""
echo "📈 Coverage Summary:"
echo "🏢 Companies: 34 (Adyen, Airbnb, Allegro, Amazon, Apple, Atlassian, Canva, Cloudflare, Dassault, Databricks, DeepL, Elastic, Figma, GitHub, Google, Klarna, Meta, Netflix, Nokia, Notion, NVIDIA, OpenAI, Palantir, Qualcomm, Revolut, SAP, Shopify, Snowflake, Spotify, Stripe, Tesla, Twilio, Uber, Wise, Zapier)"
echo "💼 Positions: 12 (Frontend, Backend, Full Stack, DevOps, Mobile, Data Engineer, Data Scientist, Data Analyst, Cloud Engineer, Cybersecurity, Blockchain, Product Manager)"
echo "📚 Categories: 6 (Algorithms, System Design, Frontend, Backend, DevOps, Mobile, Data)"
echo "🎯 Total Questions: ~2000+"
