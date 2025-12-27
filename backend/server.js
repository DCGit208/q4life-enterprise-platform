// Q4LIFE ALLEGRO BACKEND API
// Node.js/Express API with PostgreSQL database
// Stripe payment integration, JWT authentication

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:3000', 'http://127.0.0.1:8080'],
    credentials: true
}));

// POSTGRESQL CONNECTION
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'q4life_allegro',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// JWT SECRET
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ====================
// HEALTH CHECK
// ====================

app.get('/api/health', async (req, res) => {
    try {
        // Test database connection
        const dbCheck = await pool.query('SELECT NOW()');
        
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: 'connected',
            stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not configured',
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            database: 'disconnected',
            error: error.message
        });
    }
});

// ====================
// AUTHENTICATION
// ====================

// REGISTER NEW USER
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, userType } = req.body;
        
        // Check if user exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );
        
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        
        // Create user
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, first_name, last_name, user_type, email_verified, created_at)
             VALUES ($1, $2, $3, $4, $5, false, NOW())
             RETURNING id, email, first_name, last_name, user_type`,
            [email, passwordHash, firstName, lastName, userType || 'customer']
        );
        
        const user = result.rows[0];
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, userType: user.user_type },
            JWT_SECRET,
            { expiresIn: '30d' }
        );
        
        res.json({ token, user });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = result.rows[0];
        
        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, userType: user.user_type },
            JWT_SECRET,
            { expiresIn: '30d' }
        );
        
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                userType: user.user_type
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// ====================
// BUSINESS REGISTRATION
// ====================

// SUBMIT BUSINESS APPLICATION
app.post('/api/businesses/apply', authenticateToken, async (req, res) => {
    try {
        const {
            businessName,
            sector,
            subcategory,
            description,
            address,
            city,
            region,
            phone,
            yearsInOperation,
            qolAnswers,
            selectedPack
        } = req.body;
        
        // Calculate QoL score
        const qolScore = calculateQoLScore(qolAnswers);
        
        // Create business record
        const result = await pool.query(
            `INSERT INTO businesses (
                user_id, business_name, sector_id, subcategory, description,
                address, city, region, phone, qol_score, pack_level,
                years_in_operation, certification_status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending', NOW())
            RETURNING *`,
            [
                req.user.userId,
                businessName,
                sector,
                subcategory,
                description,
                address,
                city,
                region,
                phone,
                qolScore.total,
                selectedPack,
                yearsInOperation
            ]
        );
        
        const business = result.rows[0];
        
        // Save QoL evaluation
        await pool.query(
            `INSERT INTO qol_evaluations (
                business_id, answers, category_scores, total_score, created_at
            ) VALUES ($1, $2, $3, $4, NOW())`,
            [
                business.id,
                JSON.stringify(qolAnswers),
                JSON.stringify(qolScore.categories),
                qolScore.total
            ]
        );
        
        res.json({
            business: {
                id: business.id,
                businessName: business.business_name,
                qolScore: qolScore.total,
                certificationStatus: business.certification_status,
                packLevel: business.pack_level
            },
            message: 'Business application submitted successfully'
        });
    } catch (error) {
        console.error('Business application error:', error);
        res.status(500).json({ error: 'Application submission failed' });
    }
});

// GET BUSINESS BY ID
app.get('/api/businesses/:id', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT b.*, s.name as sector_name, sc.name as subcategory_name,
                    u.email, u.first_name, u.last_name,
                    a.first_name as aff_first_name, a.last_name as aff_last_name,
                    ag.name as agg_name
             FROM businesses b
             JOIN users u ON b.user_id = u.id
             JOIN sectors s ON b.sector_id = s.id
             JOIN subcategories sc ON b.subcategory_id = sc.id
             LEFT JOIN affs a ON b.aff_id = a.id
             LEFT JOIN aggs ag ON b.agg_id = ag.id
             WHERE b.id = $1`,
            [req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Business not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get business error:', error);
        res.status(500).json({ error: 'Failed to retrieve business' });
    }
});

