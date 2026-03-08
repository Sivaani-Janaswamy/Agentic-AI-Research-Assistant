#!/bin/bash
# -------------------------------
# Robust Backend Test Script
# Research Agentic AI
# -------------------------------

BASE_URL="http://127.0.0.1:8000"
EMAIL="testuser@example.com"
PASSWORD="StrongPass123"
FULL_NAME="Test User"
PDF_PATH="C:\Users\sivaa\Downloads\testpaper.pdf"
PASSED=0
FAILED=0

echo "🚀 Starting Backend Automated Test..."

# Helper function to run an endpoint test
test_endpoint() {
  NAME=$1
  CMD=$2
  echo "Testing: $NAME"
  OUT=$($CMD 2>&1) # capture errors too
  if [[ $OUT == *"error"* ]] || [[ $OUT == *"{"error":"* ]]; then
    echo "❌ $NAME FAILED"
    FAILED=$((FAILED+1))
    echo "Output: $OUT"
  else
    echo "✅ $NAME PASSED"
    PASSED=$((PASSED+1))
  fi
}

# 1️⃣ Signup
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\", \"full_name\": \"$FULL_NAME\"}")
echo "$RESPONSE"

# 2️⃣ Login
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$EMAIL&password=$PASSWORD")

# Extract JWT token from response
TOKEN=$(echo $RESPONSE | grep -oP '(?<="access_token":")[^"]+')
if [ -z "$TOKEN" ]; then
  echo "❌ Login failed. Cannot proceed."
  exit 1
fi
echo "✅ Login successful, token obtained."

# 3️⃣ Search Papers
test_endpoint "Search Papers" "curl -s -X GET \"$BASE_URL/api/papers/search?q=machine+learning\" -H \"Authorization: Bearer $TOKEN\""

# 4️⃣ Recent Papers
RECENT=$(curl -s -X GET "$BASE_URL/api/papers/recent" -H "Authorization: Bearer $TOKEN")
PAPER_ID=$(echo "$RECENT" | grep -oP '(?<="id":")[^"]+' | head -1)
test_endpoint "Recent Papers" "echo \"$RECENT\""

# 5️⃣ Paper Details
if [ -n "$PAPER_ID" ]; then
  test_endpoint "Paper Details" "curl -s -X GET \"$BASE_URL/api/papers/$PAPER_ID\" -H \"Authorization: Bearer $TOKEN\""
fi

# 6️⃣ Summarize PDF
if [ -f "$PDF_PATH" ]; then
  test_endpoint "Summarize PDF" "curl -s -X POST \"$BASE_URL/api/analysis/summarize\" -H \"Authorization: Bearer $TOKEN\" -F \"file=@$PDF_PATH\""
fi

# 7️⃣ Detect Research Gaps
test_endpoint "Detect Research Gaps" "curl -s -X POST \"$BASE_URL/api/analysis/detect-gaps\" -H \"Authorization: Bearer $TOKEN\" -H \"Content-Type: application/json\" -d '{\"topic\": \"computer vision\"}'"

# 8️⃣ Compare Papers
if [ -n "$PAPER_ID" ]; then
  test_endpoint "Compare Papers" "curl -s -X POST \"$BASE_URL/api/analysis/compare\" -H \"Authorization: Bearer $TOKEN\" -H \"Content-Type: application/json\" -d '{\"paper_ids\": [\"$PAPER_ID\"]}'"
fi

# 9️⃣ Add Favorite
if [ -n "$PAPER_ID" ]; then
  FAV_ADD=$(curl -s -X POST "$BASE_URL/api/user/favorites" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"paper_id\": \"$PAPER_ID\"}")
  FAV_ID=$(echo "$FAV_ADD" | grep -oP '(?<="id":")[^"]+')
  test_endpoint "Add Favorite" "echo \"$FAV_ADD\""
fi

# 🔟 Get Favorites
FAVS=$(curl -s -X GET "$BASE_URL/api/user/favorites" -H "Authorization: Bearer $TOKEN")
test_endpoint "Get Favorites" "echo \"$FAVS\""

# 1️⃣1️⃣ Delete Favorite
if [ -n "$FAV_ID" ]; then
  test_endpoint "Delete Favorite" "curl -s -X DELETE \"$BASE_URL/api/user/favorites/$FAV_ID\" -H \"Authorization: Bearer $TOKEN\""
fi

# 1️⃣2️⃣ Get History
test_endpoint "Get History" "curl -s -X GET \"$BASE_URL/api/user/history\" -H \"Authorization: Bearer $TOKEN\""

# 1️⃣3️⃣ Related Papers (Query)
test_endpoint "Related Papers (Query)" "curl -s -X GET \"$BASE_URL/api/papers/related?q=deep+learning\" -H \"Authorization: Bearer $TOKEN\""

# 1️⃣4️⃣ Related Papers (Paper ID)
if [ -n "$PAPER_ID" ]; then
  test_endpoint "Related Papers (Paper ID)" "curl -s -X GET \"$BASE_URL/api/papers/related?paper_id=$PAPER_ID\" -H \"Authorization: Bearer $TOKEN\""
fi

# Summary
echo "----------------------------"
echo "✅ Tests Passed: $PASSED"
echo "❌ Tests Failed: $FAILED"
echo "🚀 Backend testing complete!"