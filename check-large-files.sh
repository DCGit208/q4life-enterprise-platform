#!/bin/bash

# Check for large files in the repository
cd "/Users/achugustave/Documents/Q4-Life/Q4 Life Website/q4-life.com"

echo "🔍 Scanning for large files..."
echo ""

# Find files larger than 10MB
echo "📦 Files larger than 10MB:"
find . -type f -size +10M 2>/dev/null | grep -v ".git" | while read file; do
    size=$(du -h "$file" | cut -f1)
    echo "  $size - $file"
done
echo ""

# Find files larger than 50MB (GitHub limit)
echo "⚠️  Files larger than 50MB (GitHub will reject):"
large=$(find . -type f -size +50M 2>/dev/null | grep -v ".git")
if [ -z "$large" ]; then
    echo "  ✅ None found"
else
    echo "$large" | while read file; do
        size=$(du -h "$file" | cut -f1)
        echo "  ❌ $size - $file"
    done
fi
echo ""

# Check total repository size
echo "💾 Total repository size:"
du -sh . | cut -f1
echo ""

# Show top 20 largest files
echo "📊 Top 20 largest files:"
find . -type f 2>/dev/null | grep -v ".git" | xargs du -h 2>/dev/null | sort -rh | head -20
echo ""

# Check if we're in a git repo
if [ -d ".git" ]; then
    echo "📋 Git status summary:"
    git status --short | wc -l | xargs echo "  Files changed:"
    echo ""
    
    # Check for files tracked by git but large
    echo "🔍 Large tracked files in Git:"
    git ls-files | while read file; do
        if [ -f "$file" ]; then
            size=$(stat -f%z "$file" 2>/dev/null || echo 0)
            if [ $size -gt 10485760 ]; then  # 10MB
                hr_size=$(du -h "$file" | cut -f1)
                echo "  $hr_size - $file"
            fi
        fi
    done
fi

echo ""
echo "✅ Scan complete!"
