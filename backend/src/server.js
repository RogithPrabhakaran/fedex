const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Validate critical environment variables
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is required');
  process.exit(1);
}

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const dcaActionRoutes = require('./routes/dcaActions');
const dcaAgencyRoutes = require('./routes/dcaAgencies');
const emailRoutes = require('./routes/emails');
const modelRoutes = require('./routes/model');
const riskRoutes = require('./routes/riskRoutes');
const invoiceRoutes = require('./routes/invoices');
const caseRoutes = require('./routes/cases');
const caseLogRoutes = require('./routes/caseLogs');
const userRoutes = require('./routes/users');

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/dca', dcaActionRoutes);
app.use('/api/dca-agencies', dcaAgencyRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/model', modelRoutes);
app.use('/api/v1', riskRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/case-logs', caseLogRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Swagger docs
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling middleware (must be after all routes)
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Something went wrong!'
    : err.message || 'Something went wrong!';
  res.status(statusCode).json({ error: message });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server with retry logic for transient DB errors
const startServer = async () => {
  const retries = parseInt(process.env.DB_CONNECT_RETRIES || '5', 10);
  const delay = parseInt(process.env.DB_CONNECT_RETRY_DELAY || '2000', 10);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sequelize.authenticate();
      console.log('Database connection established successfully.');

      await sequelize.sync({ force: false });
      console.log('Database synchronized.');

      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
      return;
    } catch (error) {
      console.error(`Database connection attempt ${attempt} failed:`, error.message || error);
      if (attempt < retries) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error(`Failed to connect to database after ${retries} attempts.`);
        process.exit(1);
      }
    }
  }
};

startServer();
