const express = require('express');
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);
router.get('/risk-thresholds', settingsController.getRiskThresholds);

// SLA definitions
router.get('/sla-definitions', settingsController.getSlaDefinitions);
router.put('/sla-definitions', settingsController.updateSlaDefinitions);

module.exports = router;
