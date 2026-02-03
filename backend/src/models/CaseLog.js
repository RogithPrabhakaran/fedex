const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CaseLog = sequelize.define('CaseLog', {
  log_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'Unique ID for this specific event',
  },
  case_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'cases',
      key: 'case_id',
    },
    comment: 'Foreign Key. Which case is this talking about?',
  },
  actor: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Who did this? (System, Agency_User, FedEx_Admin)',
  },
  action_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Event category: STATUS_CHANGE, COMMENT, CALL_LOG',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'The details (e.g., "Debtor said he is traveling until Monday")',
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Exact time the event happened',
  },
}, {
  tableName: 'case_logs',
  timestamps: false, // We're using created_at manually
  indexes: [
    {
      fields: ['case_id'],
    },
    {
      fields: ['actor'],
    },
    {
      fields: ['action_type'],
    },
    {
      fields: ['created_at'],
    },
  ],
});

module.exports = CaseLog;
