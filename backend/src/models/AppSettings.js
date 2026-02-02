const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AppSettings = sequelize.define('AppSettings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  org_name: { type: DataTypes.STRING, defaultValue: 'FedEx Recovery' },
  notification_rules: { type: DataTypes.JSON, defaultValue: {} },
  risk_thresholds: { type: DataTypes.JSON, defaultValue: { low_max: 0.3, med_min: 0.31, med_max: 0.7, high_min: 0.71 } },
  auto_actions: { type: DataTypes.JSON, defaultValue: {} },
  commission_rate: { type: DataTypes.DECIMAL(5,2), defaultValue: 15.0 },
  sla_definitions: { type: DataTypes.JSON, defaultValue: {} },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'app_settings',
  timestamps: false,
});

module.exports = AppSettings;
