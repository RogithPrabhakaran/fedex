const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SlaEvent = sequelize.define('SlaEvent', {
  // Primary Key
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: 'Unique SLA event identifier',
  },
  
  // Links to case
  case_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'cases',
      key: 'case_id',
    },
    comment: 'Foreign key to cases table',
  },
  
  // Event Details
  event_type: {
    type: DataTypes.ENUM('sla_met', 'sla_warning', 'sla_breach', 'sla_escalated'),
    allowNull: false,
    comment: 'Type of SLA event',
  },
  
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Description of the SLA event',
  },
  
  alert_sent: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Whether an alert was sent for this event',
  },
  
  // Audit
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
    comment: 'Event timestamp',
  },
}, {
  tableName: 'sla_events',
  timestamps: false,
  indexes: [
    {
      name: 'idx_case_events',
      fields: ['case_id', 'event_type'],
    },
  ],
});

module.exports = SlaEvent;
