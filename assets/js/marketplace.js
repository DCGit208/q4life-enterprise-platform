// Q4LIFE ALLEGRO MARKETPLACE - CORE LOGIC
// Complete business sectors, search, filtering, and display

// ========================================
// 1. ALL 15 BUSINESS SECTORS
// ========================================

const BUSINESS_SECTORS = [
    {
        id: 'food-dining',
        name: 'Food & Dining',
        icon: '🍽️',
        description: 'Restaurants, cafes, catering, bakeries, food delivery',
        businessCount: 8420,
        subcategories: ['Restaurants', 'Cafes & Coffee Shops', 'Catering Services', 'Bakeries', 'Food Delivery', 'Grocery Stores', 'Specialty Foods', 'Meal Prep Services']
    },
    {
        id: 'transportation',
        name: 'Transportation & Logistics',
        icon: '🚗',
        description: 'Taxi services, car rental, logistics, delivery, moving',
        businessCount: 5680,
        subcategories: ['Taxi & Ride-Hailing', 'Car Rental', 'Freight & Logistics', 'Moving Services', 'Courier & Delivery', 'Vehicle Maintenance', 'Car Wash & Detailing']
    },
    {
        id: 'healthcare',
        name: 'Healthcare & Wellness',
        icon: '🏥',
        description: 'Clinics, hospitals, wellness centers, fitness, nutrition',
        businessCount: 4320,
        subcategories: ['Medical Clinics', 'Dental Care', 'Mental Health', 'Fitness Centers', 'Nutrition & Dietetics', 'Physical Therapy', 'Wellness Spas', 'Home Healthcare']
    },
    {
        id: 'home-services',
        name: 'Home Services',
        icon: '🏠',
        description: 'Cleaning, repairs, maintenance, landscaping, security',
        businessCount: 7890,
        subcategories: ['House Cleaning', 'Plumbing', 'Electrical Services', 'HVAC', 'Pest Control', 'Landscaping', 'Home Security', 'General Repairs']
    },
    {
        id: 'professional-services',
        name: 'Professional Services',
        icon: '💼',
        description: 'Legal, accounting, consulting, HR, business services',
        businessCount: 3450,
        subcategories: ['Legal Services', 'Accounting & Tax', 'Business Consulting', 'HR Services', 'Marketing Agencies', 'IT Consulting', 'Financial Advisory', 'Virtual Assistants']
    },
    {
        id: 'education-training',
        name: 'Education & Training',
        icon: '📚',
        description: 'Schools, tutoring, professional training, courses',
        businessCount: 2980,
        subcategories: ['Private Schools', 'Tutoring Centers', 'Professional Training', 'Language Schools', 'Music & Arts', 'Technical Training', 'Online Courses', 'Career Coaching']
    },
    {
        id: 'real-estate-property',
        name: 'Real Estate & Property',
        icon: '🏢',
        description: 'Real estate agents, property management, rentals',
        businessCount: 2150,
        subcategories: ['Real Estate Agents', 'Property Management', 'Rental Services', 'Commercial Leasing', 'Property Development', 'Appraisal Services', 'Title & Escrow']
    },
    {
        id: 'beauty-personal-care',
        name: 'Beauty & Personal Care',
        icon: '💇',
        description: 'Salons, spas, barbers, cosmetics, skincare',
        businessCount: 6720,
        subcategories: ['Hair Salons', 'Barbershops', 'Nail Salons', 'Spas & Massage', 'Skincare Clinics', 'Cosmetics Stores', 'Personal Styling', 'Makeup Artists']
    },
    {
        id: 'entertainment-events',
        name: 'Entertainment & Events',
        icon: '🎉',
        description: 'Event planning, photography, entertainment, venues',
        businessCount: 1890,
        subcategories: ['Event Planning', 'Photography', 'Videography', 'Entertainment Services', 'Venues & Halls', 'DJ & Music', 'Catering Services', 'Decorations']
    },
    {
        id: 'agriculture-farming',
        name: 'Agriculture & Farming',
        icon: '🌾',
        description: 'Farms, agricultural supplies, produce, livestock',
        businessCount: 3260,
        subcategories: ['Crop Farming', 'Livestock', 'Agricultural Supplies', 'Organic Produce', 'Farm Equipment', 'Irrigation Services', 'Agricultural Consulting', 'Food Processing']
    },
    {
        id: 'construction-engineering',
        name: 'Construction & Engineering',
        icon: '🏗️',
        description: 'Construction, architecture, engineering, contracting',
        businessCount: 4580,
        subcategories: ['General Contracting', 'Architecture', 'Civil Engineering', 'Electrical Contracting', 'Plumbing Contracting', 'Roofing', 'Interior Design', 'Project Management']
    },
    {
        id: 'technology-it',
        name: 'Technology & IT Services',
        icon: '💻',
        description: 'Software, IT support, web development, tech solutions',
        businessCount: 2740,
        subcategories: ['Software Development', 'IT Support', 'Web Development', 'Cybersecurity', 'Cloud Services', 'Mobile Apps', 'Data Analytics', 'Tech Training']
    },
    {
        id: 'financial-services',
        name: 'Financial Services',
        icon: '💰',
        description: 'Banking, insurance, investment, lending, fintech',
        businessCount: 1680,
        subcategories: ['Banks & Credit Unions', 'Insurance', 'Investment Firms', 'Microfinance', 'Payment Services', 'Financial Planning', 'Tax Services', 'Lending Services']
    },
    {
        id: 'retail-shopping',
        name: 'Retail & Shopping',
        icon: '🛍️',
        description: 'Stores, boutiques, e-commerce, wholesale, markets',
        businessCount: 9840,
        subcategories: ['Clothing & Fashion', 'Electronics', 'Home Goods', 'Sporting Goods', 'Books & Media', 'Jewelry', 'Pet Supplies', 'Department Stores']
    },
    {
        id: 'hospitality-tourism',
        name: 'Hospitality & Tourism',
        icon: '🏨',
        description: 'Hotels, travel agencies, tour operators, resorts',
        businessCount: 2390,
        subcategories: ['Hotels & Resorts', 'Travel Agencies', 'Tour Operators', 'Vacation Rentals', 'Tourist Attractions', 'Travel Guides', 'Transportation Services', 'Cruise Services']
    }
];