// APPROVE BUSINESS (ADMIN ONLY)
app.post('/api/admin/businesses/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const businessId = req.params.id;
        
        // Get business details
        const businessResult = await pool.query(
            'SELECT * FROM businesses WHERE id = $1',
            [businessId]
        );
        
        if (businessResult.rows.length === 0) {
            return res.status(404).json({ error: 'Business not found' });
        }
        
        const business = businessResult.rows[0];
        
        // Update business status to active
        const updateResult = await pool.query(
            `UPDATE businesses
             SET certification_status = 'active',
                 approved_at = NOW()
             WHERE id = $1
             RETURNING *`,
            [businessId]
        );
        
        const approvedBusiness = updateResult.rows[0];
        
        res.json({
            business: {
                id: approvedBusiness.id,
                businessName: approvedBusiness.business_name,
                certificationStatus: approvedBusiness.certification_status,
                qolScore: approvedBusiness.qol_score,
                affId: approvedBusiness.aff_id,
                aggId: approvedBusiness.agg_id
            },
            message: 'Business approved successfully'
        });
    } catch (error) {
        console.error('Approval error:', error);
        res.status(500).json({ error: 'Approval failed' });
    }
});

// ====================
// MARKETPLACE
// ====================

// SEARCH BUSINESSES
app.get('/api/marketplace/search', async (req, res) => {
    try {
        const { query, sector, city, minQoL, page = 1, limit = 20 } = req.query;
        
        let whereConditions = ["certification_status = 'active'"];
        let params = [];
        let paramIndex = 1;
        
        if (query) {
            params.push(`%${query}%`);
            whereConditions.push(`(business_name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
            paramIndex++;
        }
        
        if (sector) {
            params.push(sector);
            whereConditions.push(`sector_id = $${paramIndex}`);
            paramIndex++;
        }
        
        if (city) {
            params.push(city);
            whereConditions.push(`city ILIKE $${paramIndex}`);
            paramIndex++;
        }
        
        if (minQoL) {
            params.push(minQoL);
            whereConditions.push(`qol_score >= $${paramIndex}`);
            paramIndex++;
        }
        
        const offset = (page - 1) * limit;
        params.push(limit, offset);
        
        const result = await pool.query(
            `SELECT b.id, b.business_name, b.description, b.qol_score, b.city, b.region,
                    b.subcategory, b.sector_id, s.name as sector_name, s.icon as sector_icon
             FROM businesses b
             LEFT JOIN sectors s ON b.sector_id = s.id
             WHERE ${whereConditions.join(' AND ')}
             ORDER BY b.qol_score DESC
             LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            params
        );
        
        res.json({
            businesses: result.rows,
            total: result.rows.length,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});
// ====================
// TRANSACTIONS
// ====================

// CREATE TRANSACTION
app.post('/api/transactions', authenticateToken, async (req, res) => {
    try {
        const { businessId, serviceId, amount } = req.body;
        
        // Get business details and pack level
        const businessResult = await pool.query(
            'SELECT * FROM businesses WHERE id = $1',
            [businessId]
        );
        
        const business = businessResult.rows[0];
        const platformFeePercentage = getPlatformFeePercentage(business.pack_level);
        const platformFee = amount * (platformFeePercentage / 100);
        
        // Commission split: Platform 40%, AGG 20%, AFF 40%
        const platformShare = platformFee * 0.40;
        const aggCommission = platformFee * 0.20;
        const affCommission = platformFee * 0.40;
        
        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'usd',
            application_fee_amount: Math.round(platformFee * 100),
            transfer_data: {
                destination: business.stripe_account_id,
            },
            metadata: {
                businessId,
                serviceId,
                customerId: req.user.userId
            }
        });
        
        // Create transaction record
        const result = await pool.query(
            `INSERT INTO transactions (
                customer_id, business_id, service_id, subtotal, platform_fee,
                platform_fee_percentage, aff_commission, agg_commission,
                stripe_payment_intent_id, order_status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', NOW())
            RETURNING id`,
            [
                req.user.userId,
                businessId,
                serviceId,
                amount,
                platformFee,
                platformFeePercentage,
                affCommission,
                aggCommission,
                paymentIntent.id
            ]
        );
        
        res.json({
            transactionId: result.rows[0].id,
            clientSecret: paymentIntent.client_secret,
            amount,
            platformFee,
            businessReceives: amount - platformFee
        });
    } catch (error) {
        console.error('Transaction creation error:', error);
        res.status(500).json({ error: 'Transaction failed' });
    }
});

// ====================
// HELPER FUNCTIONS
// ====================

function calculateQoLScore(answers) {
    // answers is object like {q1: 18, q2: 19, ...q50: 17}
    // Convert to array of values
    const answerValues = Object.keys(answers)
        .filter(key => key.startsWith('q'))
        .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))
        .map(key => answers[key]);
    
    const categories = {
        'Service Quality': answerValues.slice(0, 10).reduce((sum, val) => sum + val, 0),
        'Customer Experience': answerValues.slice(10, 20).reduce((sum, val) => sum + val, 0),
        'Business Operations': answerValues.slice(20, 30).reduce((sum, val) => sum + val, 0),
        'Social Impact': answerValues.slice(30, 40).reduce((sum, val) => sum + val, 0),
        'Innovation & Growth': answerValues.slice(40, 50).reduce((sum, val) => sum + val, 0)
    };
    
    const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
    
    return { total, categories };
}

