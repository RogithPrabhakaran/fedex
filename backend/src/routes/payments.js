// backend/src/routes/payments.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Route: POST /api/payments/webhook
router.post('/webhook', paymentController.handleFedExPaymentWebhook);

module.exports = router;