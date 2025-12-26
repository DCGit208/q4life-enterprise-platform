# 🚀 GitHub Push & Deployment Instructions

## Step 1: Create GitHub Repository

1. **Go to GitHub** and sign in to your account
2. **Click the "+" icon** in the top right → "New repository"
3. **Configure the repository:**
   - Repository name: `q4life-enterprise-platform` (or your preferred name)
   - Description: "Q4Life Enterprise Platform - Multi-Billion Dollar Business Development & Investment Platform"
   - Visibility: Private (recommended) or Public
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. **Click "Create repository"**

## Step 2: Push to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
cd "/Users/achugustave/Documents/Q4-Life/Q4 Life Website/q4-life.com"

# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/q4life-enterprise-platform.git

# Verify the remote was added
git remote -v

# Push to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME`** with your actual GitHub username.

### If you get authentication errors:

**Option A: Personal Access Token (Recommended)**
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Use token as password when prompted:
   ```bash
   Username: your-github-username
   Password: ghp_xxxxxxxxxxxxxxxxxxxx (your token)
   ```

**Option B: SSH Key**
```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to GitHub: Settings → SSH and GPG keys → New SSH key
# Copy public key:
cat ~/.ssh/id_ed25519.pub

# Change remote to SSH
git remote set-url origin git@github.com:YOUR_USERNAME/q4life-enterprise-platform.git
git push -u origin main
```

## Step 3: Verify Push

After pushing, verify on GitHub:
- ✅ All files should be visible in the repository
- ✅ 3 commits should show in history
- ✅ Main branch should be default

## Step 4: Post-Push Checklist

### Create GitHub Secrets (for CI/CD)

If deploying with GitHub Actions, add these secrets:
1. Go to repository → Settings → Secrets and variables → Actions
2. Add secrets:
   - `DB_PASSWORD` - PostgreSQL password
   - `JWT_SECRET` - JWT secret key
   - `STRIPE_SECRET_KEY` - Stripe API key

### Protect Main Branch

1. Settings → Branches → Add branch protection rule
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass

### Add Collaborators

1. Settings → Collaborators and teams
2. Click "Add people"
3. Enter GitHub username or email

## Step 5: Future Updates

### Making Changes

```bash
# Make your changes to files...

# Stage changes
git add .

# Commit with descriptive message
git commit -m "Your commit message"

# Push to GitHub
git push origin main
```

### Pull Latest Changes

```bash
git pull origin main
```

### Create a New Branch

```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push branch to GitHub
git push origin feature/new-feature

# Create Pull Request on GitHub
# After approval, merge to main
```

## 🌐 Deployment Options

### Option 1: Frontend on iPage (Current Hosting)

**Upload Files:**
```bash
# Via FTP (using FileZilla or similar)
Host: ftp.yourdomain.com
Username: your_username
Password: your_password

Upload these directories:
- /assets/
- /divisions/
- /investors/
- All .html files (except backend-related)
```

**Update API Configuration:**
```javascript
// assets/js/api-config.js
const API_BASE_URL = 'https://api.yourdomain.com/api'; // Change to production URL
```

### Option 2: Backend on VPS (DigitalOcean, AWS, etc.)

**Server Setup:**
```bash
# SSH into your server
ssh root@your-server-ip

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Install PM2 (process manager)
sudo npm install -g pm2

# Clone repository
cd /var/www
git clone https://github.com/YOUR_USERNAME/q4life-enterprise-platform.git
cd q4life-enterprise-platform/backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
nano .env  # Edit with production values

# Run database setup
chmod +x setup-postgres.sh
./setup-postgres.sh

# Start with PM2
pm2 start server.js --name q4life-api
pm2 save
pm2 startup
```

**Configure Nginx:**
```nginx
# /etc/nginx/sites-available/q4life-api
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/q4life-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Set up SSL with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### Option 3: Full Cloud Deployment (Vercel/Netlify Frontend + Railway Backend)

**Frontend (Vercel):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd "/Users/achugustave/Documents/Q4-Life/Q4 Life Website/q4-life.com"
vercel

# Follow prompts, it will auto-detect static site
```

**Backend (Railway):**
1. Go to railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway auto-detects Node.js
5. Add environment variables in Railway dashboard
6. Deploy!

### Option 4: All-in-One Docker Deployment

```dockerfile
# Dockerfile (root directory)
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install
COPY . .
EXPOSE 3001 8080
CMD ["node", "backend/server.js"]
```

```bash
# Build and run
docker build -t q4life-platform .
docker run -p 3001:3001 -p 8080:8080 --env-file backend/.env q4life-platform
```

## 📊 Monitoring & Maintenance

### Set Up Monitoring

**Backend Monitoring:**
```bash
# PM2 monitoring
pm2 monit

# Set up PM2 dashboard
pm2 link [secret] [public]
```

**Database Backups:**
```bash
# Create daily backup cron job
crontab -e

# Add this line:
0 2 * * * pg_dump q4life_allegro > /backups/q4life_$(date +\%Y\%m\%d).sql
```

### Update Process

```bash
# On server
cd /var/www/q4life-enterprise-platform
git pull origin main
cd backend
npm install  # If package.json changed
pm2 restart q4life-api
```

## 🔒 Security Checklist

- [ ] Change default admin password
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall (ufw on Ubuntu)
- [ ] Regular database backups
- [ ] Keep Node.js and dependencies updated
- [ ] Monitor server logs
- [ ] Set up rate limiting on API

## 📞 Support

If you encounter issues:
1. Check logs: `pm2 logs q4life-api`
2. Verify environment variables: `pm2 env 0`
3. Test database connection: `cd backend && node test-connection.js`
4. Run navigation tests: `./test-navigation.sh`

## ✅ Final Verification

After deployment, test:
- [ ] Homepage loads correctly
- [ ] All 10 division pages accessible
- [ ] Marketplace search works
- [ ] Business registration flow works
- [ ] Admin dashboard functional
- [ ] API health endpoint responds
- [ ] All assets (CSS/JS) load
- [ ] No 404 errors in browser console

---

**Ready to push?** Run these commands now:

```bash
cd "/Users/achugustave/Documents/Q4-Life/Q4 Life Website/q4-life.com"
git remote add origin https://github.com/YOUR_USERNAME/q4life-enterprise-platform.git
git push -u origin main
```

🎉 **Your Q4Life platform is ready for production!**
