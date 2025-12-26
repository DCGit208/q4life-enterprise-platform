#!/bin/bash
# Q4Life Platform - GitHub Push Script
# Run this script to push your code to GitHub

echo "🚀 Q4Life Enterprise Platform - GitHub Push"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: Run this script from the q4-life.com directory"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Git repository not initialized"
    exit 1
fi

echo -e "${BLUE}📋 Current Status:${NC}"
echo "Branch: $(git branch --show-current)"
echo "Commits: $(git rev-list --count HEAD)"
echo "Last commit: $(git log -1 --pretty=%B | head -1)"
echo ""

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
    echo "Uncommitted files:"
    git status --short
    echo ""
    read -p "Do you want to commit these changes first? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_msg
        git add -A
        git commit -m "$commit_msg"
        echo -e "${GREEN}✅ Changes committed${NC}"
    fi
fi

echo ""
echo -e "${BLUE}🔗 Step 1: Create GitHub Repository${NC}"
echo "-----------------------------------"
echo "1. Go to: https://github.com/new"
echo "2. Repository name: q4life-enterprise-platform"
echo "3. Description: Q4Life Enterprise Platform - Multi-Billion Dollar Business Development & Investment Platform"
echo "4. Visibility: Private (recommended)"
echo "5. DO NOT initialize with README, .gitignore, or license"
echo "6. Click 'Create repository'"
echo ""
read -p "Press Enter when repository is created..."

echo ""
echo -e "${BLUE}📝 Step 2: Enter Your GitHub Username${NC}"
echo "-------------------------------------"
read -p "GitHub username: " github_user

if [ -z "$github_user" ]; then
    echo "❌ Error: GitHub username is required"
    exit 1
fi

REPO_URL="https://github.com/$github_user/q4life-enterprise-platform.git"

echo ""
echo -e "${BLUE}🔗 Step 3: Adding Remote Repository${NC}"
echo "-----------------------------------"

# Check if remote already exists
if git remote | grep -q "origin"; then
    echo "Remote 'origin' already exists. Updating URL..."
    git remote set-url origin "$REPO_URL"
else
    echo "Adding remote 'origin'..."
    git remote add origin "$REPO_URL"
fi

echo -e "${GREEN}✅ Remote added: $REPO_URL${NC}"
echo ""
git remote -v
echo ""

echo -e "${BLUE}🚀 Step 4: Pushing to GitHub${NC}"
echo "----------------------------"
echo "This will push 5 commits to the main branch"
echo ""
read -p "Ready to push? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Pushing to GitHub..."
    if git push -u origin main; then
        echo ""
        echo -e "${GREEN}🎉 SUCCESS! Your code is now on GitHub!${NC}"
        echo ""
        echo "View your repository at:"
        echo "https://github.com/$github_user/q4life-enterprise-platform"
        echo ""
        echo -e "${BLUE}📚 Next Steps:${NC}"
        echo "1. Visit your repository URL above"
        echo "2. Review the README.md for setup instructions"
        echo "3. Check DEPLOYMENT_GUIDE.md for deployment options"
        echo "4. Set up branch protection (Settings → Branches)"
        echo "5. Add collaborators if needed (Settings → Collaborators)"
        echo ""
        echo -e "${GREEN}✅ All done! Your Q4Life platform is on GitHub!${NC}"
    else
        echo ""
        echo -e "${YELLOW}⚠️  Push failed. This might be due to:${NC}"
        echo "1. Incorrect username"
        echo "2. Authentication required (see below)"
        echo ""
        echo -e "${BLUE}Authentication Options:${NC}"
        echo ""
        echo "Option A: Personal Access Token"
        echo "1. Go to: https://github.com/settings/tokens"
        echo "2. Generate new token → Tokens (classic)"
        echo "3. Select 'repo' scope"
        echo "4. Generate and copy token"
        echo "5. When prompted for password, paste your token"
        echo ""
        echo "Option B: SSH Key"
        echo "1. Generate key: ssh-keygen -t ed25519 -C 'your_email@example.com'"
        echo "2. Copy key: cat ~/.ssh/id_ed25519.pub"
        echo "3. Add to GitHub: Settings → SSH and GPG keys"
        echo "4. Change remote: git remote set-url origin git@github.com:$github_user/q4life-enterprise-platform.git"
        echo "5. Push: git push -u origin main"
    fi
else
    echo "Push cancelled. Run this script again when ready."
fi

echo ""
