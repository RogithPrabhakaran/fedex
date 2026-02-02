const Issue = require('../models/Issue');
const { Op } = require('sequelize');

const issuesController = {
  async listIssues(req, res) {
    try {
      const { status, priority, q } = req.query;
      const where = {};
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (q) {
        where[Op.or] = [
          { title: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
        ];
      }
      const issues = await Issue.findAll({ where, order: [['created_at', 'DESC']] });
      res.json(issues);
    } catch (error) {
      console.error('List issues error:', error);
      res.status(500).json({ error: 'Failed to list issues' });
    }
  },

  async getIssue(req, res) {
    try {
      const issue = await Issue.findByPk(req.params.id);
      if (!issue) return res.status(404).json({ error: 'Issue not found' });
      res.json(issue);
    } catch (error) {
      console.error('Get issue error:', error);
      res.status(500).json({ error: 'Failed to fetch issue' });
    }
  },

  async createIssue(req, res) {
    try {
      const newIssue = await Issue.create(req.body);
      res.status(201).json(newIssue);
    } catch (error) {
      console.error('Create issue error:', error);
      res.status(500).json({ error: 'Failed to create issue' });
    }
  },

  async updateIssue(req, res) {
    try {
      const [updated] = await Issue.update(req.body, { where: { id: req.params.id } });
      if (!updated) return res.status(404).json({ error: 'Issue not found' });
      const issue = await Issue.findByPk(req.params.id);
      res.json(issue);
    } catch (error) {
      console.error('Update issue error:', error);
      res.status(500).json({ error: 'Failed to update issue' });
    }
  },

  async deleteIssue(req, res) {
    try {
      const deleted = await Issue.destroy({ where: { id: req.params.id } });
      if (!deleted) return res.status(404).json({ error: 'Issue not found' });
      res.status(204).send();
    } catch (error) {
      console.error('Delete issue error:', error);
      res.status(500).json({ error: 'Failed to delete issue' });
    }
  }
};

module.exports = issuesController;
