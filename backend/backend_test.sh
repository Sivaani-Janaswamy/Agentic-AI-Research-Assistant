#!/bin/bash
# -------------------------------
# Automated Backend Test Script
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

# 1️⃣ Signup
echo "1️⃣ Signup..."
RESPONSE=$(gemini request POST $BASE_URL/api/auth/signup \
  "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\", \"full_name\": \"$FULL_NAME\"}" \
  --header 'Content-Type: application/json')
echo "$RESPONSE"

# 2️⃣ Login
echo "2️⃣ Login..."
RESPONSE=$(gemini request POST $BASE_URL/api/auth/login \
  "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}" \
  --header 'Content-Type: application/json')

# Extract JWT token from response (adjust if JSON key is different)
TOKEN=$(echo $RESPONSE | grep -oP '(?<="access_token":")[^"]+')
if [ -z "$TOKEN" ]; then
  echo "❌ Login failed. Cannot proceed."
  exit 1
fi
echo "✅ Login successful, token obtained."

# Helper function to test endpoints
test_endpoint() {
  NAME=$1
  CMD=$2
  echo "Testing: $NAME"
  OUT=$(eval $CMD)
  if [[ $OUT == *"error"* ]]; then
    echo "❌ $NAME FAILED"
    FAILED=$((FAILED+1))
  else
    echo "✅ $NAME PASSED"
    PASSED=$((PASSED+1))
  fi
}

# 3️⃣ Search papers
test_endpoint "Search Papers" "gemini request GET \"$BASE_URL/api/papers/search?q=machine+learning\" --header \"Authorization: Bearer $TOKEN\""

# 4️⃣ Recent papers
RECENT=$(gemini request GET "$BASE_URL/api/papers/recent" --header "Authorization: Bearer $TOKEN")
PAPER_ID=$(echo $RECENT | grep -oP '(?<="id":")[^"]+' | head -1)
test_endpoint "Recent Papers" "echo \"$RECENT\""

# 5️⃣ Paper details
if [ -n "$PAPER_ID" ]; then
  test_endpoint "Paper Details" "gemini request GET \"$BASE_URL/api/papers/$PAPER_ID\" --header \"Authorization: Bearer $TOKEN\""
fi

# 6️⃣ Summarize PDF
if [ -f "$PDF_PATH" ]; then
  test_endpoint "Summarize PDF" "gemini request POST $BASE_URL/api/analysis/summarize --form \"file=@$PDF_PATH\" --header \"Authorization: Bearer $TOKEN\""
fi

# 7️⃣ Detect research gaps
test_endpoint "Detect Research Gaps" "gemini request POST $BASE_URL/api/analysis/detect-gaps '{\"topic\": \"computer vision\"}' --header \"Authorization: Bearer $TOKEN\" --header 'Content-Type: application/json'"

# 8️⃣ Compare papers (using PAPER_ID twice if only 1 available)
test_endpoint "Compare Papers" "gemini request POST $BASE_URL/api/analysis/compare '{\"paper_ids\": [\"$PAPER_ID\", \"$PAPER_ID\"]}' --header \"Authorization: Bearer $TOKEN\" --header 'Content-Type: application/json'"

# 9️⃣ Add favorite
test_endpoint "Add Favorite" "gemini request POST $BASE_URL/api/user/favorites '{\"paper_id\": \"$PAPER_ID\"}' --header \"Authorization: Bearer $TOKEN\" --header 'Content-Type: application/json'"

# 🔟 Get favorites
FAVS=$(gemini request GET $BASE_URL/api/user/favorites --header "Authorization: Bearer $TOKEN")
test_endpoint "Get Favorites" "echo \"$FAVS\""
FAV_ID=$(echo $FAVS | grep -oP '(?<="id":")[^"]+' | head -1)

# 1️⃣1️⃣ Delete favorite
if [ -n "$FAV_ID" ]; then
  test_endpoint "Delete Favorite" "gemini request DELETE $BASE_URL/api/user/favorites/$FAV_ID --header \"Authorization: Bearer $TOKEN\""
fi

# 1️⃣2️⃣ Get history
test_endpoint "Get History" "gemini request GET $BASE_URL/api/user/history --header \"Authorization: Bearer $TOKEN\""

# 1️⃣3️⃣ Related papers by query
test_endpoint "Related Papers (Query)" "gemini request GET \"$BASE_URL/api/papers/related?q=deep+learning\" --header \"Authorization: Bearer $TOKEN\""

# 1️⃣4️⃣ Related papers by paper ID
test_endpoint "Related Papers (Paper ID)" "gemini request GET \"$BASE_URL/api/papers/related?paper_id=$PAPER_ID\" --header \"Authorization: Bearer $TOKEN\""

# Summary
echo "----------------------------"
echo "✅ Tests Passed: $PASSED"
echo "❌ Tests Failed: $FAILED"
echo "🚀 Backend testing complete!"