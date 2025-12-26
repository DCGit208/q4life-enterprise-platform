// Q4LIFE ALLEGRO - BUSINESS REGISTRATION PORTAL
// 50-Question QoL Evaluation + Pack Selection + Payment Integration

let currentStep = 1;
let qolScore = 0;
let selectedPack = null;
let formData = {};

// SUBCATEGORIES BY SECTOR
const SUBCATEGORIES = {
    'food-dining': ['Restaurants', 'Fast Food', 'Catering', 'Food Delivery', 'Cafes & Bakeries', 'Organic Markets', 'Street Food Vendors', 'Food Trucks'],
    'transportation': ['Taxi Services', 'Delivery Services', 'Moving Services', 'Car Rental', 'Moto-Taxi', 'Bus Services', 'Logistics', 'Freight'],
    'healthcare': ['Hospitals', 'Clinics', 'Pharmacies', 'Home Care', 'Mental Health', 'Dental', 'Traditional Medicine', 'Diagnostic Centers'],
    'home-services': ['Plumbing', 'Electrical', 'Cleaning', 'Security', 'Gardening', 'Pest Control', 'AC Repair', 'General Maintenance'],
    'professional-services': ['Legal Services', 'Accounting', 'Consulting', 'Marketing', 'HR Services', 'Translation', 'Business Advisory', 'Insurance'],
    'education-training': ['Schools', 'Tutoring', 'Vocational Training', 'Language Schools', 'Online Courses', 'Exam Prep', 'Music Lessons', 'Tech Training'],
    'real-estate-property': ['Sales', 'Rentals', 'Property Management', 'Real Estate Agents', 'Co-working Spaces', 'Storage', 'Land Sales', 'Development'],
    'beauty-personal-care': ['Salons', 'Barbershops', 'Spas', 'Nail Services', 'Massage', 'Cosmetics', 'Beauty Training', 'Skincare'],
    'entertainment-events': ['Event Planning', 'DJ Services', 'Photography', 'Videography', 'Venues', 'Decoration', 'Entertainment', 'Catering'],
    'agriculture-farming': ['Crop Farming', 'Livestock', 'Fish Farming', 'Poultry', 'Agro-inputs', 'Farm Equipment', 'Processing', 'Agricultural Advisory'],
    'construction-engineering': ['Building', 'Renovation', 'Engineering', 'Architecture', 'Concrete', 'Roofing', 'Painting', 'Tiling'],
    'technology-it': ['Web Development', 'Software', 'IT Support', 'Mobile Apps', 'Cybersecurity', 'Cloud Services', 'Data Analytics', 'AI Solutions'],
    'financial-services': ['Banking', 'Insurance', 'Microfinance', 'Investment', 'Mobile Money', 'Accounting', 'Tax Services', 'Financial Advisory'],
    'retail-shopping': ['Supermarkets', 'Clothing', 'Electronics', 'Hardware', 'Furniture', 'Cosmetics', 'Phones', 'General Merchandise'],
    'hospitality-tourism': ['Hotels', 'Guest Houses', 'Restaurants', 'Tour Operators', 'Travel Agencies', 'Car Rental', 'Event Venues', 'Resorts']
};

