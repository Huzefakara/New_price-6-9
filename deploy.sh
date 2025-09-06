#!/bin/bash
# Deployment script for Vercel

echo "🚀 Starting Vercel Deployment Process..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Run final build test
echo "🔨 Testing production build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful! Ready for deployment."
    
    # Deploy to Vercel
    echo "🌐 Deploying to Vercel..."
    vercel --prod
    
    echo "🎯 Deployment complete!"
    echo "📊 Check your deployment at: https://vercel.com/dashboard"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi