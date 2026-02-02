/**
 * User model
 *
 * Represents application users including FedEx admins and DCA agents/managers.
 * Passwords stored in `password` MUST be hashed before creating the record;
 * controllers that create users currently use bcrypt for hashing.
 *
 * Available roles:
 * - FEDEX_ADMIN: full access to admin pages
 * - DCA_AGENT: agent-facing features and forum
 * - DCA_MANAGER: agency management
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
    type: DataTypes.ENUM('FEDEX_ADMIN', 'DCA_AGENT', 'DCA_MANAGER'),
    allowNull: false,
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: 'https://via.placeholder.com/40',
  },
  agencyId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