// 50 QOL EVALUATION QUESTIONS (5 categories × 10 questions × 20 points each = 1000 points)
const QOL_QUESTIONS = [
    // CATEGORY 1: SERVICE QUALITY (200 points)
    {
        category: 'Service Quality',
        question: 'Do you have written service quality standards that all employees must follow?',
        points: 20
    },
    {
        category: 'Service Quality',
        question: 'Do you conduct regular customer satisfaction surveys?',
        points: 20
    },
    {
        category: 'Service Quality',
        question: 'Do you have a formal complaints resolution process with response times under 24 hours?',
        points: 20
    },
    {
        category: 'Service Quality',
        question: 'Have you received any industry certifications or quality awards?',
        points: 20
    },
    {
        category: 'Service Quality',
        question: 'Do you have a customer service training program for employees?',
        points: 20
    },
    {
        category: 'Service Quality',
        question: 'Do you measure service delivery times and maintain performance metrics?',
        points: 20
    },
    {
        category: 'Service Quality',
        question: 'Do you have a system to track repeat customers and their satisfaction?',
        points: 20
    },
    {
        category: 'Service Quality',
        question: 'Can customers easily reach you through multiple channels (phone, WhatsApp, email)?',
        points: 20
    },
    {
        category: 'Service Quality',
        question: 'Do you provide service guarantees or warranties?',
        points: 20
    },
    {
        category: 'Service Quality',
        question: 'Do you have a process for continuous service improvement based on feedback?',
        points: 20
    },
    
    // CATEGORY 2: BUSINESS OPERATIONS (200 points)
    {
        category: 'Business Operations',
        question: 'Is your business registered with all required government agencies?',
        points: 20
    },
    {
        category: 'Business Operations',
        question: 'Do you maintain proper financial records and accounting systems?',
        points: 20
    },
    {
        category: 'Business Operations',
        question: 'Do you have business insurance coverage?',
        points: 20
    },
    {
        category: 'Business Operations',
        question: 'Do you have documented operational procedures and processes?',
        points: 20
    },
    {
        category: 'Business Operations',
        question: 'Is your business profitable and financially sustainable?',
        points: 20
    },
    {
        category: 'Business Operations',
        question: 'Do you have a business continuity or emergency plan?',
        points: 20
    },
    {
        category: 'Business Operations',
        question: 'Do you use technology systems (POS, inventory management, CRM)?',
        points: 20
    },
    {
        category: 'Business Operations',
        question: 'Do you have clearly defined roles and responsibilities for your team?',
        points: 20
    },
    {
        category: 'Business Operations',
        question: 'Do you conduct regular performance reviews and strategic planning?',
        points: 20
    },
    {
        category: 'Business Operations',
        question: 'Do you have suppliers/vendors with reliable quality standards?',
        points: 20
    },
    
    // CATEGORY 3: EMPLOYEE WELFARE (200 points)
    {
        category: 'Employee Welfare',
        question: 'Do you provide written employment contracts to all employees?',
        points: 20
    },
    {
        category: 'Employee Welfare',
        question: 'Do you pay salaries on time every month?',
        points: 20
    },
    {
        category: 'Employee Welfare',
        question: 'Do you register employees with social security (CNPS)?',
        points: 20
    },
    {
        category: 'Employee Welfare',
        question: 'Do you provide health insurance or healthcare benefits?',
        points: 20
    },
    {
        category: 'Employee Welfare',
        question: 'Do you offer paid annual leave and sick leave?',
        points: 20
    },
    {
        category: 'Employee Welfare',
        question: 'Do you provide training and professional development opportunities?',
        points: 20
    },
    {
        category: 'Employee Welfare',
        question: 'Is your workplace safe with proper safety equipment and protocols?',
        points: 20
    },
    {
        category: 'Employee Welfare',
        question: 'Do you have a zero-tolerance policy for discrimination and harassment?',
        points: 20
    },
    {
        category: 'Employee Welfare',
        question: 'Do you provide employee performance incentives or bonuses?',
        points: 20
    },
    {
        category: 'Employee Welfare',
        question: 'Do you conduct regular employee satisfaction surveys?',
        points: 20
    },
    
    // CATEGORY 4: SOCIAL RESPONSIBILITY (200 points)
    {
        category: 'Social Responsibility',
        question: 'Do you source products/services from local suppliers?',
        points: 20
    },
    {
        category: 'Social Responsibility',
        question: 'Do you have environmentally sustainable practices (waste management, recycling)?',
        points: 20
    },
    {
        category: 'Social Responsibility',
        question: 'Do you participate in community development initiatives?',
        points: 20
    },
    {
        category: 'Social Responsibility',
        question: 'Do you provide services to underserved communities or vulnerable populations?',
        points: 20
    },
    {
        category: 'Social Responsibility',
        question: 'Do you have ethical sourcing and fair trade practices?',
        points: 20
    },
    {
        category: 'Social Responsibility',
        question: 'Do you support local employment and youth development?',
        points: 20
    },
    {
        category: 'Social Responsibility',
        question: 'Do you have energy-efficient operations or use renewable energy?',
        points: 20
    },
    {
        category: 'Social Responsibility',
        question: 'Do you donate to charities or sponsor community events?',
        points: 20
    },
    {
        category: 'Social Responsibility',
        question: 'Do you have transparent business practices and ethical standards?',
        points: 20
    },
    {
        category: 'Social Responsibility',
        question: 'Do you educate customers about sustainability or quality-of-life issues?',
        points: 20
    },
    
    // CATEGORY 5: CUSTOMER VALUE (200 points)
    {
        category: 'Customer Value',
        question: 'Do you offer competitive pricing compared to market rates?',
        points: 20
    },
    {
        category: 'Customer Value',
        question: 'Do you provide clear, transparent pricing with no hidden fees?',
        points: 20
    },
    {
        category: 'Customer Value',
        question: 'Do you offer flexible payment options (cash, mobile money, credit)?',
        points: 20
    },
    {
        category: 'Customer Value',
        question: 'Do you have a loyalty program or rewards for repeat customers?',
        points: 20
    },
    {
        category: 'Customer Value',
        question: 'Do you provide after-sales support and follow-up?',
        points: 20
    },
    {
        category: 'Customer Value',
        question: 'Do you offer package deals or bundled services for better value?',
        points: 20
    },
    {
        category: 'Customer Value',
        question: 'Do you honor promises and commitments to customers?',
        points: 20
    },
    {
        category: 'Customer Value',
        question: 'Do you provide educational content or advice to help customers?',
        points: 20
    },
    {
        category: 'Customer Value',
        question: 'Can customers access your services conveniently (location, hours, online)?',
        points: 20
    },
    {
        category: 'Customer Value',
        question: 'Do you go above and beyond to exceed customer expectations?',
        points: 20
    }
];