function getPlatformFeePercentage(packLevel) {
    const fees = {
        '15-std': 10,
        '25-std': 12,
        '50-std': 15,
        '100-std': 18,
        'gold': 20,
        'platinum': 25
    };
    return fees[packLevel] || 15;
}

async function assignAffiliateToNewBusiness(city, sectorId) {
    // Find AFF with capacity in same city/region
    const result = await pool.query(
        `SELECT a.id as aff_id, a.agg_id
         FROM affs a
         WHERE a.city = $1
         AND a.active_businesses_count < 50
         AND a.status = 'active'
         ORDER BY a.performance_score DESC, a.active_businesses_count ASC
         LIMIT 1`,
        [city]
    );
    
    if (result.rows.length > 0) {
        return result.rows[0];
    }
    
    // If no AFF in city, find in same region
    return { affId: null, aggId: null }; // Manual assignment needed
}

// MIDDLEWARE
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

function requireAdmin(req, res, next) {
    if (req.user.userType !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

// ====================
// NETWORK MANAGEMENT APIs
// ====================

// AAG Dashboard - Get AAG overview and affiliates
app.get('/api/aag/dashboard', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Get AAG info
        const aagQuery = await pool.query(`
            SELECT a.*, u.name, u.email, u.company_name
            FROM aggs a
            JOIN users u ON a.user_id = u.user_id
            WHERE u.user_id = $1
        `, [userId]);
        
        if (aagQuery.rows.length === 0) {
            return res.status(404).json({ error: 'AAG not found' });
        }
        
        const aag = aagQuery.rows[0];
        
        // Get all affiliates for this AAG
        const affsQuery = await pool.query(`
            SELECT 
                af.aff_id,
                u.name,
                u.email,
                af.referral_code,
                af.rank,
                af.active_clients_count,
                af.monthly_revenue,
                af.commission_rate,
                af.status,
                af.created_at
            FROM affs af
            JOIN users u ON af.user_id = u.user_id
            WHERE af.agg_id = $1
            ORDER BY af.monthly_revenue DESC
        `, [aag.agg_id]);
        
        // Calculate commission earned this month
        const commissionQuery = await pool.query(`
            SELECT SUM(amount) as total
            FROM commission_records
            WHERE agg_id = $1 
            AND commission_type = 'override'
            AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
        `, [aag.agg_id]);
        
        const commission = commissionQuery.rows[0].total || 0;
        
        res.json({
            name: aag.name || aag.company_name,
            activeAffiliates: aag.active_affiliates_count,
            maxAffiliates: aag.max_affiliates,
            totalClients: aag.total_network_clients,
            monthlyRevenue: parseFloat(aag.monthly_revenue || 0),
            commissionEarned: parseFloat(commission),
            tier: aag.tier,
            affiliates: affsQuery.rows.map(aff => ({
                id: aff.aff_id,
                name: aff.name,
                email: aff.email,
                referralCode: aff.referral_code,
                rank: aff.rank,
                activeClients: aff.active_clients_count,
                monthlyRevenue: parseFloat(aff.monthly_revenue || 0),
                commissionRate: parseFloat(aff.commission_rate),
                status: aff.status,
                joinedDate: aff.created_at
            }))
        });
    } catch (error) {
        console.error('AAG Dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
});

// AFF Dashboard - Get AFF overview and clients
app.get('/api/aff/dashboard', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Get AFF info
        const affQuery = await pool.query(`
            SELECT af.*, u.name, u.email
            FROM affs af
            JOIN users u ON af.user_id = u.user_id
            WHERE u.user_id = $1
        `, [userId]);
        
        if (affQuery.rows.length === 0) {
            return res.status(404).json({ error: 'Affiliate not found' });
        }
        
        const aff = affQuery.rows[0];
        
        // Get all clients for this AFF
        const clientsQuery = await pool.query(`
            SELECT 
                c.customer_id,
                u.name,
                u.email,
                c.patronage_kit,
                c.monthly_fee,
                c.status,
                c.created_at,
                c.renewal_date,
                c.lifetime_value
            FROM customers c
            JOIN users u ON c.user_id = u.user_id
            WHERE c.aff_id = $1
            ORDER BY c.created_at DESC
        `, [aff.aff_id]);
        
        // Calculate commission earned this month
        const commissionQuery = await pool.query(`
            SELECT SUM(amount) as total
            FROM commission_records
            WHERE aff_id = $1 
            AND commission_type = 'direct'
            AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
        `, [aff.aff_id]);
        
        const commission = commissionQuery.rows[0].total || 0;
        
        // Count new clients this month
        const newClientsQuery = await pool.query(`
            SELECT COUNT(*) as count
            FROM customers
            WHERE aff_id = $1
            AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
        `, [aff.aff_id]);
        
        const newClients = parseInt(newClientsQuery.rows[0].count || 0);
        
        // Calculate kit distribution
        const kitDistQuery = await pool.query(`
            SELECT patronage_kit, COUNT(*) as count
            FROM customers
            WHERE aff_id = $1 AND status = 'active'
            GROUP BY patronage_kit
        `, [aff.aff_id]);
        
        const kitDistribution = {};
        kitDistQuery.rows.forEach(row => {
            kitDistribution[row.patronage_kit] = parseInt(row.count);
        });
        
        res.json({
            name: aff.name,
            rank: aff.rank,
            referralCode: aff.referral_code,
            referralLink: `https://q4-life.com/join?ref=${aff.referral_code}`,
            activeClients: aff.active_clients_count,
            maxClients: aff.max_clients,
            monthlyRevenue: parseFloat(aff.monthly_revenue || 0),
            commissionEarned: parseFloat(commission),
            commissionRate: parseFloat(aff.commission_rate),
            newClients: newClients,
            revenueGrowth: 15.2, // TODO: Calculate actual growth
            commissionChange: parseFloat(commission) * 0.15, // TODO: Calculate actual change
            clients: clientsQuery.rows.map(client => ({
                id: client.customer_id,
                name: client.name,
                email: client.email,
                kit: client.patronage_kit,
                fee: parseFloat(client.monthly_fee),
                commission: parseFloat(client.monthly_fee) * parseFloat(aff.commission_rate) / 100,
                joined: client.created_at,
                status: client.status,
                renewalDate: client.renewal_date,
                lifetimeValue: parseFloat(client.lifetime_value || 0)
            })),
            kitDistribution: kitDistribution
        });
    } catch (error) {
        console.error('AFF Dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
});

// Admin Network Overview
app.get('/api/admin/network-stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Get AAG stats
        const aagStats = await pool.query(`
            SELECT 
                COUNT(*) as total_aags,
                SUM(active_affiliates_count) as total_affs,
                SUM(total_network_clients) as total_clients,
                SUM(monthly_revenue) as total_revenue
            FROM aggs
        `);
        
        // Get commission stats
        const commissionStats = await pool.query(`
            SELECT 
                SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_commissions,
                SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_commissions
            FROM commission_records
            WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
        `);
        
        // Get top performers
        const topAggs = await pool.query(`
            SELECT 
                a.agg_id,
                u.name,
                u.company_name,
                a.active_affiliates_count,
                a.total_network_clients,
                a.monthly_revenue,
                a.tier
            FROM aggs a
            JOIN users u ON a.user_id = u.user_id
            ORDER BY a.monthly_revenue DESC
            LIMIT 10
        `);
        
        const topAffs = await pool.query(`
            SELECT 
                af.aff_id,
                u.name,
                af.rank,
                af.active_clients_count,
                af.monthly_revenue
            FROM affs af
            JOIN users u ON af.user_id = u.user_id
            ORDER BY af.monthly_revenue DESC
            LIMIT 10
        `);
        
        res.json({
            totalAggs: parseInt(aagStats.rows[0].total_aags || 0),
            maxAags: 20,
            totalAffs: parseInt(aagStats.rows[0].total_affs || 0),
            maxAffs: 1000,
            totalClients: parseInt(aagStats.rows[0].total_clients || 0),
            maxClients: 500000,
            monthlyRevenue: parseFloat(aagStats.rows[0].total_revenue || 0),
            pendingCommissions: parseFloat(commissionStats.rows[0].pending_commissions || 0),
            paidCommissions: parseFloat(commissionStats.rows[0].paid_commissions || 0),
            topAggs: topAggs.rows.map(agg => ({
                id: agg.agg_id,
                name: agg.name || agg.company_name,
                affiliates: agg.active_affiliates_count,
                clients: agg.total_network_clients,
                revenue: parseFloat(agg.monthly_revenue || 0),
                tier: agg.tier
            })),
            topAffs: topAffs.rows.map(aff => ({
                id: aff.aff_id,
                name: aff.name,
                rank: aff.rank,
                clients: aff.active_clients_count,
                revenue: parseFloat(aff.monthly_revenue || 0)
            }))
        });
    } catch (error) {
        console.error('Network stats error:', error);
        res.status(500).json({ error: 'Failed to load network statistics' });
    }
});

