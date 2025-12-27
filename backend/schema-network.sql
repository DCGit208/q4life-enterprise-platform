-- Q4LIFE ALLEGRO - ENHANCED NETWORK SCHEMA
-- Supports: 20 AAGs, 50 AFFs per AAG, 500 Clients per AFF
-- Drop existing tables
DROP TABLE IF EXISTS commission_records, customers, transactions, qol_evaluations, businesses, affs, aggs, sectors, users CASCADE;

-- =====================
-- 1. USERS TABLE (All user types)
-- =====================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) CHECK (user_type IN ('customer', 'business', 'aff', 'agg', 'admin')) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP
);

-- =====================
-- 2. AAGS TABLE (Affiliate Agents/Agencies)
-- =====================
CREATE TABLE aggs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    max_affiliates INTEGER DEFAULT 50,
    active_affiliates_count INTEGER DEFAULT 0,
    commission_rate DECIMAL(5,2) DEFAULT 10.00, -- % override on AFF sales
    total_network_clients INTEGER DEFAULT 0, -- Total clients across all AFFs
    monthly_revenue DECIMAL(12,2) DEFAULT 0,
    total_commissions_earned DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    tier VARCHAR(20) DEFAULT 'standard' CHECK (tier IN ('standard', 'premium', 'elite')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- =====================
-- 3. AFFS TABLE (Affiliates)
-- =====================
CREATE TABLE affs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agg_id UUID REFERENCES aggs(id) ON DELETE SET NULL,
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    max_clients INTEGER DEFAULT 500,
    active_clients_count INTEGER DEFAULT 0,
    commission_rate DECIMAL(5,2) DEFAULT 20.00, -- % on direct client sales
    monthly_revenue DECIMAL(12,2) DEFAULT 0,
    total_commissions_earned DECIMAL(12,2) DEFAULT 0,
    rank VARCHAR(50) DEFAULT 'Associate', -- Associate, Senior, Master, Elite
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    UNIQUE(user_id)
);

-- =====================
-- 4. CUSTOMERS TABLE (Patronage Kit Holders)
-- =====================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    aff_id UUID REFERENCES affs(id) ON DELETE SET NULL,
    patronage_kit VARCHAR(20) CHECK (patronage_kit IN ('25-std', '100-prem', '250-pro', '500-elite', '1k-ent')) NOT NULL,
    monthly_fee DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'cancelled')),
    signup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    renewal_date TIMESTAMP,
    last_payment_date TIMESTAMP,
    lifetime_value DECIMAL(12,2) DEFAULT 0,
    referral_count INTEGER DEFAULT 0,
    city VARCHAR(100),
    region VARCHAR(100),
    country VARCHAR(100) DEFAULT 'USA',
    UNIQUE(user_id)
);

-- =====================
-- 5. SECTORS TABLE
-- =====================
CREATE TABLE sectors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    description TEXT,
    business_count INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0
);

-- =====================
-- 6. BUSINESSES TABLE
-- =====================
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    sector_id VARCHAR(50) REFERENCES sectors(id),
    subcategory VARCHAR(100),
    description TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    address TEXT,
    phone VARCHAR(20),
    qol_score INTEGER CHECK (qol_score >= 0 AND qol_score <= 1000),
    pack_level VARCHAR(20) CHECK (pack_level IN ('25-std', '100-prem', '250-pro', '500-elite', '1k-ent')),
    monthly_fee DECIMAL(10,2),
    certification_status VARCHAR(20) DEFAULT 'pending' CHECK (certification_status IN ('pending', 'active', 'suspended', 'rejected')),
    years_in_operation INTEGER,
    aff_id UUID REFERENCES affs(id),
    agg_id UUID REFERENCES aggs(id),
    stripe_account_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    UNIQUE(user_id)
);

-- =====================
-- 7. QOL EVALUATIONS
-- =====================
CREATE TABLE qol_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    answers JSONB NOT NULL,
    category_scores JSONB,
    total_score INTEGER CHECK (total_score >= 0 AND total_score <= 1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- 8. TRANSACTIONS TABLE (All payments)
-- =====================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type VARCHAR(50) CHECK (transaction_type IN ('patronage_fee', 'business_fee', 'commission_payout', 'refund')) NOT NULL,
    user_id UUID REFERENCES users(id),
    customer_id UUID REFERENCES customers(id),
    business_id UUID REFERENCES businesses(id),
    amount DECIMAL(10,2) NOT NULL,
    stripe_payment_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- =====================
-- 9. COMMISSION RECORDS
-- =====================
CREATE TABLE commission_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id),
    aff_id UUID REFERENCES affs(id),
    agg_id UUID REFERENCES aggs(id),
    commission_type VARCHAR(20) CHECK (commission_type IN ('direct', 'override')) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    rate DECIMAL(5,2) NOT NULL,
    base_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'held')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP
);

