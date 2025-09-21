#!/bin/bash

# Financial Manager App - Quick Start Script
# This script helps you get started quickly with the application

echo "🚀 Financial Manager App - Quick Start"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your MongoDB Atlas credentials"
    echo "   You can find the template in env.example"
    read -p "Press Enter to continue after editing .env file..."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if MongoDB URI is configured
if grep -q "mongodb+srv://username:password" .env; then
    echo "⚠️  Please configure your MongoDB Atlas URI in .env file"
    echo "   Replace 'username', 'password', and 'cluster' with your actual values"
    read -p "Press Enter to continue after configuring MongoDB URI..."
fi

# Start the application
echo "🚀 Starting the application..."
echo "   Frontend: http://localhost:3000"
echo "   API Docs: http://localhost:3000/api-docs"
echo ""
echo "Press Ctrl+C to stop the application"
echo ""

npm run dev
