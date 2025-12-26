// Q4LIFE ALLEGRO - ADMIN DASHBOARD
// Platform Management, Business Approvals, Revenue Tracking

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all menu items
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked menu item
    event.target.closest('a').classList.add('active');
}

// REAL-TIME REVENUE CALCULATIONS
function calculatePlatformRevenue() {
    const businesses = 60000; // Current certified businesses
    
    // Pack distribution (estimated based on QoL scores)
    const packDistribution = {
        '15-std': { count: 18000, entryFee: 26000, monthlyFee: 13000 }, // 30%
        '25-std': { count: 15000, entryFee: 44000, monthlyFee: 22000 }, // 25%
        '50-std': { count: 12000, entryFee: 87000, monthlyFee: 44000 }, // 20%
        '100-std': { count: 9000, entryFee: 175000, monthlyFee: 87000 }, // 15%
        'gold': { count: 4500, entryFee: 250000, monthlyFee: 125000 }, // 7.5%
        'platinum': { count: 1500, entryFee: 350000, monthlyFee: 175000 } // 2.5%
    };
    
    // Calculate monthly subscription revenue
    let monthlySubscriptionRevenue = 0;
    for (let pack in packDistribution) {
        monthlySubscriptionRevenue += packDistribution[pack].count * packDistribution[pack].monthlyFee;
    }
    
    // Calculate entry fee revenue (assuming 2000 new businesses per month)
    const newBusinessesPerMonth = 2000;
    let entryFeeRevenue = 0;
    // Distribute new businesses proportionally
    entryFeeRevenue += newBusinessesPerMonth * 0.30 * 26000; // 15% STD
    entryFeeRevenue += newBusinessesPerMonth * 0.25 * 44000; // 25% STD
    entryFeeRevenue += newBusinessesPerMonth * 0.20 * 87000; // 50% STD
    entryFeeRevenue += newBusinessesPerMonth * 0.15 * 175000; // 100% STD
    entryFeeRevenue += newBusinessesPerMonth * 0.075 * 250000; // Gold
    entryFeeRevenue += newBusinessesPerMonth * 0.025 * 350000; // Platinum
    
    // Calculate transaction fee revenue (15% average of GMV)
    // Each business generates ~$30K monthly GMV (conservative estimate)
    const avgMonthlyGMVPerBusiness = 30000;
    const totalMonthlyGMV = businesses * avgMonthlyGMVPerBusiness;
    const avgTransactionFeeRate = 0.15; // 15% average
    const transactionFeeRevenue = totalMonthlyGMV * avgTransactionFeeRate;
    
    // Total monthly revenue
    const totalMonthlyRevenue = monthlySubscriptionRevenue + entryFeeRevenue + transactionFeeRevenue;
    
    return {
        subscriptions: monthlySubscriptionRevenue,
        entryFees: entryFeeRevenue,
        transactions: transactionFeeRevenue,
        total: totalMonthlyRevenue,
        annual: totalMonthlyRevenue * 12
    };
}

// BUSINESS APPROVAL FUNCTIONS
function approveBusinessApplication(applicationId, businessName, qolScore) {
    // In production, this would:
    // 1. Update database: status = "approved"
    // 2. Assign AFF based on location/sector
    // 3. Assign AGG (AFF's parent)
    // 4. Send approval email with certification badge
    // 5. Charge entry fee via Stripe
    // 6. Schedule mystery shopper evaluation
    // 7. Create business profile in marketplace
    // 8. Notify AFF of new business assignment
    
    if (confirm(`Approve ${businessName}?\n\nQoL Score: ${qolScore}\n\nThis will:\n✓ Certify the business\n✓ Charge entry fee\n✓ Assign to AFF/AGG\n✓ Publish to marketplace`)) {
        console.log(`Approving application ${applicationId}...`);
        
        // Simulate approval process
        alert(`✅ ${businessName} has been approved!\n\nCertification: QoL ${qolScore}\nEntry fee charged successfully\nAFF/AGG assigned\nBusiness is now live in marketplace`);
        
        // Remove from pending list (in production, refresh from database)
        event.target.closest('.approval-card').remove();
    }
}