// PACK CONFIGURATIONS
const PACKS = {
    '15-std': {
        name: '15% STD',
        entryFee: 26000,
        monthlyFee: 13000,
        clienteleTarget: 750,
        minScore: 300,
        maxScore: 399,
        description: 'Entry-level pack for businesses ready to scale'
    },
    '25-std': {
        name: '25% STD',
        entryFee: 44000,
        monthlyFee: 22000,
        clienteleTarget: 1500,
        minScore: 400,
        maxScore: 499,
        description: 'Growth pack for established businesses'
    },
    '50-std': {
        name: '50% STD',
        entryFee: 87000,
        monthlyFee: 44000,
        clienteleTarget: 3000,
        minScore: 500,
        maxScore: 599,
        description: 'Premium pack for quality-focused businesses'
    },
    '100-std': {
        name: '100% STD',
        entryFee: 175000,
        monthlyFee: 87000,
        clienteleTarget: 5000,
        minScore: 600,
        maxScore: 699,
        description: 'Elite pack for industry leaders'
    },
    'gold': {
        name: 'Gold Elite',
        entryFee: 250000,
        monthlyFee: 125000,
        clienteleTarget: 7500,
        minScore: 700,
        maxScore: 799,
        description: 'Gold-tier excellence certification'
    },
    'platinum': {
        name: 'Platinum Elite',
        entryFee: 350000,
        monthlyFee: 175000,
        clienteleTarget: 10000,
        minScore: 800,
        maxScore: 1000,
        description: 'Ultimate quality-of-life certification'
    }
};

// LOAD SUBCATEGORIES BASED ON SECTOR
function loadSubcategories(sectorId) {
    const subcategorySelect = document.getElementById('subcategorySelect');
    subcategorySelect.innerHTML = '<option value="">-- Select Subcategory --</option>';
    
    if (SUBCATEGORIES[sectorId]) {
        SUBCATEGORIES[sectorId].forEach(sub => {
            const option = document.createElement('option');
            option.value = sub.toLowerCase().replace(/\s+/g, '-');
            option.textContent = sub;
            subcategorySelect.appendChild(option);
        });
    }
}

