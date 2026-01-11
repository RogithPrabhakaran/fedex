const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust path to your DB config

// DCA Agencies Model

const DcaAgency = sequelize.define('DcaAgency', {
  // *** IDENTITY ***
  dca_id: { 
    type: DataTypes.STRING(255), 
    primaryKey: true, 
    allowNull: false 
  },
  agency_name: { 
    type: DataTypes.STRING(255), 
    allowNull: false 
  },
  short_name: { type: DataTypes.STRING(255) },
  
  // *** NEW ROUTING FIELDS (The "Brain" needs these) ***
  specialties: {
    type: DataTypes.JSON, 
    allowNull: true,
    defaultValue: [],
    comment: 'Array of skills e.g. ["CUSTOMS", "FREIGHT", "B2B"]'
  },
  tier_level: { 
    type: DataTypes.INTEGER, 
    defaultValue: 2,
    comment: '1=Elite (Best/Expensive), 2=Standard, 3=Volume (Cheap/CallCenter)'
  },
  monthly_capacity_limit: { 
    type: DataTypes.INTEGER, 
    defaultValue: 500 
  },
  current_active_load: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0,
    comment: 'Real-time count of open cases assigned to this agency'
  },

  // *** CONTACT & META ***
  contact_person: { type: DataTypes.STRING(255) },
  contact_email: { type: DataTypes.STRING(255) },
  contact_phone: { type: DataTypes.STRING(255) },
  regions: { type: DataTypes.STRING(255) },
  
  // *** PERFORMANCE SNAPSHOTS ***
  recovery_rate_overall: { type: DataTypes.DECIMAL(5, 2) },
  avg_days_to_recovery: { type: DataTypes.INTEGER },
  total_cases_handled: { type: DataTypes.BIGINT },
  performance_score: { type: DataTypes.DECIMAL(3, 1) },

  // *** FINANCIALS & CONFIG ***
  commission_rate: { type: DataTypes.DECIMAL(5, 2) },
  min_case_amount: { type: DataTypes.DECIMAL(10, 2) },
  max_case_amount: { type: DataTypes.DECIMAL(10, 2) },
  
  // *** SYSTEM STATUS ***
  status: { 
    type: DataTypes.ENUM('ACTIVE', 'WARNING', 'SUSPENDED'), 
    defaultValue: 'ACTIVE' 
  },
  api_endpoint: { type: DataTypes.STRING(255) },
  api_auth_token: { type: DataTypes.STRING(255) },
  is_preferred_partner: { type: DataTypes.BOOLEAN },
  notes: { type: DataTypes.TEXT },
  
  // *** DATES ***
  created_date: { type: DataTypes.DATEONLY },
  last_performance_review: { type: DataTypes.DATEONLY }

}, {
  tableName: 'dca_agencies',
  timestamps: false, 
});

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
