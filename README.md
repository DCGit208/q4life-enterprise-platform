# Q4Life Allegro - Complete Deployment Guide

## 🌟 Platform Overview

Q4Life Allegro is a revolutionary quality-of-life certified business marketplace where "everyone affords quality by offering one." The platform connects 60,000+ QoL-certified businesses with 2.5 million quality-conscious customers.

**Revenue Model:**
- Monthly Recurring Revenue: **$3.55B** (at 60,000 businesses)
- Annual Run Rate: **$42.6B**
- Projected at 1M businesses: **$708B annually**

## 📁 Project Structure

```
q4life.com/
├── index.html                          # Main landing page with 10 divisions
├── marketplace.html                    # Customer-facing marketplace
├── marketplace.js                      # 15 sectors, search/filter logic
├── business-portal.html                # Business registration + 50-question QoL evaluation
├── customer-dashboard.html             # Customer orders, reviews, favorites
├── admin-dashboard.html                # Admin approval, revenue tracking
├── assets/
│   └── js/
│       ├── business-registration.js    # Registration logic, QoL scoring
│       └── admin-dashboard.js          # Admin functions, revenue calculations
├── backend/
│   ├── server.js                       # Express API (auth, transactions, approvals)
│   ├── package.json                    # Node.js dependencies
│   └── .env.example                    # Environment configuration template
└── q4life-allegro-platform/
    └── database_schema.sql             # PostgreSQL schema (15 tables)
```

## 🚀 Quick Start

### 1. Database Setup (PostgreSQL)

```bash
# Install PostgreSQL
# macOS:
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb q4life_allegro

# Run schema migration
psql -d q4life_allegro -f q4life-allegro-platform/database_schema.sql
```

**Database includes:**
- 15 main tables (users, businesses, transactions, reviews, AGG/AFF network)
- UUID primary keys
- Indexes on qol_score, sector, city, business_id
- Seed data: 15 sectors + admin user (admin@q4life.com)

### 2. Backend Setup (Node.js/Express)

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials:
# - Database password
# - Stripe API keys (get from dashboard.stripe.com)
# - JWT secret (generate strong random string)
# - Email service (SendGrid/AWS SES)

# Start development server
npm run dev

# Production
npm start
```

**API Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Authentication
- `POST /api/businesses/apply` - Business application + QoL evaluation
- `GET /api/marketplace/search` - Search certified businesses
- `POST /api/transactions` - Create order/payment
- `POST /api/admin/businesses/:id/approve` - Admin certification approval

### 3. Stripe Payment Integration

```bash
# Install Stripe CLI (for webhook testing)
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test payment
stripe trigger payment_intent.succeeded
```

**Stripe Setup:**
1. Create account at [stripe.com](https://stripe.com)
2. Get API keys from Dashboard → Developers → API keys
3. Enable Stripe Connect for marketplace payments
4. Configure webhooks for payment events

### 4. Frontend Deployment

```bash
# Option 1: Simple HTTP Server
npx http-server -p 8080

# Option 2: Vercel (recommended)
npm install -g vercel
vercel

# Option 3: Netlify
npm install -g netlify-cli
netlify deploy
```

**Frontend URLs:**
- Homepage: `http://localhost:8080/index.html`
- Marketplace: `http://localhost:8080/marketplace.html`
- Business Portal: `http://localhost:8080/business-portal.html`
- Customer Dashboard: `http://localhost:8080/customer-dashboard.html`
- Admin Panel: `http://localhost:8080/admin-dashboard.html`

## 📊 Business Logic Reference

### QoL Score Calculation (0-1000 points)

50 questions across 5 categories (200 points each):

1. **Service Quality** (200 points)
   - Written quality standards
   - Customer satisfaction surveys
   - Complaints resolution (< 24hrs)
   - Industry certifications
   - Service training programs
   - Performance metrics tracking
   - Repeat customer tracking
   - Multi-channel accessibility
   - Service guarantees
   - Continuous improvement process

2. **Business Operations** (200 points)
   - Government registration
   - Financial records/accounting
   - Business insurance
   - Documented procedures
   - Financial sustainability
   - Business continuity plan
   - Technology systems (POS, CRM)
   - Defined roles/responsibilities
   - Performance reviews
   - Reliable suppliers

3. **Employee Welfare** (200 points)
   - Written employment contracts
   - On-time salary payments
   - Social security (CNPS)
   - Health insurance
   - Paid leave (annual/sick)
   - Training opportunities
   - Workplace safety
   - Anti-discrimination policy
   - Performance incentives
   - Employee satisfaction surveys

4. **Social Responsibility** (200 points)
   - Local supplier sourcing
   - Environmental sustainability
   - Community development
   - Underserved community services
   - Ethical sourcing
   - Local employment support
   - Energy efficiency
   - Charitable donations
   - Transparent practices
   - Customer education

