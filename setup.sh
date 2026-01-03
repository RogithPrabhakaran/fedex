#!/bin/bash

echo "🚀 Setting up FedEx DCA Manager Pro..."

# Setup Backend
echo "📦 Setting up backend..."
cd backend
npm install

# Check if .env exists, if not create from template
if [ ! -f .env ]; then
    echo "⚙️  Creating backend .env file..."
    echo "Please configure your .env file with database and email settings."
fi

# Setup Frontend
echo "📦 Setting up frontend..."
cd ../frontend
npm install

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure backend/.env with your database credentials"
echo "2. Create MySQL database: CREATE DATABASE fedex_dca_db;"
echo "3. Start backend: cd backend && node runSeeds.js && npm run dev"
echo "4. Start frontend: cd frontend && npm run dev"
echo ""
echo "Default login credentials:"
echo "FedEx Admin: admin@fedex.com / password123"
echo "DCA Agent: agent@dca.com / password123"
