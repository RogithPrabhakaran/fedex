/**
 * DcaAgency and related models
 *
 * The DcaAgency model stores DCA (agency) level metadata used by the
 * application: contact information, performance metrics, API tokens, capacity
 * limits and bank/payment related fields. Some fields (e.g. `bank_details`)
 * contain structured JSON and should be considered sensitive; consider
 * encrypting these fields in production or using a dedicated secrets store.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust path to your DB config

// DCA Agencies Model

const DcaAgency = sequelize.define(
  'DcaAgency',
  {
    dca_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    agency_name: { type: DataTypes.STRING, allowNull: false },
    short_name: { type: DataTypes.STRING },
    specialization: { type: DataTypes.STRING },
    regions: { type: DataTypes.STRING },
    contact_person: { type: DataTypes.STRING },
    contact_phone: { type: DataTypes.STRING },
    contact_email: { type: DataTypes.STRING },
    recovery_rate_overall: { type: DataTypes.DECIMAL(5, 2) },
    avg_days_to_recovery: { type: DataTypes.INTEGER },
    total_cases_handled: { type: DataTypes.BIGINT },
    commission_rate: { type: DataTypes.DECIMAL(5, 2) },
    min_case_amount: { type: DataTypes.DECIMAL(10, 2) },
    max_case_amount: { type: DataTypes.DECIMAL(10, 2) },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'WARNING', 'SUSPENDED'),
      defaultValue: 'ACTIVE',
    },
    performance_score: { type: DataTypes.DECIMAL(3, 1) },
    sla_first_contact_hours: { type: DataTypes.INTEGER },
    sla_recovery_days: { type: DataTypes.INTEGER },
    created_date: { type: DataTypes.DATEONLY },
    last_performance_review: { type: DataTypes.DATEONLY },
    api_endpoint: { type: DataTypes.STRING },
    api_auth_token: { type: DataTypes.STRING },
    is_preferred_partner: { type: DataTypes.BOOLEAN },
    notes: { type: DataTypes.TEXT },
  },
  {
    tableName: 'dca_agencies',
    timestamps: false,
  }
);

// Performance By Type Model

const DcaPerformanceByType = sequelize.define(
  'DcaPerformanceByType',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    dca_id: {
      type: DataTypes.STRING,
      references: {
        model: DcaAgency,
        key: 'dca_id',
      },
    },
    debt_category: { type: DataTypes.STRING },
    debtor_type: { type: DataTypes.STRING },
    debt_cause: { type: DataTypes.STRING },
    cases_handled: { type: DataTypes.INTEGER },
    recovered_amount: { type: DataTypes.DECIMAL(12, 2) },
    recovery_rate: { type: DataTypes.DECIMAL(5, 2) },
    avg_days_to_recovery: { type: DataTypes.INTEGER },
    avg_complexity_score: { type: DataTypes.DECIMAL(3, 1) },
    cost_per_recovery: { type: DataTypes.DECIMAL(5, 2) },
    sla_compliance_rate: { type: DataTypes.DECIMAL(5, 2) },
    last_updated: { type: DataTypes.DATEONLY },
  },
  {
    tableName: 'dca_performance_by_type',
    timestamps: false,
  }
);

// SLA Compliance Model

const DcaSlaCompliance = sequelize.define(
  'DcaSlaCompliance',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    dca_id: {
      type: DataTypes.STRING,
      references: {
        model: DcaAgency,
        key: 'dca_id',
      },
    },
    sla_type: { type: DataTypes.STRING },
    target_hours: { type: DataTypes.INTEGER },
    compliance_rate: { type: DataTypes.DECIMAL(5, 2) },
    total_checks: { type: DataTypes.INTEGER },
    breach_count: { type: DataTypes.INTEGER },
    last_breach_date: { type: DataTypes.DATEONLY, allowNull: true },
  },
  {
    tableName: 'dca_sla_compliance',
    timestamps: false,
  }
);

// Cases Summary Model

const DcaCasesSummary = sequelize.define(
  'DcaCasesSummary',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    dca_id: {
      type: DataTypes.STRING,
      references: {
        model: DcaAgency,
        key: 'dca_id',
      },
    },
    month_year: { type: DataTypes.STRING },
    total_cases_assigned: { type: DataTypes.INTEGER },
    cases_recovered: { type: DataTypes.INTEGER },
    recovered_amount: { type: DataTypes.DECIMAL(12, 2) },
    avg_recovery_days: { type: DataTypes.INTEGER },
    sla_breaches: { type: DataTypes.INTEGER },
    performance_trend: { type: DataTypes.STRING },
  },
  {
    tableName: 'dca_cases_summary',
    timestamps: false,
  }
);

module.exports = {
  DcaAgency,
  DcaPerformanceByType,
  DcaSlaCompliance,
  DcaCasesSummary,
};
