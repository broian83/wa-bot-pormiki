#!/usr/bin/env bash

echo "🚀 Deploying WA Bot PORMIKI to GitHub + Netlify..."
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
  echo "📦 Initializing git repository..."
  git init
fi

# Check if GitHub CLI is available
if command -v gh &> /dev/null; then
  echo "🔑 Checking GitHub authentication..."
  gh auth status 2>/dev/null || {
    echo "❌ Please login to GitHub first: gh auth login"
    exit 1
  }

  # Check if remote exists
  if ! git remote get-url origin &> /dev/null; then
    echo "📝 Creating GitHub repository..."
    gh repo create wa-bot-pormiki --public --source=. --remote=origin
  fi
else
  echo "⚠️  GitHub CLI not found. Please create repo manually and add remote:"
  echo "   git remote add origin https://github.com/YOUR_USERNAME/wa-bot-pormiki.git"
fi

# Add and commit all files
echo "📝 Staging files..."
git add .

echo "💾 Committing..."
git commit -m "Initial commit: WA Bot PORMIKI with AI + Dashboard"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main 2>/dev/null || git push -u origin master

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://app.netlify.com"
echo "2. Click 'Add new site' → 'Import an existing project'"
echo "3. Connect to GitHub and select 'wa-bot-pormiki'"
echo "4. Set build command: cd dashboard && npm install && npm run build"
echo "5. Set publish directory: dashboard/.next"
echo "6. Add environment variables in Netlify dashboard"
echo ""
echo "🎉 Done!"
