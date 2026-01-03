const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DcaAction = sequelize.define('DcaAction', {
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
  type: {
    type: DataTypes.ENUM('CALL', 'VISIT', 'LEGAL_NOTICE', 'RECOVERY_PLAN'),
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  performedBy: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'dca_actions',
  timestamps: true,
});

module.exports = DcaAction;
