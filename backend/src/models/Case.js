const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Case = sequelize.define('Case', {
  case_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'Unique ID for internal tracking (e.g., 1001)',
  },
  invoice_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: 'invoices',
      key: 'invoice_id',
    },
    comment: 'Links to the Invoice. (The source of the debt)',
  },
  assigned_agency_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID of the DCA currently owning this case',
  },
  bucket_category: {
    type: DataTypes.ENUM('CUSTOMS', 'FREIGHT', 'ADMIN'),
    allowNull: false,
    comment: 'AI Classification: CUSTOMS, FREIGHT, ADMIN',
  },
  priority_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
    validate: {
      min: 1,
      max: 10,
    },
    comment: 'AI Logic: 1 (Low) to 10 (Critical). Based on amount & ageing',
  },
  life_cycle_status: {
    type: DataTypes.ENUM('OPEN', 'ASSIGNED', 'WIP', 'CLOSED', 'RECALLED'),
    allowNull: false,
    defaultValue: 'OPEN',
    comment: 'The Manager View (High Level): OPEN, ASSIGNED, WIP, CLOSED, RECALLED',
  },
  disposition_code: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'The Agent View (Granular Details): PTP, PTP_BROKEN, RTP, SKP, DNC, DISPUTE',
  },
  next_action_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'SLA Trigger: The "Snooze" button. If date < TODAY, alert the agent',
  },
  last_touched_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'SLA Watchdog: If this is > 7 days old, trigger a Slack Alert',
  },
  sla_deadline: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Hard Deadline: The date by which this must be closed (e.g., Day 45)',
  },
  amount_recovered: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Total money collected so far (allows for partial payments)',
  },
  notes_summary: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'A short summary of the latest log (e.g., "User traveling till Mon")',
  },
}, {
  tableName: 'cases',
  timestamps: true,
  indexes: [
    {
      fields: ['invoice_id'],
    },
    {
      fields: ['assigned_agency_id'],
    },
    {
      fields: ['life_cycle_status'],
    },
    {
      fields: ['bucket_category'],
    },
    {
      fields: ['priority_score'],
    },
    {
      fields: ['next_action_date'],
    },
    {
      fields: ['last_touched_at'],
    },
  ],
});

module.exports = Case;
