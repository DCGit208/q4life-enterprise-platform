// Test Business Registration Flow
require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
const SECTOR_ID = 'food-dining';

async function testBusinessRegistration() {
    console.log('🧪 Testing Q4Life Business Registration Flow\n');
    
    try {
        // STEP 1: Register a test business owner
        console.log('📝 Step 1: Registering business owner...');
        const ownerData = {
            email: `testowner${Date.now()}@q4life.com`,
            password: 'testpass123',
            firstName: 'Test',
            lastName: 'Business Owner',
            userType: 'business'
        };
        
        const registerResponse = await axios.post(`${API_BASE}/auth/register`, ownerData);
        const { token, user } = registerResponse.data;
        console.log(`✅ Owner registered: ${user.email}`);
        console.log(`   User ID: ${user.id}`);
        console.log(`   Token: ${token.substring(0, 20)}...\n`);
        
        // STEP 2: Submit business application with QoL evaluation
        console.log('🏢 Step 2: Submitting business application...');
        const businessData = {
            businessName: 'FoodNet Organic Market',
            sector: 'food-dining',
            subcategory: 'Organic Markets',
            description: 'Premium organic food market offering fresh produce, health foods, and sustainable products.',
            city: 'Yaoundé',
            region: 'Centre',
            address: '123 Independence Avenue, Yaoundé',
            yearsInOperation: 5,
            phone: '+237 6 12 34 56 78',
            
            // QoL Evaluation (50 questions)
            qolAnswers: {
                // Service Quality (10 questions × 20 points = 200)
                q1: 18, q2: 19, q3: 17, q4: 20, q5: 18,
                q6: 19, q7: 18, q8: 17, q9: 19, q10: 18,
                
                // Customer Experience (10 questions × 20 points = 200)
                q11: 19, q12: 18, q13: 19, q14: 17, q15: 18,
                q16: 19, q17: 18, q18: 20, q19: 17, q20: 19,
                
                // Business Operations (10 questions × 20 points = 200)
                q21: 18, q22: 17, q23: 19, q24: 18, q25: 17,
                q26: 19, q27: 18, q28: 17, q29: 19, q30: 18,
                
                // Social Impact (10 questions × 20 points = 200)
                q31: 19, q32: 18, q33: 17, q34: 19, q35: 18,
                q36: 17, q37: 19, q38: 18, q39: 17, q40: 19,
                
                // Innovation & Growth (10 questions × 20 points = 200)
                q41: 18, q42: 19, q43: 17, q44: 18, q45: 19,
                q46: 17, q47: 18, q48: 19, q49: 17, q50: 18
            },
            
            selectedPack: '25-std' // 25% Pack
        };
        
        const businessResponse = await axios.post(`${API_BASE}/businesses/apply`, businessData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const business = businessResponse.data.business;
        console.log(`✅ Business submitted: ${business.businessName}`);
        console.log(`   Business ID: ${business.id}`);
        console.log(`   QoL Score: ${business.qolScore}/1000`);
        console.log(`   Status: ${business.certificationStatus}`);
        console.log(`   Pack: ${business.packLevel}\n`);
        
        // STEP 3: Admin login
        console.log('👤 Step 3: Admin login...');
        const adminLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: 'admin@q4life.com',
            password: 'admin123'
        });
        
        const adminToken = adminLoginResponse.data.token;
        console.log(`✅ Admin logged in\n`);
        
        // STEP 4: Admin approves business
        console.log('✅ Step 4: Admin approving business...');
        const approvalResponse = await axios.post(
            `${API_BASE}/admin/businesses/${business.id}/approve`,
            {},
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        
        const approvedBusiness = approvalResponse.data.business;
        console.log(`✅ Business APPROVED!`);
        console.log(`   Status: ${approvedBusiness.certificationStatus}`);
        console.log(`   Affiliate assigned: ${approvedBusiness.affId || 'TBD'}`);
        console.log(`   Agency assigned: ${approvedBusiness.aggId || 'TBD'}\n`);
        
        // STEP 5: Search marketplace
        console.log('🔍 Step 5: Checking marketplace...');
        const searchResponse = await axios.get(`${API_BASE}/marketplace/search?sector=food-dining&limit=5`);
        
        console.log(`✅ Found ${searchResponse.data.businesses.length} business(es) in ${SECTOR_ID}`);
        searchResponse.data.businesses.forEach((biz, i) => {
            console.log(`   ${i + 1}. ${biz.business_name || 'Unknown'} (QoL: ${biz.qol_score || 'N/A'}) - ${biz.city || 'N/A'}`);
        });
        
        console.log('\n🎉 FULL FLOW TEST COMPLETE!\n');
        console.log('Summary:');
        console.log('✅ Business owner registered');
        console.log('✅ Business application submitted');
        console.log('✅ QoL score calculated');
        console.log('✅ Admin approved business');
        console.log('✅ Business now visible in marketplace');
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.response?.data || error.message);
        if (error.response?.status === 404) {
            console.log('\n⚠️  API endpoint not found. The backend may be missing this route.');
        }
    }
}

// Run the test
testBusinessRegistration();
