#!/bin/bash
# Navigation Links Test Script
# Tests all internal navigation links for 404 errors

echo "🧪 Q4Life Navigation Links Test"
echo "================================"
echo ""

BASE_URL="http://localhost:8080"
BACKEND_URL="http://localhost:3001"
ERRORS=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test URL
test_url() {
    local url=$1
    local description=$2
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" == "200" ]; then
        echo -e "${GREEN}✓${NC} $description ($url)"
    elif [ "$response" == "000" ]; then
        echo -e "${YELLOW}⚠${NC} $description - Server not responding ($url)"
        ((ERRORS++))
    else
        echo -e "${RED}✗${NC} $description - HTTP $response ($url)"
        ((ERRORS++))
    fi
}

echo "Testing Frontend Pages..."
echo "-------------------------"
test_url "$BASE_URL/index.html" "Homepage"
test_url "$BASE_URL/marketplace.html" "Marketplace"
test_url "$BASE_URL/sector.html" "Sector Page"
test_url "$BASE_URL/business-portal.html" "Business Portal"
test_url "$BASE_URL/admin-dashboard.html" "Admin Dashboard"
test_url "$BASE_URL/customer-dashboard.html" "Customer Dashboard"
test_url "$BASE_URL/quote.html" "Quote Page"
test_url "$BASE_URL/contact-us.html" "Contact Us"
test_url "$BASE_URL/investors/index.html" "Investors Page"

echo ""
echo "Testing Division Pages..."
echo "-------------------------"
test_url "$BASE_URL/divisions/connect-enterprise.html" "Connect Division"
test_url "$BASE_URL/divisions/consult-enterprise.html" "Consult Division"
test_url "$BASE_URL/divisions/construct-enterprise.html" "Construct Division"
test_url "$BASE_URL/divisions/create-enterprise.html" "Create Division"
test_url "$BASE_URL/divisions/capital-enterprise.html" "Capital Division"
test_url "$BASE_URL/divisions/capabilities-enterprise.html" "Capabilities Division"
test_url "$BASE_URL/divisions/care-enterprise.html" "Care Division"
test_url "$BASE_URL/divisions/cultivate-enterprise.html" "Cultivate Division"
test_url "$BASE_URL/divisions/concierge-enterprise.html" "Concierge Division"
test_url "$BASE_URL/divisions/curate-enterprise.html" "Curate Division"

echo ""
echo "Testing Backend API..."
echo "----------------------"
test_url "$BACKEND_URL/api/health" "API Health Check"

echo ""
echo "Testing Assets..."
echo "-----------------"
test_url "$BASE_URL/assets/css/enterprise.css" "Enterprise CSS"
test_url "$BASE_URL/assets/js/api-config.js" "API Config"

echo ""
echo "================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! No broken links found.${NC}"
else
    echo -e "${RED}❌ Found $ERRORS error(s). Please review the output above.${NC}"
fi
echo ""
