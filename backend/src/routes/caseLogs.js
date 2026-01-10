const express = require('express');
const caseLogController = require('../controllers/caseLogController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// ==================== CASE LOG ROUTES ====================
router.get('/', caseLogController.getAllCaseLogs);
router.get('/case/:caseId', caseLogController.getLogsByCase);
router.get('/:id', caseLogController.getCaseLogById);
router.post('/', caseLogController.createCaseLog);
router.post('/status-change', caseLogController.createStatusChangeLog);
router.post('/call-log', caseLogController.createCallLog);
router.post('/comment', caseLogController.createCommentLog);
router.put('/:id', caseLogController.updateCaseLog);
router.delete('/:id', caseLogController.deleteCaseLog);

module.exports = router;