// ========================================
// 2. SAMPLE FEATURED BUSINESSES (Demo Data)
// ========================================

const FEATURED_BUSINESSES = [
    {
        id: 1,
        name: 'Elite Car Detailing',
        sector: 'transportation',
        qolScore: 925,
        rating: 4.9,
        reviewCount: 342,
        description: 'Professional car detailing with eco-friendly products',
        location: 'Yaoundé',
        priceRange: '$$',
        image: '🚗',
        tags: ['Certified', 'Top Rated', 'Eco-Friendly']
    },
    {
        id: 2,
        name: 'FoodNet Organic Market',
        sector: 'food-dining',
        qolScore: 890,
        rating: 4.8,
        reviewCount: 567,
        description: 'Fresh organic produce and healthy meal prep',
        location: 'Douala',
        priceRange: '$$$',
        image: '🥗',
        tags: ['Certified', 'Organic', 'Delivery']
    },
    {
        id: 3,
        name: 'Wellness Plus Clinic',
        sector: 'healthcare',
        qolScore: 950,
        rating: 5.0,
        reviewCount: 289,
        description: 'Holistic healthcare and preventive medicine',
        location: 'Yaoundé',
        priceRange: '$$$',
        image: '🏥',
        tags: ['Certified', 'Top Rated', '24/7']
    },
    {
        id: 4,
        name: 'SparkleHome Cleaning',
        sector: 'home-services',
        qolScore: 875,
        rating: 4.7,
        reviewCount: 421,
        description: 'Professional home and office cleaning services',
        location: 'Bamenda',
        priceRange: '$$',
        image: '🏠',
        tags: ['Certified', 'Insured', 'Same-Day']
    },
    {
        id: 5,
        name: 'TechBridge Consulting',
        sector: 'professional-services',
        qolScore: 910,
        rating: 4.9,
        reviewCount: 156,
        description: 'Digital transformation and IT strategy consulting',
        location: 'Douala',
        priceRange: '$$$$',
        image: '💼',
        tags: ['Certified', 'Enterprise', 'Global']
    },
    {
        id: 6,
        name: 'Glow Beauty Spa',
        sector: 'beauty-personal-care',
        qolScore: 860,
        rating: 4.8,
        reviewCount: 734,
        description: 'Luxury spa and beauty treatments',
        location: 'Yaoundé',
        priceRange: '$$$',
        image: '💇',
        tags: ['Certified', 'Luxury', 'Organic']
    }
];

// ========================================
// 3. MARKETPLACE LOGIC
// ========================================

