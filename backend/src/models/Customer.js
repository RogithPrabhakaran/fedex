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
}, {
  tableName: 'customers',
  timestamps: true,
});

module.exports = Customer;
