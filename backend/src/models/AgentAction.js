const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AgentAction = sequelize.define('AgentAction', {
  // Primary Key
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: 'Unique agent action identifier',
  },
  
  // Agent Information
  agent_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Name of the agent performing the action',
  },
  
  // Links to case
  case_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'cases',
      key: 'case_id',
    },
    comment: 'Foreign key to cases table',
  },
  
  // Action Details
  action_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Type of action performed by the agent',
  },
  
  reasoning: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reasoning behind the action',
  },
  
  gemini_response: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Response from Gemini AI',
  },
  
  success: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true,
    comment: 'Whether the action was successful',
  },
  
  // Audit
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
    comment: 'Action timestamp',
  },
}, {
  tableName: 'agent_actions',
  timestamps: false,
  indexes: [
    {
      name: 'idx_agent_case',
      fields: ['case_id'],
    },
  ],
});

module.exports = AgentAction;
