const express = require('express');
const issuesController = require('../controllers/issuesController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', issuesController.listIssues);
router.get('/:id', issuesController.getIssue);
router.post('/', issuesController.createIssue);
router.put('/:id', issuesController.updateIssue);
router.delete('/:id', issuesController.deleteIssue);

// Comments for issues (forum-style threads)
const commentsController = require('../controllers/commentsController');
router.get('/:id/comments', commentsController.listComments);
router.post('/:id/comments', commentsController.createComment);

module.exports = router;
