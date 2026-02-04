const { Invoice, Case } = require('../models');
const { Op } = require('sequelize');

const invoiceController = {
  // ==================== INVOICE CRUD ====================

  async getAllInvoices(req, res) {
    try {
      const { 
        tax_id, 
        tracking_no, 
        payment_status, 
        invoice_no,
        limit = 100,
        offset = 0
      } = req.query;
      const where = {};

      if (tax_id) where.tax_id = { [Op.like]: `%${tax_id}%` };
      if (tracking_no) where.tracking_no = tracking_no;
      if (invoice_no) where.invoice_no = invoice_no;
      if (payment_status) where.payment_status = payment_status;

      const invoices = await Invoice.findAll({
        where,
        order: [['invoice_date', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
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
          payment_status: { [Op.in]: ['UNPAID', 'PARTIAL'] },
        },
        order: [['invoice_date', 'ASC']],
      });

      res.json(invoices);
    } catch (error) {
      console.error('Get overdue invoices error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch overdue invoices' });
    }
  },
};

module.exports = invoiceController;
