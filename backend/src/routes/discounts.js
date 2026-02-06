const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Create a new discount request
router.post('/', discountController.createDiscountRequest);

// Get all discount requests (with optional filters)
router.get('/', discountController.getDiscountRequests);

// Get discount requests for a specific customer
router.get('/customer/:customerId', discountController.getDiscountRequestsByCustomer);

// Update discount request status
router.put('/:id', discountController.updateDiscountRequest);

module.exports = router;
