-- Seed test users for Q4Life Enterprise Platform
-- Passwords are bcrypt hashed versions of simple test passwords

-- Clean up existing test data (optional)
DELETE FROM commissions WHERE customer_id IN (SELECT id FROM customers WHERE aff_id IN (SELECT id FROM affs WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%test%' OR email = 'admin@q4life.com')));
DELETE FROM customers WHERE aff_id IN (SELECT id FROM affs WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%test%' OR email = 'admin@q4life.com'));
DELETE FROM affs WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%test%' OR email = 'admin@q4life.com');
DELETE FROM aggs WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%test%' OR email = 'admin@q4life.com');
DELETE FROM businesses WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%test%' OR email = 'admin@q4life.com');
DELETE FROM users WHERE email LIKE '%test%' OR email = 'admin@q4life.com';

-- Insert Admin User
-- Email: admin@q4life.com | Password: admin123
INSERT INTO users (email, password, role, first_name, last_name, created_at)
VALUES ('admin@q4life.com', '$2b$10$rZ3qG5xKJ9Y.NpZqGqH7xOYd8vZhF6JhJ9X0qpqY8xQX0Z9Y8xQX0', 'admin', 'Admin', 'User', NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert 3 Test AAG Users
-- Email: aag1@test.com | Password: test123
INSERT INTO users (email, password, role, first_name, last_name, created_at)
VALUES ('aag1@test.com', '$2b$10$rZ3qG5xKJ9Y.NpZqGqH7xOYd8vZhF6JhJ9X0qpqY8xQX0Z9Y8xQX0', 'agg', 'AAG', 'One', NOW())
ON CONFLICT (email) DO NOTHING;

-- Email: aag2@test.com | Password: test123
INSERT INTO users (email, password, role, first_name, last_name, created_at)
VALUES ('aag2@test.com', '$2b$10$rZ3qG5xKJ9Y.NpZqGqH7xOYd8vZhF6JhJ9X0qpqY8xQX0Z9Y8xQX0', 'agg', 'AAG', 'Two', NOW())
ON CONFLICT (email) DO NOTHING;

-- Email: aag3@test.com | Password: test123
INSERT INTO users (email, password, role, first_name, last_name, created_at)
VALUES ('aag3@test.com', '$2b$10$rZ3qG5xKJ9Y.NpZqGqH7xOYd8vZhF6JhJ9X0qpqY8xQX0Z9Y8xQX0', 'agg', 'AAG', 'Three', NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert 5 Test AFF Users
-- Email: aff1@test.com | Password: test123
INSERT INTO users (email, password, role, first_name, last_name, created_at)
VALUES ('aff1@test.com', '$2b$10$rZ3qG5xKJ9Y.NpZqGqH7xOYd8vZhF6JhJ9X0qpqY8xQX0Z9Y8xQX0', 'aff', 'AFF', 'One', NOW())
ON CONFLICT (email) DO NOTHING;

-- Email: aff2@test.com | Password: test123
INSERT INTO users (email, password, role, first_name, last_name, created_at)
VALUES ('aff2@test.com', '$2b$10$rZ3qG5xKJ9Y.NpZqGqH7xOYd8vZhF6JhJ9X0qpqY8xQX0Z9Y8xQX0', 'aff', 'AFF', 'Two', NOW())
ON CONFLICT (email) DO NOTHING;

-- Email: aff3@test.com | Password: test123
INSERT INTO users (email, password, role, first_name, last_name, created_at)
VALUES ('aff3@test.com', '$2b$10$rZ3qG5xKJ9Y.NpZqGqH7xOYd8vZhF6JhJ9X0qpqY8xQX0Z9Y8xQX0', 'aff', 'AFF', 'Three', NOW())
ON CONFLICT (email) DO NOTHING;

-- Email: aff4@test.com | Password: test123
INSERT INTO users (email, password, role, first_name, last_name, created_at)
VALUES ('aff4@test.com', '$2b$10$rZ3qG5xKJ9Y.NpZqGqH7xOYd8vZhF6JhJ9X0qpqY8xQX0Z9Y8xQX0', 'aff', 'AFF', 'Four', NOW())
ON CONFLICT (email) DO NOTHING;

-- Email: aff5@test.com | Password: test123
INSERT INTO users (email, password, role, first_name, last_name, created_at)
VALUES ('aff5@test.com', '$2b$10$rZ3qG5xKJ9Y.NpZqGqH7xOYd8vZhF6JhJ9X0qpqY8xQX0Z9Y8xQX0', 'aff', 'AFF', 'Five', NOW())
ON CONFLICT (email) DO NOTHING;

-- Create AAG records for the AAG users
INSERT INTO aggs (user_id, max_affiliates, active_affiliates_count, commission_rate, override_rate, status)
SELECT id, 50, 0, 5.00, 2.00, 'active' FROM users WHERE email = 'aag1@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO aggs (user_id, max_affiliates, active_affiliates_count, commission_rate, override_rate, status)
SELECT id, 50, 0, 5.00, 2.00, 'active' FROM users WHERE email = 'aag2@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO aggs (user_id, max_affiliates, active_affiliates_count, commission_rate, override_rate, status)
SELECT id, 50, 0, 5.00, 2.00, 'active' FROM users WHERE email = 'aag3@test.com'
ON CONFLICT DO NOTHING;

-- Create AFF records for the AFF users (assign to AAG 1)
INSERT INTO affs (user_id, agg_id, max_customers, active_customers_count, commission_rate, referral_code, status)
SELECT 
    u.id, 
    (SELECT id FROM aggs WHERE user_id = (SELECT id FROM users WHERE email = 'aag1@test.com')),
    500,
    0,
    10.00,
    'AFF' || u.id || '-' || substr(md5(random()::text), 1, 6),
    'active'
FROM users u WHERE u.email = 'aff1@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO affs (user_id, agg_id, max_customers, active_customers_count, commission_rate, referral_code, status)
SELECT 
    u.id, 
    (SELECT id FROM aggs WHERE user_id = (SELECT id FROM users WHERE email = 'aag1@test.com')),
    500,
    0,
    10.00,
    'AFF' || u.id || '-' || substr(md5(random()::text), 1, 6),
    'active'
FROM users u WHERE u.email = 'aff2@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO affs (user_id, agg_id, max_customers, active_customers_count, commission_rate, referral_code, status)
SELECT 
    u.id, 
    (SELECT id FROM aggs WHERE user_id = (SELECT id FROM users WHERE email = 'aag1@test.com')),
    500,
    0,
    10.00,
    'AFF' || u.id || '-' || substr(md5(random()::text), 1, 6),
    'active'
FROM users u WHERE u.email = 'aff3@test.com'
ON CONFLICT DO NOTHING;

-- Assign remaining AFFs to AAG 2
INSERT INTO affs (user_id, agg_id, max_customers, active_customers_count, commission_rate, referral_code, status)
SELECT 
    u.id, 
    (SELECT id FROM aggs WHERE user_id = (SELECT id FROM users WHERE email = 'aag2@test.com')),
    500,
    0,
    10.00,
    'AFF' || u.id || '-' || substr(md5(random()::text), 1, 6),
    'active'
FROM users u WHERE u.email = 'aff4@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO affs (user_id, agg_id, max_customers, active_customers_count, commission_rate, referral_code, status)
SELECT 
    u.id, 
    (SELECT id FROM aggs WHERE user_id = (SELECT id FROM users WHERE email = 'aag2@test.com')),
    500,
    0,
    10.00,
    'AFF' || u.id || '-' || substr(md5(random()::text), 1, 6),
    'active'
FROM users u WHERE u.email = 'aff5@test.com'
ON CONFLICT DO NOTHING;

-- Add some test customers to AFF 1
INSERT INTO customers (user_id, aff_id, patronage_kit, monthly_fee, status, signup_date, renewal_date)
SELECT 
    NULL,
    (SELECT id FROM affs WHERE user_id = (SELECT id FROM users WHERE email = 'aff1@test.com')),
    '100-prem',
    100.00,
    'active',
    NOW() - INTERVAL '30 days',
    NOW() + INTERVAL '335 days'
FROM generate_series(1, 10);

INSERT INTO customers (user_id, aff_id, patronage_kit, monthly_fee, status, signup_date, renewal_date)
SELECT 
    NULL,
    (SELECT id FROM affs WHERE user_id = (SELECT id FROM users WHERE email = 'aff1@test.com')),
    '250-pro',
    250.00,
    'active',
    NOW() - INTERVAL '15 days',
    NOW() + INTERVAL '350 days'
FROM generate_series(1, 5);

INSERT INTO customers (user_id, aff_id, patronage_kit, monthly_fee, status, signup_date, renewal_date)
SELECT 
    NULL,
    (SELECT id FROM affs WHERE user_id = (SELECT id FROM users WHERE email = 'aff1@test.com')),
    '25-std',
    25.00,
    'active',
    NOW() - INTERVAL '60 days',
    NOW() + INTERVAL '305 days'
FROM generate_series(1, 15);

-- Add some test customers to AFF 2
INSERT INTO customers (user_id, aff_id, patronage_kit, monthly_fee, status, signup_date, renewal_date)
SELECT 
    NULL,
    (SELECT id FROM affs WHERE user_id = (SELECT id FROM users WHERE email = 'aff2@test.com')),
    '500-elite',
    500.00,
    'active',
    NOW() - INTERVAL '10 days',
    NOW() + INTERVAL '355 days'
FROM generate_series(1, 3);

INSERT INTO customers (user_id, aff_id, patronage_kit, monthly_fee, status, signup_date, renewal_date)
SELECT 
    NULL,
    (SELECT id FROM affs WHERE user_id = (SELECT id FROM users WHERE email = 'aff2@test.com')),
    '100-prem',
    100.00,
    'active',
    NOW() - INTERVAL '20 days',
    NOW() + INTERVAL '345 days'
FROM generate_series(1, 12);

-- Update AAG affiliate counts
UPDATE aggs SET active_affiliates_count = (
    SELECT COUNT(*) FROM affs WHERE affs.agg_id = aggs.id AND affs.status = 'active'
);

-- Update AFF customer counts
UPDATE affs SET active_customers_count = (
    SELECT COUNT(*) FROM customers WHERE customers.aff_id = affs.id AND customers.status = 'active'
);

-- Display summary
SELECT 
    'Admin Users' as type,
    COUNT(*) as count
FROM users WHERE role = 'admin'
UNION ALL
SELECT 
    'AAG Users' as type,
    COUNT(*) as count
FROM users WHERE role = 'agg'
UNION ALL
SELECT 
    'AFF Users' as type,
    COUNT(*) as count
FROM users WHERE role = 'aff'
UNION ALL
SELECT 
    'AAG Records' as type,
    COUNT(*) as count
FROM aggs WHERE status = 'active'
UNION ALL
SELECT 
    'AFF Records' as type,
    COUNT(*) as count
FROM affs WHERE status = 'active'
UNION ALL
SELECT 
    'Customers' as type,
    COUNT(*) as count
FROM customers WHERE status = 'active';
