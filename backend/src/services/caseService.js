const { Case, Invoice } = require('../models');
const { Op } = require('sequelize');

const caseService = {
  /**
   * Calculate priority score based on amount and ageing
   * AI Logic: 1 (Low) to 10 (Critical)
   * @param {number} totalAmount - Invoice total amount
   * @param {number} daysPastDue - Days past due date
   * @param {boolean} isCustomsDuty - Whether it's a customs duty case
   * @returns {number} - Priority score (1-10)
   */
  calculatePriorityScore(totalAmount, daysPastDue, isCustomsDuty = false) {
    let score = 5; // Base score

    // Amount factor (0-3 points)
    if (totalAmount > 100000) score += 3;
    else if (totalAmount > 50000) score += 2;
    else if (totalAmount > 10000) score += 1;

    // Ageing factor (0-3 points)
    if (daysPastDue > 90) score += 3;
    else if (daysPastDue > 60) score += 2;
    else if (daysPastDue > 30) score += 1;

    // Customs duty gets +2 priority
    if (isCustomsDuty) score += 2;

    // Cap at 10
    return Math.min(score, 10);
  },

  /**
   * Check for SLA deadline violations
   * @returns {Promise<Array>} - Cases that have passed SLA deadline
   */
  async checkSlaDeadlines() {
    return await Case.findAll({
      where: {
        sla_deadline: { [Op.lt]: new Date() },
        life_cycle_status: { [Op.notIn]: ['CLOSED'] },
      },
      include: [{
        model: Invoice,
        as: 'invoice',
      }],
      order: [['sla_deadline', 'ASC']],
    });
  },

  /**
   * Get stale cases (not touched in 7+ days)
   * @param {number} days - Number of days (default 7)
   * @returns {Promise<Array>} - Stale cases
   */
  async getStaleCases(days = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await Case.findAll({
      where: {
        last_touched_at: { [Op.lt]: cutoffDate },
        life_cycle_status: { [Op.notIn]: ['CLOSED'] },
      },
      include: [{
        model: Invoice,
        as: 'invoice',
      }],
      order: [['last_touched_at', 'ASC']],
    });
  },

  /**
   * Get all cases for a specific DCA agency
   * @param {number} agencyId - DCA agency ID
   * @returns {Promise<Array>} - Cases assigned to the agency
   */
  async getCasesByAgency(agencyId) {
    return await Case.findAll({
      where: { assigned_agency_id: agencyId },
      include: [{
        model: Invoice,
        as: 'invoice',
      }],
      order: [['priority_score', 'DESC']],
    });
  },

  /**
   * Get cases requiring immediate action (next_action_date < today)
   * @returns {Promise<Array>} - Cases requiring action
   */
  async getCasesRequiringAction() {
    return await Case.findAll({
      where: {
        next_action_date: { [Op.lt]: new Date() },
        life_cycle_status: { [Op.notIn]: ['CLOSED'] },
      },
      include: [{
        model: Invoice,
        as: 'invoice',
      }],
      order: [['priority_score', 'DESC'], ['next_action_date', 'ASC']],
    });
  },

  /**
   * Calculate recovery rate for a case
   * @param {number} totalAmount - Invoice total amount
   * @param {number} amountRecovered - Amount recovered so far
   * @returns {number} - Recovery rate as percentage
   */
  calculateRecoveryRate(totalAmount, amountRecovered) {
    if (totalAmount === 0) return 0;
    return (amountRecovered / totalAmount) * 100;
  },

  /**
   * Get cases by bucket category
   * @param {string} category - CUSTOMS, FREIGHT, or ADMIN
   * @returns {Promise<Array>} - Cases in the category
   */
  async getCasesByBucket(category) {
    return await Case.findAll({
      where: { bucket_category: category },
      include: [{
        model: Invoice,
        as: 'invoice',
      }],
      order: [['priority_score', 'DESC']],
    });
  },

  /**
   * Get performance metrics for an agency
   * @param {number} agencyId - DCA agency ID
   * @returns {Promise<Object>} - Performance metrics
   */
  async getAgencyPerformanceMetrics(agencyId) {
    const cases = await this.getCasesByAgency(agencyId);
    
    const totalCases = cases.length;
    const closedCases = cases.filter(c => c.life_cycle_status === 'CLOSED').length;
    const totalDebt = cases.reduce((sum, c) => sum + parseFloat(c.invoice.total_amount), 0);
    const totalRecovered = cases.reduce((sum, c) => sum + parseFloat(c.amount_recovered), 0);
    
    return {
      totalCases,
      closedCases,
      openCases: totalCases - closedCases,
      closureRate: totalCases > 0 ? (closedCases / totalCases) * 100 : 0,
      totalDebt,
      totalRecovered,
      recoveryRate: totalDebt > 0 ? (totalRecovered / totalDebt) * 100 : 0,
    };
  },
};

module.exports = caseService;
