#!/bin/bash

# ERAPPO PDF Service - Local Test Script
# Runs both services in parallel and provides test commands

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}ERAPPO PDF Service - Local Test${NC}"
echo -e "${BLUE}================================${NC}\n"

# Check if directories exist
if [ ! -d "$HOME/pdf-service" ]; then
    echo -e "${RED}Error: ~/pdf-service not found${NC}"
    exit 1
fi

if [ ! -d "$HOME/erappo/erappo" ]; then
    echo -e "${RED}Error: ~/erappo/erappo not found${NC}"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js found:${NC} $(node --version)"
echo -e "${GREEN}✓ npm found:${NC} $(npm --version)\n"

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"

echo -e "${BLUE}PDF Service:${NC}"
cd "$HOME/pdf-service"
npm install --silent 2>/dev/null || npm install

echo -e "${BLUE}Main App:${NC}"
cd "$HOME/erappo/erappo"
npm install --silent 2>/dev/null || npm install

echo -e "\n${GREEN}✓ Dependencies installed${NC}\n"

# Create env files if needed
echo -e "${YELLOW}Checking environment variables...${NC}"

if [ ! -f "$HOME/pdf-service/.env.local" ]; then
    echo -e "${YELLOW}Creating pdf-service/.env.local${NC}"
    cat > "$HOME/pdf-service/.env.local" << 'EOF'
PDF_SERVICE_SECRET=local-test-secret-key
NODE_ENV=development
EOF
fi

# Check main app env
MAIN_APP_ENV="$HOME/erappo/erappo/.env.local"
if grep -q "PDF_SERVICE_URL" "$MAIN_APP_ENV" 2>/dev/null; then
    echo -e "${GREEN}✓ PDF_SERVICE_URL already configured${NC}"
else
    echo -e "${YELLOW}Adding PDF_SERVICE_URL to main app .env.local${NC}"
    cat >> "$MAIN_APP_ENV" << 'EOF'

# PDF Service (Local Testing)
PDF_SERVICE_URL=http://localhost:3001/api/generate-pdf
PDF_SERVICE_SECRET=local-test-secret-key
EOF
fi

echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}\n"

echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo -e "${YELLOW}1. Start PDF Service (Terminal 1):${NC}"
echo "   cd ~/pdf-service && npm run dev"
echo ""
echo -e "${YELLOW}2. Start Main App (Terminal 2):${NC}"
echo "   cd ~/erappo/erappo && npm run dev"
echo ""
echo -e "${YELLOW}3. Test PDF Service (Terminal 3):${NC}"
echo "   curl http://localhost:3001/api/generate-pdf"
echo ""
echo -e "${YELLOW}4. Generate Test PDF:${NC}"
echo "   curl -X POST http://localhost:3001/api/generate-pdf \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -H 'X-PDF-Service-Secret: local-test-secret-key' \\"
echo "     -d '{\"templateName\":\"payslip\",\"data\":{\"employee\":{\"name\":\"John Doe\"},\"company\":{\"companyName\":\"ACME\"}}}' \\"
echo "     --output ~/Downloads/test.pdf && open ~/Downloads/test.pdf"
echo ""
echo -e "${BLUE}Services:${NC}"
echo "  • PDF Service: http://localhost:3001"
echo "  • Main App:    http://localhost:3000"
echo ""
echo -e "${BLUE}Docs:${NC}"
echo "  • Local Testing: ~/pdf-service/LOCAL_TESTING.md"
echo "  • Deployment:   ~/pdf-service/DEPLOYMENT.md"
echo ""
