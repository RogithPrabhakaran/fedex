const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  // Primary Key
  invoice_id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false,
    comment: 'Unique invoice identifier',
  },
  
  // FedEx CSV Columns (EXACT FedEx format)
  master_edi: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Master EDI reference number',
  },
  invoice_no: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Invoice number from FedEx',
  },
  invoice_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Invoice generation date',
  },
  type: {
    type: DataTypes.CHAR(1),
    allowNull: true,
    comment: 'O = Original',
  },
  settle: {
    type: DataTypes.CHAR(1),
    allowNull: true,
    comment: 'D = Demand/Overdue',
  },
  inv_charge: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: 'Line item amount',
  },
  trans_cnt: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '1 = single shipment',
  },
  tracking_no: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Shipment tracking number',
  },
  country: {
    type: DataTypes.CHAR(2),
    allowNull: true,
    comment: 'Country code (e.g., IN)',
  },
  balance_due: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: 'Outstanding balance amount',
  },
  payment_status: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'UNPAID, PARTIAL',
  },
  tax_id: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'GSTIN: 29ABCDE1234F1Z5',
  },
  awb_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Air Waybill number',
  },
  bill_of_entry: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Bill of entry reference',
  },
  duty_tax_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: 'Duty and tax amount',
  },
  
  // Aggregated (calculated from lines)
  total_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: 'Total invoice amount',
  },
  total_lines: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Number of line items',
  },
  
  // Audit
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Source CSV filename',
  },
  processed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
    comment: 'Processing timestamp',
  },
  csv_row_number: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Row number in source CSV',
  },
}, {
  tableName: 'invoices',
  timestamps: true,
  indexes: [
    {
      name: 'idx_tracking',
      fields: ['tracking_no'],
    },
    {
      name: 'idx_gstin',
      fields: ['tax_id'],
    },
    {
      name: 'idx_overdue',
      fields: ['payment_status', 'invoice_date'],
    },
  ],
});

module.exports = Invoice;
