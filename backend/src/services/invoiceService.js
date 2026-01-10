const { Invoice } = require('../models');
const { Op } = require('sequelize');

const invoiceService = {
  /**
   * Calculate days past due for an invoice
   * @param {Date} dueDate - The due date of the invoice
   * @returns {number} - Number of days past due (negative if not yet due)
   */
  calculateDaysPastDue(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  /**
   * Get all overdue invoices
   * @returns {Promise<Array>} - Array of overdue invoices
   */
  async getOverdueInvoices() {
    return await Invoice.findAll({
      where: {
        due_date: { [Op.lt]: new Date() },
      },
      order: [['due_date', 'ASC']],
    });
  },

  /**
   * Get all invoices for a specific customer
   * @param {string} customerEmail - Customer email address
   * @returns {Promise<Array>} - Array of customer invoices
   */
  async getInvoicesByCustomer(customerEmail) {
    return await Invoice.findAll({
      where: { customer_email: customerEmail },
      order: [['invoice_date', 'DESC']],
    });
  },

  /**
   * Get invoices with customs duty (bill_of_entry_no exists)
   * These are high priority
   * @returns {Promise<Array>} - Array of customs duty invoices
   */
  async getCustomsDutyInvoices() {
    return await Invoice.findAll({
      where: {
        bill_of_entry_no: { [Op.ne]: null },
      },
      order: [['due_date', 'ASC']],
    });
  },

  /**
   * Calculate total outstanding debt for a customer
   * @param {string} customerEmail - Customer email address
   * @returns {Promise<number>} - Total outstanding amount
   */
  async getTotalDebtByCustomer(customerEmail) {
    const invoices = await this.getInvoicesByCustomer(customerEmail);
    return invoices.reduce((total, invoice) => {
      return total + parseFloat(invoice.total_amount);
    }, 0);
  },

  /**
   * Get invoices by ageing bucket
   * @param {number} minDays - Minimum days overdue
   * @param {number} maxDays - Maximum days overdue (optional)
   * @returns {Promise<Array>} - Array of invoices in the ageing bucket
   */
  async getInvoicesByAgeingBucket(minDays, maxDays = null) {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() - minDays);

    const where = {
      due_date: { [Op.lte]: minDate },
    };

    if (maxDays) {
      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() - maxDays);
      where.due_date[Op.gte] = maxDate;
    }

    return await Invoice.findAll({
      where,
      order: [['due_date', 'ASC']],
    });
  },
};

module.exports = invoiceService;
