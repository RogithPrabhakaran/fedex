const { Case, Invoice, CaseLog } = require('../models');
const { Op } = require('sequelize');

const caseController = {
  // ==================== CASE CRUD ====================

  async getAllCases(req, res) {
    try {
      const { 
        life_cycle_status, 
        assigned_agency_id, 
        bucket_category, 
        priority_score,
        sla_overdue 
      } = req.query;
      const where = {};

      if (life_cycle_status) where.life_cycle_status = life_cycle_status;
      if (assigned_agency_id) where.assigned_agency_id = assigned_agency_id;
      if (bucket_category) where.bucket_category = bucket_category;
      if (priority_score) where.priority_score = { [Op.gte]: priority_score };
      
      // Filter for SLA overdue cases
      if (sla_overdue === 'true') {
        where.sla_deadline = { [Op.lt]: new Date() };
      }

      const cases = await Case.findAll({
        where,
        include: [{
          model: Invoice,
          as: 'invoice',
        }],
        order: [['priority_score', 'DESC'], ['sla_deadline', 'ASC']],
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
        description: `Case created with status: ${caseRecord.life_cycle_status}`,
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
      if (req.body.life_cycle_status && req.body.life_cycle_status !== oldCase.life_cycle_status) {
        await CaseLog.create({
          case_id: caseRecord.case_id,
          actor: req.user?.email || 'System',
          action_type: 'STATUS_CHANGE',
          description: `Status changed from ${oldCase.life_cycle_status} to ${caseRecord.life_cycle_status}`,
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
      const { assigned_agency_id } = req.body;
      
      const caseRecord = await Case.findByPk(req.params.id);
      if (!caseRecord) {
        return res.status(404).json({ error: 'Case not found' });
      }

      await caseRecord.update({
        assigned_agency_id,
        life_cycle_status: 'ASSIGNED',
        last_touched_at: new Date(),
      });

      // Log the assignment
      await CaseLog.create({
        case_id: caseRecord.case_id,
        actor: req.user?.email || 'System',
        action_type: 'STATUS_CHANGE',
        description: `Case assigned to agency ID: ${assigned_agency_id}`,
      });

      res.json(caseRecord);
    } catch (error) {
      console.error('Assign case to agency error:', error);
      res.status(500).json({ error: error.message || 'Failed to assign case' });
    }
  },

  // Update case disposition
  async updateCaseDisposition(req, res) {
    try {
      const { disposition_code, notes_summary } = req.body;
      
      const caseRecord = await Case.findByPk(req.params.id);
      if (!caseRecord) {
        return res.status(404).json({ error: 'Case not found' });
      }

      await caseRecord.update({
        disposition_code,
        notes_summary,
        last_touched_at: new Date(),
      });

      // Log the disposition update
      await CaseLog.create({
        case_id: caseRecord.case_id,
        actor: req.user?.email || 'Agency_User',
        action_type: 'COMMENT',
        description: `Disposition updated to: ${disposition_code}. Notes: ${notes_summary}`,
      });

      res.json(caseRecord);
    } catch (error) {
      console.error('Update case disposition error:', error);
      res.status(500).json({ error: error.message || 'Failed to update disposition' });
    }
  },

  // Get stale cases (not touched in 7+ days)
  async getStaleCases(req, res) {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const cases = await Case.findAll({
        where: {
          last_touched_at: { [Op.lt]: sevenDaysAgo },
          life_cycle_status: { [Op.notIn]: ['CLOSED'] },
        },
        include: [{
          model: Invoice,
          as: 'invoice',
        }],
        order: [['last_touched_at', 'ASC']],
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
        where: { assigned_agency_id: agencyId },
        include: [{
          model: Invoice,
          as: 'invoice',
        }],
        order: [['priority_score', 'DESC']],
      });

      res.json(cases);
    } catch (error) {
      console.error('Get cases by agency error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch agency cases' });
    }
  },
};

module.exports = caseController;
