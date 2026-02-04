const { CaseLog, Case } = require('../models');
const { Op } = require('sequelize');

const caseLogController = {
  // ==================== CASE LOG CRUD ====================

  async getAllCaseLogs(req, res) {
    try {
      const { case_id, actor, action_type, start_date, end_date } = req.query;
      const where = {};

      if (case_id) where.case_id = case_id;
      if (actor) where.actor = { [Op.like]: `%${actor}%` };
      if (action_type) where.action_type = action_type;
      
      // Date range filtering
      if (start_date || end_date) {
        where.created_at = {};
        if (start_date) where.created_at[Op.gte] = new Date(start_date);
        if (end_date) where.created_at[Op.lte] = new Date(end_date);
      }

      const logs = await CaseLog.findAll({
        where,
        include: [{
          model: Case,
          as: 'case',
        }],
        order: [['created_at', 'DESC']],
      });

      res.json(logs);
    } catch (error) {
      console.error('Get all case logs error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch case logs' });
    }
  },

  async getCaseLogById(req, res) {
    try {
      const log = await CaseLog.findByPk(req.params.id, {
        include: [{
          model: Case,
          as: 'case',
        }],
      });

      if (!log) {
        return res.status(404).json({ error: 'Case log not found' });
      }

      res.json(log);
    } catch (error) {
      console.error('Get case log by ID error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch case log' });
    }
  },

  async createCaseLog(req, res) {
    try {
      // Validate that the case exists
      const caseRecord = await Case.findByPk(req.body.case_id);
      if (!caseRecord) {
        return res.status(404).json({ error: 'Case not found' });
      }

      const log = await CaseLog.create(req.body);

      res.status(201).json(log);
    } catch (error) {
      console.error('Create case log error:', error);
      res.status(500).json({ error: error.message || 'Failed to create case log' });
    }
  },

  async updateCaseLog(req, res) {
    try {
      const [updated] = await CaseLog.update(req.body, {
        where: { log_id: req.params.id },
      });

      if (!updated) {
        return res.status(404).json({ error: 'Case log not found' });
      }

      const log = await CaseLog.findByPk(req.params.id);
      res.json(log);
    } catch (error) {
      console.error('Update case log error:', error);
      res.status(500).json({ error: error.message || 'Failed to update case log' });
    }
  },

  async deleteCaseLog(req, res) {
    try {
      const deleted = await CaseLog.destroy({
        where: { log_id: req.params.id },
      });

      if (!deleted) {
        return res.status(404).json({ error: 'Case log not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete case log error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete case log' });
    }
  },

  // Get logs for a specific case
  async getLogsByCase(req, res) {
    try {
      const { caseId } = req.params;
      const logs = await CaseLog.findAll({
        where: { case_id: caseId },
        order: [['created_at', 'DESC']],
      });

      res.json(logs);
    } catch (error) {
      console.error('Get logs by case error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch case logs' });
    }
  },

  // Create a status change log
  async createStatusChangeLog(req, res) {
    try {
      const { case_id, old_status, new_status, actor } = req.body;

      const caseRecord = await Case.findByPk(case_id);
      if (!caseRecord) {
        return res.status(404).json({ error: 'Case not found' });
      }

      const log = await CaseLog.create({
        case_id,
        actor: actor || 'System',
        action_type: 'STATUS_CHANGE',
        description: `Status changed from ${old_status} to ${new_status}`,
      });

      res.status(201).json(log);
    } catch (error) {
      console.error('Create status change log error:', error);
      res.status(500).json({ error: error.message || 'Failed to create status change log' });
    }
  },

  // Create a call log
  async createCallLog(req, res) {
    try {
      const { case_id, actor, description } = req.body;

      const caseRecord = await Case.findByPk(case_id);
      if (!caseRecord) {
        return res.status(404).json({ error: 'Case not found' });
      }

      const log = await CaseLog.create({
        case_id,
        actor: actor || 'Agency_User',
        action_type: 'CALL_LOG',
        description,
      });

      res.status(201).json(log);
    } catch (error) {
      console.error('Create call log error:', error);
      res.status(500).json({ error: error.message || 'Failed to create call log' });
    }
  },

  // Create a comment log
  async createCommentLog(req, res) {
    try {
      const { case_id, actor, description } = req.body;

      const caseRecord = await Case.findByPk(case_id);
      if (!caseRecord) {
        return res.status(404).json({ error: 'Case not found' });
      }

      const log = await CaseLog.create({
        case_id,
        actor: actor || 'Agency_User',
        action_type: 'COMMENT',
        description,
      });

      res.status(201).json(log);
    } catch (error) {
      console.error('Create comment log error:', error);
      res.status(500).json({ error: error.message || 'Failed to create comment log' });
    }
  },
};

module.exports = caseLogController;
