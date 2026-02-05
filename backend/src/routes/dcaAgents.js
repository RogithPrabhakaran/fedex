const express = require('express');
const router = express.Router();
const dcaAgentController = require('../controllers/dcaAgentController');
const authenticate = require('../middleware/auth');
const { checkRole } = require('../middleware/roleMiddleware');

// All routes require authentication and DCA_ADMIN role
router.use(authenticate);
router.use(checkRole('DCA_ADMIN'));

// Agent CRUD
router.get('/', dcaAgentController.getAllAgents);
router.post('/', dcaAgentController.createAgent);
router.put('/:id', dcaAgentController.updateAgent);
router.delete('/:id', dcaAgentController.deleteAgent);

// Agent stats and progress
router.get('/:id/stats', dcaAgentController.getAgentStats);
router.get('/:id/progress', dcaAgentController.getAgentProgress);

module.exports = router;
