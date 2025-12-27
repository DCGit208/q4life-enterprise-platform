#!/bin/bash
# Network API Endpoint Test Script
# Tests all new network management API endpoints

API_BASE="http://localhost:3001/api"
ADMIN_EMAIL="admin@q4life.com"
ADMIN_PASS="admin123"

echo "========================================"
echo "Q4Life Network API Endpoint Tests"
echo "========================================"
echo ""

# 1. Health Check
echo "1. Testing Health Check..."
curl -s "$API_BASE/health" | jq -r '.status' && echo "✅ Health check passed" || echo "❌ Health check failed"
echo ""

# 2. Login as Admin
echo "2. Logging in as Admin..."
TOKEN=$(curl -s -X POST "$API_BASE/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}" \
  | jq -r '.token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo "✅ Admin login successful"
    echo "Token: ${TOKEN:0:20}..."
else
    echo "❌ Admin login failed"
    exit 1
fi
echo ""

# 3. Test Admin Network Stats
echo "3. Testing Admin Network Stats..."
NETWORK_STATS=$(curl -s "$API_BASE/admin/network-stats" \
  -H "Authorization: Bearer $TOKEN")

echo "$NETWORK_STATS" | jq -r '
  "Total AAGs: \(.totalAggs)/\(.maxAggs)",
  "Total AFFs: \(.totalAffs)/\(.maxAffs)",
  "Total Clients: \(.totalClients)/\(.maxClients)",
  "Monthly Revenue: $\(.monthlyRevenue)",
  "Pending Commissions: $\(.pendingCommissions)"
'

if [ "$(echo "$NETWORK_STATS" | jq -r '.totalAggs')" != "null" ]; then
    echo "✅ Network stats endpoint working"
else
    echo "❌ Network stats endpoint failed"
fi
echo ""

# 4. Test AAG Dashboard (if test AAG exists)
echo "4. Testing AAG Dashboard..."
AAG_EMAIL="aag.test@q4life.com"
AAG_PASS="admin123"

AAG_TOKEN=$(curl -s -X POST "$API_BASE/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$AAG_EMAIL\",\"password\":\"$AAG_PASS\"}" \
  | jq -r '.token')

if [ "$AAG_TOKEN" != "null" ] && [ -n "$AAG_TOKEN" ]; then
    echo "✅ AAG login successful"
    
    AAG_DASHBOARD=$(curl -s "$API_BASE/aag/dashboard" \
      -H "Authorization: Bearer $AAG_TOKEN")
    
    echo "$AAG_DASHBOARD" | jq -r '
      "AAG Name: \(.name)",
      "Active Affiliates: \(.activeAffiliates)/\(.maxAffiliates)",
      "Total Clients: \(.totalClients)",
      "Monthly Revenue: $\(.monthlyRevenue)",
      "Commission Earned: $\(.commissionEarned)"
    '
    
    if [ "$(echo "$AAG_DASHBOARD" | jq -r '.name')" != "null" ]; then
        echo "✅ AAG dashboard endpoint working"
    else
        echo "❌ AAG dashboard endpoint failed"
    fi
else
    echo "⚠️  Test AAG account not found or login failed"
fi
echo ""

# 5. Test AFF Dashboard (if test AFF exists)
echo "5. Testing AFF Dashboard..."
AFF_EMAIL="aff.test@q4life.com"
AFF_PASS="admin123"

AFF_TOKEN=$(curl -s -X POST "$API_BASE/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$AFF_EMAIL\",\"password\":\"$AFF_PASS\"}" \
  | jq -r '.token')

if [ "$AFF_TOKEN" != "null" ] && [ -n "$AFF_TOKEN" ]; then
    echo "✅ AFF login successful"
    
    AFF_DASHBOARD=$(curl -s "$API_BASE/aff/dashboard" \
      -H "Authorization: Bearer $AFF_TOKEN")
    
    echo "$AFF_DASHBOARD" | jq -r '
      "AFF Name: \(.name)",
      "Rank: \(.rank)",
      "Referral Code: \(.referralCode)",
      "Active Clients: \(.activeClients)/\(.maxClients)",
      "Monthly Revenue: $\(.monthlyRevenue)",
      "Commission Earned: $\(.commissionEarned)"
    '
    
    if [ "$(echo "$AFF_DASHBOARD" | jq -r '.name')" != "null" ]; then
        echo "✅ AFF dashboard endpoint working"
    else
        echo "❌ AFF dashboard endpoint failed"
    fi
else
    echo "⚠️  Test AFF account not found or login failed"
fi
echo ""

echo "========================================"
echo "Test Summary"
echo "========================================"
echo ""
echo "All core network endpoints have been tested."
echo "Check the output above for any failures."
echo ""
echo "Next steps:"
echo "1. Visit http://localhost:8080/admin-network-overview.html"
echo "2. Login with admin@q4life.com / admin123"
echo "3. Explore the network management dashboards"
echo ""
