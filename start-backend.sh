#!/bin/bash
# Setup and run BOUALEM BOIS Backend

echo "🚀 Starting BOUALEM BOIS Backend..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js detected: $(node -v)"
echo ""

# Navigate to backend directory
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Start the server
echo "🎯 Starting server on http://localhost:3000"
echo "Press Ctrl+C to stop"
echo ""

npm start
