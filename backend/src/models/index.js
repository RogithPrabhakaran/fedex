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
const DcaAgent = require('./DcaAgent');
const DiscountRequest = require('./DiscountRequest');

const {
  DcaAgency,
  DcaPerformanceByType,
  DcaSlaCompliance,
  DcaCasesSummary,
} = require('./dcaAgencies');

// Define associations

// ===== NEW: User Role-Based Associations =====
// User self-referential (DCA_AGENT -> DCA_ADMIN)
User.hasMany(User, {
  foreignKey: 'parent_dca_admin_id',
  as: 'agents',
  onDelete: 'SET NULL',
});
User.belongsTo(User, {
  foreignKey: 'parent_dca_admin_id',
  as: 'dcaAdmin',
});

// DcaAgent -> User associations
DcaAgent.belongsTo(User, {
  foreignKey: 'dca_admin_id',
  as: 'dcaAdmin',
});
DcaAgent.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'userAccount',
});
User.hasMany(DcaAgent, {
  foreignKey: 'dca_admin_id',
  as: 'managedAgents',
});

// DcaAgency -> User (admin)
DcaAgency.belongsTo(User, {
  foreignKey: 'admin_user_id',
  as: 'admin',
});
User.hasOne(DcaAgency, {
  foreignKey: 'admin_user_id',
  as: 'managedAgency',
});

// Case -> DcaAgent (NEW: Cases reference DcaAgent, not User)
Case.belongsTo(DcaAgent, {
  foreignKey: 'agent_id',
  as: 'agent',
});
DcaAgent.hasMany(Case, {
  foreignKey: 'agent_id',
  as: 'assignedCases',
});

// Case -> User (DCA Admin)
Case.belongsTo(User, {
  foreignKey: 'dca_admin_id',
  as: 'dcaAdmin',
});
User.hasMany(Case, {
  foreignKey: 'dca_admin_id',
  as: 'managedCases',
});

// ===== Existing Associations =====
Customer.hasMany(DcaAction, { foreignKey: 'customerId', as: 'actions' });
DcaAction.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

// Customer --> DiscountRequest associations
Customer.hasMany(DiscountRequest, { foreignKey: 'customerId', as: 'discountRequests' });
DiscountRequest.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

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
  DcaAgent,
  DiscountRequest,
};
