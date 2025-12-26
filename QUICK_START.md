# Q4LIFE ALLEGRO - QUICK START GUIDE

## 🚀 Get Running in 5 Minutes

### Step 1: Setup Database (2 minutes)

```bash
# Install PostgreSQL (if not already installed)
# macOS:
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Create database
createdb q4life_allegro

# Run migrations
psql -d q4life_allegro -f q4life-allegro-platform/database_schema.sql
```

**Result:** Database created with 15 tables, 15 sectors, and admin user.

### Step 2: Configure Backend (1 minute)

```bash
cd backend

# Create .env file
cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=5432
DB_NAME=q4life_allegro
DB_USER=postgres
DB_PASSWORD=
JWT_SECRET=super_secret_key_change_this_in_production_minimum_32_chars
STRIPE_SECRET_KEY=sk_test_51234567890  
FRONTEND_URL=http://localhost:8080
PORT=3000
NODE_ENV=development
EOF

# Install dependencies
npm install
```

### Step 3: Start Backend (30 seconds)

```bash
# From backend/ directory
npm run dev
```

**Result:** API server running on http://localhost:3000

### Step 4: Start Frontend (30 seconds)

```bash
# Open new terminal, from q4-life.com/ directory
npx http-server -p 8080
```

**Result:** Website running on http://localhost:8080

### Step 5: Test the Platform (1 minute)

**Open in browser:**
1. **Homepage:** http://localhost:8080/index.html
2. **Marketplace:** http://localhost:8080/marketplace.html
3. **Business Portal:** http://localhost:8080/business-portal.html
4. **Customer Dashboard:** http://localhost:8080/customer-dashboard.html
5. **Admin Dashboard:** http://localhost:8080/admin-dashboard.html

---

## 🧪 Test Scenarios

### A. Register a Business

1. Visit: http://localhost:8080/business-portal.html
2. Fill **Step 1:** Basic Information
   - Business Name: "TestCafe Organic"
   - Sector: Food & Dining
   - Subcategory: Restaurants
   - City: Yaoundé
3. Fill **Step 2:** Answer 50 QoL questions (click "Yes" on all for testing = 1000 score)
4. View **Step 3:** QoL Score = 1000 (Platinum Elite)
5. Select **Step 4:** Pack (e.g., Platinum Elite)
6. **Step 5:** Payment (Stripe test mode - use card: 4242 4242 4242 4242)

**Expected:** Business application submitted, pending admin review

### B. Admin Approval

1. Visit: http://localhost:8080/admin-dashboard.html
2. Click **Pending Approvals** in sidebar
3. View TestCafe Organic application
4. Review QoL score breakdown
5. Click **"✓ Approve & Certify"**

**Expected:** Business certified and published to marketplace

### C. Customer Shopping

1. Visit: http://localhost:8080/marketplace.html
2. Search for "TestCafe" or browse Food & Dining sector
3. Click business card to view details
4. See QoL badge (1000), ratings, reviews
5. Click "Order Service"

**Expected:** Stripe checkout opens for payment

---

## 🎯 Admin Login Credentials

**Default Admin Account:**
- Email: `admin@q4life.com`
- Password: `Q4Life2024!`

**Created in:** `database_schema.sql` (line ~500)

---

## 🧪 Stripe Test Cards

**Successful Payment:**
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

**Declined Payment:**
```
Card Number: 4000 0000 0000 0002
```

**Requires Authentication:**
```
Card Number: 4000 0027 6000 3184
```

---

## 📊 Sample Data Included

**15 Business Sectors:**
- Food & Dining (8,420 businesses)
- Transportation (5,680)
- Healthcare (4,320)
- Home Services (7,890)
- Professional Services (3,450)
- Education & Training (2,980)
- Real Estate (2,150)
- Beauty & Personal Care (6,720)
- Entertainment (1,890)
- Agriculture (3,260)
- Construction (4,580)
- Technology & IT (2,740)
- Financial Services (1,680)
- Retail & Shopping (9,840)
- Hospitality & Tourism (2,390)

**Total:** 67,950 businesses (sample data in marketplace.js)

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
export PORT=3001
npm run dev
```

### Database Connection Error
```bash
# Check PostgreSQL status
brew services list

