const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  invoice_id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false,
    comment: 'The unique bill number (e.g., INV-8821)',
  },
  customer_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Name of the person or company who owes money',
  },
  customer_email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true,
    },
    comment: 'Used for automated email reminders',
  },
  customer_phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Used by the DCA to make calls',
  },
  bill_of_entry_no: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Crucial Classifier. If this exists, it is a Customs Duty debt (High Priority)',
  },
  awb_no: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Air Waybill (Tracking Number). Used to check delivery status',
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'The total debt value',
  },
  amount_duty: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
    comment: 'The tax portion. DCAs use this to explain why the bill is high',
  },
  invoice_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'When the bill was generated',
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Calculation Field. Current Date - Due Date = Days Past Due (Ageing)',
  },
  pdf_link: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Secure URL to the original PDF invoice file',
  },
}, {
  tableName: 'invoices',
  timestamps: true,
  indexes: [
    {
      fields: ['customer_email'],
    },
    {
      fields: ['bill_of_entry_no'],
    },
    {
      fields: ['awb_no'],
    },
    {
      fields: ['due_date'],
    },
  ],
});

module.exports = Invoice;
