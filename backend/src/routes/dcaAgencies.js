const express = require('express');
const dcaAgencyController = require('../controllers/dcaAgencyController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// ==================== DCA AGENCY ROUTES ====================
router.get('/agencies', dcaAgencyController.getAllAgencies);
router.get('/agencies/:id', dcaAgencyController.getAgencyById);
router.get('/agencies/:id/performance', dcaAgencyController.getAgencyWithPerformance);
router.post('/agencies', dcaAgencyController.createAgency);
router.put('/agencies/:id', dcaAgencyController.updateAgency);
router.delete('/agencies/:id', dcaAgencyController.deleteAgency);

// ==================== PERFORMANCE BY TYPE ROUTES ====================
router.get('/performance', dcaAgencyController.getAllPerformanceByType);
router.get('/performance/:id', dcaAgencyController.getPerformanceByTypeById);
router.post('/performance', dcaAgencyController.createPerformanceByType);
router.put('/performance/:id', dcaAgencyController.updatePerformanceByType);
router.delete('/performance/:id', dcaAgencyController.deletePerformanceByType);

// ==================== SLA COMPLIANCE ROUTES ====================
router.get('/sla-compliance', dcaAgencyController.getAllSlaCompliance);
router.get('/sla-compliance/:id', dcaAgencyController.getSlaComplianceById);
router.post('/sla-compliance', dcaAgencyController.createSlaCompliance);
router.put('/sla-compliance/:id', dcaAgencyController.updateSlaCompliance);
router.delete('/sla-compliance/:id', dcaAgencyController.deleteSlaCompliance);

// ==================== CASES SUMMARY ROUTES ====================
router.get('/cases-summary', dcaAgencyController.getAllCasesSummary);
router.get('/cases-summary/:id', dcaAgencyController.getCasesSummaryById);
router.post('/cases-summary', dcaAgencyController.createCasesSummary);
router.put('/cases-summary/:id', dcaAgencyController.updateCasesSummary);
router.delete('/cases-summary/:id', dcaAgencyController.deleteCasesSummary);

module.exports = router;
