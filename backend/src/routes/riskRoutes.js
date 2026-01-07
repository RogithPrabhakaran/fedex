const express = require('express');
const router = express.Router();
const mcaService = require('../services/mcaService');
const wbService = require('../services/worldBankService');
const riskModel = require('../services/riskModel');
const riskController = require('../controllers/riskController');

router.post('/assess-risk', async (req, res) => {
    try {
        const { cin } = req.body;
        
        if (!cin) {
            return res.status(400).json({ error: "CIN is required" });
        }

        // 1. Get Company Data
        const company = await mcaService.getCompanyData(cin);
        if (!company) {
            return res.status(404).json({ error: "CIN not found" });
        }

        // 2. Get Macro Data
        const gdp = await wbService.getCountryGDP('IND');

        // 3. Run Algorithm
        const analysis = riskModel.calculateRisk(company, gdp || 0);

        res.json({
            company: company.data.company_name,
            status: company.data.company_status,
            macro_context: gdp ? `India GDP 2023: $${(gdp / 1e12).toFixed(2)}T` : "GDP data unavailable",
            risk_profile: analysis
        });
    } catch (error) {
        console.error('Assess risk error:', error);
        res.status(500).json({ error: error.message || 'Failed to assess risk' });
    }
});

// New comprehensive analysis endpoints (recommended)
router.post('/customers/:id/analyze', riskController.analyzeCustomer);
router.post('/analyze-all', riskController.analyzeAllCustomers);

// Legacy endpoints (kept for backward compatibility)
router.post('/compute-risk-all', riskController.computeRiskForAll);
router.post('/customers/:id/compute-risk', riskController.computeRiskForCustomer);

module.exports = router;