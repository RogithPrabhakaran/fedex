const express = require('express');
const emailController = require('../controllers/emailController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/templates', emailController.getAllTemplates);
router.get('/templates/:id', emailController.getTemplateById);
router.post('/templates', emailController.createTemplate);
router.put('/templates/:id', emailController.updateTemplate);
router.delete('/templates/:id', emailController.deleteTemplate);
router.post('/send', emailController.sendEmail);

module.exports = router;