-- =====================
-- INDEXES FOR PERFORMANCE
-- =====================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_affs_agg ON affs(agg_id);
CREATE INDEX idx_affs_code ON affs(referral_code);
CREATE INDEX idx_customers_aff ON customers(aff_id);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_businesses_sector ON businesses(sector_id);
CREATE INDEX idx_businesses_status ON businesses(certification_status);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(created_at);
CREATE INDEX idx_commissions_aff ON commission_records(aff_id);
CREATE INDEX idx_commissions_agg ON commission_records(agg_id);

-- =====================
-- SEED DATA
-- =====================

-- Insert admin user
INSERT INTO users (email, password_hash, user_type, first_name, last_name, is_active, email_verified)
VALUES ('admin@q4life.com', '$2a$10$Dj.Sw3y6YWHEGT/YlI9TquqOZJZWKBxpEF.raOVrck55Jqk/a6Buu', 'admin', 'System', 'Administrator', true, true);

-- Insert 15 sectors
INSERT INTO sectors (id, name, icon, description, display_order) VALUES
('food-dining', 'Food & Dining', '🍽️', 'Restaurants, cafes, catering, food delivery', 1),
('healthcare', 'Healthcare & Wellness', '🏥', 'Medical, dental, mental health, fitness', 2),
('education', 'Education & Training', '🎓', 'Schools, tutoring, online courses, certification', 3),
('technology', 'Technology & IT', '💻', 'Software, hardware, IT services, web development', 4),
('retail', 'Retail & Shopping', '🛍️', 'Clothing, electronics, home goods, specialty stores', 5),
('home-services', 'Home Services', '🏠', 'Cleaning, repairs, landscaping, pest control', 6),
('automotive', 'Automotive', '🚗', 'Car sales, repairs, maintenance, detailing', 7),
('beauty-spa', 'Beauty & Spa', '💆', 'Salons, spas, barbershops, cosmetics', 8),
('entertainment', 'Entertainment & Events', '🎭', 'Venues, DJs, photography, event planning', 9),
('professional', 'Professional Services', '💼', 'Legal, accounting, consulting, financial', 10),
('real-estate', 'Real Estate', '🏘️', 'Agents, property management, rentals', 11),
('travel', 'Travel & Hospitality', '✈️', 'Hotels, travel agents, tourism, transportation', 12),
('pet-services', 'Pet Services', '🐾', 'Veterinary, grooming, training, pet supplies', 13),
('childcare', 'Childcare & Family', '👶', 'Daycare, babysitting, family services', 14),
('arts-crafts', 'Arts & Crafts', '🎨', 'Art supplies, custom crafts, classes, galleries', 15);

-- Sample AAG (for testing)
DO $$
DECLARE
    agg_user_id UUID;
BEGIN
    INSERT INTO users (email, password_hash, user_type, first_name, last_name, is_active, email_verified)
    VALUES ('aag.test@q4life.com', '$2a$10$Dj.Sw3y6YWHEGT/YlI9TquqOZJZWKBxpEF.raOVrck55Jqk/a6Buu', 'agg', 'Test', 'Agency', true, true)
    RETURNING id INTO agg_user_id;
    
    INSERT INTO aggs (user_id, company_name, commission_rate, tier)
    VALUES (agg_user_id, 'Test Agency Group', 10.00, 'premium');
END $$;

-- Sample AFF (for testing)
DO $$
DECLARE
    aff_user_id UUID;
    test_agg_id UUID;
BEGIN
    SELECT id INTO test_agg_id FROM aggs LIMIT 1;
    
    INSERT INTO users (email, password_hash, user_type, first_name, last_name, is_active, email_verified)
    VALUES ('aff.test@q4life.com', '$2a$10$Dj.Sw3y6YWHEGT/YlI9TquqOZJZWKBxpEF.raOVrck55Jqk/a6Buu', 'aff', 'Test', 'Affiliate', true, true)
    RETURNING id INTO aff_user_id;
    
    INSERT INTO affs (user_id, agg_id, referral_code, commission_rate, rank, approved_at)
    VALUES (aff_user_id, test_agg_id, 'TEST-AFF-001', 20.00, 'Senior', CURRENT_TIMESTAMP);
END $$;

-- Sample Customer (for testing)
DO $$
DECLARE
    customer_user_id UUID;
    test_aff_id UUID;
BEGIN
    SELECT id INTO test_aff_id FROM affs LIMIT 1;
    
    INSERT INTO users (email, password_hash, user_type, first_name, last_name, is_active, email_verified)
    VALUES ('customer.test@q4life.com', '$2a$10$Dj.Sw3y6YWHEGT/YlI9TquqOZJZWKBxpEF.raOVrck55Jqk/a6Buu', 'customer', 'Test', 'Customer', true, true)
    RETURNING id INTO customer_user_id;
    
    INSERT INTO customers (user_id, aff_id, patronage_kit, monthly_fee, renewal_date, city, region)
    VALUES (customer_user_id, test_aff_id, '100-prem', 100.00, CURRENT_TIMESTAMP + INTERVAL '30 days', 'Los Angeles', 'California');
END $$;
