#!/bin/bash

echo "🚀 Setting up FedEx DCA Manager Pro Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MySQL is running
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL is not installed or not in PATH. Please ensure MySQL is installed and running."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file..."
    cp .env .env.backup 2>/dev/null || true
    echo "Please configure your .env file with database and email settings."
    echo "Default database name: fedex_dca_db"
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure your .env file with database credentials"
echo "2. Create MySQL database: CREATE DATABASE fedex_dca_db;"
echo "3. Run: node runSeeds.js (to setup database and seed data)"
echo "4. Run: npm run dev (to start development server)"
echo ""
echo "Default login credentials:"
echo "FedEx Admin: admin@fedex.com / password123"
echo "DCA Agent: agent@dca.com / password123"
