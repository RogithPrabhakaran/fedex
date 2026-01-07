const { DcaAction, Customer } = require('../models');

const dcaActionController = {
  async createAction(req, res) {
    try {
      const { customerId } = req.params;
      
      // Validate customer exists
      const customer = await Customer.findByPk(customerId);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const actionData = { 
        ...req.body, 
        customerId,
        performedBy: req.body.performedBy || req.user?.id || 'system'
      };
      
      const action = await DcaAction.create(actionData);
      res.status(201).json(action);
    } catch (error) {
      console.error('Create action error:', error);
      res.status(500).json({ error: error.message || 'Failed to create action' });
    }
  },

  async getActionsByCustomer(req, res) {
    try {
      const { customerId } = req.params;
      
      const actions = await DcaAction.findAll({
        where: { customerId },
        order: [['date', 'DESC']],
      });

      res.json(actions);
    } catch (error) {
      console.error('Get actions by customer error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch actions' });
    }
  },

  async updateAction(req, res) {
    try {
      const [updated] = await DcaAction.update(req.body, {
        where: { id: req.params.id },
      });

      if (!updated) {
        return res.status(404).json({ error: 'Action not found' });
      }

      const action = await DcaAction.findByPk(req.params.id);
      res.json(action);
    } catch (error) {
      console.error('Update action error:', error);
      res.status(500).json({ error: error.message || 'Failed to update action' });
    }
  },

  async deleteAction(req, res) {
    try {
      const deleted = await DcaAction.destroy({
        where: { id: req.params.id },
      });

      if (!deleted) {
        return res.status(404).json({ error: 'Action not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete action error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete action' });
    }
  },
};

module.exports = dcaActionController;
