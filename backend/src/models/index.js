const sequelize = require('../config/database');
const User = require('./User');
const Customer = require('./Customer');
const DcaAction = require('./DcaAction');
const EmailTemplate = require('./EmailTemplate');

// Define associations
Customer.hasMany(DcaAction, { foreignKey: 'customerId', as: 'actions' });
DcaAction.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

module.exports = {
  sequelize,
  User,
  Customer,
  DcaAction,
  EmailTemplate,
};
