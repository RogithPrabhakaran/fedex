const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DcaAgent = sequelize.define('DcaAgent', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    comment: 'Auto-increment agent ID',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Agent full name',
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
    comment: 'Agent email address (unique)',
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Agent contact phone number',
  },
  dca_admin_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Parent DCA Admin (from Users table)',
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Optional: Linked User account for login',
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
    allowNull: false,
    defaultValue: 'ACTIVE',
    comment: 'Agent status',
  },
  assigned_cases_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of currently assigned cases',
  },
  recovery_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    comment: 'Recovery rate percentage (0.00 to 100.00)',
  },
}, {
  tableName: 'dca_agents',
  timestamps: true,
  indexes: [
    {
      fields: ['dca_admin_id'],
    },
    {
      fields: ['user_id'],
    },
    {
      fields: ['email'],
      unique: true,
    },
  ],
});

module.exports = DcaAgent;
