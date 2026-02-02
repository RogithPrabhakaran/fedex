/**
 * DCA Agency controller
 *
 * Provides management APIs for DCA agencies and their related summaries,
 * performance metrics, and SLA compliance records. Exposes endpoints for
 * listing agencies, regenerating API tokens, inviting/removing agents, and
 * CRUD for performance/SLA/case summary records.
 *
 * Important notes:
 * - `regenerateApiKey` produces a new UUID token stored on the agency row.
 * - `inviteAgent` currently returns a temporary password; production should
 *   send an email and not return plain credentials.
 */

const {
  DcaAgency,
  DcaPerformanceByType,
  DcaSlaCompliance,
  DcaCasesSummary,
} = require('../models/dcaAgencies');
const { Op } = require('sequelize');

const { v4: uuidv4 } = require('uuid');

const dcaAgencyController = {
  // ==================== DCA AGENCY CRUD ====================
  /**
   * GET /api/dca-agencies
   * Query parameters: status, specialization, region
   * Returns a list of agencies ordered by performance_score desc.
   */
  async getAllAgencies(req, res) {
    try {
      const { status, specialization, region } = req.query;
      const where = {};

      if (status) where.status = status;
      if (specialization) where.specialization = { [Op.like]: `%${specialization}%` };
      if (region) where.regions = { [Op.like]: `%${region}%` };

      const agencies = await DcaAgency.findAll({
        where,
        order: [['performance_score', 'DESC']],
      });

      res.json(agencies);
    } catch (error) {
      console.error('Get all agencies error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch agencies' });
    }
  },

  async getAgencyById(req, res) {
    try {
      const agency = await DcaAgency.findByPk(req.params.id);

      if (!agency) {
        return res.status(404).json({ error: 'Agency not found' });
      }

      res.json(agency);
    } catch (error) {
      console.error('Get agency by ID error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch agency' });
    }
  },

  async createAgency(req, res) {
    try {
      const agency = await DcaAgency.create(req.body);
      res.status(201).json(agency);
    } catch (error) {
      console.error('Create agency error:', error);
      res.status(500).json({ error: error.message || 'Failed to create agency' });
    }
  },

  async updateAgency(req, res) {
    try {
      const [updated] = await DcaAgency.update(req.body, {
        where: { dca_id: req.params.id },
      });

      if (!updated) {
        return res.status(404).json({ error: 'Agency not found' });
      }

      const agency = await DcaAgency.findByPk(req.params.id);
      res.json(agency);
    } catch (error) {
      console.error('Update agency error:', error);
      res.status(500).json({ error: error.message || 'Failed to update agency' });
    }
  },

  // Regenerate API auth token for agency
  async regenerateApiKey(req, res) {
    try {
      const agency = await DcaAgency.findByPk(req.params.id);
      if (!agency) return res.status(404).json({ error: 'Agency not found' });

      const newKey = uuidv4();
      await agency.update({ api_auth_token: newKey });
      res.json({ api_auth_token: newKey });
    } catch (error) {
      console.error('Regenerate API key error:', error);
      res.status(500).json({ error: 'Failed to regenerate API key' });
    }
  },

  async getAgencyAgents(req, res) {
    try {
      const User = require('../models/User');
      const agencyId = req.params.id;
      const agents = await User.findAll({ where: { agencyId, role: 'DCA_AGENT' } });
      res.json(agents);
    } catch (error) {
      console.error('Get agency agents error:', error);
      res.status(500).json({ error: 'Failed to fetch agents' });
    }
  },

  async inviteAgent(req, res) {
    try {
      const User = require('../models/User');
      const agencyId = req.params.id;
      const { name, email } = req.body;

      if (!email || !name) return res.status(400).json({ error: 'Name and email are required' });

      // Generate temporary password (in real app, send invite email)
      const tempPassword = uuidv4().split('-')[0] + 'A1!';
      const bcrypt = require('bcryptjs');
      const hashed = bcrypt.hashSync(tempPassword, 10);

      const user = await User.create({ name, email, password: hashed, role: 'DCA_AGENT', agencyId });
      // In production, send email with temp credentials
      res.status(201).json({ id: user.id, email: user.email, tempPassword });
    } catch (error) {
      console.error('Invite agent error:', error);
      res.status(500).json({ error: 'Failed to invite agent' });
    }
  },

  async removeAgent(req, res) {
    try {
      const User = require('../models/User');
      const deleted = await User.destroy({ where: { id: req.params.userId } });
      if (!deleted) return res.status(404).json({ error: 'Agent not found' });
      res.status(204).send();
    } catch (error) {
      console.error('Remove agent error:', error);
      res.status(500).json({ error: 'Failed to remove agent' });
    }
  },

  async deleteAgency(req, res) {
    try {
      const deleted = await DcaAgency.destroy({
        where: { dca_id: req.params.id },
      });

      if (!deleted) {
        return res.status(404).json({ error: 'Agency not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete agency error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete agency' });
    }
  },

  // Get agencies with performance details
  async getAgencyWithPerformance(req, res) {
    try {
      const agency = await DcaAgency.findByPk(req.params.id);

      if (!agency) {
        return res.status(404).json({ error: 'Agency not found' });
      }

      const performance = await DcaPerformanceByType.findAll({
        where: { dca_id: req.params.id },
      });

      const slaCompliance = await DcaSlaCompliance.findAll({
        where: { dca_id: req.params.id },
      });

      const casesSummary = await DcaCasesSummary.findAll({
        where: { dca_id: req.params.id },
        order: [['month_year', 'DESC']],
        limit: 12, // Last 12 months
      });

      res.json({
        agency,
        performance,
        slaCompliance,
        casesSummary,
      });
    } catch (error) {
      console.error('Get agency with performance error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch agency details' });
    }
  },

  // ==================== PERFORMANCE BY TYPE CRUD ====================

  async getAllPerformanceByType(req, res) {
    try {
      const { dca_id, debt_category, debtor_type } = req.query;
      const where = {};

      if (dca_id) where.dca_id = dca_id;
      if (debt_category) where.debt_category = debt_category;
      if (debtor_type) where.debtor_type = debtor_type;

      const performance = await DcaPerformanceByType.findAll({
        where,
        order: [['recovery_rate', 'DESC']],
      });

      res.json(performance);
    } catch (error) {
      console.error('Get all performance by type error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch performance data' });
    }
  },

  async getPerformanceByTypeById(req, res) {
    try {
      const performance = await DcaPerformanceByType.findByPk(req.params.id);

      if (!performance) {
        return res.status(404).json({ error: 'Performance record not found' });
      }

      res.json(performance);
    } catch (error) {
      console.error('Get performance by type by ID error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch performance record' });
    }
  },

  async createPerformanceByType(req, res) {
    try {
      // Validate that the DCA agency exists
      const agency = await DcaAgency.findByPk(req.body.dca_id);
      if (!agency) {
        return res.status(404).json({ error: 'DCA Agency not found' });
      }

      const performance = await DcaPerformanceByType.create(req.body);
      res.status(201).json(performance);
    } catch (error) {
      console.error('Create performance by type error:', error);
      res.status(500).json({ error: error.message || 'Failed to create performance record' });
    }
  },

  async updatePerformanceByType(req, res) {
    try {
      const [updated] = await DcaPerformanceByType.update(req.body, {
        where: { id: req.params.id },
      });

      if (!updated) {
        return res.status(404).json({ error: 'Performance record not found' });
      }

      const performance = await DcaPerformanceByType.findByPk(req.params.id);
      res.json(performance);
    } catch (error) {
      console.error('Update performance by type error:', error);
      res.status(500).json({ error: error.message || 'Failed to update performance record' });
    }
  },

  async deletePerformanceByType(req, res) {
    try {
      const deleted = await DcaPerformanceByType.destroy({
        where: { id: req.params.id },
      });

      if (!deleted) {
        return res.status(404).json({ error: 'Performance record not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete performance by type error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete performance record' });
    }
  },

  // ==================== SLA COMPLIANCE CRUD ====================

  async getAllSlaCompliance(req, res) {
    try {
      const { dca_id, sla_type } = req.query;
      const where = {};

      if (dca_id) where.dca_id = dca_id;
      if (sla_type) where.sla_type = sla_type;

      const slaCompliance = await DcaSlaCompliance.findAll({
        where,
        order: [['compliance_rate', 'ASC']], // Show worst performers first
      });

      res.json(slaCompliance);
    } catch (error) {
      console.error('Get all SLA compliance error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch SLA compliance data' });
    }
  },

  async getSlaComplianceById(req, res) {
    try {
      const slaCompliance = await DcaSlaCompliance.findByPk(req.params.id);

      if (!slaCompliance) {
        return res.status(404).json({ error: 'SLA compliance record not found' });
      }

      res.json(slaCompliance);
    } catch (error) {
      console.error('Get SLA compliance by ID error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch SLA compliance record' });
    }
  },

  async createSlaCompliance(req, res) {
    try {
      // Validate that the DCA agency exists
      const agency = await DcaAgency.findByPk(req.body.dca_id);
      if (!agency) {
        return res.status(404).json({ error: 'DCA Agency not found' });
      }

      const slaCompliance = await DcaSlaCompliance.create(req.body);
      res.status(201).json(slaCompliance);
    } catch (error) {
      console.error('Create SLA compliance error:', error);
      res.status(500).json({ error: error.message || 'Failed to create SLA compliance record' });
    }
  },

  async updateSlaCompliance(req, res) {
    try {
      const [updated] = await DcaSlaCompliance.update(req.body, {
        where: { id: req.params.id },
      });

      if (!updated) {
        return res.status(404).json({ error: 'SLA compliance record not found' });
      }

      const slaCompliance = await DcaSlaCompliance.findByPk(req.params.id);
      res.json(slaCompliance);
    } catch (error) {
      console.error('Update SLA compliance error:', error);
      res.status(500).json({ error: error.message || 'Failed to update SLA compliance record' });
    }
  },

  async deleteSlaCompliance(req, res) {
    try {
      const deleted = await DcaSlaCompliance.destroy({
        where: { id: req.params.id },
      });

      if (!deleted) {
        return res.status(404).json({ error: 'SLA compliance record not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete SLA compliance error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete SLA compliance record' });
    }
  },

  // ==================== CASES SUMMARY CRUD ====================

  async getAllCasesSummary(req, res) {
    try {
      const { dca_id, month_year } = req.query;
      const where = {};

      if (dca_id) where.dca_id = dca_id;
      if (month_year) where.month_year = month_year;

      const casesSummary = await DcaCasesSummary.findAll({
        where,
        order: [['month_year', 'DESC']],
      });

      res.json(casesSummary);
    } catch (error) {
      console.error('Get all cases summary error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch cases summary data' });
    }
  },

  async getCasesSummaryById(req, res) {
    try {
      const casesSummary = await DcaCasesSummary.findByPk(req.params.id);

      if (!casesSummary) {
        return res.status(404).json({ error: 'Cases summary record not found' });
      }

      res.json(casesSummary);
    } catch (error) {
      console.error('Get cases summary by ID error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch cases summary record' });
    }
  },

  async createCasesSummary(req, res) {
    try {
      // Validate that the DCA agency exists
      const agency = await DcaAgency.findByPk(req.body.dca_id);
      if (!agency) {
        return res.status(404).json({ error: 'DCA Agency not found' });
      }

      const casesSummary = await DcaCasesSummary.create(req.body);
      res.status(201).json(casesSummary);
    } catch (error) {
      console.error('Create cases summary error:', error);
      res.status(500).json({ error: error.message || 'Failed to create cases summary record' });
    }
  },

  async updateCasesSummary(req, res) {
    try {
      const [updated] = await DcaCasesSummary.update(req.body, {
        where: { id: req.params.id },
      });

      if (!updated) {
        return res.status(404).json({ error: 'Cases summary record not found' });
      }

      const casesSummary = await DcaCasesSummary.findByPk(req.params.id);
      res.json(casesSummary);
    } catch (error) {
      console.error('Update cases summary error:', error);
      res.status(500).json({ error: error.message || 'Failed to update cases summary record' });
    }
  },

  async deleteCasesSummary(req, res) {
    try {
      const deleted = await DcaCasesSummary.destroy({
        where: { id: req.params.id },
      });

      if (!deleted) {
        return res.status(404).json({ error: 'Cases summary record not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete cases summary error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete cases summary record' });
    }
  },
};

module.exports = dcaAgencyController;
