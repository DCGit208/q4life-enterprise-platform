// Q4LIFE ALLEGRO - FIREBASE BACKEND ADAPTER
// Drop-in replacement for PostgreSQL backend
// Uses Firebase Firestore + Firebase Auth

const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
});

const db = admin.firestore();
const auth = admin.auth();

const app = express();
app.use(express.json());
app.use(cors());

// ====================
// AUTHENTICATION
// ====================

// REGISTER NEW USER
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, userType } = req.body;
        
        // Create Firebase Auth user
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: `${firstName} ${lastName}`
        });
        
        // Create Firestore user document
        await db.collection('users').doc(userRecord.uid).set({
            email,
            firstName,
            lastName,
            userType: userType || 'customer',
            emailVerified: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Generate custom token
        const token = await auth.createCustomToken(userRecord.uid);
        
        res.json({
            token,
            user: {
                id: userRecord.uid,
                email,
                firstName,
                lastName,
                userType
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message });
    }
});

// LOGIN (client-side uses Firebase Auth SDK)
app.post('/api/auth/verify', async (req, res) => {
    try {
        const { idToken } = req.body;
        
        // Verify Firebase ID token
        const decodedToken = await auth.verifyIdToken(idToken);
        const userId = decodedToken.uid;
        
        // Get user data from Firestore
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        res.json({
            user: {
                id: userId,
                ...userData
            }
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// ====================
// BUSINESS REGISTRATION
// ====================

app.post('/api/businesses/apply', async (req, res) => {
    try {
        const {
            userId,
            businessName,
            sectorId,
            subcategoryId,
            description,
            address,
            city,
            region,
            phone,
            qolAnswers,
            selectedPack
        } = req.body;
        
        // Calculate QoL score
        const qolScore = calculateQoLScore(qolAnswers);
        
        // Create business document in Firestore
        const businessRef = await db.collection('businesses').add({
            userId,
            businessName,
            sectorId,
            subcategoryId,
            description,
            address,
            city,
            region,
            phone,
            qolScore: qolScore.total,
            packLevel: selectedPack,
            certificationStatus: 'pending_review',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Save QoL evaluation
        await db.collection('qol_evaluations').add({
            businessId: businessRef.id,
            answers: qolAnswers,
            categoryScores: qolScore.categories,
            totalScore: qolScore.total,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Q4Life Business Evaluation Fee',
                        description: `Application for ${businessName}`
                    },
                    unit_amount: 50000 // $500
                },
                quantity: 1
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/business-dashboard?success=true`,
            cancel_url: `${process.env.FRONTEND_URL}/business-portal?canceled=true`,
            metadata: {
                businessId: businessRef.id,
                applicationType: 'evaluation_fee'
            }
        });
        
        res.json({
            businessId: businessRef.id,
            qolScore: qolScore.total,
            checkoutUrl: session.url
        });
    } catch (error) {
        console.error('Business application error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET BUSINESS BY ID
app.get('/api/businesses/:id', async (req, res) => {
    try {
        const businessDoc = await db.collection('businesses').doc(req.params.id).get();
        
        if (!businessDoc.exists) {
            return res.status(404).json({ error: 'Business not found' });
        }
        
        res.json({
            id: businessDoc.id,
            ...businessDoc.data()
        });
    } catch (error) {
        console.error('Get business error:', error);
        res.status(500).json({ error: error.message });
    }
});

// APPROVE BUSINESS (ADMIN)
app.post('/api/admin/businesses/:id/approve', async (req, res) => {
    try {
        const businessId = req.params.id;
        const businessDoc = await db.collection('businesses').doc(businessId).get();
        const business = businessDoc.data();
        
        // Assign AFF/AGG (simplified for now)
        const affAssignment = await assignAffiliateToNewBusiness(business.city, business.sectorId);
        
        // Create Stripe Connected Account
        const stripeAccount = await stripe.accounts.create({
            type: 'express',
            country: 'CM',
            email: business.email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true }
            }
        });
        
        // Update business status
        await db.collection('businesses').doc(businessId).update({
            certificationStatus: 'approved',
            affId: affAssignment.affId || null,
            aggId: affAssignment.aggId || null,
            stripeAccountId: stripeAccount.id,
            certifiedAt: admin.firestore.FieldValue.serverTimestamp(),
            goLiveDate: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
        });
        
        res.json({
            success: true,
            message: 'Business approved and certified',
            affAssignment
        });
    } catch (error) {
        console.error('Business approval error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ====================
// MARKETPLACE SEARCH
// ====================

app.get('/api/marketplace/search', async (req, res) => {
    try {
        const { query, sectorId, city, minQoL, page = 1, limit = 20 } = req.query;
        
        let businessesQuery = db.collection('businesses')
            .where('certificationStatus', '==', 'approved');
        
        if (sectorId) {
            businessesQuery = businessesQuery.where('sectorId', '==', sectorId);
        }
        
        if (city) {
            businessesQuery = businessesQuery.where('city', '==', city);
        }
        
        if (minQoL) {
            businessesQuery = businessesQuery.where('qolScore', '>=', parseInt(minQoL));
        }
        
        // Execute query
        const snapshot = await businessesQuery
            .orderBy('qolScore', 'desc')
            .limit(parseInt(limit))
            .get();
        
        const businesses = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Filter by keyword if provided (Firestore doesn't have full-text search)
        let filteredBusinesses = businesses;
        if (query) {
            const searchTerm = query.toLowerCase();
            filteredBusinesses = businesses.filter(b => 
                b.businessName.toLowerCase().includes(searchTerm) ||
                b.description.toLowerCase().includes(searchTerm)
            );
        }
        
        res.json({
            businesses: filteredBusinesses,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ====================
// TRANSACTIONS
// ====================

app.post('/api/transactions', async (req, res) => {
    try {
        const { customerId, businessId, serviceId, amount } = req.body;
        
        // Get business details
        const businessDoc = await db.collection('businesses').doc(businessId).get();
        const business = businessDoc.data();
        
        const platformFeePercentage = getPlatformFeePercentage(business.packLevel);
        const platformFee = amount * (platformFeePercentage / 100);
        
        // Commission split
        const platformShare = platformFee * 0.40;
        const aggCommission = platformFee * 0.20;
        const affCommission = platformFee * 0.40;
        
        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'usd',
            application_fee_amount: Math.round(platformFee * 100),
            transfer_data: {
                destination: business.stripeAccountId
            },
            metadata: {
                businessId,
                serviceId,
                customerId
            }
        });
        
        // Create transaction record
        const transactionRef = await db.collection('transactions').add({
            customerId,
            businessId,
            serviceId,
            subtotal: amount,
            platformFee,
            platformFeePercentage,
            affCommission,
            aggCommission,
            stripePaymentIntentId: paymentIntent.id,
            orderStatus: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.json({
            transactionId: transactionRef.id,
            clientSecret: paymentIntent.client_secret,
            amount,
            platformFee
        });
    } catch (error) {
        console.error('Transaction error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ====================
// HELPER FUNCTIONS
// ====================

function calculateQoLScore(answers) {
    const categories = {
        'Service Quality': answers.slice(0, 10).reduce((sum, val) => sum + val, 0),
        'Business Operations': answers.slice(10, 20).reduce((sum, val) => sum + val, 0),
        'Employee Welfare': answers.slice(20, 30).reduce((sum, val) => sum + val, 0),
        'Social Responsibility': answers.slice(30, 40).reduce((sum, val) => sum + val, 0),
        'Customer Value': answers.slice(40, 50).reduce((sum, val) => sum + val, 0)
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
    try {
        const snapshot = await db.collection('affs')
            .where('city', '==', city)
            .where('activeBusinessesCount', '<', 50)
            .where('status', '==', 'active')
            .orderBy('performanceScore', 'desc')
            .limit(1)
            .get();
        
        if (!snapshot.empty) {
            const affDoc = snapshot.docs[0];
            return {
                affId: affDoc.id,
                aggId: affDoc.data().aggId
            };
        }
        
        return { affId: null, aggId: null };
    } catch (error) {
        console.error('AFF assignment error:', error);
        return { affId: null, aggId: null };
    }
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Q4Life Allegro API (Firebase) running on port ${PORT}`);
});

module.exports = app;
