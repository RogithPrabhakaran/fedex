const sequelize = require('../config/database');
const User = require('./User');
const Customer = require('./Customer');
const DcaAction = require('./DcaAction');
const EmailTemplate = require('./EmailTemplate');
const Invoice = require('./Invoice');
const Case = require('./Case');
const CaseLog = require('./CaseLog');
const AgentAction = require('./AgentAction');
const SlaEvent = require('./SlaEvent');
const AppSettings = require('./AppSettings');
const Issue = require('./Issue');
const IssueComment = require('./IssueComment');

const {
  DcaAgency,
  DcaPerformanceByType,
  DcaSlaCompliance,
  DcaCasesSummary,
} = require('./dcaAgencies');

// Define associations
Customer.hasMany(DcaAction, { foreignKey: 'customerId', as: 'actions' });
DcaAction.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

DcaAgency.hasMany(DcaPerformanceByType, { foreignKey: 'dca_id' });
DcaPerformanceByType.belongsTo(DcaAgency, { foreignKey: 'dca_id' });

DcaAgency.hasMany(DcaSlaCompliance, { foreignKey: 'dca_id' });
DcaSlaCompliance.belongsTo(DcaAgency, { foreignKey: 'dca_id' });

DcaAgency.hasMany(DcaCasesSummary, { foreignKey: 'dca_id' });
DcaCasesSummary.belongsTo(DcaAgency, { foreignKey: 'dca_id' });

// Invoice -> Case -> CaseLog associations
Invoice.hasMany(Case, { foreignKey: 'invoice_id', as: 'cases' });
Case.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'invoice' });

Case.hasMany(CaseLog, { foreignKey: 'case_id', as: 'logs' });
CaseLog.belongsTo(Case, { foreignKey: 'case_id', as: 'case' });

Case.hasMany(AgentAction, { foreignKey: 'case_id', as: 'agentActions' });
AgentAction.belongsTo(Case, { foreignKey: 'case_id', as: 'case' });

Case.hasMany(SlaEvent, { foreignKey: 'case_id', as: 'slaEvents' });
SlaEvent.belongsTo(Case, { foreignKey: 'case_id', as: 'case' });

module.exports = {
  sequelize,
  User,
  Customer,
  DcaAction,
  EmailTemplate,
  DcaAgency,
  DcaPerformanceByType,
  DcaSlaCompliance,
  DcaCasesSummary,
  Invoice,
  Case,
  CaseLog,
  AgentAction,
  SlaEvent,
  AppSettings,
  Issue,
  IssueComment,
};
