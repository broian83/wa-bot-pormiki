# Deploy script for Windows PowerShell
Write-Host "🚀 Deploying WA Bot PORMIKI to GitHub + Netlify..." -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing git repository..." -ForegroundColor Yellow
    git init
}

# Check if GitHub CLI is available
if (Get-Command gh -ErrorAction SilentlyContinue) {
    Write-Host "🔑 Checking GitHub authentication..." -ForegroundColor Yellow
    $authStatus = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Please login to GitHub first: gh auth login" -ForegroundColor Red
        exit 1
    }

    # Check if remote exists
    $remoteExists = git remote get-url origin 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "📝 Creating GitHub repository..." -ForegroundColor Yellow
        gh repo create wa-bot-pormiki --public --source=. --remote=origin
    }
} else {
    Write-Host "⚠️  GitHub CLI not found. Please create repo manually and add remote:" -ForegroundColor Yellow
    Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/wa-bot-pormiki.git" -ForegroundColor Gray
}

# Add and commit all files
Write-Host "📝 Staging files..." -ForegroundColor Yellow
git add .

Write-Host "💾 Committing..." -ForegroundColor Yellow
git commit -m "Initial commit: WA Bot PORMIKI with AI + Dashboard"

# Push to GitHub
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main 2>$null
if ($LASTEXITCODE -ne 0) {
    git push -u origin master
}

Write-Host ""
Write-Host "✅ Code pushed to GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to https://app.netlify.com"
Write-Host "2. Click 'Add new site' → 'Import an existing project'"
Write-Host "3. Connect to GitHub and select 'wa-bot-pormiki'"
Write-Host "4. Set build settings:"
Write-Host "   - Base directory: dashboard"
Write-Host "   - Build command: npm install && npm run build"
Write-Host "   - Publish directory: .next"
Write-Host "5. Add environment variables in Netlify dashboard"
Write-Host ""
Write-Host "🎉 Done!" -ForegroundColor Green
