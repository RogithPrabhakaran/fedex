const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DiscountRequest = sequelize.define('DiscountRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id',
    },
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contactEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  requestedAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    allowNull: false,
    defaultValue: 'PENDING',
  },
  approvedBy: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'discount_requests',
  timestamps: true,
  indexes: [
    {
      name: 'idx_customer',
      fields: ['customerId'],
    },
    {
      name: 'idx_status',
      fields: ['status'],
    },
  ],
});

module.exports = DiscountRequest;
