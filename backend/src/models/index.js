const sequelize = require('../config/database');
const User = require('./User');
const Customer = require('./Customer');
const DcaAction = require('./DcaAction');
const EmailTemplate = require('./EmailTemplate');
const DcaAgency = require('./dcaAgencies');
const DcaPerformanceByType = require('./dcaAgencies');
const DcaSlaCompliance = require('./dcaAgencies');
const DcaCasesSummary = require('./dcaAgencies');
// Define associations
Customer.hasMany(DcaAction, { foreignKey: 'customerId', as: 'actions' });
DcaAction.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
DcaAgency.hasMany(DcaPerformanceByType, { foreignKey: 'dca_id' });
DcaPerformanceByType.belongsTo(DcaAgency, { foreignKey: 'dca_id' });

DcaAgency.hasMany(DcaSlaCompliance, { foreignKey: 'dca_id' });
DcaSlaCompliance.belongsTo(DcaAgency, { foreignKey: 'dca_id' });

DcaAgency.hasMany(DcaCasesSummary, { foreignKey: 'dca_id' });
DcaCasesSummary.belongsTo(DcaAgency, { foreignKey: 'dca_id' });
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
};
