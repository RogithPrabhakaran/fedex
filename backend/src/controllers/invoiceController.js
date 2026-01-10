const { Invoice, Case } = require('../models');
const { Op } = require('sequelize');

const invoiceController = {
  // ==================== INVOICE CRUD ====================

  async getAllInvoices(req, res) {
    try {
      const { customer_name, customer_email, bill_of_entry_no, overdue } = req.query;
      const where = {};

      if (customer_name) where.customer_name = { [Op.like]: `%${customer_name}%` };
      if (customer_email) where.customer_email = customer_email;
      if (bill_of_entry_no) where.bill_of_entry_no = bill_of_entry_no;
      
      // Filter for overdue invoices
      if (overdue === 'true') {
        where.due_date = { [Op.lt]: new Date() };
      }

      const invoices = await Invoice.findAll({
        where,
        order: [['due_date', 'ASC']],
      });

      res.json(invoices);
    } catch (error) {
      console.error('Get all invoices error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch invoices' });
    }
  },

  async getInvoiceById(req, res) {
    try {
      const invoice = await Invoice.findByPk(req.params.id);

      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      res.json(invoice);
    } catch (error) {
      console.error('Get invoice by ID error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch invoice' });
    }
  },

  async createInvoice(req, res) {
    try {
      const invoice = await Invoice.create(req.body);
      res.status(201).json(invoice);
    } catch (error) {
      console.error('Create invoice error:', error);
      res.status(500).json({ error: error.message || 'Failed to create invoice' });
    }
  },

  async updateInvoice(req, res) {
    try {
      const [updated] = await Invoice.update(req.body, {
        where: { invoice_id: req.params.id },
      });

      if (!updated) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      const invoice = await Invoice.findByPk(req.params.id);
      res.json(invoice);
    } catch (error) {
      console.error('Update invoice error:', error);
      res.status(500).json({ error: error.message || 'Failed to update invoice' });
    }
  },

  async deleteInvoice(req, res) {
    try {
      const deleted = await Invoice.destroy({
        where: { invoice_id: req.params.id },
      });

      if (!deleted) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete invoice error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete invoice' });
    }
  },

  // Get invoice with related cases
  async getInvoiceWithCases(req, res) {
    try {
      const invoice = await Invoice.findByPk(req.params.id, {
        include: [{
          model: Case,
          as: 'cases',
          order: [['priority_score', 'DESC']],
        }],
      });

      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      res.json(invoice);
    } catch (error) {
      console.error('Get invoice with cases error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch invoice details' });
    }
  },

  // Get overdue invoices
  async getOverdueInvoices(req, res) {
    try {
      const invoices = await Invoice.findAll({
        where: {
          due_date: { [Op.lt]: new Date() },
        },
        order: [['due_date', 'ASC']],
      });

      res.json(invoices);
    } catch (error) {
      console.error('Get overdue invoices error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch overdue invoices' });
    }
  },

  // Get invoices by customer
  async getInvoicesByCustomer(req, res) {
    try {
      const { email } = req.params;
      const invoices = await Invoice.findAll({
        where: { customer_email: email },
        order: [['invoice_date', 'DESC']],
      });

      res.json(invoices);
    } catch (error) {
      console.error('Get invoices by customer error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch customer invoices' });
    }
  },
};

module.exports = invoiceController;
