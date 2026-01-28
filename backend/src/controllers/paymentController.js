// backend/src/controllers/paymentController.js
const { Invoice, Customer } = require('../models');
const { sequelize } = require('../models'); // For transaction support

const paymentController = {
  // This is the endpoint FedEx server will hit
  async handleFedExPaymentWebhook(req, res) {
    const t = await sequelize.transaction();
    
    try {
      // 1. Parse the incoming payload from FedEx
      // Expected payload: { "invoice_id": "INV-8821", "amount_paid": 5000.00, "payment_status": "SUCCESS" }
      const { invoice_id, amount_paid, payment_status } = req.body;

      if (payment_status !== 'SUCCESS') {
        return res.status(200).json({ message: 'Payment ignored (not successful)' });
      }

      console.log(`💰 Payment detected for Invoice: ${invoice_id}`);

      // 2. Find the Invoice
      const invoice = await Invoice.findByPk(invoice_id, { transaction: t });
      
      if (!invoice) {
        await t.rollback();
        return res.status(404).json({ error: 'Invoice not found' });
      }

      // 3. Find the associated Customer using email
      // We link Invoice.customer_email to Customer.contactEmail
      const customer = await Customer.findOne({ 
        where: { contactEmail: invoice.customer_email },
        transaction: t
      });

      if (!customer) {
        // If no customer profile exists, just update the invoice
        await invoice.update({ total_amount: 0 }, { transaction: t });
        await t.commit();
        return res.json({ message: 'Invoice updated, but no customer profile found.' });
      }

      // 4. Update the Customer Logic (The "Removal" Step)
      const currentDebt = parseFloat(customer.totalDebt);
      const paymentAmount = parseFloat(amount_paid);
      const newDebt = Math.max(0, currentDebt - paymentAmount);

      const updateData = {
        totalDebt: newDebt,
        outstanding_balance: newDebt,
        last_analyzed_at: new Date() // Mark activity
      };

      // CRITICAL: If debt is zero, change status to 'Closed'
      // This "removes" them from the "Active/New" filter lists in your dashboard
      if (newDebt <= 0) {
        updateData.status = 'Closed'; 
        updateData.daysOverdue = 0;
        updateData.repaymentProbability = 100; // Perfect score
        updateData.notes = (customer.notes || '') + `\n[System]: Auto-closed via FedEx Payment Webhook on ${new Date().toISOString()}`;
      } else {
        // If partial payment, just reduce debt
        updateData.notes = (customer.notes || '') + `\n[System]: Partial payment of ${paymentAmount} received.`;
      }

      await customer.update(updateData, { transaction: t });

      // 5. Update/Archive the Invoice
      // We set total_amount to 0 to show it's paid
      await invoice.update({ total_amount: 0 }, { transaction: t });

      await t.commit();
      
      console.log(`✅ Customer ${customer.name} updated. New Status: ${updateData.status || customer.status}`);
      res.json({ success: true, message: 'Payment processed successfully' });

    } catch (error) {
      await t.rollback();
      console.error('Payment Webhook Error:', error);
      res.status(500).json({ error: 'Failed to process payment notification' });
    }
  }
};

module.exports = paymentController;