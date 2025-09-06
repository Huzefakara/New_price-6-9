# Deployment script for Windows PowerShell

Write-Host "🚀 Starting Vercel Deployment Process..." -ForegroundColor Green

# Check if vercel CLI is installed
$vercelInstalled = Get-Command "vercel" -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "⚠️  Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

# Run final build test
Write-Host "🔨 Testing production build..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful! Ready for deployment." -ForegroundColor Green
    
    # Deploy to Vercel
    Write-Host "🌐 Deploying to Vercel..." -ForegroundColor Blue
    vercel --prod
    
    Write-Host "🎯 Deployment complete!" -ForegroundColor Green
    Write-Host "📊 Check your deployment at: https://vercel.com/dashboard" -ForegroundColor Cyan
} else {
    Write-Host "❌ Build failed. Please fix errors before deploying." -ForegroundColor Red
    exit 1
}