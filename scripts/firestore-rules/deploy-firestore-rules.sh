#!/bin/bash

# Deploy Firestore Rules for Achievements System
# This script deploys the updated Firestore security rules

echo "🔐 Deploying Firestore Rules for Achievements System..."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please run:"
    echo "   firebase login"
    exit 1
fi

echo "📋 Current Firebase project:"
firebase use

echo ""
read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Deploying Firestore rules..."
    firebase deploy --only firestore:rules
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Firestore rules deployed successfully!"
        echo ""
        echo "📝 New features enabled:"
        echo "   • Achievement/XP validation (prevents cheating)"
        echo "   • Badge tracking with subcollections"
        echo "   • User achievement progress tracking"
        echo "   • Global achievement/badge definitions"
        echo ""
    else
        echo ""
        echo "❌ Deployment failed. Please check the errors above."
        exit 1
    fi
else
    echo "❌ Deployment cancelled."
    exit 0
fi
