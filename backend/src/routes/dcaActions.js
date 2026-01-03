const express = require('express');
const dcaActionController = require('../controllers/dcaActionController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/customers/:customerId/actions', dcaActionController.createAction);
router.get('/customers/:customerId/actions', dcaActionController.getActionsByCustomer);
router.put('/actions/:id', dcaActionController.updateAction);
router.delete('/actions/:id', dcaActionController.deleteAction);

module.exports = router;
