const { CaseLog, Case } = require('../models');

const caseLogService = {
  /**
   * Create a status change log entry
   * @param {number} caseId - Case ID
   * @param {string} oldStatus - Previous status
   * @param {string} newStatus - New status
   * @param {string} actor - Who made the change
   * @returns {Promise<Object>} - Created log entry
   */
  async createStatusChangeLog(caseId, oldStatus, newStatus, actor = 'System') {
    const log = await CaseLog.create({
      case_id: caseId,
      actor,
      action_type: 'STATUS_CHANGE',
      description: `Status changed from ${oldStatus} to ${newStatus}`,
    });

    // Update case's last_touched_at
    await Case.update(
      { last_touched_at: new Date() },
      { where: { case_id: caseId } }
    );

    return log;
  },

  /**
   * Create a comment log entry
   * @param {number} caseId - Case ID
   * @param {string} comment - Comment text
   * @param {string} actor - Who made the comment
   * @returns {Promise<Object>} - Created log entry
   */
  async createCommentLog(caseId, comment, actor = 'Agency_User') {
    const log = await CaseLog.create({
      case_id: caseId,
      actor,
      action_type: 'COMMENT',
      description: comment,
    });

    // Update case's last_touched_at
    await Case.update(
      { last_touched_at: new Date() },
      { where: { case_id: caseId } }
    );

    return log;
  },

  /**
   * Create a call log entry
   * @param {number} caseId - Case ID
   * @param {string} callDetails - Call details/notes
   * @param {string} actor - Who made the call
   * @returns {Promise<Object>} - Created log entry
   */
  async createCallLog(caseId, callDetails, actor = 'Agency_User') {
    const log = await CaseLog.create({
      case_id: caseId,
      actor,
      action_type: 'CALL_LOG',
      description: callDetails,
    });

    // Update case's last_touched_at
    await Case.update(
      { last_touched_at: new Date() },
      { where: { case_id: caseId } }
    );

    return log;
  },

  /**
   * Get all logs for a specific case
   * @param {number} caseId - Case ID
   * @param {number} limit - Maximum number of logs to return (optional)
   * @returns {Promise<Array>} - Array of log entries
   */
  async getLogsByCase(caseId, limit = null) {
    const options = {
      where: { case_id: caseId },
      order: [['created_at', 'DESC']],
    };

    if (limit) {
      options.limit = limit;
    }

    return await CaseLog.findAll(options);
  },

  /**
   * Get logs by action type
   * @param {string} actionType - Action type (STATUS_CHANGE, COMMENT, CALL_LOG)
   * @param {Date} startDate - Start date (optional)
   * @param {Date} endDate - End date (optional)
   * @returns {Promise<Array>} - Array of log entries
   */
  async getLogsByActionType(actionType, startDate = null, endDate = null) {
    const where = { action_type: actionType };

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at[Op.gte] = startDate;
      if (endDate) where.created_at[Op.lte] = endDate;
    }

    return await CaseLog.findAll({
      where,
      order: [['created_at', 'DESC']],
    });
  },

  /**
   * Get logs by actor
   * @param {string} actor - Actor name/email
   * @param {number} limit - Maximum number of logs to return (optional)
   * @returns {Promise<Array>} - Array of log entries
   */
  async getLogsByActor(actor, limit = null) {
    const options = {
      where: { actor },
      order: [['created_at', 'DESC']],
    };

    if (limit) {
      options.limit = limit;
    }

    return await CaseLog.findAll(options);
  },

  /**
   * Get activity summary for a case
   * @param {number} caseId - Case ID
   * @returns {Promise<Object>} - Activity summary
   */
  async getCaseActivitySummary(caseId) {
    const logs = await this.getLogsByCase(caseId);
    
    const summary = {
      totalLogs: logs.length,
      statusChanges: logs.filter(l => l.action_type === 'STATUS_CHANGE').length,
      comments: logs.filter(l => l.action_type === 'COMMENT').length,
      callLogs: logs.filter(l => l.action_type === 'CALL_LOG').length,
      lastActivity: logs.length > 0 ? logs[0].created_at : null,
      uniqueActors: [...new Set(logs.map(l => l.actor))],
    };

    return summary;
  },
};

module.exports = caseLogService;
