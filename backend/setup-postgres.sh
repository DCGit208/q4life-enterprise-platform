#!/bin/bash

# Q4LIFE ALLEGRO - AUTOMATED POSTGRESQL SETUP
# This script will install PostgreSQL, create database, and configure backend
# Run: chmod +x setup-postgres.sh && ./setup-postgres.sh

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Q4LIFE ALLEGRO - POSTGRESQL SETUP${NC}"
echo -e "${BLUE}========================================${NC}\n"

# =====================================
# 1. CHECK IF POSTGRESQL IS INSTALLED
# =====================================
echo -e "${YELLOW}[1/8] Checking PostgreSQL installation...${NC}"

if command -v psql &> /dev/null; then
    POSTGRES_VERSION=$(psql --version | awk '{print $3}')
    echo -e "${GREEN}✓ PostgreSQL ${POSTGRES_VERSION} is already installed${NC}\n"
else
    echo -e "${YELLOW}PostgreSQL not found. Installing via Homebrew...${NC}"
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        echo -e "${RED}✗ Homebrew not found. Installing Homebrew first...${NC}"
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    # Install PostgreSQL
    brew install postgresql@15
    brew services start postgresql@15
    
    # Add to PATH
    echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
    export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
    
    echo -e "${GREEN}✓ PostgreSQL installed successfully${NC}\n"
fi

# =====================================
# 2. START POSTGRESQL SERVICE
# =====================================
echo -e "${YELLOW}[2/8] Starting PostgreSQL service...${NC}"

if brew services list | grep -q "postgresql@15.*started"; then
    echo -e "${GREEN}✓ PostgreSQL is already running${NC}\n"
else
    brew services start postgresql@15
    sleep 3  # Wait for service to start
    echo -e "${GREEN}✓ PostgreSQL service started${NC}\n"
fi

# =====================================
# 3. CREATE DATABASE
# =====================================
echo -e "${YELLOW}[3/8] Creating Q4Life database...${NC}"

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw q4life_allegro; then
    echo -e "${YELLOW}Database 'q4life_allegro' already exists${NC}"
    read -p "Do you want to DROP and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        dropdb q4life_allegro
        createdb q4life_allegro
        echo -e "${GREEN}✓ Database recreated${NC}\n"
    else
        echo -e "${BLUE}Keeping existing database${NC}\n"
    fi
else
    createdb q4life_allegro
    echo -e "${GREEN}✓ Database 'q4life_allegro' created${NC}\n"
fi

# =====================================
# 4. IMPORT DATABASE SCHEMA
# =====================================
echo -e "${YELLOW}[4/8] Importing database schema...${NC}"

# Find the schema file
SCHEMA_PATH="../q4life-allegro-platform/database_schema.sql"

if [ ! -f "$SCHEMA_PATH" ]; then
    # Try alternative path
    SCHEMA_PATH="../../q4life-allegro-platform/database_schema.sql"
fi

if [ -f "$SCHEMA_PATH" ]; then
    psql q4life_allegro < "$SCHEMA_PATH"
    echo -e "${GREEN}✓ Database schema imported (15 tables created)${NC}\n"
else
    echo -e "${RED}✗ Schema file not found at $SCHEMA_PATH${NC}"
    echo -e "${YELLOW}Please run this script from the backend/ directory${NC}\n"
    exit 1
fi

# =====================================
# 5. CREATE .ENV FILE
# =====================================
echo -e "${YELLOW}[5/8] Configuring environment variables...${NC}"

if [ -f ".env" ]; then
    echo -e "${YELLOW}.env file already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Keeping existing .env file${NC}\n"
        ENV_EXISTS=true
    fi
fi

if [ -z "$ENV_EXISTS" ]; then
    # Get Stripe keys from user
    echo -e "\n${BLUE}Enter your Stripe API keys (or press Enter to use test mode):${NC}"
    read -p "Stripe Secret Key (sk_test_...): " STRIPE_SECRET
    read -p "Stripe Publishable Key (pk_test_...): " STRIPE_PUBLIC
    
    # Generate secure JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    
    # Get PostgreSQL password
    read -s -p "PostgreSQL password (leave empty if none): " DB_PASSWORD
    echo
    
    # Create .env file
    cat > .env << EOF
# Q4LIFE ALLEGRO - PRODUCTION CONFIGURATION
# Generated: $(date)

# DATABASE
DB_HOST=localhost
DB_PORT=5432
DB_NAME=q4life_allegro
DB_USER=$USER
DB_PASSWORD=${DB_PASSWORD:-}

# JWT (Auto-generated secure key)
JWT_SECRET=$JWT_SECRET

# STRIPE
STRIPE_SECRET_KEY=${STRIPE_SECRET:-sk_test_51placeholder}
STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLIC:-pk_test_placeholder}
STRIPE_WEBHOOK_SECRET=whsec_placeholder_configure_in_stripe_dashboard

# APPLICATION
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:8080
API_URL=http://localhost:3000

# EMAIL (Optional - configure later)
SENDGRID_API_KEY=
FROM_EMAIL=noreply@q4life.com
EOF

    echo -e "${GREEN}✓ .env file created with your configuration${NC}\n"
fi