// NAVIGATION FUNCTIONS
function nextStep(currentStepNum) {
    // Validate current step before proceeding
    if (!validateStep(currentStepNum)) {
        return;
    }
    
    // Special handling for step 2 → 3 (QoL evaluation)
    if (currentStepNum === 2) {
        return; // calculateQoLScore() handles navigation
    }
    
    // Move to next step
    document.getElementById(`step${currentStepNum}`).classList.remove('active');
    document.getElementById(`step${currentStepNum}Indicator`).classList.add('completed');
    document.getElementById(`step${currentStepNum}Indicator`).classList.remove('active');
    
    const nextStepNum = currentStepNum + 1;
    document.getElementById(`step${nextStepNum}`).classList.add('active');
    document.getElementById(`step${nextStepNum}Indicator`).classList.add('active');
    
    currentStep = nextStepNum;
    
    // Load pack options if moving to step 4
    if (nextStepNum === 4) {
        loadPackOptions();
    }
    
    // Load payment summary if moving to step 5
    if (nextStepNum === 5) {
        loadPaymentSummary();
    }
    
    window.scrollTo(0, 0);
}

function previousStep(currentStepNum) {
    document.getElementById(`step${currentStepNum}`).classList.remove('active');
    document.getElementById(`step${currentStepNum}Indicator`).classList.remove('active');
    
    const prevStepNum = currentStepNum - 1;
    document.getElementById(`step${prevStepNum}`).classList.add('active');
    document.getElementById(`step${prevStepNum}Indicator`).classList.add('active');
    document.getElementById(`step${prevStepNum}Indicator`).classList.remove('completed');
    
    currentStep = prevStepNum;
    window.scrollTo(0, 0);
}

// VALIDATION
function validateStep(stepNum) {
    if (stepNum === 1) {
        const form = document.getElementById('businessRegistrationForm');
        const inputs = form.querySelectorAll('#step1 input[required], #step1 select[required], #step1 textarea[required]');
        
        for (let input of inputs) {
            if (!input.value.trim()) {
                alert(`Please fill in: ${input.name}`);
                input.focus();
                return false;
            }
        }
        
        // Save step 1 data
        formData.businessName = form.businessName.value;
        formData.firstName = form.firstName.value;
        formData.lastName = form.lastName.value;
        formData.email = form.email.value;
        formData.phone = form.phone.value;
        formData.sector = form.sector.value;
        formData.subcategory = form.subcategory.value;
        formData.description = form.description.value;
        formData.city = form.city.value;
        formData.region = form.region.value;
        formData.address = form.address.value;
        formData.yearsInOperation = form.yearsInOperation.value;
        
        return true;
    }
    
    if (stepNum === 4) {
        if (!selectedPack) {
            alert('Please select a pack');
            return false;
        }
        return true;
    }
    
    return true;
}

// LOAD QOL QUESTIONS
document.addEventListener('DOMContentLoaded', function() {
    const questionsContainer = document.getElementById('qolQuestions');
    
    let currentCategory = '';
    let categoryHTML = '';
    
    QOL_QUESTIONS.forEach((q, index) => {
        if (q.category !== currentCategory) {
            if (categoryHTML) {
                questionsContainer.innerHTML += categoryHTML;
            }
            
            currentCategory = q.category;
            categoryHTML = `
                <div style="background: #f9fafb; padding: 1.5rem; border-radius: 1rem; margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1.5rem; color: #0a0e27; border-bottom: 2px solid #fbbf24; padding-bottom: 0.5rem;">
                        ${q.category} (200 points)
                    </h3>
            `;
        }
        
        categoryHTML += `
            <div style="margin-bottom: 1rem; display: flex; align-items: center; background: white; padding: 1rem; border-radius: 0.5rem;">
                <div style="flex: 1; margin-right: 2rem;">
                    <label style="font-weight: 500;">${index + 1}. ${q.question}</label>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="radio" name="q${index}" value="20" required style="width: auto; margin-right: 0.5rem;">
                        <span style="color: #10b981; font-weight: 600;">Yes (+${q.points})</span>
                    </label>
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="radio" name="q${index}" value="0" required style="width: auto; margin-right: 0.5rem;">
                        <span style="color: #6b7280;">No (0)</span>
                    </label>
                </div>
            </div>
        `;
        
        if ((index + 1) % 10 === 0) {
            categoryHTML += `</div>`;
            questionsContainer.innerHTML += categoryHTML;
            categoryHTML = '';
        }
    });
});

