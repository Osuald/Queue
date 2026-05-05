#!/bin/bash
# Artillery Setup Script for QueueCare

echo "========================================="
echo "Artillery Stress Testing Setup"
echo "========================================="

# Check if Artillery is installed globally
if ! command -v artillery &> /dev/null; then
    echo "Artillery not found globally. Installing..."
    npm install -g artillery
else
    echo "✓ Artillery is already installed"
fi

# Check if Artillery is in devDependencies
if ! grep -q "artillery" package.json; then
    echo "Adding Artillery to devDependencies..."
    npm install --save-dev artillery
else
    echo "✓ Artillery is already in package.json"
fi

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "To run stress tests:"
echo ""
echo "1. Start the backend server:"
echo "   cd backend && npm run dev"
echo ""
echo "2. In another terminal, start the frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "3. In another terminal, run the stress tests:"
echo "   # API stress test"
echo "   artillery run artillery-api.yml"
echo ""
echo "   # Frontend stress test"
echo "   artillery run artillery-frontend.yml"
echo ""
echo "4. View detailed reports:"
echo "   artillery run artillery-api.yml --output api-report.json"
echo "   artillery report api-report.json"
echo ""
echo "For more details, see ARTILLERY_GUIDE.md"
