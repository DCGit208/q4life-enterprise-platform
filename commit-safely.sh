#!/bin/bash

# Safe Git Commit Script - Handles large repos with incremental commits
# Usage: ./commit-safely.sh

cd "/Users/achugustave/Documents/Q4-Life/Q4 Life Website/q4-life.com"

echo "🔍 Checking repository status..."
echo ""

# Check for large files
echo "📦 Checking for large files (>50MB)..."
large_files=$(find . -type f -size +50M 2>/dev/null | grep -v ".git")
if [ ! -z "$large_files" ]; then
    echo "⚠️  WARNING: Large files found:"
    echo "$large_files"
    echo ""
    echo "Consider adding these to .gitignore or using Git LFS"
    echo ""
fi

# Show current status
echo "📊 Current Git status:"
git status --short
echo ""

# Increase buffer for large pushes
git config http.postBuffer 524288000
echo "✅ Increased Git buffer to 500MB"
echo ""

# Strategy: Commit in logical groups
echo "🎯 Recommended commit strategy:"
echo ""
echo "1️⃣  Core pages first (divisions/)"
echo "2️⃣  Business technology pages"
echo "3️⃣  Assets and supporting files"
echo "4️⃣  Documentation and configs"
echo ""

read -p "Start incremental commits? (y/n): " proceed

if [ "$proceed" != "y" ]; then
    echo "Cancelled."
    exit 0
fi

# Function to commit and push
commit_and_push() {
    local message=$1
    shift
    local files=$@
    
    echo ""
    echo "📝 Committing: $message"
    git add $files
    
    if git diff --cached --quiet; then
        echo "   ⏭️  No changes to commit"
        return
    fi
    
    git commit -m "$message"
    
    echo "   ⬆️  Pushing to GitHub..."
    if git push origin main; then
        echo "   ✅ Success!"
    else
        echo "   ❌ Push failed. Retrying with smaller batch..."
        git reset --soft HEAD~1
        return 1
    fi
}

# Batch 1: Main division pages
commit_and_push "Update main division pages" \
    divisions/*.html

sleep 2

# Batch 2: Business technology core
commit_and_push "Update business technology pages" \
    divisions/business-technology.html \
    divisions/business-technology/*.html

sleep 2

# Batch 3: Remaining changes
if git diff --quiet; then
    echo ""
    echo "✅ All changes committed successfully!"
else
    echo ""
    read -p "📦 Commit all remaining changes? (y/n): " commit_rest
    if [ "$commit_rest" = "y" ]; then
        commit_and_push "Update remaining files and assets" .
    fi
fi

echo ""
echo "🎉 Commit process complete!"
echo ""
echo "To verify: git log --oneline -5"