// CALCULATE QOL SCORE
function calculateQoLScore() {
    // Check if all questions are answered
    for (let i = 0; i < 50; i++) {
        const answer = document.querySelector(`input[name="q${i}"]:checked`);
        if (!answer) {
            alert(`Please answer all questions. Question ${i + 1} is unanswered.`);
            return;
        }
    }
    
    // Calculate total score
    let totalScore = 0;
    const categoryScores = {
        'Service Quality': 0,
        'Business Operations': 0,
        'Employee Welfare': 0,
        'Social Responsibility': 0,
        'Customer Value': 0
    };
    
    QOL_QUESTIONS.forEach((q, index) => {
        const answer = document.querySelector(`input[name="q${index}"]:checked`);
        const points = parseInt(answer.value);
        totalScore += points;
        categoryScores[q.category] += points;
    });
    
    qolScore = totalScore;
    formData.qolScore = totalScore;
    formData.categoryScores = categoryScores;
    
    // Display score
    displayQoLScore(totalScore, categoryScores);
    
    // Move to step 3
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step2Indicator').classList.add('completed');
    document.getElementById('step2Indicator').classList.remove('active');
    document.getElementById('step3').classList.add('active');
    document.getElementById('step3Indicator').classList.add('active');
    currentStep = 3;
    window.scrollTo(0, 0);
}

// DISPLAY QOL SCORE
function displayQoLScore(score, categoryScores) {
    document.getElementById('scoreDisplay').textContent = score;
    
    let title = '';
    let description = '';
    let eligibility = '';
    
    if (score >= 800) {
        title = 'Platinum Elite';
        description = 'Outstanding! You qualify for our highest certification tier.';
        eligibility = 'Eligible for: Platinum Elite Pack';
    } else if (score >= 700) {
        title = 'Gold Elite';
        description = 'Excellent! You qualify for Gold-tier certification.';
        eligibility = 'Eligible for: Gold Elite Pack';
    } else if (score >= 600) {
        title = 'Elite Certified';
        description = 'Great! You qualify for 100% STD Elite Pack.';
        eligibility = 'Eligible for: 100% STD Pack';
    } else if (score >= 500) {
        title = 'Premium Certified';
        description = 'Very Good! You qualify for 50% STD Premium Pack.';
        eligibility = 'Eligible for: 50% STD Pack';
    } else if (score >= 400) {
        title = 'Growth Certified';
        description = 'Good! You qualify for 25% STD Growth Pack.';
        eligibility = 'Eligible for: 25% STD Pack';
    } else if (score >= 300) {
        title = 'Entry Certified';
        description = 'You qualify for 15% STD Entry Pack.';
        eligibility = 'Eligible for: 15% STD Pack';
    } else {
        title = 'Below Threshold';
        description = 'Your score is below our minimum certification requirement (300). Please improve your quality standards and reapply.';
        eligibility = 'Not eligible for certification at this time.';
    }
    
    document.getElementById('scoreTitle').textContent = title;
    document.getElementById('scoreDescription').textContent = description;
    
    // Display breakdown
    let breakdownHTML = `
        <div style="background: white; padding: 2rem; border-radius: 1rem; border: 2px solid #e5e7eb;">
            <h3 style="margin-bottom: 1.5rem;">Score Breakdown</h3>
            <div style="margin-bottom: 1rem;"><strong>${eligibility}</strong></div>
    `;
    
    for (let category in categoryScores) {
        const categoryScore = categoryScores[category];
        const percentage = (categoryScore / 200) * 100;
        breakdownHTML += `
            <div style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>${category}</span>
                    <strong>${categoryScore} / 200</strong>
                </div>
                <div style="background: #e5e7eb; height: 12px; border-radius: 6px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%); height: 100%; width: ${percentage}%;"></div>
                </div>
            </div>
        `;
    }
    
    breakdownHTML += `</div>`;
    document.getElementById('scoreBreakdown').innerHTML = breakdownHTML;
}

