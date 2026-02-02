const IssueComment = require('../models/IssueComment');
const Issue = require('../models/Issue');

const commentsController = {
  async listComments(req, res) {
    try {
      const issueId = req.params.id;
      const issue = await Issue.findByPk(issueId);
      if (!issue) return res.status(404).json({ error: 'Issue not found' });

      const comments = await IssueComment.findAll({ where: { issue_id: issueId }, order: [['created_at', 'ASC']] });
      res.json(comments);
    } catch (error) {
      console.error('List comments error:', error);
      res.status(500).json({ error: 'Failed to list comments' });
    }
  },

  async createComment(req, res) {
    try {
      const issueId = req.params.id;
      const issue = await Issue.findByPk(issueId);
      if (!issue) return res.status(404).json({ error: 'Issue not found' });

      const payload = req.body;
      payload.issue_id = issueId;
      const comment = await IssueComment.create(payload);
      res.status(201).json(comment);
    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  }
};

module.exports = commentsController;
