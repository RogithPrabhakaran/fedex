const { Customer, DcaAction } = require('../models');
const { Op } = require('sequelize');
const Joi = require('joi');

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
          order: [['date', 'DESC']],
        }],
        order: [['updatedAt', 'DESC']],
      });

      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCustomerById(req, res) {
    try {
      const customer = await Customer.findByPk(req.params.id, {
        include: [{
          model: DcaAction,
          as: 'actions',
          order: [['date', 'DESC']],
        }],
      });

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async createCustomer(req, res) {
    try {
      const customer = await Customer.create(req.body);
      res.status(201).json(customer);
    } catch (error) {
      res.status(500).json({ error: error.message });
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

      const customer = await Customer.findByPk(req.params.id, {
        include: [{
          model: DcaAction,
          as: 'actions',
          order: [['date', 'DESC']],
        }],
      });

      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: error.message });
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
      res.status(500).json({ error: error.message });
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
      res.status(500).json({ error: error.message });
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

      const [updatedCount] = await Customer.update(
        { assignedToDcaId: dcaId, status: 'Review' },
        { where: { id: customerIds } }
      );

      if (!updatedCount) {
        return res.status(404).json({ error: 'No customers were updated' });
      }

      const updatedCustomers = await Customer.findAll({ where: { id: customerIds } });
      res.json({ updatedCount, updatedCustomers });
    } catch (error) {
      res.status(500).json({ error: error.message });
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
          order: [['date', 'DESC']],
        }],
        order: [['updatedAt', 'DESC']],
      });

      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = customerController;
