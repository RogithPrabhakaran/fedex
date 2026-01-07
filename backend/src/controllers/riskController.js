const riskService = require('../services/riskService');
const customerAnalysisService = require('../services/customerAnalysisService');

const riskController = {
  // New comprehensive analysis endpoint
  async analyzeCustomer(req, res) {
    try {
      const { id } = req.params;
      const result = await customerAnalysisService.analyzeCustomer(id);
      res.json(result);
    } catch (err) {
      console.error('analyzeCustomer failed', err);
      if (err.message === 'Customer not found') {
        return res.status(404).json({ error: err.message });
      }
      res.status(500).json({ error: err.message || 'Customer analysis failed' });
    }
  },

  // Analyze all customers
  async analyzeAllCustomers(req, res) {
    try {
      const results = await customerAnalysisService.analyzeAllCustomers();
      const successCount = results.filter(r => r.success).length;
      res.json({ 
        success: true, 
        total: results.length,
        successCount,
        failedCount: results.length - successCount,
        results 
      });
    } catch (err) {
      console.error('analyzeAllCustomers failed', err);
      res.status(500).json({ error: err.message || 'Bulk analysis failed' });
    }
  },

  // Legacy endpoints (kept for backward compatibility)
  async computeRiskForAll(req, res) {
    try {
      const results = await riskService.computeRiskForAll();
      res.json({ success: true, updatedCount: results.length, results });
    } catch (err) {
      console.error('computeRiskForAll failed', err);
      res.status(500).json({ error: 'Risk computation failed' });
    }
  },

  async computeRiskForCustomer(req, res) {
    try {
      const { id } = req.params;
      const result = await riskService.computeRiskForCustomerId(id);
      res.json({ success: true, ...result });
    } catch (err) {
      console.error('computeRiskForCustomer failed', err);
      if (err.message === 'Customer not found') return res.status(404).json({ error: err.message });
      res.status(500).json({ error: 'Risk computation failed' });
    }
  }
};

module.exports = riskController;