function rejectBusinessApplication(applicationId, businessName) {
    const reason = prompt(`Reject ${businessName}?\n\nPlease provide rejection reason:`);
    
    if (reason) {
        // In production:
        // 1. Update database: status = "rejected", rejection_reason = reason
        // 2. Refund evaluation fee
        // 3. Send rejection email with feedback
        // 4. Log rejection for analytics
        
        console.log(`Rejecting application ${applicationId}: ${reason}`);
        alert(`❌ ${businessName} has been rejected.\n\nReason: ${reason}\n\nEvaluation fee will be refunded within 5-7 business days.`);
        
        event.target.closest('.approval-card').remove();
    }
}

// QOL SCORE RECALCULATION
function recalculateQoLScore(answers) {
    // Takes array of 50 answers (each 0 or 20 points)
    // Returns total score and category breakdown
    
    const categoryScores = {
        'Service Quality': 0,
        'Business Operations': 0,
        'Employee Welfare': 0,
        'Social Responsibility': 0,
        'Customer Value': 0
    };
    
    // Questions 0-9: Service Quality
    for (let i = 0; i < 10; i++) {
        categoryScores['Service Quality'] += answers[i];
    }
    
    // Questions 10-19: Business Operations
    for (let i = 10; i < 20; i++) {
        categoryScores['Business Operations'] += answers[i];
    }
    
    // Questions 20-29: Employee Welfare
    for (let i = 20; i < 30; i++) {
        categoryScores['Employee Welfare'] += answers[i];
    }
    
    // Questions 30-39: Social Responsibility
    for (let i = 30; i < 40; i++) {
        categoryScores['Social Responsibility'] += answers[i];
    }
    
    // Questions 40-49: Customer Value
    for (let i = 40; i < 50; i++) {
        categoryScores['Customer Value'] += answers[i];
    }
    
    const totalScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0);
    
    return {
        total: totalScore,
        categories: categoryScores,
        packEligibility: determinePackEligibility(totalScore)
    };
}

function determinePackEligibility(score) {
    if (score >= 800) return 'platinum';
    if (score >= 700) return 'gold';
    if (score >= 600) return '100-std';
    if (score >= 500) return '50-std';
    if (score >= 400) return '25-std';
    if (score >= 300) return '15-std';
    return 'not-eligible';
}

// COMMISSION CALCULATION
function calculateCommissionSplit(transactionAmount, feePercentage) {
    // Transaction fee split: Platform 40%, AGG 20%, AFF 40%
    
    const transactionFee = transactionAmount * (feePercentage / 100);
    
    return {
        totalFee: transactionFee,
        platformShare: transactionFee * 0.40,
        aggShare: transactionFee * 0.20,
        affShare: transactionFee * 0.40,
        businessReceives: transactionAmount - transactionFee
    };
}

// CLIENTELE DELIVERY TRACKING
function trackClienteleDelivery(businessId, packLevel, currentClients, targetClients) {
    const progress = (currentClients / targetClients) * 100;
    const remaining = targetClients - currentClients;
    
    // Calculate estimated completion based on growth rate
    const monthlyGrowthRate = 150; // Average new clients per month per business
    const monthsToTarget = Math.ceil(remaining / monthlyGrowthRate);
    
    return {
        current: currentClients,
        target: targetClients,
        progress: Math.min(progress, 100),
        remaining: Math.max(remaining, 0),
        estimatedMonthsToTarget: remaining > 0 ? monthsToTarget : 0,
        status: progress >= 100 ? 'Target Achieved' : progress >= 75 ? 'On Track' : progress >= 50 ? 'Moderate Progress' : 'Needs Attention'
    };
}

// MYSTERY SHOPPER SCORING
function scheduleMysteryShopperEvaluation(businessId, sector) {
    // Mystery shopper evaluations happen quarterly
    // Score must remain above 80% or business risks suspension
    
    const evaluation = {
        businessId: businessId,
        sector: sector,
        scheduledDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        evaluationCriteria: [
            'Service speed and efficiency',
            'Staff professionalism and courtesy',
            'Cleanliness and presentation',
            'Adherence to quality standards',
            'Customer communication',
            'Problem resolution',
            'Value for money'
        ],
        passingScore: 80
    };
    
    console.log('Mystery shopper evaluation scheduled:', evaluation);
    return evaluation;
}

