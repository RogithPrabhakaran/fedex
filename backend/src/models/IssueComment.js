/**
 * IssueComment model
 *
 * Stores threaded comments for an Issue. Used by the agent forum UI and the
 * admin issue detail screen.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const IssueComment = sequelize.define('IssueComment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  issue_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'issues', key: 'id' }
  },
  author_id: { type: DataTypes.STRING },
  author_name: { type: DataTypes.STRING },
  content: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'issue_comments',
  timestamps: false,
});

module.exports = IssueComment;