// LOAD PACK OPTIONS BASED ON QOL SCORE
function loadPackOptions() {
    const packContainer = document.getElementById('packOptions');
    let packsHTML = '';
    let recommendedPackName = '';
    
    for (let packId in PACKS) {
        const pack = PACKS[packId];
        
        // Check if eligible
        const isEligible = qolScore >= pack.minScore && qolScore <= pack.maxScore;
        const isRecommended = isEligible;
        
        if (isRecommended) {
            recommendedPackName = pack.name;
        }
        
        const disabledClass = !isEligible ? 'opacity: 0.5; pointer-events: none;' : '';
        const recommendedBadge = isRecommended ? '<span style="background: #10b981; color: white; padding: 0.25rem 0.75rem; border-radius: 0.25rem; font-size: 0.875rem; font-weight: 700; margin-left: 1rem;">RECOMMENDED</span>' : '';
        
        packsHTML += `
            <div class="pack-card" style="${disabledClass}" onclick="selectPack('${packId}', this)">
                <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                    <input type="radio" name="pack" value="${packId}" ${!isEligible ? 'disabled' : ''}>
                    <h3 style="flex: 1; margin: 0;">${pack.name}</h3>
                    ${recommendedBadge}
                </div>
                <p style="color: #6b7280; margin-bottom: 1rem;">${pack.description}</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; background: #f9fafb; padding: 1rem; border-radius: 0.5rem;">
                    <div>
                        <div style="font-size: 0.875rem; color: #6b7280;">Entry Fee</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: #f59e0b;">$${pack.entryFee.toLocaleString()}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.875rem; color: #6b7280;">Monthly</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: #f59e0b;">$${pack.monthlyFee.toLocaleString()}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.875rem; color: #6b7280;">Clientele Target</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: #0a0e27;">${pack.clienteleTarget.toLocaleString()}</div>
                    </div>
                </div>
                ${!isEligible ? '<div style="color: #ef4444; font-weight: 600; margin-top: 1rem;">QoL Score: ' + pack.minScore + '-' + pack.maxScore + ' required</div>' : ''}
            </div>
        `;
    }
    
    packContainer.innerHTML = packsHTML;
    document.getElementById('recommendedPack').textContent = recommendedPackName || 'None (score too low)';
}

function selectPack(packId, element) {
    // Remove selected class from all packs
    document.querySelectorAll('.pack-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selected class to clicked pack
    element.classList.add('selected');
    element.querySelector('input[type="radio"]').checked = true;
    
    selectedPack = packId;
    formData.pack = packId;
}

// LOAD PAYMENT SUMMARY
function loadPaymentSummary() {
    if (!selectedPack) {
        alert('No pack selected');
        return;
    }
    
    const pack = PACKS[selectedPack];
    
    document.getElementById('summaryPack').textContent = pack.name;
    document.getElementById('summaryEntry').textContent = `$${pack.entryFee.toLocaleString()}`;
    document.getElementById('summaryMonthly').textContent = `$${pack.monthlyFee.toLocaleString()}/month`;
    document.getElementById('summaryTarget').textContent = `${pack.clienteleTarget.toLocaleString()} customers`;
    document.getElementById('summaryTotal').textContent = `$500`; // Evaluation fee only (entry fee charged after approval)
}

// FORM SUBMISSION
document.getElementById('businessRegistrationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // In production, this would:
    // 1. Submit form data to backend API
    // 2. Process Stripe payment for $500 evaluation fee
    // 3. Create business record in database with status "pending_review"
    // 4. Send confirmation email
    // 5. Redirect to business dashboard
    
    console.log('Form Data:', formData);
    console.log('QoL Score:', qolScore);
    console.log('Selected Pack:', selectedPack);
    
    alert(`✅ Application Submitted!\n\nBusiness: ${formData.businessName}\nQoL Score: ${qolScore}\nPack: ${PACKS[selectedPack].name}\n\nYou'll receive an email confirmation shortly. Our team will review your application within 7-14 days.\n\n(In production, Stripe payment would process here)`);
    
    // Redirect to business dashboard (to be created)
    // window.location.href = 'business-dashboard.html';
});
