# FedEx DCA Manager Pro

A comprehensive debt collection management system connecting FedEx with Debt Collection Agencies (DCA). The application tracks customers with overdue payments, displays propensity rates, enables automated email communications, and manages the workflow from internal collection to DCA assignment and legal action.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Sequelize + MySQL
- **Authentication**: JWT-based authentication
- **Email**: Nodemailer integration for automated communications

## 🚀 Quick Start

1. **Clone and setup:**
   ```bash
   git clone <repository>
   cd fedex-dca-manager-pro
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Configure database:**
   - Install MySQL and create database: `CREATE DATABASE fedex_dca_db;`
   - Update `backend/.env` with your database credentials

3. **Initialize database:**
   ```bash
   cd backend
   node runSeeds.js
   ```

4. **Start services:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend  
   cd frontend
   npm run dev
   ```

5. **Access application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 👥 Default Users

After running seeds:
- **FedEx Admin**: `admin@fedex.com` / `password123`
- **DCA Agent**: `agent@dca.com` / `password123`

## 🔧 Features

### FedEx Admin Dashboard
- **Customer Overview**: Complete customer list with debt tracking
- **Propensity Scoring**: AI-powered repayment probability analysis
- **DCA Assignment**: Assign low-propensity customers to collection agencies
- **Email Campaigns**: Automated email communications with templates
- **Performance Monitoring**: Track DCA performance and recovery rates

### DCA Agent Dashboard
- **Recovery Queue**: View assigned customers requiring collection action
- **Action Logging**: Record calls, visits, legal notices, and recovery plans
- **Case Updates**: Update customer status and progress
- **Communication History**: Track all interactions with customers

### Email System
- **Template Management**: Create and manage email templates
- **Bulk Communications**: Send emails to multiple customers
- **Dynamic Content**: Placeholder replacement ({{ContactName}}, {{DebtAmount}}, etc.)
- **Delivery Tracking**: Monitor email delivery status

## 📊 Database Schema

### Core Tables
- **Users**: FedEx admins and DCA agents with role-based access
- **Customers**: Customer information, debt details, and propensity scores
- **DCA Actions**: Action log for all collection activities
- **Email Templates**: Reusable email templates with dynamic content

## 🔄 Workflow

1. **Customer Identification**: FedEx identifies customers with overdue payments
2. **Propensity Analysis**: System calculates repayment probability scores
3. **Internal Collection**: High-propensity customers handled internally
4. **DCA Assignment**: Low-propensity customers assigned to collection agencies
5. **Action Tracking**: DCA agents log all collection activities
6. **Status Updates**: Progress tracked from "New" to "Legal Action" or "Closed"
7. **Reporting**: Performance metrics and recovery rate analysis

## 🛠️ Development

### Backend Structure
```
backend/
├── src/
│   ├── controllers/     # API route handlers
│   ├── models/         # Sequelize database models
│   ├── routes/         # Express route definitions
│   ├── middleware/     # Authentication and validation
│   └── config/         # Database configuration
├── seeds/              # Database seed data
└── runSeeds.js        # Database initialization script
```

### Frontend Structure
```
frontend/
├── components/         # Reusable UI components
├── views/             # Page components
├── services/          # API and external service integrations
├── types.ts           # TypeScript type definitions
└── constants.ts       # Application constants
```

## 🔐 Security

- JWT-based authentication with secure token storage
- Role-based access control (FedEx Admin vs DCA Agent)
- Password hashing with bcryptjs
- Input validation and sanitization
- CORS configuration for cross-origin requests

## 📧 Email Configuration

Configure SMTP settings in `backend/.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production` in backend/.env
2. Configure production database credentials
3. Set secure JWT_SECRET
4. Configure production SMTP settings
5. Build frontend: `npm run build`
6. Deploy backend to your server
7. Serve frontend build files

### Environment Variables
```env
NODE_ENV=production
PORT=5000
DB_HOST=your_db_host
DB_NAME=fedex_dca_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_secure_jwt_secret
EMAIL_HOST=your_smtp_host
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software for FedEx internal use.
