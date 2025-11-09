#!/bin/bash

# Practice Library Migration Script
# Converts and seeds all questions to new schema

echo "╔════════════════════════════════════════════════════╗"
echo "║   Practice Library Complete Migration             ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Check if service account exists
if [ ! -f "scripts/serviceAccounts.json" ]; then
    echo "❌ Error: serviceAccounts.json not found"
    echo "   Please download it from Firebase Console:"
    echo "   Project Settings > Service Accounts > Generate New Private Key"
    exit 1
fi

# Ask for confirmation
echo "This will:"
echo "  1. Convert all questions from seed-interview-questions-2.ts"
echo "  2. Seed them to Firestore (practice_questions collection)"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

# Ask if should clear existing
echo ""
read -p "Clear existing questions first? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Will clear existing questions..."
    npx ts-node scripts/seed-all-questions.ts --clear
else
    echo "📝 Will add to existing questions..."
    npx ts-node scripts/seed-all-questions.ts
fi

echo ""
echo "✨ Migration complete!"
echo ""
echo "Next steps:"
echo "  1. Check Firestore Console"
echo "  2. Test with your UI components"
echo "  3. Try LLM evaluation"
echo ""