# Restart if needed
brew services restart postgresql@15

# Test connection
psql -d q4life_allegro -c "SELECT COUNT(*) FROM sectors;"
```

### Frontend Not Loading
```bash
# Make sure you're in the correct directory
cd /Users/achugustave/Documents/Q4-Life/Q4\ Life\ Website/q4-life.com/

# Try different port
npx http-server -p 8888
```

### Stripe Not Working
- Get real test keys from: https://dashboard.stripe.com/test/apikeys
- Update `.env` file with: `STRIPE_SECRET_KEY=sk_test_...`
- Restart backend: `npm run dev`

---

## 📈 View Platform Metrics

### Revenue Dashboard
Visit: http://localhost:8080/admin-dashboard.html

**You'll see:**
- Monthly Recurring Revenue: **$3.55B**
- Annual Run Rate: **$42.6B**
- 60,000 certified businesses
- 2.5M active customers
- Transaction fee revenue: $890M/month

### Business Distribution
**Top 3 Sectors:**
1. Retail & Shopping: 9,840 businesses
2. Food & Dining: 8,420 businesses
3. Home Services: 7,890 businesses

---

## 🎨 Customize Your Platform

### Change Platform Colors
Edit: `assets/css/enterprise.css`
```css
:root {
    --primary-color: #fbbf24;  /* Gold */
    --secondary-color: #f59e0b;  /* Dark Gold */
    /* Change to your brand colors */
}
```

### Modify Pack Pricing
Edit: `assets/js/business-registration.js` (line ~180)
```javascript
const PACKS = {
    '15-std': {
        entryFee: 26000,  // Change to your pricing
        monthlyFee: 13000,
        clienteleTarget: 750
    }
    // ... modify others
}
```

### Add New Business Sector
Edit: `marketplace.js` (add to BUSINESS_SECTORS array)
```javascript
{
    id: 'your-sector',
    name: 'Your Sector Name',
    icon: '🆕',
    description: 'Description',
    businessCount: 0,
    subcategories: ['Sub1', 'Sub2', ...]
}
```

Then update database:
```sql
INSERT INTO sectors (id, name, icon, description)
VALUES ('your-sector', 'Your Sector Name', '🆕', 'Description');
```

---

## 🚀 Deploy to Production

### Option 1: Vercel (Frontend) + Heroku (Backend)

**Frontend (Vercel):**
```bash
npm install -g vercel
cd /path/to/q4-life.com
vercel
```

**Backend (Heroku):**
```bash
cd backend
heroku create q4life-api
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### Option 2: AWS (Complete Stack)

**Database:** AWS RDS (PostgreSQL)
**Backend:** AWS Elastic Beanstalk
**Frontend:** AWS S3 + CloudFront
**Files:** AWS S3 bucket

### Option 3: All-in-One (DigitalOcean)

**App Platform:** Deploy backend + frontend together
**Managed Database:** PostgreSQL
**Spaces:** File storage

---

## 📞 Need Help?

**Check these files:**
1. `README.md` - Comprehensive deployment guide
2. `IMPLEMENTATION_SUMMARY.md` - Complete feature list
3. Backend console logs: Check terminal running `npm run dev`
4. Database logs: `psql -d q4life_allegro`

**Common Commands:**
```bash
# View database tables
psql -d q4life_allegro -c "\dt"

# Check businesses count
psql -d q4life_allegro -c "SELECT COUNT(*) FROM businesses;"

# View API routes
# Open: http://localhost:3000/api/test (add test endpoint if needed)

# Backend logs
# Check terminal running: npm run dev
```

---

## ✅ Success Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `q4life_allegro` created
- [ ] Schema migrated (15 tables)
- [ ] Backend dependencies installed
- [ ] `.env` file configured
- [ ] Backend API running on port 3000
- [ ] Frontend server running on port 8080
- [ ] Can access all 5 pages (index, marketplace, business-portal, customer-dashboard, admin-dashboard)
- [ ] Stripe test mode configured
- [ ] Admin dashboard shows $3.55B MRR
- [ ] Marketplace shows 15 sectors

---

**🎉 You're ready to go! Start testing the platform.**

**Homepage:** http://localhost:8080/index.html
