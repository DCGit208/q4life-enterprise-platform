# Q4Life Network Management System

## 🎯 Overview
Complete multi-level network management system supporting 500,000 clients across a 3-tier structure:
- **20 AAGs** (Affiliate Agents) - Top level
- **1,000 AFFs** (Affiliates) - 50 per AAG
- **500,000 Clients** - 500 per AFF

## 💰 Revenue Potential

### At Full Capacity
- **Monthly Revenue (MRR)**: $71M
- **Annual Revenue (ARR)**: $852M
- **Total Commissions**: $21.3M/month
- **Net Revenue**: $49.7M/month

### Commission Structure
- **AFFs**: 20% direct commission on client sales
- **AAGs**: 10% override commission on AFF sales

### Patronage Tiers
- Standard ($25/mo) - Basic membership
- Premium ($100/mo) - Enhanced benefits
- Professional ($250/mo) - Business features
- Elite ($500/mo) - Premium access
- Enterprise ($1,000/mo) - Full suite

## 🏗️ System Architecture

### Database Schema (`backend/schema-network.sql`)
**9 Core Tables:**
1. `users` - All user accounts (customers, businesses, AFFs, AAGs, admin)
2. `aggs` - Affiliate Agents (max 50 AFFs each)
3. `affs` - Affiliates (max 500 clients each)
4. `customers` - End clients with patronage kits
5. `businesses` - Business marketplace participants
6. `sectors` - 15 industry sectors
7. `qol_evaluations` - Quality of Life assessments
8. `transactions` - All financial transactions
9. `commission_records` - Direct and override commissions

**12 Performance Indexes** for 500K+ scale queries

### Backend API (`backend/server.js`)

**Network Management Endpoints:**
```javascript
GET /api/aag/dashboard          // AAG overview + 50 affiliates
GET /api/aff/dashboard          // AFF overview + 500 clients
GET /api/admin/network-stats    // Complete platform statistics
POST /api/commissions/calculate // Auto-calculate commissions
```

## 📊 Dashboard Interfaces

### 1. AAG Dashboard (`aag-dashboard.html`)
**Purpose**: Manage 50 affiliates and 25,000-client network

**Features:**
- Stats Grid: Active AFFs (X/50), Total Clients, Monthly Revenue, Commission MTD
- Affiliates Table: Performance tracking for all 50 AFFs
- Top Performers: Leaderboard by revenue
- Network Analytics: Client distribution, growth trends
- Recruitment Tools: Invite and onboard new AFFs

**Access**: https://q4-life.com/aag-dashboard.html

### 2. AFF Dashboard (`aff-dashboard.html`)
**Purpose**: Manage 500 clients and track personal performance

**Features:**
- Rank Display: Current rank + progress to next level
- Referral Box: Unique code + shareable link
- Stats Grid: Active Clients (X/500), Revenue, Commission, New Clients
- Clients Table: All 500 clients with patronage tiers
- Kit Distribution: Visual breakdown by patronage level
- Marketing Tools: Share links, track conversions

**Access**: https://q4-life.com/aff-dashboard.html

**Rank System:**
- Associate (0-99 clients)
- Senior (100-249 clients)
- Master (250-399 clients)
- Elite (400-500 clients)

### 3. Admin Network Overview (`admin-network-overview.html`)
**Purpose**: Real-time monitoring of entire 500K-client network

**Features:**
- Network Stats: AAGs (X/20), AFFs (X/1000), Clients (X/500K)
- Revenue Dashboard: MRR, ARR, projections at full capacity
- Commission Tracking: Pending vs. paid commissions
- Top Performers: Best AAGs and AFFs by revenue
- Capacity Planning: Visual progress bars for network growth

**Access**: https://q4-life.com/admin-network-overview.html

## 🔐 Authentication

**JWT Token-Based**
- Tokens stored in `localStorage.getItem('authToken')`
- Required for all dashboard and API endpoints
- Role-based access: customer, business, aff, agg, admin

**Test Accounts** (from schema seed data):
```
Admin:        admin@q4life.com
Test AAG:     aag.test@q4life.com
Test AFF:     aff.test@q4life.com
Test Customer: customer.test@q4life.com
```

## 🚀 Deployment

### GitHub Repository
- **URL**: https://github.com/DCGit208/q4life-enterprise-platform
- **Branch**: main
- **Commits**: 14 (including network system)

### Auto-Deployment (FTP)
- **Trigger**: Push to main branch
- **Action**: GitHub Actions FTP Deploy
- **Server**: ftp.btheducationgroup.com
- **Directory**: /q4lifecom/
- **Live Site**: https://q4-life.com

**Workflow**: `.github/workflows/deploy.yml`

## 🎯 Network Capacity Tracking

