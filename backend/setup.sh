#!/bin/bash

echo "🚀 Setting up Solve Backend API..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ Please edit .env file with your database configuration"
else
    echo "✅ .env file already exists"
fi

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed or not in PATH"
    echo "   Please install PostgreSQL and create a database named 'solve'"
else
    echo "✅ PostgreSQL found"
    
    # Try to create database (will fail if it already exists, which is fine)
    createdb solve 2>/dev/null || echo "✅ Database 'solve' already exists or could not be created"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your database configuration"
echo "2. Make sure PostgreSQL is running"
echo "3. Run 'pnpm run start:dev' to start the development server"
echo ""
echo "The API will be available at: http://localhost:3001/api"
echo "Health check: http://localhost:3001/api/health"
echo ""
echo "📚 See API.md for complete API documentation"