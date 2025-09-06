#!/usr/bin/env powershell

Write-Host "🚀 Pushing to GitHub Repository: new-price" -ForegroundColor Green

# Check if remote exists
$remoteExists = git remote -v | Select-String "origin"
if (-not $remoteExists) {
    Write-Host "📡 Adding GitHub remote..." -ForegroundColor Blue
    git remote add origin https://github.com/Huzefakara/new-price.git
}

# Verify remote
Write-Host "✅ Verifying remote..." -ForegroundColor Yellow
git remote -v

# Push to GitHub
Write-Host "⬆️ Pushing to GitHub..." -ForegroundColor Blue
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 Successfully deployed to GitHub!" -ForegroundColor Green
    Write-Host "🌐 Repository URL: https://github.com/Huzefakara/new-price" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Yellow
    Write-Host "  1. ✅ Visit your repository: https://github.com/Huzefakara/new-price" -ForegroundColor White
    Write-Host "  2. 🚀 Deploy to Vercel: https://vercel.com/new" -ForegroundColor White
    Write-Host "  3. 🔗 Connect your GitHub repository" -ForegroundColor White
    Write-Host "  4. 🎯 Enjoy your live price comparison tool!" -ForegroundColor White
} else {
    Write-Host "❌ Push failed. Make sure you created the repository on GitHub first!" -ForegroundColor Red
    Write-Host "📝 Create repo at: https://github.com/new" -ForegroundColor Yellow
}