5. **Customer Value** (200 points)
   - Competitive pricing
   - Transparent pricing
   - Flexible payment options
   - Loyalty programs
   - After-sales support
   - Package deals
   - Honoring commitments
   - Educational content
   - Convenient access
   - Exceeding expectations

### Pack Levels & Pricing

| Pack | QoL Score | Entry Fee | Monthly | Clientele Target | Transaction Fee |
|------|-----------|-----------|---------|------------------|-----------------|
| 15% STD | 300-399 | $26,000 | $13,000 | 750 | 10% |
| 25% STD | 400-499 | $44,000 | $22,000 | 1,500 | 12% |
| 50% STD | 500-599 | $87,000 | $44,000 | 3,000 | 15% |
| 100% STD | 600-699 | $175,000 | $87,000 | 5,000 | 18% |
| Gold Elite | 700-799 | $250,000 | $125,000 | 7,500 | 20% |
| Platinum Elite | 800-1000 | $350,000 | $175,000 | 10,000 | 25% |

### Commission Distribution

**Transaction fee split:**
- Platform: 40%
- AGG (Agency): 20%
- AFF (Affiliate): 40%

**Example:** Customer pays $100 → Platform fee 15% ($15)
- Platform receives: $6 (40% of $15)
- AGG receives: $3 (20% of $15)
- AFF receives: $6 (40% of $15)
- Business receives: $85

### Revenue Breakdown (60K Businesses)

**Monthly:**
- Subscription Revenue: $2.66B
- Entry Fees (2,000 new/month): $144M
- Transaction Fees (15% avg): $890M
- **Total MRR: $3.55B**

**Annual Run Rate: $42.6B**

**At 1 Million Businesses:**
- Monthly Revenue: $59B
- Annual Revenue: $708B

## 🏗️ System Architecture

### Tech Stack

**Frontend:**
- HTML5/CSS3/JavaScript (vanilla)
- Responsive design (mobile-first)
- No framework dependencies (lightweight)

**Backend:**
- Node.js 18+ with Express
- PostgreSQL 15+ database
- JWT authentication
- Stripe payment processing

**Infrastructure:**
- Database: PostgreSQL (AWS RDS recommended)
- Backend: Node.js (AWS EC2/Elastic Beanstalk)
- Frontend: Static hosting (Vercel/Netlify/Cloudflare Pages)
- File Storage: AWS S3 (business images/videos)
- Email: SendGrid or AWS SES
- SMS: Twilio

### Database Schema

**15 Main Tables:**
1. `users` - Authentication (customer/business/aff/agg/admin)
2. `sectors` - 15 business categories
3. `subcategories` - 8 subcategories per sector (120 total)
4. `businesses` - QoL score, pack level, certification status
5. `qol_evaluations` - 50-question assessment results
6. `customers` - Profile, preferences, loyalty tier
7. `services` - Business offerings, pricing
8. `transactions` - Orders, payments, commission splits
9. `reviews` - 5-star ratings, verified purchases
10. `aggs` - Agency network (manages 20 AFFs each)
11. `affs` - Affiliate network (manages 50 businesses each)
12. `commission_records` - Payment tracking
13. `subscription_payments` - Entry fees + monthly billing
14. `business_media` - Images/videos
15. `customer_favorites` - Saved businesses

### Security Features

- bcrypt password hashing (10 rounds)
- JWT tokens (30-day expiration)
- CORS protection
- Rate limiting (100 requests/15 min)
- SQL injection prevention (parameterized queries)
- XSS protection (input sanitization)
- HTTPS required in production
- Environment variable secrets

## 📱 User Journeys

### Business Onboarding Flow

1. **Visit business-portal.html**
2. **Fill Basic Info:**
   - Business name, sector, location
   - Owner details, contact info
   - Years in operation
3. **Complete 50-Question QoL Evaluation**
   - Answer yes/no to each question
   - Auto-calculate score (0-1000)
4. **View QoL Score & Eligible Packs**
   - See category breakdown
   - Recommended pack highlighted
5. **Select Pack & Pay $500 Evaluation Fee**
   - Stripe checkout
   - Email confirmation sent
6. **Admin Review (7-14 days)**
   - Admin views application in admin-dashboard.html
   - Reviews QoL answers and score
   - Approves or rejects
7. **If Approved:**
   - Certification badge issued
   - Entry fee charged via Stripe
   - AFF/AGG assigned
   - Mystery shopper scheduled
   - Business goes live in marketplace
8. **Ongoing:**
   - Monthly subscription billed
   - AFF delivers clientele
   - Quarterly mystery shopper evaluations
   - Transaction commissions distributed

### Customer Shopping Flow

1. **Visit marketplace.html**
2. **Browse 15 Sectors or Search**
   - Food & Dining, Transportation, Healthcare, etc.
   - Filter by location, QoL score
3. **Click Business Card**
   - View QoL badge (860/1000)
   - Read reviews (4.9 stars)
   - See services/pricing