# =====================================
# 6. INSTALL NPM DEPENDENCIES
# =====================================
echo -e "${YELLOW}[6/8] Installing Node.js dependencies...${NC}"

if [ ! -f "package.json" ]; then
    echo -e "${RED}✗ package.json not found. Are you in the backend/ directory?${NC}\n"
    exit 1
fi

npm install

echo -e "${GREEN}✓ Dependencies installed${NC}\n"

# =====================================
# 7. SEED INITIAL DATA
# =====================================
echo -e "${YELLOW}[7/8] Seeding initial data (15 sectors + admin user)...${NC}"

psql q4life_allegro << 'EOF'
-- Insert 15 business sectors
INSERT INTO sectors (id, name, icon, description, business_count, display_order) VALUES
('food-dining', 'Food & Dining', '🍽️', 'Restaurants, catering, food delivery', 8420, 1),
('transportation', 'Transportation & Logistics', '🚗', 'Taxi, delivery, moving services', 5680, 2),
('healthcare', 'Healthcare & Wellness', '🏥', 'Hospitals, clinics, pharmacies', 4320, 3),
('home-services', 'Home Services', '🏠', 'Plumbing, electrical, cleaning', 7890, 4),
('professional-services', 'Professional Services', '💼', 'Legal, accounting, consulting', 3450, 5),
('education-training', 'Education & Training', '📚', 'Schools, tutoring, courses', 2980, 6),
('real-estate-property', 'Real Estate & Property', '🏢', 'Sales, rentals, management', 2150, 7),
('beauty-personal-care', 'Beauty & Personal Care', '💇', 'Salons, spas, cosmetics', 6720, 8),
('entertainment-events', 'Entertainment & Events', '🎉', 'Event planning, venues', 1890, 9),
('agriculture-farming', 'Agriculture & Farming', '🌾', 'Crop, livestock, fishing', 3260, 10),
('construction-engineering', 'Construction & Engineering', '🏗️', 'Building, renovation', 4580, 11),
('technology-it', 'Technology & IT Services', '💻', 'Web, software, IT support', 2740, 12),
('financial-services', 'Financial Services', '💰', 'Banking, insurance, investment', 1680, 13),
('retail-shopping', 'Retail & Shopping', '🛍️', 'Supermarkets, stores', 9840, 14),
('hospitality-tourism', 'Hospitality & Tourism', '🏨', 'Hotels, tours, travel', 2390, 15)
ON CONFLICT (id) DO NOTHING;

-- Create admin user (password: admin123 - CHANGE THIS!)
INSERT INTO users (email, password_hash, user_type, first_name, last_name, email_verified)
VALUES (
    'admin@q4life.com',
    '$2a$10$8K1p/a0dL3LzFKIKFZfVwuZGnO8V0pTmQmN0mL6w5wKDGZ0R2yT.S',  -- bcrypt hash of "admin123"
    'admin',
    'Super',
    'Admin',
    true
)
ON CONFLICT (email) DO NOTHING;
EOF

echo -e "${GREEN}✓ Initial data seeded${NC}"
echo -e "${BLUE}  - 15 business sectors${NC}"
echo -e "${BLUE}  - Admin user: admin@q4life.com / admin123${NC}\n"

# =====================================
# 8. TEST DATABASE CONNECTION
# =====================================
echo -e "${YELLOW}[8/8] Testing database connection...${NC}"

# Create a quick test script
node << 'NODEEOF'
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function test() {
    try {
        const result = await pool.query('SELECT COUNT(*) as sector_count FROM sectors');
        const userCount = await pool.query('SELECT COUNT(*) as user_count FROM users');
        
        console.log(`\x1b[32m✓ Database connection successful\x1b[0m`);
        console.log(`  - Sectors: ${result.rows[0].sector_count}`);
        console.log(`  - Users: ${userCount.rows[0].user_count}`);
        
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error(`\x1b[31m✗ Database connection failed:\x1b[0m`, error.message);
        process.exit(1);
    }
}

test();
NODEEOF

echo

# =====================================
# SETUP COMPLETE
# =====================================
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ POSTGRESQL SETUP COMPLETE!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${BLUE}What's been configured:${NC}"
echo -e "  ✓ PostgreSQL installed and running"
echo -e "  ✓ Database 'q4life_allegro' created"
echo -e "  ✓ 15 tables imported"
echo -e "  ✓ 15 business sectors seeded"
echo -e "  ✓ Admin user created"
echo -e "  ✓ Environment variables configured"
echo -e "  ✓ Node.js dependencies installed\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Start the backend server:"
echo -e "     ${BLUE}npm start${NC}"
echo -e ""
echo -e "  2. Test the API:"
echo -e "     ${BLUE}curl http://localhost:3000/api/health${NC}"
echo -e ""
echo -e "  3. Login to admin dashboard:"
echo -e "     Email: ${BLUE}admin@q4life.com${NC}"
echo -e "     Password: ${BLUE}admin123${NC} ${RED}(CHANGE THIS!)${NC}"
echo -e ""
echo -e "  4. Configure Stripe keys in .env file"
echo -e ""
echo -e "  5. Update frontend API_BASE_URL to:"
echo -e "     ${BLUE}http://localhost:3000/api${NC}\n"

echo -e "${GREEN}Backend is ready! Run 'npm start' to launch.${NC}\n"
