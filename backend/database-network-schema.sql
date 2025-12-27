-- Q4Life Network Schema Update
-- Adds support for AAG (20) → AFF (50 each) → Customer (500 each) network structure

-- Update aggs table with network capacity and commission structure
ALTER TABLE aggs ADD COLUMN IF NOT EXISTS max_affiliates INTEGER DEFAULT 50;
ALTER TABLE aggs ADD COLUMN IF NOT EXISTS active_affiliates_count INTEGER DEFAULT 0;
ALTER TABLE aggs ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 5.00;
ALTER TABLE aggs ADD COLUMN IF NOT EXISTS override_rate DECIMAL(5,2) DEFAULT 2.00;
ALTER TABLE aggs ADD COLUMN IF NOT EXISTS total_network_revenue DECIMAL(12,2) DEFAULT 0;
ALTER TABLE aggs ADD COLUMN IF NOT EXISTS total_commissions_earned DECIMAL(12,2) DEFAULT 0;
ALTER TABLE aggs ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));

-- Update affs table with network capacity and commission structure  
ALTER TABLE affs ADD COLUMN IF NOT EXISTS max_customers INTEGER DEFAULT 500;
ALTER TABLE affs ADD COLUMN IF NOT EXISTS active_customers_count INTEGER DEFAULT 0;
ALTER TABLE affs ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 10.00;
ALTER TABLE affs ADD COLUMN IF NOT EXISTS total_sales DECIMAL(12,2) DEFAULT 0;
ALTER TABLE affs ADD COLUMN IF NOT EXISTS total_commissions_earned DECIMAL(12,2) DEFAULT 0;
ALTER TABLE affs ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50) UNIQUE;
ALTER TABLE affs ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));

-- Create customers table for patronage kit subscribers
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    aff_id UUID REFERENCES affs(id) ON DELETE SET NULL,
    patronage_kit VARCHAR(20) DEFAULT '25-std' CHECK (patronage_kit IN ('25-std', '100-prem', '250-pro', '500-elite', '1k-ent')),
    kit_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'cancelled')),
    subscription_start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    renewal_date TIMESTAMP,
    last_payment_date TIMESTAMP,
    lifetime_value DECIMAL(10,2) DEFAULT 0,
    referral_code VARCHAR(50) UNIQUE,
    referred_by_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create commissions table for tracking all commission transactions
CREATE TABLE IF NOT EXISTS commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('aff_direct', 'agg_override', 'referral_bonus')),
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_type VARCHAR(20) CHECK (recipient_type IN ('aff', 'agg')),
    source_transaction_id UUID,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'disputed')),
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_aff_id ON customers(aff_id);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_patronage_kit ON customers(patronage_kit);
CREATE INDEX IF NOT EXISTS idx_commissions_recipient ON commissions(recipient_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_affs_agg_id ON affs(agg_id);
CREATE INDEX IF NOT EXISTS idx_affs_status ON affs(status);

-- Generate referral codes for existing AFFs if they don't have one
UPDATE affs 
SET referral_code = CONCAT('AFF-', UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)))
WHERE referral_code IS NULL;

-- Insert sample AAGs (if none exist)
INSERT INTO aggs (id, user_id, max_affiliates, commission_rate, override_rate, status)
SELECT 
    gen_random_uuid(),
    id,
    50,
    5.00,
    2.00,
    'active'
FROM users 
WHERE user_type = 'agg' AND id NOT IN (SELECT user_id FROM aggs)
LIMIT 20;

-- Function to update counts when customers are added/removed
CREATE OR REPLACE FUNCTION update_aff_customer_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE affs 
        SET active_customers_count = active_customers_count + 1
        WHERE id = NEW.aff_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE affs 
        SET active_customers_count = active_customers_count - 1
        WHERE id = OLD.aff_id AND active_customers_count > 0;
    ELSIF TG_OP = 'UPDATE' AND OLD.aff_id != NEW.aff_id THEN
        UPDATE affs 
        SET active_customers_count = active_customers_count - 1
        WHERE id = OLD.aff_id AND active_customers_count > 0;
        UPDATE affs 
        SET active_customers_count = active_customers_count + 1
        WHERE id = NEW.aff_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for customer count updates
DROP TRIGGER IF EXISTS trigger_update_aff_customer_count ON customers;
CREATE TRIGGER trigger_update_aff_customer_count
AFTER INSERT OR UPDATE OR DELETE ON customers
FOR EACH ROW EXECUTE FUNCTION update_aff_customer_count();

-- Function to update AAG affiliate counts
CREATE OR REPLACE FUNCTION update_agg_affiliate_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE aggs 
        SET active_affiliates_count = active_affiliates_count + 1
        WHERE id = NEW.agg_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE aggs 
        SET active_affiliates_count = active_affiliates_count - 1
        WHERE id = OLD.agg_id AND active_affiliates_count > 0;
    ELSIF TG_OP = 'UPDATE' AND OLD.agg_id != NEW.agg_id THEN
        UPDATE aggs 
        SET active_affiliates_count = active_affiliates_count - 1
        WHERE id = OLD.agg_id AND active_affiliates_count > 0;
        UPDATE aggs 
        SET active_affiliates_count = active_affiliates_count + 1
        WHERE id = NEW.agg_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for affiliate count updates
DROP TRIGGER IF EXISTS trigger_update_agg_affiliate_count ON affs;
CREATE TRIGGER trigger_update_agg_affiliate_count
AFTER INSERT OR UPDATE OR DELETE ON affs
FOR EACH ROW EXECUTE FUNCTION update_agg_affiliate_count();

COMMENT ON TABLE customers IS 'Patronage kit subscribers (500 per AFF, 25K per AAG, 500K total platform)';
COMMENT ON TABLE commissions IS 'Commission tracking for AFFs (10%) and AAGs (2% override)';
COMMENT ON COLUMN customers.patronage_kit IS 'Kit tier: 25-std ($25/mo), 100-prem ($100/mo), 250-pro ($250/mo), 500-elite ($500/mo), 1k-ent ($1000/mo)';
COMMENT ON COLUMN affs.max_customers IS 'Maximum 500 customers per affiliate';
COMMENT ON COLUMN aggs.max_affiliates IS 'Maximum 50 affiliates per agency';
