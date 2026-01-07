/**
 * Update existing customers with new field defaults
 * Adds missing fields to existing customers without changing their data
 */

require('dotenv').config();
const { sequelize, Customer } = require('../src/models');

async function updateExistingCustomers() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connection established.');

    // Get all customers
    const customers = await Customer.findAll();
    console.log(`\nFound ${customers.length} customers to update.\n`);

    let updated = 0;
    for (const customer of customers) {
      const updates = {};
      let needsUpdate = false;

      // Set defaults for missing ML model fields
      if (!customer.invoice_amount && customer.totalDebt) {
        updates.invoice_amount = customer.totalDebt;
        needsUpdate = true;
      }
      if (!customer.payment_terms_days) {
        updates.payment_terms_days = 30;
        needsUpdate = true;
      }
      if (!customer.service_type) {
        updates.service_type = 'GROUND';
        needsUpdate = true;
      }
      if (!customer.ontime_delivery_rate_hist) {
        updates.ontime_delivery_rate_hist = 0.9;
        needsUpdate = true;
      }
      if (!customer.past_due_ratio_hist && customer.daysOverdue) {
        updates.past_due_ratio_hist = Math.min(1, customer.daysOverdue / 120);
        needsUpdate = true;
      }
      if (!customer.dispute_rate_hist) {
        updates.dispute_rate_hist = 0;
        needsUpdate = true;
      }
      if (!customer.reminder_count) {
        updates.reminder_count = 0;
        needsUpdate = true;
      }
      if (!customer.credit_tier) {
        // Determine based on repayment probability
        if (customer.repaymentProbability >= 70) {
          updates.credit_tier = 'LOW_RISK';
        } else if (customer.repaymentProbability >= 40) {
          updates.credit_tier = 'MEDIUM_RISK';
        } else {
          updates.credit_tier = 'HIGH_RISK';
        }
        needsUpdate = true;
      }
      if (!customer.outstanding_balance && customer.totalDebt) {
        updates.outstanding_balance = customer.totalDebt;
        needsUpdate = true;
      }
      if (!customer.credit_limit && customer.totalDebt) {
        updates.credit_limit = customer.totalDebt * 3; // Default 3x debt
        needsUpdate = true;
      }
      if (!customer.utilization_at_invoice && customer.credit_limit && customer.outstanding_balance) {
        updates.utilization_at_invoice = Math.min(2, 
          Number(customer.outstanding_balance || customer.totalDebt || 0) / 
          Number(customer.credit_limit || customer.totalDebt * 3 || 1)
        );
        needsUpdate = true;
      }
      if (!customer.analysis_status) {
        updates.analysis_status = 'PENDING';
        needsUpdate = true;
      }
      if (!customer.cin) {
        // Generate a mock CIN based on account ID
        updates.cin = `U${Math.floor(Math.random() * 100000)}${customer.accountId.replace(/[^0-9]/g, '').substring(0, 4)}${new Date().getFullYear()}`;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Customer.update(updates, { where: { id: customer.id } });
        console.log(`✓ Updated customer: ${customer.name} (${customer.accountId})`);
        updated++;
      } else {
        console.log(`- Skipped customer: ${customer.name} (already has all fields)`);
      }
    }

    console.log(`\n✓ Update complete! Updated ${updated} out of ${customers.length} customers.`);
    
  } catch (error) {
    console.error('✗ Error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

updateExistingCustomers();