// AFF/AGG ASSIGNMENT LOGIC
function assignAffiliateToNewBusiness(businessCity, businessSector) {
    // Find AFF with:
    // 1. Capacity (currently managing < 50 businesses)
    // 2. Same or nearby city
    // 3. Experience in same sector (preferred but not required)
    // 4. High performance score
    
    // In production, query database:
    // SELECT * FROM affs 
    // WHERE city = businessCity OR region = businessRegion
    // AND active_businesses_count < 50
    // ORDER BY performance_score DESC, active_businesses_count ASC
    // LIMIT 1
    
    const selectedAff = {
        id: 'AFF-12345',
        name: 'Jean-Paul Kamga',
        city: businessCity,
        currentBusinessCount: 23,
        performanceScore: 92,
        avgClienteleDeliveryTime: '4.2 months',
        aggId: 'AGG-678'
    };
    
    console.log('Assigned AFF:', selectedAff);
    return selectedAff;
}

// REVENUE PROJECTION CALCULATOR
function projectRevenueGrowth(currentBusinesses, monthlyGrowthRate, months) {
    // Project revenue for next N months based on growth rate
    
    const projections = [];
    let businesses = currentBusinesses;
    
    for (let month = 1; month <= months; month++) {
        businesses += monthlyGrowthRate;
        
        const revenue = calculatePlatformRevenue(); // Use current distribution
        const projectedRevenue = (revenue.total / currentBusinesses) * businesses;
        
        projections.push({
            month: month,
            businesses: Math.round(businesses),
            monthlyRevenue: projectedRevenue,
            annualRunRate: projectedRevenue * 12
        });
    }
    
    return projections;
}

// EXPORT FUNCTIONS FOR REPORTS
function exportBusinessData() {
    // Export all business data to CSV
    console.log('Exporting business data to CSV...');
    alert('Business data exported successfully!\n\nFile: Q4Life_Businesses_' + new Date().toISOString().split('T')[0] + '.csv');
}

function exportRevenueReport() {
    // Export revenue report to PDF
    console.log('Generating revenue report...');
    alert('Revenue report generated successfully!\n\nFile: Q4Life_Revenue_Report_' + new Date().toISOString().split('T')[0] + '.pdf');
}

function exportCommissionReport() {
    // Export commission payouts for AGG/AFF network
    console.log('Generating commission report...');
    alert('Commission report generated successfully!\n\nFile: Q4Life_Commissions_' + new Date().toISOString().split('T')[0] + '.csv');
}

// Initialize dashboard on load
document.addEventListener('DOMContentLoaded', function() {
    // Calculate and display current revenue
    const revenue = calculatePlatformRevenue();
    console.log('Platform Revenue:', {
        monthly: '$' + (revenue.total / 1000000).toFixed(2) + 'M',
        annual: '$' + (revenue.annual / 1000000000).toFixed(2) + 'B',
        breakdown: {
            subscriptions: '$' + (revenue.subscriptions / 1000000).toFixed(2) + 'M',
            entryFees: '$' + (revenue.entryFees / 1000000).toFixed(2) + 'M',
            transactions: '$' + (revenue.transactions / 1000000).toFixed(2) + 'M'
        }
    });
    
    // Project growth for next 12 months
    const projections = projectRevenueGrowth(60000, 2000, 12);
    console.log('12-Month Revenue Projections:', projections);
    
    // Example: At 1M businesses, monthly revenue would be:
    const at1Million = (revenue.total / 60000) * 1000000;
    console.log('Revenue at 1M businesses:', '$' + (at1Million / 1000000000).toFixed(2) + 'B/month');
});

// ALERT SYSTEM
function checkSystemAlerts() {
    // Monitor for critical events:
    // 1. Businesses falling below QoL threshold
    // 2. Failed mystery shopper evaluations
    // 3. Payment failures
    // 4. AFF not meeting clientele targets
    // 5. Customer complaints exceeding threshold
    
    const alerts = [
        {
            type: 'warning',
            business: 'QuickMove Logistics',
            message: 'Clientele target progress below 50% (1,200 / 1,500 clients)',
            action: 'Contact AFF to accelerate marketing'
        },
        {
            type: 'critical',
            business: 'FreshFood Market',
            message: 'Mystery shopper score: 72% (below 80% threshold)',
            action: 'Schedule quality improvement review'
        }
    ];
    
    return alerts;
}
