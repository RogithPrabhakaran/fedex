# FedEx DCA Manager Pro - Backend

Backend API for the FedEx DCA Manager Pro application built with Node.js, Express, and Sequelize.

## Features

- User authentication (FedEx Admin & DCA Agent roles)
- Customer management with debt tracking
- DCA action logging and management
- Email template system with automated sending
- Propensity rate tracking
- MySQL database with Sequelize ORM

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MySQL database
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` file with your database and email configuration:
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=fedex_dca_db
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

3. Create MySQL database:
```sql
CREATE DATABASE fedex_dca_db;
```

4. Run database migrations and seed data:
```bash
node runSeeds.js
```

5. Start the server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### Propensity Model
- `POST /api/model/predict` - Run the payment propensity model on input features and return a structured JSON prediction.

Example request body (required fields):
```json
{
  "invoice_amount": 55000.0,
  "payment_terms_days": 30,
  "service_type": "GROUND",
  "recent_shipments_30d": 12,
  "recent_shipments_90d": 40,
  "ontime_delivery_rate_hist": 0.92,
  "delivery_exceptions_90d": 1,
  "past_due_ratio_hist": 0.15,
  "dispute_rate_hist": 0.05,
  "reminder_count": 0,
  "credit_tier": "MEDIUM_RISK",
  "credit_limit": 300000.0,
  "outstanding_balance": 80000.0,
  "utilization_at_invoice": 0.27
}
```

Response:
```json
{
  "success": true,
  "risk_score": 0.6478,
  "prediction": "ON_TIME",
  "risk_category": "MEDIUM_RISK",
  "business_action": "Monitor closely",
  "input_data": { ... }
}
```

Add a note that Python dependencies are required to run the predictor (joblib, pandas, numpy, scikit-learn).

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Customers
- `GET /api/customers` - Get all customers (with filters)
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `POST /api/customers/:id/assign-dca` - Assign customer to DCA

### DCA Actions
- `POST /api/dca/customers/:customerId/actions` - Create action for customer
- `GET /api/dca/customers/:customerId/actions` - Get actions for customer
- `PUT /api/dca/actions/:id` - Update action
- `DELETE /api/dca/actions/:id` - Delete action

### Email Templates
- `GET /api/emails/templates` - Get all templates
- `GET /api/emails/templates/:id` - Get template by ID
- `POST /api/emails/templates` - Create template
- `PUT /api/emails/templates/:id` - Update template
- `DELETE /api/emails/templates/:id` - Delete template
- `POST /api/emails/send` - Send emails to customers

## Default Users

After running seeds, you can login with:

**FedEx Admin:**
- Email: `admin@fedex.com`
- Password: `password123`

**DCA Agent:**
- Email: `agent@dca.com`
- Password: `password123`

## Database Schema

### Users
- id (UUID, Primary Key)
- email (String, Unique)
- password (String, Hashed)
- name (String)
- role (ENUM: FEDEX_ADMIN, DCA_AGENT)
- avatar (String)
- agencyId (String, Optional)

### Customers
- id (UUID, Primary Key)
- name (String)
- accountId (String, Unique)
- contactEmail (String)
- contactPhone (String)
- region (String)
- status (ENUM: Active, Negotiating, New, At Risk, Defaulted, Review, Legal Action, Closed)
- totalDebt (Decimal)
- daysOverdue (Integer)
- repaymentProbability (Integer, 0-100)
- notes (Text, Optional)
- assignedToDcaId (String, Optional)

### DCA Actions
- id (UUID, Primary Key)
- customerId (UUID, Foreign Key)
- type (ENUM: CALL, VISIT, LEGAL_NOTICE, RECOVERY_PLAN)
- date (Date)
- notes (Text)
- performedBy (String)

### Email Templates
- id (UUID, Primary Key)
- name (String)
- subject (String)
- body (Text)
- description (String)
- image (String, Optional)

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `node runSeeds.js` - Reset database and run seeds
