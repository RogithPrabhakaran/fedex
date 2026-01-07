const { Customer, DcaAction } = require('../models');
const { Op } = require('sequelize');
const Joi = require('joi');
const riskService = require('../services/riskService');

const customerController = {
  async getAllCustomers(req, res) {
    try {
      const { status, region, search } = req.query;
      const where = {};

      if (status) where.status = status;
      if (region) where.region = region;
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { accountId: { [Op.like]: `%${search}%` } },
          { contactEmail: { [Op.like]: `%${search}%` } },
        ];
      }

      const customers = await Customer.findAll({
        where,
        include: [{
          model: DcaAction,
          as: 'actions',
          separate: true,
          order: [['date', 'DESC']],
        }],
        order: [['updatedAt', 'DESC']],
      });

      res.json(customers);
    } catch (error) {
      console.error('Get all customers error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch customers' });
    }
  },

  async getCustomerById(req, res) {
    try {
      const customer = await Customer.findByPk(req.params.id, {
        include: [{
          model: DcaAction,
          as: 'actions',
          separate: true,
          order: [['date', 'DESC']],
        }],
      });

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      res.json(customer);
    } catch (error) {
      console.error('Get customer by ID error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch customer' });
    }
  },

  async createCustomer(req, res) {
    try {
      const customer = await Customer.create(req.body);
      // compute risk immediately for this new customer
      try {
        const { customer: updated } = await riskService.computeRiskForCustomerId(customer.id);
        return res.status(201).json(updated);
      } catch (err) {
        // risk compute failed but creation succeeded
        console.error('Risk compute after create failed', err);
        return res.status(201).json(customer);
      }
    } catch (error) {
      console.error('Create customer error:', error);
      res.status(500).json({ error: error.message || 'Failed to create customer' });
    }
  },

  async updateCustomer(req, res) {
    try {
      const [updated] = await Customer.update(req.body, {
        where: { id: req.params.id },
      });

      if (!updated) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      // re-run risk computation for this customer and return refreshed record
      try {
        const { customer } = await riskService.computeRiskForCustomerId(req.params.id);
        return res.json(customer);
      } catch (err) {
        console.error('Risk compute after update failed', err);
        const customer = await Customer.findByPk(req.params.id, {
          include: [{
            model: DcaAction,
            as: 'actions',
            separate: true,
            order: [['date', 'DESC']],
          }],
        });
        return res.json(customer);
      }
    } catch (error) {
      console.error('Update customer error:', error);
      res.status(500).json({ error: error.message || 'Failed to update customer' });
    }
  },

  async deleteCustomer(req, res) {
    try {
      const deleted = await Customer.destroy({
        where: { id: req.params.id },
      });

      if (!deleted) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete customer error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete customer' });
    }
  },

  async assignToDca(req, res) {
    try {
      const { dcaId } = req.body;
      
      const [updated] = await Customer.update(
        { assignedToDcaId: dcaId, status: 'Review' },
        { where: { id: req.params.id } }
      );

      if (!updated) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const customer = await Customer.findByPk(req.params.id);
      res.json(customer);
    } catch (error) {
      console.error('Assign to DCA error:', error);
      res.status(500).json({ error: error.message || 'Failed to assign customer to DCA' });
    }
  },

  // Bulk-assign a list of customers to a DCA agency
  async assignToDcaBulk(req, res) {
    try {
      const schema = Joi.object({
        customerIds: Joi.array().items(Joi.string()).min(1).required(),
        dcaId: Joi.string().required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const { customerIds, dcaId } = value;

      const updatedCount = await Customer.update(
        { assignedToDcaId: dcaId, status: 'Review' },
        { where: { id: customerIds } }
      );

      if (updatedCount[0] === 0) {
        return res.status(404).json({ error: 'No customers were updated' });
      }

      const updatedCustomers = await Customer.findAll({ where: { id: customerIds } });
      res.json({ updatedCount: updatedCount[0], updatedCustomers });
    } catch (error) {
      console.error('Bulk assign to DCA error:', error);
      res.status(500).json({ error: error.message || 'Failed to bulk assign customers' });
    }
  },

  // Return customers that are assigned to an external DCA (optional ?dcaId=agency)
  async getAssignedCustomers(req, res) {
    try {
      const { dcaId } = req.query;
      const where = { assignedToDcaId: { [Op.ne]: null } };
      if (dcaId) where.assignedToDcaId = dcaId;

      const customers = await Customer.findAll({
        where,
        include: [{
          model: DcaAction,
          as: 'actions',
          separate: true,
          order: [['date', 'DESC']],
        }],
        order: [['updatedAt', 'DESC']],
      });

      res.json(customers);
    } catch (error) {
      console.error('Get assigned customers error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch assigned customers' });
    }
  },
};

module.exports = customerController;
