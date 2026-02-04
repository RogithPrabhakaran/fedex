const { Case, Invoice, CaseLog } = require('../models');
const { Op } = require('sequelize');

const caseController = {
  // ==================== CASE CRUD ====================

  async getAllCases(req, res) {
    try {
      const { 
        status, 
        dca_id, 
        priority,
        debt_category,
        debtor_type,
        sla_overdue,
        limit = 100,
        offset = 0
      } = req.query;
      const where = {};

      if (status) where.status = status;
      if (dca_id) where.dca_id = dca_id;
      if (priority) where.priority = priority;
      if (debt_category) where.debt_category = debt_category;
      if (debtor_type) where.debtor_type = debtor_type;
      
      // Filter for SLA overdue cases
      if (sla_overdue === 'true') {
        where.first_contact_due = { [Op.lt]: new Date() };
      }

      const cases = await Case.findAll({
        where,
        include: [{
          model: Invoice,
          as: 'invoice',
        }],
        order: [['complexity_score', 'DESC'], ['first_contact_due', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json(cases);
    } catch (error) {
      console.error('Get all cases error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch cases' });
    }
  },

  async getCaseById(req, res) {
    try {
      const caseRecord = await Case.findByPk(req.params.id, {
        include: [{
          model: Invoice,
          as: 'invoice',
        }],
      });

      if (!caseRecord) {
        return res.status(404).json({ error: 'Case not found' });
      }

      res.json(caseRecord);
    } catch (error) {
      console.error('Get case by ID error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch case' });
    }
  },

  async createCase(req, res) {
    try {
      // Validate that the invoice exists
      const invoice = await Invoice.findByPk(req.body.invoice_id);
      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      const caseRecord = await Case.create(req.body);
      
      // Create initial log entry
      await CaseLog.create({
        case_id: caseRecord.case_id,
        actor: 'System',
        action_type: 'STATUS_CHANGE',
        description: `Case created with status: ${caseRecord.status}`,
      });

      res.status(201).json(caseRecord);
    } catch (error) {
      console.error('Create case error:', error);
      res.status(500).json({ error: error.message || 'Failed to create case' });
    }
  },

  async updateCase(req, res) {
    try {
      const oldCase = await Case.findByPk(req.params.id);
      if (!oldCase) {
        return res.status(404).json({ error: 'Case not found' });
      }

      const [updated] = await Case.update(req.body, {
        where: { case_id: req.params.id },
      });

      if (!updated) {
        return res.status(404).json({ error: 'Case not found' });
      }

      const caseRecord = await Case.findByPk(req.params.id);
      
      // Log status change if status was updated
      if (req.body.status && req.body.status !== oldCase.status) {
        await CaseLog.create({
          case_id: caseRecord.case_id,
          actor: req.user?.email || 'System',
          action_type: 'STATUS_CHANGE',
          description: `Status changed from ${oldCase.status} to ${caseRecord.status}`,
        });
      }

      res.json(caseRecord);
    } catch (error) {
      console.error('Update case error:', error);
      res.status(500).json({ error: error.message || 'Failed to update case' });
    }
  },

  async deleteCase(req, res) {
    try {
      const deleted = await Case.destroy({
        where: { case_id: req.params.id },
      });

      if (!deleted) {
        return res.status(404).json({ error: 'Case not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete case error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete case' });
    }
  },

  // Get case with all logs
  async getCaseWithLogs(req, res) {
    try {
      const caseRecord = await Case.findByPk(req.params.id, {
        include: [
          {
            model: Invoice,
            as: 'invoice',
          },
          {
            model: CaseLog,
            as: 'logs',
            order: [['created_at', 'DESC']],
          },
        ],
      });

      if (!caseRecord) {
        return res.status(404).json({ error: 'Case not found' });
      }

      res.json(caseRecord);
    } catch (error) {
      console.error('Get case with logs error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch case details' });
    }
  },

  // Assign case to DCA agency
  async assignCaseToAgency(req, res) {
    try {
      const { dca_id } = req.body;
      
      const caseRecord = await Case.findByPk(req.params.id);
      if (!caseRecord) {
        return res.status(404).json({ error: 'Case not found' });
      }

      await caseRecord.update({
        dca_id,
        status: 'ASSIGNED',
        assigned_at: new Date(),
      });

      // Log the assignment
      await CaseLog.create({
        case_id: caseRecord.case_id,
        actor: req.user?.email || 'System',
        action_type: 'STATUS_CHANGE',
        description: `Case assigned to DCA: ${dca_id}`,
      });

      res.json(caseRecord);
    } catch (error) {
      console.error('Assign case to agency error:', error);
      res.status(500).json({ error: error.message || 'Failed to assign case' });
    }
  },



  // Get stale cases (not assigned in 7+ days or overdue SLA)
  async getStaleCases(req, res) {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const cases = await Case.findAll({
        where: {
          [Op.or]: [
            { assigned_at: { [Op.lt]: sevenDaysAgo } },
            { first_contact_due: { [Op.lt]: new Date() } }
          ],
          status: { [Op.notIn]: ['RECOVERED', 'WRITE_OFF'] },
        },
        include: [{
          model: Invoice,
          as: 'invoice',
        }],
        order: [['assigned_at', 'ASC']],
      });

      res.json(cases);
    } catch (error) {
      console.error('Get stale cases error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch stale cases' });
    }
  },

  // Get cases by agency
  async getCasesByAgency(req, res) {
    try {
      const { agencyId } = req.params;
      const cases = await Case.findAll({
        where: { dca_id: agencyId },
        include: [{
          model: Invoice,
          as: 'invoice',
        }],
        order: [['complexity_score', 'DESC'], ['dpd', 'DESC']],
      });

      res.json(cases);
    } catch (error) {
      console.error('Get cases by agency error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch agency cases' });
    }
  },
};

module.exports = caseController;