4. **Add to Cart & Checkout**
   - Stripe payment
   - Order confirmation
5. **Service Delivered**
6. **Leave Review**
   - Rate overall, quality, service, value
   - Verified purchase badge

### Admin Operations

1. **Login to admin-dashboard.html**
2. **Dashboard Overview:**
   - Revenue: $3.55B MRR
   - 60,000 businesses
   - 2.5M customers
   - Pending approvals: 8
3. **Review Business Application:**
   - View QoL score breakdown
   - Check category scores
   - Verify pack eligibility
   - Approve or reject
4. **Monitor Platform:**
   - Business distribution by sector
   - Transaction volume
   - AGG/AFF performance
   - Commission payouts
5. **Manage Network:**
   - View 1,250 AGGs
   - View 25,000 AFFs
   - Track clientele delivery
   - Process commission payments

## 🔧 Customization

### Adding New Business Sectors

```javascript
// In marketplace.js, add to BUSINESS_SECTORS array:
{
    id: 'new-sector',
    name: 'New Sector Name',
    icon: '🆕',
    description: 'Description of the sector',
    businessCount: 0,
    subcategories: [
        'Subcategory 1',
        'Subcategory 2',
        // ... 6 more
    ]
}
```

```sql
-- In database, add to sectors table:
INSERT INTO sectors (id, name, icon, description)
VALUES ('new-sector', 'New Sector Name', '🆕', 'Description');

-- Add subcategories:
INSERT INTO subcategories (sector_id, name)
VALUES 
    ('new-sector', 'Subcategory 1'),
    ('new-sector', 'Subcategory 2');
    -- ... etc
```

### Modifying Pack Pricing

```javascript
// In business-registration.js, update PACKS object:
const PACKS = {
    '15-std': {
        name: '15% STD',
        entryFee: 30000, // Changed from 26000
        monthlyFee: 15000, // Changed from 13000
        clienteleTarget: 1000, // Changed from 750
        // ... rest
    }
};
```

```bash
# Update .env file:
PLATFORM_FEE_15_STD=12  # Changed from 10
```

### Changing Commission Splits

```bash
# In .env file:
PLATFORM_COMMISSION_SHARE=50  # Changed from 40
AGG_COMMISSION_SHARE=15       # Changed from 20
AFF_COMMISSION_SHARE=35       # Changed from 40
```

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL is running:
brew services list

# Restart if needed:
brew services restart postgresql@15

# Verify connection:
psql -d q4life_allegro -c "SELECT COUNT(*) FROM businesses;"
```

### Stripe Payments Not Working
```bash
# Test mode vs production mode
# Make sure you're using correct API keys
# Test keys start with: sk_test_...
# Live keys start with: sk_live_...

# Verify in .env:
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

### QoL Score Calculation Wrong
```javascript
// Verify all 50 questions are answered
// Each question = 20 points (Yes) or 0 (No)
// Total must be 0-1000
// Check business-registration.js calculateQoLScore()
```

### Port Already in Use
```bash
# Find process using port 3000:
lsof -i :3000

# Kill process:
kill -9 <PID>

# Or use different port in .env:
PORT=3001
```

## 📈 Scaling Recommendations

### At 100K Businesses
- Enable Redis caching for marketplace searches
- Implement CDN for static assets (Cloudflare)
- Database read replicas
- Horizontal scaling (multiple API servers)

### At 500K Businesses
- Microservices architecture
- Separate payment processing service
- Elasticsearch for advanced search
- Message queue (RabbitMQ/AWS SQS)

### At 1M Businesses
- Kubernetes orchestration
- Multi-region deployment
- Database sharding by sector/region
- Real-time analytics pipeline
- Machine learning for AFF assignment

## 🚢 Production Deployment Checklist

- [ ] Change all API keys to production (Stripe, SendGrid, AWS)
- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS (SSL certificate from Let's Encrypt)
- [ ] Configure CORS allowed origins
- [ ] Set NODE_ENV=production
- [ ] Enable database backups (daily)
- [ ] Set up error monitoring (Sentry)
- [ ] Configure CDN (Cloudflare)
- [ ] Enable rate limiting
- [ ] Set up uptime monitoring
- [ ] Create admin user (secure password)
- [ ] Test Stripe webhooks
- [ ] Configure email service
- [ ] Set up SMS notifications
- [ ] Document API endpoints
- [ ] Load testing (Apache Bench, k6)

## 📞 Support & Contact

**Q4Life Allegro Platform**
- Email: admin@q4life.com
- Website: https://q4life.com
- Documentation: This README

**For Technical Issues:**
1. Check troubleshooting section above
2. Review console logs: `console.log()` in browser, `npm run dev` output
3. Check database logs: `psql -d q4life_allegro`
4. Review Stripe dashboard for payment issues

## 📄 License

MIT License - Q4Life Allegro Platform

---

**Built with ❤️ by the Q4Life Team**
*"Everyone affords quality by offering one"*
