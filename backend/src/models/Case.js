const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Case = sequelize.define('Case', {
  // Primary Key
  case_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
    comment: 'Unique case identifier (UUID)',
  },
  
  // Links to source invoice
  invoice_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
    references: {
      model: 'invoices',
      key: 'invoice_id',
    },
    comment: 'Foreign key to invoices table',
  },
  tracking_no: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Shipment tracking number',
  },
  
  // Business Classification (LAYER 1 output)
  debt_category: {
    type: DataTypes.ENUM('CUSTOMS_DUTY', 'FREIGHT', 'ADMIN_FEES', 'PENALTIES'),
    allowNull: false,
    comment: 'Debt classification category',
  },
  debtor_type: {
    type: DataTypes.ENUM('B2B', 'B2C'),
    allowNull: false,
    comment: 'Business to Business or Business to Consumer',
  },
  
  // Debtor Info (parsed from invoice)
  debtor_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Name of the debtor',
  },
  debtor_gstin: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'GSTIN of the debtor',
  },
  debtor_phone: {
    type: DataTypes.STRING(15),
    allowNull: true,
    comment: 'Contact phone number',
  },
  debtor_email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Contact email address',
  },
  
  // Financials
  case_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: 'Total case amount',
  },
  dpd: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Days Past Due',
  },
  
  // Intelligence (LAYER 2 output)
  complexity_score: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: true,
    comment: 'Case complexity score',
  },
  recovery_probability: {
    type: DataTypes.DECIMAL(5, 3),
    allowNull: true,
    comment: 'Probability of successful recovery',
  },
  priority: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'HIGH, MEDIUM, LOW',
  },
  
  // DCA Assignment
  dca_id: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Assigned DCA identifier (e.g., DCA-AGILE-24)',
  },
  dca_admin_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'DCA Admin who accepted/manages this case',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  agent_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Assigned DCA agent working on this case',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  assigned_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'DCA assignment timestamp',
  },
  
  // Workflow Status
  status: {
    type: DataTypes.ENUM('NEW', 'ASSIGNED', 'CONTACTED', 'PROMISED', 'PARTIAL_PAYMENT', 'RECOVERED', 'WRITE_OFF'),
    allowNull: false,
    defaultValue: 'NEW',
    comment: 'Current case status',
  },
  
  // SLA Tracking
  first_contact_due: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'First contact deadline',
  },
  recovery_due: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Recovery deadline',
  },
  sla_warning_threshold: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'SLA warning threshold timestamp',
  },
  last_agent_check: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last agent check timestamp',
  },
  
  // Audit
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
    comment: 'Case creation timestamp',
  },
}, {
  tableName: 'cases',
  timestamps: true,
  indexes: [
    {
      name: 'idx_dca',
      fields: ['dca_id', 'status'],
    },
    {
      name: 'idx_priority',
      fields: ['priority', 'complexity_score'],
    },
    {
      name: 'idx_sla_deadline',
      fields: ['first_contact_due', 'status'],
    },
    {
      name: 'idx_recovery_due',
      fields: ['recovery_due', 'status'],
    },
  ],
});

module.exports = Case;