// Current filters
let currentFilters = {
    location: 'all',
    qolScore: 'all',
    sector: 'all',
    searchQuery: ''
};

// Initialize marketplace on page load
document.addEventListener('DOMContentLoaded', function() {
    renderSectors();
    renderFeaturedBusinesses();
});

// ========================================
// 4. RENDER FUNCTIONS
// ========================================

function renderSectors() {
    const sectorGrid = document.getElementById('sectorGrid');
    if (!sectorGrid) return;
    
    sectorGrid.innerHTML = BUSINESS_SECTORS.map(sector => `
        <a href="sector.html?id=${sector.id}" class="sector-card">
            <div class="sector-icon">${sector.icon}</div>
            <h3 style="color: #0a0e27; font-size: 1.5rem; margin-bottom: 0.75rem; font-weight: 700;">
                ${sector.name}
            </h3>
            <p style="color: #6b7280; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1rem;">
                ${sector.description}
            </p>
            <div class="business-count">
                ${sector.businessCount.toLocaleString()} businesses
            </div>
        </a>
    `).join('');
}

function renderFeaturedBusinesses() {
    const container = document.getElementById('featuredBusinesses');
    if (!container) return;
    
    container.innerHTML = FEATURED_BUSINESSES.map(business => `
        <div class="business-card" onclick="viewBusiness(${business.id})">
            <div class="business-image" style="background: linear-gradient(135deg, ${getColorForSector(business.sector)});">
                <span style="font-size: 4rem;">${business.image}</span>
                <div class="qol-badge">
                    ⭐ ${business.qolScore}
                </div>
            </div>
            <div class="business-info">
                <h3 style="color: #0a0e27; font-size: 1.35rem; margin-bottom: 0.5rem; font-weight: 700;">
                    ${business.name}
                </h3>
                <div class="rating">
                    <span>⭐ ${business.rating}</span>
                    <span style="color: #6b7280;">(${business.reviewCount} reviews)</span>
                </div>
                <p style="color: #6b7280; font-size: 0.95rem; margin-bottom: 1rem;">
                    ${business.description}
                </p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #f59e0b; font-weight: 700;">📍 ${business.location}</span>
                    <span style="color: #0a0e27; font-weight: 700;">${business.priceRange}</span>
                </div>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap;">
                    ${business.tags.map(tag => `
                        <span style="background: #fffbeb; color: #f59e0b; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
                            ${tag}
                        </span>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function getColorForSector(sectorId) {
    const colors = {
        'food-dining': '#f59e0b 0%, #d97706 100%',
        'transportation': '#2563eb 0%, #1e40af 100%',
        'healthcare': '#10b981 0%, #059669 100%',
        'home-services': '#8b5cf6 0%, #6d28d9 100%',
        'professional-services': '#6366f1 0%, #4f46e5 100%',
        'education-training': '#ec4899 0%, #be185d 100%',
        'real-estate-property': '#14b8a6 0%, #0d9488 100%',
        'beauty-personal-care': '#f43f5e 0%, #e11d48 100%',
        'entertainment-events': '#a855f7 0%, #7c3aed 100%',
        'agriculture-farming': '#84cc16 0%, #65a30d 100%',
        'construction-engineering': '#f97316 0%, #ea580c 100%',
        'technology-it': '#3b82f6 0%, #2563eb 100%',
        'financial-services': '#eab308 0%, #ca8a04 100%',
        'retail-shopping': '#ef4444 0%, #dc2626 100%',
        'hospitality-tourism': '#06b6d4 0%, #0891b2 100%'
    };
    return colors[sectorId] || '#6366f1 0%, #4f46e5 100%';
}

// ========================================
// 5. SEARCH & FILTER FUNCTIONS
// ========================================

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.toLowerCase();
    
    if (!query) {
        alert('Please enter a search term');
        return;
    }
    
    // In production, this would query the backend API
    console.log('Searching for:', query);
    
    // Redirect to sector page or search results
    // For now, show alert
    alert(`Searching for: "${query}"\n\nFound 234 businesses matching your search.\n\nThis will redirect to search results page in production.`);
}

function filterByLocation(location) {
    currentFilters.location = location;
    updateFilterChips();
    applyFilters();
}

function filterByScore(score) {
    currentFilters.qolScore = score;
    updateFilterChips();
    applyFilters();
}

function updateFilterChips() {
    // Update active state on filter chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    
    // This would be more sophisticated in production
    const activeChips = document.querySelectorAll('.filter-chip');
    activeChips.forEach(chip => {
        if (chip.textContent.toLowerCase().includes(currentFilters.location) ||
            chip.textContent.toLowerCase().includes(currentFilters.qolScore)) {
            chip.classList.add('active');
        }
    });
}

function applyFilters() {
    // In production, this would filter the displayed businesses
    console.log('Applying filters:', currentFilters);
    
    // Re-render businesses based on filters
    // For now, just log
    alert(`Filters applied:\nLocation: ${currentFilters.location}\nQoL Score: ${currentFilters.qolScore}+\n\nShowing filtered results...`);
}

// ========================================
// 6. BUSINESS INTERACTION FUNCTIONS
// ========================================

function viewBusiness(businessId) {
    // In production, redirect to business detail page
    const business = FEATURED_BUSINESSES.find(b => b.id === businessId);
    if (business) {
        alert(`Viewing: ${business.name}\n\nQoL Score: ${business.qolScore}\nRating: ${business.rating}/5\n\nThis will redirect to business profile page in production.`);
        // window.location.href = `business-profile.html?id=${businessId}`;
    }
}

function loadMoreBusinesses() {
    // In production, load more businesses from API
    alert('Loading more businesses...\n\nThis will fetch paginated results from the database.');
}

// ========================================
// 7. HOW BUSINESSES GET POPULATED
// ========================================

/*
BUSINESS POPULATION LOGIC:

1. NEW BUSINESS REGISTRATION:
   - Business owner visits business-portal.html
   - Completes 50-question QoL evaluation
   - Selects sector from 15 options + subcategory
   - Submits for certification

2. CERTIFICATION PROCESS:
   - Admin reviews application (business-admin.html)
   - Mystery shopper evaluation
   - QoL score calculated (0-1000)
   - If score > 600: APPROVED and added to marketplace
   - If score < 600: REJECTED or Business Development required

3. MARKETPLACE LISTING:
   - Approved business automatically appears in marketplace
   - Categorized under correct sector
   - Searchable by name, location, services
   - Ranked by QoL score + ratings

4. CLIENTELE DELIVERY:
   - AFF assigned to business
   - Marketing campaigns launched
   - Business appears in:
     * Sector browse pages
     * Search results
     * Featured listings (if high QoL score)
     * Location-based recommendations

5. DYNAMIC UPDATES:
   - Business QoL score updates quarterly
   - Reviews update in real-time
   - Featured status based on performance
   - Auto-suspension if score drops below threshold

DATABASE STRUCTURE:
businesses_table:
- id, name, sector_id, subcategory_id
- qol_score, rating, review_count
- location, address, phone, email
- description, images, services
- pack_level, certification_status
- created_at, last_updated

sectors_table:
- id, name, icon, description
- business_count (auto-calculated)

transactions_table:
- customer_id, business_id, amount
- platform_fee, status, date

reviews_table:
- customer_id, business_id, rating, comment
- verified_purchase, date
*/

// ========================================
// 8. MARKET LOGIC SUMMARY
// ========================================

/*
MARKET LOGIC:

SUPPLY SIDE (Businesses):
1. Register → Evaluate → Certify → List
2. Categorized into 15 sectors
3. Ranked by QoL score (600-1000)
4. Pay subscription (15%-100% STD packs)
5. Get clientele delivery guarantee

DEMAND SIDE (Customers):
1. Browse by sector OR search by keyword
2. Filter by location, QoL score, price
3. View business profiles (photos, reviews, QoL score)
4. Book/buy with buyer protection
5. Review experience → impacts business QoL score

PLATFORM ECONOMICS:
- Customers browse for FREE
- Businesses pay subscription + transaction fees
- Platform takes 10-25% of all transactions
- AGG/AFF earn commissions for clientele delivery
- Network effect: More businesses → More customers → More businesses

QUALITY ASSURANCE:
- Only QoL-certified businesses appear
- Mystery shopper audits
- Customer reviews impact scores
- Immediate suspension if quality drops
- Money-back guarantee for customers

GROWTH MECHANICS:
1. Start with 100 businesses (3 sectors)
2. Prove clientele delivery works
3. Expand to 15 sectors
4. Scale to 60,000+ businesses
5. $5-10B monthly GMV at scale
*/

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BUSINESS_SECTORS, FEATURED_BUSINESSES };
}
