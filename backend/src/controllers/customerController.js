const { Customer, DcaAction } = require('../models');
const { Op } = require('sequelize');

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
};

module.exports = customerController;
