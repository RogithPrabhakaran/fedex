const express = require('express');
const invoiceController = require('../controllers/invoiceController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// ==================== INVOICE ROUTES ====================
router.get('/', invoiceController.getAllInvoices);
router.get('/overdue', invoiceController.getOverdueInvoices);
router.get('/:id', invoiceController.getInvoiceById);
router.get('/:id/cases', invoiceController.getInvoiceWithCases);
router.post('/', invoiceController.createInvoice);
router.put('/:id', invoiceController.updateInvoice);
router.delete('/:id', invoiceController.deleteInvoice);

module.exports = router;
