/**
 * AppSettings model
 *
 * Single-row configuration store for application-wide settings. The app uses
 * a single record (id=1) to hold global configuration such as risk
 * thresholds, notification rules, SLA definitions, commission rate, and other
 * admin-controlled values.
 *
 * Notes:
 * - Fields are stored as JSON where the structure can vary over time.
 * - Security-sensitive fields (e.g., payment/bank details) should be stored
 *   encrypted or managed via a secrets service; currently stored as JSON.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AppSettings = sequelize.define('AppSettings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  /**
   * Human-friendly organization name shown in the admin UI.
   */
  org_name: { type: DataTypes.STRING, defaultValue: 'FedEx Recovery' },
  /**
   * Notification rule configuration (channels, thresholds, recipients).
   * Stored as free-form JSON to allow future expansion.
   */
  notification_rules: { type: DataTypes.JSON, defaultValue: {} },
  /**
   * Risk thresholds used by the ML/prediction pipeline and UI.
   * Example shape: { low_max, med_min, med_max, high_min }
   */
  risk_thresholds: { type: DataTypes.JSON, defaultValue: { low_max: 0.3, med_min: 0.31, med_max: 0.7, high_min: 0.71 } },
  /**
   * Automatic action rules (e.g., auto-escalate, auto-email) configured by admin.
   */
  auto_actions: { type: DataTypes.JSON, defaultValue: {} },
  /**
   * Default commission rate applied to calculations; stored as decimal percentage.
   */
  commission_rate: { type: DataTypes.DECIMAL(5,2), defaultValue: 15.0 },
  /**
   * SLA definitions: an object or array describing available SLA templates used
   * by the SLA management UI and enforcement logic.
   */
  sla_definitions: { type: DataTypes.JSON, defaultValue: {} },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'app_settings',
  timestamps: false,
});

module.exports = AppSettings;
