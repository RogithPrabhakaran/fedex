/**
 * Comments controller
 *
 * Provides a minimal API for listing and creating comments on issues. The
 * controller enforces that the parent Issue exists before allowing comment
 * operations. Comments are ordered by creation time for thread-like display
 * in the frontend (agent forum view).
 */

const IssueComment = require('../models/IssueComment');
const Issue = require('../models/Issue');

const commentsController = {
  /**
   * GET /api/issues/:id/comments
   * List comments for the issue identified by :id. Returns 404 if the issue
   * cannot be found.
   */
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

  /**
   * POST /api/issues/:id/comments
   * Create a comment under the given issue id. The request body should
   * contain at minimum a `body` field with the comment text and `author_id`.
   */
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