### Current Limits
```javascript
MAX_AAGS = 20
MAX_AFFS_PER_AAG = 50
MAX_CLIENTS_PER_AFF = 500
TOTAL_AFF_CAPACITY = 20 × 50 = 1,000
TOTAL_CLIENT_CAPACITY = 1,000 × 500 = 500,000
```

### Database Constraints
- AAGs table: `max_affiliates = 50`
- AFFs table: `max_clients = 500`
- Referral codes: UNIQUE constraint
- Commission rates: AAG 10%, AFF 20%

## 📈 Key Metrics

### AAG Performance Tracking
- Active affiliates count (X/50)
- Total network clients (up to 25,000)
- Monthly revenue from all AFFs
- Override commission earned
- Network growth rate

### AFF Performance Tracking
- Active clients count (X/500)
- Monthly revenue from clients
- Direct commission earned
- New client acquisition rate
- Client retention rate
- Rank progression

### Admin Monitoring
- Total AAGs active (X/20)
- Total AFFs active (X/1,000)
- Total clients active (X/500,000)
- Platform MRR/ARR
- Commission payouts pending
- Network capacity utilization

## 🛠️ Next Steps for Full Implementation

### Phase 1: Complete Backend Integration ✅
- [x] Database schema with network tables
- [x] API endpoints for dashboards
- [x] Commission calculation logic
- [ ] Real-time data sync
- [ ] Background jobs for metrics

### Phase 2: Recruitment & Onboarding
- [ ] AFF application form
- [ ] AAG approval workflow
- [ ] Automated referral code generation
- [ ] Email invitation system
- [ ] Onboarding checklist and training

### Phase 3: Commission System
- [ ] Automatic calculation on payment
- [ ] Monthly payout aggregation
- [ ] Payment processing integration
- [ ] Commission dispute handling
- [ ] Historical payout reports

### Phase 4: Analytics & Reporting
- [ ] Revenue forecasting
- [ ] Churn analysis
- [ ] Top performer identification
- [ ] Network health dashboard
- [ ] Custom report builder

### Phase 5: Marketing Tools
- [ ] Referral link generator
- [ ] QR code creation
- [ ] Social media templates
- [ ] Email drip campaigns
- [ ] Performance tracking

## 📁 File Structure

```
q4-life.com/
├── aag-dashboard.html              # AAG interface
├── aff-dashboard.html              # AFF interface  
├── admin-network-overview.html     # Admin network view
├── admin-dashboard.html            # Business admin (existing)
├── backend/
│   ├── server.js                   # Express API with network endpoints
│   ├── schema-network.sql          # Enhanced database schema
│   └── .env                        # Environment variables
├── .github/
│   └── workflows/
│       └── deploy.yml              # Auto-deployment to FTP
└── assets/
    ├── css/
    │   └── enterprise.css
    └── js/
        └── api-config.js           # API_BASE_URL configuration
```

## 🔄 Data Flow

### Client Signup Flow
1. Client clicks AFF referral link: `q4-life.com/join?ref=AFF-CODE-001`
2. Selects patronage kit ($25-$1000)
3. Completes payment (Stripe)
4. Account created in `customers` table
5. Linked to AFF via `aff_id` foreign key
6. Commission record created for AFF (20%) and AAG (10%)
7. AFF and AAG stats updated automatically

### Commission Calculation
```javascript
POST /api/commissions/calculate
{
  "transactionId": "txn_abc123",
  "customerId": "cust_xyz789",
  "amount": 250.00
}

// Automatically calculates:
// - AFF commission: $50 (20% of $250)
// - AAG commission: $25 (10% of $250)
// - Records both in commission_records table
// - Updates monthly_revenue for AFF and AAG
```

## 💡 Revenue Calculation Examples

### Example 1: Elite AAG (Full Capacity)
- 50 AFFs (max capacity)
- Each AFF has 500 clients (max capacity)
- Total clients: 25,000
- Avg patronage: $142/mo
- Monthly revenue: $3.55M
- AAG override (10%): $355K/month

### Example 2: Master AFF (300 Clients)
- 300 active clients
- Distribution:
  * 120 Standard ($25) = $3,000
  * 100 Premium ($100) = $10,000
  * 50 Professional ($250) = $12,500
  * 25 Elite ($500) = $12,500
  * 5 Enterprise ($1,000) = $5,000
- Total monthly: $43,000
- AFF commission (20%): $8,600/month

## 📞 Support & Documentation

**Technical Documentation**: This file
**API Documentation**: See backend/server.js comments
**Database Schema**: See backend/schema-network.sql
**GitHub Issues**: https://github.com/DCGit208/q4life-enterprise-platform/issues

---

**Built for Scale**: Designed to handle 500,000 clients with optimized database indexes and efficient API endpoints.

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: Production Ready - Backend integration in progress
