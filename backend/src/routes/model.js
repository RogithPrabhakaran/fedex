const express = require('express');
const modelController = require('../controllers/modelController');

const router = express.Router();

/**
 * @openapi
 * /api/model/predict:
 *   post:
 *     summary: Get repayment propensity prediction from the ML model
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Model input payload (see README for fields)
 *     responses:
 *       200:
 *         description: Model prediction result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/predict', modelController.predict);

module.exports = router;
