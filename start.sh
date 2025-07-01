#!/bin/bash

echo "🚢 Cargo Shipment Tracker Setup"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   You can start it with: sudo systemctl start mongod"
    echo "   Or: brew services start mongodb/brew/mongodb-community (on macOS)"
fi

echo "📦 Installing dependencies..."

# Install backend dependencies
echo "Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd cargo-shipment-tracker
npm install
cd ..

echo "✅ Dependencies installed!"

# Check if .env files exist
if [ ! -f .env ]; then
    echo "📝 Creating backend .env file..."
    cp .env.example .env
fi

if [ ! -f cargo-shipment-tracker/.env ]; then
    echo "📝 Creating frontend .env file..."
    cp cargo-shipment-tracker/.env.example cargo-shipment-tracker/.env
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. Start the backend server:"
echo "   npm start"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd cargo-shipment-tracker"
echo "   npm start"
echo ""
echo "The application will be available at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:5000"
