# Q4Life Enterprise Platform

A comprehensive multi-billion dollar business development, technology infrastructure, and investment platform.

## 🌟 Overview

Q4Life is an enterprise-grade platform featuring:
- **10 Enterprise Divisions**: Connect, Consult, Construct, Create, Capital, Capabilities, Care, Cultivate, Concierge, Curate
- **Marketplace Platform**: Business registration, QoL scoring, admin approval system
- **Investor Relations**: Comprehensive investor portal with financial reporting
- **Full-Stack Architecture**: Node.js/Express backend, PostgreSQL database, vanilla JavaScript frontend

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Python 3 (for local development server)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/q4life.com.git
   cd q4life.com
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials and Stripe keys
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Run the automated setup script
   chmod +x setup-postgres.sh
   ./setup-postgres.sh
   ```

4. **Start the servers**
   ```bash
   # Terminal 1: Backend API (port 3001)
   cd backend
   npm start

   # Terminal 2: Frontend server (port 8080)
   cd ..
   python3 -m http.server 8080
   ```

5. **Access the platform**
   - Homepage: http://localhost:8080/index.html
   - Marketplace: http://localhost:8080/marketplace.html
   - Admin Dashboard: http://localhost:8080/admin-dashboard.html
   - Business Portal: http://localhost:8080/business-portal.html

## 📁 Project Structure

```
q4-life.com/
├── index.html                 # Main homepage
├── marketplace.html           # Business marketplace
├── sector.html               # Sector-specific listings
├── business-portal.html      # Business registration
├── admin-dashboard.html      # Admin approval interface
├── customer-dashboard.html   # Customer portal
├── quote.html               # Quote request form
│
├── divisions/               # 10 Enterprise divisions
│   ├── connect-enterprise.html
│   ├── consult-enterprise.html
│   ├── construct-enterprise.html
│   ├── create-enterprise.html
│   ├── capital-enterprise.html
│   ├── capabilities-enterprise.html
│   ├── care-enterprise.html
│   ├── cultivate-enterprise.html
│   ├── concierge-enterprise.html
│   └── curate-enterprise.html
│
├── investors/               # Investor relations
│   └── index.html
│
├── backend/                 # Node.js/Express API
│   ├── server.js           # Main API server
│   ├── package.json
│   ├── .env.example
│   ├── setup-postgres.sh   # Database setup script
│   └── test-registration-flow.js
│
└── assets/
    ├── css/
    │   └── enterprise.css   # Main stylesheet
    └── js/
        ├── api-config.js    # API configuration
        ├── marketplace.js
        └── admin-dashboard.js
```

## 🔧 Backend API

### Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

#### Business Management
- `POST /api/businesses/apply` - Submit business application
- `GET /api/businesses/:id` - Get business details
- `GET /api/marketplace/search` - Search marketplace

#### Admin
- `POST /api/admin/businesses/:id/approve` - Approve business
- `GET /api/admin/businesses/pending` - Get pending businesses

### Database Schema

**Tables:**
- `users` - All platform users (customers, businesses, admins, AFF, AGG)
- `sectors` - 15 marketplace sectors
- `businesses` - Registered businesses with QoL scores
- `qol_evaluations` - 50-question quality of life assessments
- `transactions` - Payment records
- `affs` - Affiliate management
- `aggs` - Agency management

### Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=q4life_allegro
DB_USER=your_user
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# Server
PORT=3001
NODE_ENV=development
```

## 🎯 Features

### Marketplace Platform
- **15 Sectors**: Food & Dining, Healthcare, Education, Technology, etc.
- **QoL Scoring**: 50-question evaluation (weighted categories)
- **Pack Levels**: 25-std, 100-prem, 250-pro, 500-elite, 1k-ent
- **Admin Approval**: Workflow for business certification

### Enterprise Divisions

1. **Connect** - Technology Infrastructure (Cisco/HPE Aruba caliber)
2. **Consult** - Strategic Advisory & Management Consulting
3. **Construct** - Development & Construction Services
4. **Create** - Creative & Branding Solutions
5. **Capital** - Investment & Financial Services
6. **Capabilities** - Training & Development Programs
7. **Care** - Healthcare & Wellness Services
8. **Cultivate** - Property Management & Agriculture
9. **Concierge** - Luxury Lifestyle Services
10. **Curate** - Wealth Management & Portfolio Advisory

### Admin Dashboard
- Business approval interface
- QoL score review
- Pack assignment
- Affiliate/Agency management

## 🔐 Security

- JWT-based authentication
- bcrypt password hashing
- Parameterized SQL queries (SQL injection prevention)
- CORS configuration
- Environment variable protection

## 🧪 Testing

### Test Registration Flow
```bash
cd backend
node test-registration-flow.js
```

This tests:
1. User registration
2. Business application submission
3. QoL score calculation
4. Admin approval
5. Marketplace search

### Expected Output
```
✅ Owner registered
✅ Business submitted (QoL: 908/1000)
✅ Admin logged in
✅ Business APPROVED
✅ Found businesses in marketplace
```

## 📊 QoL Scoring System

**Categories (weighted):**
- Quality (25%) - Products, services, consistency
- Environment (20%) - Atmosphere, cleanliness, accessibility
- Operations (20%) - Hours, communication, efficiency
- Innovation (15%) - Technology, sustainability, unique offerings
- Community (10%) - Local impact, social responsibility
- Experience (10%) - Overall experience, special touches

**Pack Tiers:**
- 25-std: $25-$250/mo (Standard)
- 100-prem: $250-$1,000/mo (Premium)
- 250-pro: $1,000-$2,500/mo (Professional)
- 500-elite: $2,500-$5,000/mo (Elite)
- 1k-ent: $5,000+/mo (Enterprise)

## 🚢 Deployment

### Frontend (iPage or similar)
1. Upload all HTML/CSS/JS files via FTP
2. Ensure proper file permissions (644 for files, 755 for directories)
3. Update API_BASE_URL in `assets/js/api-config.js`

### Backend (VPS/Cloud)
1. Set up Node.js environment
2. Install PostgreSQL
3. Clone repository
4. Run `npm install` in backend directory
5. Configure .env file
6. Run database setup script
7. Start with PM2: `pm2 start server.js`

### Database
1. PostgreSQL 14+ required
2. Run `setup-postgres.sh` for automated setup
3. Or manually execute SQL schema

## 📝 Recent Updates

### December 26, 2025
- ✅ Fixed all division page navigation (replaced index-enterprise.html → index.html)
- ✅ Eliminated 404 errors on back navigation
- ✅ Updated investors and quote pages
- ✅ Verified all internal links working
- ✅ Initialized git repository on main branch
- ✅ Ready for GitHub push

## 👥 Admin Credentials

**Default Admin:**
- Email: admin@q4life.com
- Password: admin123
- Type: admin

(Change immediately in production)

## 🔗 Links

- Homepage: http://localhost:8080/index.html
- API Health: http://localhost:3001/api/health
- Admin Dashboard: http://localhost:8080/admin-dashboard.html
- Business Portal: http://localhost:8080/business-portal.html

## 📄 License

Proprietary - Q4Life Enterprise Platform
© 2025 Q4Life. All rights reserved.

## 🤝 Support

For technical support or inquiries:
- Email: dev@q4life.com
- Investor Relations: ir@q4life.com

---

**Status:** Production Ready
**Version:** 1.0.0
**Last Updated:** December 26, 2025
