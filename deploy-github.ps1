# GitHub Deployment Script for "new-price" repository
# Run this after creating the repository on GitHub.com

Write-Host "🚀 Deploying to GitHub Repository: new-price" -ForegroundColor Green

# Get GitHub username
$username = Read-Host "Enter your GitHub username"

# Add remote repository
Write-Host "📡 Adding GitHub remote..." -ForegroundColor Blue
git remote add origin "https://github.com/$username/new-price.git"

# Verify remote was added
Write-Host "✅ Verifying remote..." -ForegroundColor Yellow
git remote -v

# Push to GitHub
Write-Host "⬆️ Pushing to GitHub..." -ForegroundColor Blue
git branch -M main
git push -u origin main

Write-Host "🎉 Successfully deployed to GitHub!" -ForegroundColor Green
Write-Host "🌐 Repository URL: https://github.com/$username/new-price" -ForegroundColor Cyan
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Visit your repository on GitHub" -ForegroundColor White
Write-Host "  2. Connect to Vercel for automatic deployment" -ForegroundColor White
Write-Host "  3. Enjoy your live price comparison tool!" -ForegroundColor White