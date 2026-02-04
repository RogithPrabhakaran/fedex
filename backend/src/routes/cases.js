const express = require('express');
const caseController = require('../controllers/caseController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// ==================== CASE ROUTES ====================
router.get('/', caseController.getAllCases);
router.get('/stale', caseController.getStaleCases);
router.get('/agency/:agencyId', caseController.getCasesByAgency);
router.get('/:id', caseController.getCaseById);
router.get('/:id/logs', caseController.getCaseWithLogs);
router.post('/', caseController.createCase);
router.put('/:id', caseController.updateCase);
router.put('/:id/assign', caseController.assignCaseToAgency);
router.delete('/:id', caseController.deleteCase);

module.exports = router;
