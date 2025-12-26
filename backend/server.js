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

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Q4Life Allegro API running on port ${PORT}`);
});

module.exports = app;
