const { Case, Invoice, CaseLog, DcaAgent } = require('../models');
const { Op } = require('sequelize');

const dashboardController = {
  /**
   * Get statistics for the DCA Admin dashboard
   * GET /api/dashboard/stats
   */
  async getStats(req, res) {
    try {
      const dcaAdminId = req.user.id; // User is logged-in DCA Admin
      console.log('Fetching stats for DCA Admin:', dcaAdminId);

      // Fundamental Stats
      const totalCases = await Case.count({ where: { dca_admin_id: dcaAdminId } });
      console.log('Total cases:', totalCases);

      const recoveredCases = await Case.count({ 
        where: { 
          dca_admin_id: dcaAdminId,
          status: 'RECOVERED'
        } 
      });
      console.log('Recovered cases:', recoveredCases);
      
      const recoveryRate = totalCases > 0 ? ((recoveredCases / totalCases) * 100).toFixed(1) : 0;

      // Cases by Status for Donut Chart
      console.log('Fetching status breakdown...');
      const statusBreakdown = await Case.findAll({
        where: { dca_admin_id: dcaAdminId },
        attributes: [
          'status',
          [Case.sequelize.fn('COUNT', Case.sequelize.col('case_id')), 'count']
        ],
        group: ['status'],
        raw: true
      });
      console.log('Status breakdown fetched');

      // Recovery Trend over last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      console.log('Fetching recovery trend...');
      // Note: check if case_amount or similar exists if amount_recovered doesn't
      const recoveryTrend = await Case.findAll({
        where: {
          dca_admin_id: dcaAdminId,
          status: 'RECOVERED',
          updatedAt: { [Op.gte]: sixMonthsAgo }
        },
        attributes: [
          [Case.sequelize.fn('DATE_FORMAT', Case.sequelize.col('updatedAt'), '%Y-%m'), 'month'],
          [Case.sequelize.fn('COUNT', Case.sequelize.col('case_id')), 'count'],
          [Case.sequelize.fn('SUM', Case.sequelize.col('case_amount')), 'amount'] // Using case_amount as fallback
        ],
        group: ['month'],
        order: [['month', 'ASC']],
        raw: true
      });
      console.log('Recovery trend fetched');

      // Top Performing Agents
      console.log('Fetching top agents...');
      const agents = await DcaAgent.findAll({
        where: { dca_admin_id: dcaAdminId },
        limit: 5,
        order: [['recovery_rate', 'DESC']]
      });
      console.log('Top agents fetched');

      res.json({
        stats: {
          totalCases,
          recoveredCases,
          recoveryRate: parseFloat(recoveryRate),
          totalRecovered: recoveryTrend.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
        },
        statusBreakdown: statusBreakdown.reduce((acc, curr) => {
          acc[curr.status] = parseInt(curr.count);
          return acc;
        }, {}),
        recoveryTrend: {
          months: recoveryTrend.map(t => t.month),
          counts: recoveryTrend.map(t => parseInt(t.count)),
          amounts: recoveryTrend.map(t => parseFloat(t.amount || 0))
        },
        topAgents: agents.map(a => ({
          name: a.name,
          recoveryRate: a.recovery_rate,
          cases: a.assigned_cases_count
        }))
      });

    } catch (error) {
      console.error('DCA Admin Dashboard Stats Error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard statistics', details: error.message });
    }
  }
};

module.exports = dashboardController;
