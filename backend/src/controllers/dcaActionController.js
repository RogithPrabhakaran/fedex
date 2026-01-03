const { DcaAction, Customer } = require('../models');

const dcaActionController = {
  async createAction(req, res) {
    try {
      const { customerId } = req.params;
      const actionData = { ...req.body, customerId };
      
      const action = await DcaAction.create(actionData);
      res.status(201).json(action);
    } catch (error) {
      res.status(500).json({ error: error.message });
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
      res.status(500).json({ error: error.message });
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
      res.status(500).json({ error: error.message });
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
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = dcaActionController;