// Calculate commissions on payment
app.post('/api/commissions/calculate', authenticateToken, async (req, res) => {
    try {
        const { transactionId, customerId, amount } = req.body;
        
        // Get customer and their AFF
        const customerQuery = await pool.query(`
            SELECT c.aff_id, af.agg_id, af.commission_rate as aff_rate, ag.commission_rate as agg_rate
            FROM customers c
            JOIN affs af ON c.aff_id = af.aff_id
            JOIN aggs ag ON af.agg_id = ag.agg_id
            WHERE c.customer_id = $1
        `, [customerId]);
        
        if (customerQuery.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        const { aff_id, agg_id, aff_rate, agg_rate } = customerQuery.rows[0];
        
        // Calculate commissions
        const affCommission = amount * (parseFloat(aff_rate) / 100);
        const aggCommission = amount * (parseFloat(agg_rate) / 100);
        
        // Record AFF commission (direct)
        await pool.query(`
            INSERT INTO commission_records 
            (transaction_id, aff_id, commission_type, amount, rate, status)
            VALUES ($1, $2, 'direct', $3, $4, 'pending')
        `, [transactionId, aff_id, affCommission, aff_rate]);
        
        // Record AAG commission (override)
        await pool.query(`
            INSERT INTO commission_records 
            (transaction_id, agg_id, commission_type, amount, rate, status)
            VALUES ($1, $2, 'override', $3, $4, 'pending')
        `, [transactionId, agg_id, aggCommission, agg_rate]);
        
        res.json({
            success: true,
            affCommission: affCommission,
            aggCommission: aggCommission,
            total: affCommission + aggCommission
        });
    } catch (error) {
        console.error('Commission calculation error:', error);
        res.status(500).json({ error: 'Failed to calculate commissions' });
    }
});

// ====================
// NETWORK MANAGEMENT API
// ====================

// GET ADMIN NETWORK OVERVIEW
app.get('/api/admin/network/overview', authenticateToken, async (req, res) => {
    try {
        if (req.user.userType !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        // Get total counts
        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM aggs WHERE status = 'active') as total_aags,
                (SELECT COUNT(*) FROM affs WHERE status = 'active') as total_affs,
                (SELECT COUNT(*) FROM customers WHERE status = 'active') as total_customers,
                (SELECT COUNT(*) FROM businesses WHERE certification_status = 'active') as total_businesses,
                (SELECT COALESCE(SUM(kit_price), 0) FROM customers WHERE status = 'active') as monthly_revenue,
                (SELECT COALESCE(SUM(total_commissions_earned), 0) FROM affs) as total_aff_commissions,
                (SELECT COALESCE(SUM(total_commissions_earned), 0) FROM aggs) as total_aag_commissions
        `);

        // Get customer breakdown by kit type
        const kitBreakdown = await pool.query(`
            SELECT 
                patronage_kit,
                COUNT(*) as count,
                SUM(kit_price) as revenue
            FROM customers
            WHERE status = 'active'
            GROUP BY patronage_kit
            ORDER BY revenue DESC
        `);

        // Get top performing AAGs
        const topAAGs = await pool.query(`
            SELECT 
                a.id,
                u.first_name || ' ' || u.last_name as name,
                u.email,
                a.active_affiliates_count,
                a.total_network_revenue,
                a.total_commissions_earned,
                a.status
            FROM aggs a
            JOIN users u ON a.user_id = u.id
            WHERE a.status = 'active'
            ORDER BY a.total_network_revenue DESC
            LIMIT 10
        `);

        res.json({
            stats: stats.rows[0],
            kitBreakdown: kitBreakdown.rows,
            topAAGs: topAAGs.rows
        });
    } catch (error) {
        console.error('Network overview error:', error);
        res.status(500).json({ error: 'Failed to load network overview' });
    }
});

// GET ALL AAGs
app.get('/api/admin/aags', authenticateToken, async (req, res) => {
    try {
        if (req.user.userType !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const aags = await pool.query(`
            SELECT 
                a.id,
                a.user_id,
                u.email,
                u.first_name || ' ' || u.last_name as name,
                a.max_affiliates,
                a.active_affiliates_count,
                a.commission_rate,
                a.override_rate,
                a.total_network_revenue,
                a.total_commissions_earned,
                a.status,
                a.created_at
            FROM aggs a
            JOIN users u ON a.user_id = u.id
            ORDER BY a.total_network_revenue DESC
        `);

        res.json({ aags: aags.rows });
    } catch (error) {
        console.error('Get AAGs error:', error);
        res.status(500).json({ error: 'Failed to load AAGs' });
    }
});

// GET AAG DASHBOARD DATA
app.get('/api/aag/dashboard', authenticateToken, async (req, res) => {
    try {
        if (req.user.userType !== 'agg') {
            return res.status(403).json({ error: 'AAG access required' });
        }

        // Get AAG details
        const aag = await pool.query(`
            SELECT * FROM aggs WHERE user_id = $1
        `, [req.user.userId]);

        if (aag.rows.length === 0) {
            return res.status(404).json({ error: 'AAG profile not found' });
        }

        const aagData = aag.rows[0];

        // Get all affiliates under this AAG
        const affiliates = await pool.query(`
            SELECT 
                a.id,
                u.email,
                u.first_name || ' ' || u.last_name as name,
                a.active_customers_count,
                a.max_customers,
                a.total_sales,
                a.total_commissions_earned,
                a.referral_code,
                a.status,
                a.created_at
            FROM affs a
            JOIN users u ON a.user_id = u.id
            WHERE a.agg_id = $1
            ORDER BY a.total_sales DESC
        `, [aagData.id]);

        // Get customer count by affiliate
        const customerStats = await pool.query(`
            SELECT 
                aff_id,
                COUNT(*) as customer_count,
                SUM(kit_price) as total_revenue
            FROM customers
            WHERE aff_id IN (SELECT id FROM affs WHERE agg_id = $1)
            AND status = 'active'
            GROUP BY aff_id
        `, [aagData.id]);

        // Calculate commissions for this month
        const monthlyCommissions = await pool.query(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM commissions
            WHERE recipient_id = $1
            AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
        `, [req.user.userId]);

        res.json({
            aag: aagData,
            affiliates: affiliates.rows,
            customerStats: customerStats.rows,
            monthlyCommissions: monthlyCommissions.rows[0].total
        });
    } catch (error) {
        console.error('AAG dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
});

// GET AFF DASHBOARD DATA
app.get('/api/aff/dashboard', authenticateToken, async (req, res) => {
    try {
        if (req.user.userType !== 'aff') {
            return res.status(403).json({ error: 'AFF access required' });
        }

        // Get AFF details
        const aff = await pool.query(`
            SELECT * FROM affs WHERE user_id = $1
        `, [req.user.userId]);

        if (aff.rows.length === 0) {
            return res.status(404).json({ error: 'AFF profile not found' });
        }

        const affData = aff.rows[0];

        // Get all customers under this AFF
        const customers = await pool.query(`
            SELECT 
                c.id,
                u.email,
                u.first_name || ' ' || u.last_name as name,
                c.patronage_kit,
                c.kit_price,
                c.status,
                c.subscription_start_date,
                c.renewal_date,
                c.lifetime_value
            FROM customers c
            JOIN users u ON c.user_id = u.id
            WHERE c.aff_id = $1
            ORDER BY c.kit_price DESC, c.created_at DESC
        `, [affData.id]);

        // Get revenue stats
        const revenueStats = await pool.query(`
            SELECT 
                patronage_kit,
                COUNT(*) as count,
                SUM(kit_price) as revenue
            FROM customers
            WHERE aff_id = $1 AND status = 'active'
            GROUP BY patronage_kit
        `, [affData.id]);

        // Get monthly commissions
        const monthlyCommissions = await pool.query(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM commissions
            WHERE recipient_id = $1
            AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
        `, [req.user.userId]);

        res.json({
            aff: affData,
            customers: customers.rows,
            revenueStats: revenueStats.rows,
            monthlyCommissions: monthlyCommissions.rows[0].total
        });
    } catch (error) {
        console.error('AFF dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
});

// ADD NEW CUSTOMER (by AFF)
app.post('/api/aff/customers', authenticateToken, async (req, res) => {
    try {
        if (req.user.userType !== 'aff') {
            return res.status(403).json({ error: 'AFF access required' });
        }

        const { email, firstName, lastName, patronageKit } = req.body;

        // Get AFF details
        const aff = await pool.query('SELECT * FROM affs WHERE user_id = $1', [req.user.userId]);
        if (aff.rows.length === 0) {
            return res.status(404).json({ error: 'AFF profile not found' });
        }

        // Check if AFF has reached customer limit
        if (aff.rows[0].active_customers_count >= aff.rows[0].max_customers) {
            return res.status(400).json({ error: 'Customer limit reached (500 max)' });
        }

        // Determine kit price
        const kitPrices = {
            '25-std': 25,
            '100-prem': 100,
            '250-pro': 250,
            '500-elite': 500,
            '1k-ent': 1000
        };
        const kitPrice = kitPrices[patronageKit] || 25;

        // Create user account
        const tempPassword = Math.random().toString(36).slice(-8);
        const passwordHash = await bcrypt.hash(tempPassword, 10);

        const user = await pool.query(`
            INSERT INTO users (email, password_hash, first_name, last_name, user_type, created_at)
            VALUES ($1, $2, $3, $4, 'customer', NOW())
            RETURNING id
        `, [email, passwordHash, firstName, lastName]);

        // Create customer record
        const customer = await pool.query(`
            INSERT INTO customers (user_id, aff_id, patronage_kit, kit_price, status, subscription_start_date, renewal_date)
            VALUES ($1, $2, $3, $4, 'active', NOW(), NOW() + INTERVAL '1 month')
            RETURNING *
        `, [user.rows[0].id, aff.rows[0].id, patronageKit, kitPrice]);

        // Calculate and record commission
        const commissionAmount = kitPrice * (aff.rows[0].commission_rate / 100);
        await pool.query(`
            INSERT INTO commissions (transaction_type, recipient_id, recipient_type, customer_id, amount, commission_rate, status)
            VALUES ('aff_direct', $1, 'aff', $2, $3, $4, 'pending')
        `, [req.user.userId, customer.rows[0].id, commissionAmount, aff.rows[0].commission_rate]);

        res.json({ 
            customer: customer.rows[0],
            tempPassword,
            message: 'Customer added successfully. Send login credentials to customer.' 
        });
    } catch (error) {
        console.error('Add customer error:', error);
        res.status(500).json({ error: 'Failed to add customer' });
    }
});

// ========================================
// NETWORK DASHBOARD API ENDPOINTS
// ========================================

// Admin: Get complete network overview
app.get('/api/admin/network/overview', authenticateToken, async (req, res) => {
    try {
        if (req.user.userType !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM aggs WHERE status = 'active') as active_aags,
                (SELECT COUNT(*) FROM affs WHERE status = 'active') as active_affs,
                (SELECT COUNT(*) FROM customers WHERE status = 'active') as active_customers,
                (SELECT SUM(kit_price) FROM customers WHERE status = 'active') as monthly_recurring_revenue,
                (SELECT SUM(total_commissions_earned) FROM aggs) as total_agg_commissions,
                (SELECT SUM(total_commissions_earned) FROM affs) as total_aff_commissions
        `);

        res.json(stats.rows[0]);
    } catch (error) {
        console.error('Network overview error:', error);
        res.status(500).json({ error: 'Failed to get network overview' });
    }
});

// Admin: Get all AAGs with their network stats
app.get('/api/admin/aags', authenticateToken, async (req, res) => {
    try {
        if (req.user.userType !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const aags = await pool.query(`
            SELECT a.*, u.email, u.first_name, u.last_name,
                   a.active_affiliates_count,
                   a.total_network_revenue,
                   a.total_commissions_earned,
                   (SELECT COUNT(*) FROM customers c 
                    JOIN affs af ON c.aff_id = af.id 
                    WHERE af.agg_id = a.id AND c.status = 'active') as total_customers
            FROM aggs a
            JOIN users u ON a.user_id = u.id
            ORDER BY a.total_network_revenue DESC
        `);

        res.json(aags.rows);
    } catch (error) {
        console.error('Get AAGs error:', error);
        res.status(500).json({ error: 'Failed to get AAGs' });
    }
});

// AAG: Get own dashboard stats
app.get('/api/aag/dashboard', authenticateToken, async (req, res) => {
    try {
        const aag = await pool.query('SELECT * FROM aggs WHERE user_id = $1', [req.user.userId]);
        
        if (aag.rows.length === 0) {
            return res.status(404).json({ error: 'AAG profile not found' });
        }

        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM affs WHERE agg_id = $1 AND status = 'active') as active_affs,
                (SELECT COUNT(*) FROM customers c 
                 JOIN affs af ON c.aff_id = af.id 
                 WHERE af.agg_id = $1 AND c.status = 'active') as total_customers,
                (SELECT SUM(af.total_sales) FROM affs af WHERE af.agg_id = $1) as total_network_sales,
                (SELECT SUM(amount) FROM commissions WHERE recipient_id = $2 AND status = 'paid') as total_commissions_paid
        `, [aag.rows[0].id, req.user.userId]);

        res.json({ aag: aag.rows[0], stats: stats.rows[0] });
    } catch (error) {
        console.error('AAG dashboard error:', error);
        res.status(500).json({ error: 'Failed to get dashboard' });
    }
});

// AAG: Get all their affiliates
app.get('/api/aag/affiliates', authenticateToken, async (req, res) => {
    try {
        const aag = await pool.query('SELECT id FROM aggs WHERE user_id = $1', [req.user.userId]);
        
        if (aag.rows.length === 0) {
            return res.status(404).json({ error: 'AAG profile not found' });
        }

        const affiliates = await pool.query(`
            SELECT af.*, u.email, u.first_name, u.last_name,
                   af.active_customers_count,
                   af.total_sales,
                   af.total_commissions_earned
            FROM affs af
            JOIN users u ON af.user_id = u.id
            WHERE af.agg_id = $1
            ORDER BY af.total_sales DESC
        `, [aag.rows[0].id]);

        res.json(affiliates.rows);
    } catch (error) {
        console.error('Get affiliates error:', error);
        res.status(500).json({ error: 'Failed to get affiliates' });
    }
});

// AFF: Get own dashboard stats
app.get('/api/aff/dashboard', authenticateToken, async (req, res) => {
    try {
        const aff = await pool.query('SELECT * FROM affs WHERE user_id = $1', [req.user.userId]);
        
        if (aff.rows.length === 0) {
            return res.status(404).json({ error: 'AFF profile not found' });
        }

        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM customers WHERE aff_id = $1 AND status = 'active') as active_customers,
                (SELECT SUM(kit_price) FROM customers WHERE aff_id = $1 AND status = 'active') as monthly_revenue,
                (SELECT SUM(amount) FROM commissions WHERE recipient_id = $2 AND status = 'paid') as total_commissions_paid,
                (SELECT SUM(amount) FROM commissions WHERE recipient_id = $2 AND status = 'pending') as pending_commissions
        `, [aff.rows[0].id, req.user.userId]);

        res.json({ aff: aff.rows[0], stats: stats.rows[0] });
    } catch (error) {
        console.error('AFF dashboard error:', error);
        res.status(500).json({ error: 'Failed to get dashboard' });
    }
});

// AFF: Get all their customers
app.get('/api/aff/customers', authenticateToken, async (req, res) => {
    try {
        const aff = await pool.query('SELECT id FROM affs WHERE user_id = $1', [req.user.userId]);
        
        if (aff.rows.length === 0) {
            return res.status(404).json({ error: 'AFF profile not found' });
        }

        const customers = await pool.query(`
            SELECT c.*, u.email, u.first_name, u.last_name
            FROM customers c
            JOIN users u ON c.user_id = u.id
            WHERE c.aff_id = $1
            ORDER BY c.created_at DESC
        `, [aff.rows[0].id]);

        res.json(customers.rows);
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ error: 'Failed to get customers' });
    }
});

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Q4Life Allegro API running on port ${PORT}`);
});

module.exports = app;
