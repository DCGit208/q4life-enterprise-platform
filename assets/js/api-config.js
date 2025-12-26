// Q4LIFE ALLEGRO - API CONFIGURATION
// Central API endpoint configuration

const API_CONFIG = {
    BASE_URL: 'http://localhost:3001/api',
    STRIPE_PUBLIC_KEY: 'pk_live_51S4PByJFVcOiuICpKXZ5oFjIWuhbZRNuFTBdBfk8II61iBhyOVhzQQJ22AUUM938xCLobMr23IVI8miaPEmsRYTj00yKjh6776',
    
    // API Endpoints
    ENDPOINTS: {
        // Authentication
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        VERIFY: '/auth/verify',
        
        // Business
        BUSINESS_APPLY: '/businesses/apply',
        BUSINESS_GET: '/businesses/:id',
        BUSINESS_UPDATE: '/businesses/:id',
        
        // Admin
        ADMIN_APPROVE: '/admin/businesses/:id/approve',
        ADMIN_BUSINESSES: '/admin/businesses',
        ADMIN_STATS: '/admin/stats',
        
        // Marketplace
        MARKETPLACE_SEARCH: '/marketplace/search',
        MARKETPLACE_SECTORS: '/marketplace/sectors',
        
        // Transactions
        CREATE_TRANSACTION: '/transactions',
        GET_TRANSACTIONS: '/transactions',
        
        // Health Check
        HEALTH: '/health'
    }
};

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
    
    // Add auth token if available
    const token = localStorage.getItem('q4life_token');
    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API request failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, apiCall };
}
