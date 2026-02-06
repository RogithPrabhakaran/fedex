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

  // Get customer payment information with unpaid invoices and payment discipline score
  async getCustomerPaymentInfo(req, res) {
    try {
      const { Invoice } = require('../models');

      // Get customer details
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

      // Find all invoices for this customer (matching by tax_id/GSTIN)
      // If customer doesn't have a tax_id field, we'll use contactEmail as fallback
      const invoices = await Invoice.findAll({
        where: {
          [Op.or]: [
            customer.cin ? { tax_id: customer.cin } : null,
            // Fallback: match by some other identifier if needed
          ].filter(Boolean),
          payment_status: { [Op.in]: ['UNPAID', 'PARTIAL'] },
        },
        order: [['invoice_date', 'ASC']],
      });

      // Calculate days left for each unpaid invoice (180-day FedEx policy)
      const unpaidInvoices = invoices.map(invoice => {
        const invoiceDate = new Date(invoice.invoice_date);
        const today = new Date();
        const daysSinceInvoice = Math.floor((today - invoiceDate) / (1000 * 60 * 60 * 24));
        const daysLeft = Math.max(0, 180 - daysSinceInvoice);
        const isOverdue = daysLeft === 0;

        return {
          invoice_id: invoice.invoice_id,
          invoice_no: invoice.invoice_no,
          invoice_date: invoice.invoice_date,
          balance_due: parseFloat(invoice.balance_due || 0),
          total_amount: parseFloat(invoice.total_amount || 0),
          payment_status: invoice.payment_status,
          tracking_no: invoice.tracking_no,
          daysSinceInvoice,
          daysLeft,
          isOverdue,
          dcaTakeover: daysLeft === 0,
        };
      });

      // Calculate payment discipline score (0-100)
      // Algorithm:
      // - Payment history (40%): Based on past_due_ratio_hist (lower is better)
      // - Current balance ratio (25%): outstanding_balance vs credit_limit
      // - Days overdue factor (20%): Based on daysOverdue
      // - Dispute rate (10%): Lower dispute_rate_hist is better
      // - Reminder efficiency (5%): reminder_count impact

      const paymentHistoryScore = Math.max(0, (1 - parseFloat(customer.past_due_ratio_hist || 0)) * 40);

      const creditUtilization = customer.credit_limit > 0
        ? parseFloat(customer.outstanding_balance || 0) / parseFloat(customer.credit_limit)
        : 1;
      const balanceScore = Math.max(0, (1 - Math.min(1, creditUtilization)) * 25);

      const daysOverdueScore = Math.max(0, Math.min(20, 20 - (customer.daysOverdue / 10)));

      const disputeScore = Math.max(0, (1 - parseFloat(customer.dispute_rate_hist || 0)) * 10);

      const reminderScore = Math.max(0, Math.min(5, 5 - (customer.reminder_count / 5)));

      const paymentDisciplineScore = Math.round(
        paymentHistoryScore +
        balanceScore +
        daysOverdueScore +
        disputeScore +
        reminderScore
      );

      // Aggregate payment statistics
      const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.balance_due, 0);
      const averageDaysOverdue = unpaidInvoices.length > 0
        ? Math.round(unpaidInvoices.reduce((sum, inv) => sum + inv.daysSinceInvoice, 0) / unpaidInvoices.length)
        : 0;
      const overdueCount = unpaidInvoices.filter(inv => inv.isOverdue).length;

      res.json({
        customer: {
          id: customer.id,
          name: customer.name,
          accountId: customer.accountId,
          contactEmail: customer.contactEmail,
          contactPhone: customer.contactPhone,
          region: customer.region,
          status: customer.status,
          totalDebt: parseFloat(customer.totalDebt || 0),
          daysOverdue: customer.daysOverdue,
          repaymentProbability: customer.repaymentProbability,
        },
        paymentInfo: {
          totalUnpaid,
          unpaidInvoicesCount: unpaidInvoices.length,
          averageDaysOverdue,
          overdueCount,
          paymentDisciplineScore,
        },
        unpaidInvoices,
        scoreBreakdown: {
          paymentHistory: Math.round(paymentHistoryScore),
          balanceRatio: Math.round(balanceScore),
          daysOverdue: Math.round(daysOverdueScore),
          disputeRate: Math.round(disputeScore),
          reminderEfficiency: Math.round(reminderScore),
        },
      });
    } catch (error) {
      console.error('Get customer payment info error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch customer payment info' });
    }
  },
};

module.exports = customerController;
