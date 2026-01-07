const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accountId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  contactEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  contactPhone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  region: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Negotiating', 'New', 'At Risk', 'Defaulted', 'Review', 'Legal Action', 'Closed'),
    allowNull: false,
    defaultValue: 'New',
  },
  totalDebt: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  daysOverdue: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  repaymentProbability: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50,
    validate: {
      min: 0,
      max: 100,
    },
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  assignedToDcaId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // CIN (Corporate Identification Number) for MCA API lookup
  cin: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // ML Model Input Fields
  invoice_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  payment_terms_days: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 30,
  },
  service_type: {
    type: DataTypes.ENUM('EXPRESS', 'GROUND', 'FREIGHT', 'INTERNATIONAL'),
    allowNull: true,
    defaultValue: 'GROUND',
  },
  recent_shipments_30d: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  recent_shipments_90d: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  ontime_delivery_rate_hist: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    defaultValue: 0.9,
    validate: {
      min: 0,
      max: 1,
    },
  },
  delivery_exceptions_90d: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  past_due_ratio_hist: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 1,
    },
  },
  dispute_rate_hist: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 1,
    },
  },
  reminder_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  credit_tier: {
    type: DataTypes.ENUM('LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK'),
    allowNull: true,
    defaultValue: 'MEDIUM_RISK',
  },
  credit_limit: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0,
  },
  outstanding_balance: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0,
  },
  utilization_at_invoice: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 2,
    },
  },
  // ML Model Output Fields
  ml_risk_score: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
  },
  ml_risk_category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ml_business_action: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ml_prediction: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Risk Model Output Fields
  risk_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  risk_verdict: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  risk_action: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Processing status
  last_analyzed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  analysis_status: {
    type: DataTypes.ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'),
    allowNull: true,
    defaultValue: 'PENDING',
  },
}, {
  tableName: 'customers',
  timestamps: true,
});

module.exports = Customer;
