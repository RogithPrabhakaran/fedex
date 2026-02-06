const express = require('express');
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', customerController.getAllCustomers);
// Get customers currently assigned to a DCA (optional ?dcaId=agency)
router.get('/assigned', customerController.getAssignedCustomers);
router.get('/:id/payment-info', customerController.getCustomerPaymentInfo);
router.get('/:id', customerController.getCustomerById);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);
router.post('/:id/assign-dca', customerController.assignToDca);
router.post('/assign-bulk', customerController.assignToDcaBulk);

module.exports = router;
