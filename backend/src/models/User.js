/**
 * User model
 *
 * Represents application users in the 4-tier role system.
 * Passwords stored in `password` MUST be hashed before creating the record;
 * controllers that create users currently use bcrypt for hashing.
 *
 * Available roles:
 * - FEDEX_ADMIN: Full access to all cases and DCAs
 * - DCA_ADMIN: Manages one DCA agency and its agents (1 per agency)
 * - DCA_AGENT: Works on individually assigned cases
 * - CUSTOMER: Customer users who can view payment info and request discounts
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('FEDEX_ADMIN', 'DCA_ADMIN', 'DCA_AGENT', 'CUSTOMER'),
    allowNull: false,
    comment: 'User role: FEDEX_ADMIN (full access), DCA_ADMIN (1 per agency), DCA_AGENT (works on assigned cases), CUSTOMER (customer portal access)',
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: 'https://via.placeholder.com/40',
  },
  agencyId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Legacy field - use dca_id instead',
  },
  // New DCA Role-Based Fields
  dca_id: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'DCA identifier (e.g., DCA-AGILE-24). NULL for FEDEX_ADMIN',
  },
  parent_dca_admin_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Parent DCA Admin ID (for DCA_AGENT only)',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'PENDING', 'INACTIVE'),
    allowNull: false,
    defaultValue: 'ACTIVE',
    comment: 'User account status',
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
