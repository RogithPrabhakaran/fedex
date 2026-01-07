/**
 * Add more mock customers if we have less than 8
 */

require('dotenv').config();
const { sequelize, Customer } = require('../src/models');

const additionalCustomers = [
  {
    name: 'TechStart Solutions',
    accountId: 'FX-556677',
    contactEmail: 'finance@techstart.io',
    contactPhone: '+1 (555) 444-5555',
    region: 'North America',
    status: 'Active',
    totalDebt: 8500.00,
    daysOverdue: 0,
    repaymentProbability: 95,
    cin: 'U44444TECH2022',
    invoice_amount: 8500.00,
    payment_terms_days: 30,
    service_type: 'EXPRESS',
    recent_shipments_30d: 15,
    recent_shipments_90d: 52,
    ontime_delivery_rate_hist: 0.99,
    delivery_exceptions_90d: 0,
    past_due_ratio_hist: 0.0,
    dispute_rate_hist: 0.0,
    reminder_count: 0,
    credit_tier: 'LOW_RISK',
    credit_limit: 75000.00,
    outstanding_balance: 8500.00,
    utilization_at_invoice: 0.113,
    analysis_status: 'PENDING',
  },
  {
    name: 'Global Shipping Partners',
    accountId: 'FX-778899',
    contactEmail: 'accounts@globalship.com',
    contactPhone: '+1 (555) 333-2222',
    region: 'Europe',
    status: 'Review',
    totalDebt: 45000.00,
    daysOverdue: 30,
    repaymentProbability: 65,
    cin: 'U55555GLOB2020',
    invoice_amount: 45000.00,
    payment_terms_days: 45,
    service_type: 'INTERNATIONAL',
    recent_shipments_30d: 20,
    recent_shipments_90d: 65,
    ontime_delivery_rate_hist: 0.88,
    delivery_exceptions_90d: 4,
    past_due_ratio_hist: 0.25,
    dispute_rate_hist: 0.05,
    reminder_count: 2,
    credit_tier: 'MEDIUM_RISK',
    credit_limit: 100000.00,
    outstanding_balance: 45000.00,
    utilization_at_invoice: 0.45,
    analysis_status: 'PENDING',
  },
  {
    name: 'Metro Express Logistics',
    accountId: 'FX-112233',
    contactEmail: 'billing@metroexpress.net',
    contactPhone: '+1 (555) 777-8888',
    region: 'North America',
    status: 'Negotiating',
    totalDebt: 18900.00,
    daysOverdue: 20,
    repaymentProbability: 75,
    cin: 'U66666METR2021',
    invoice_amount: 18900.00,
    payment_terms_days: 30,
    service_type: 'GROUND',
    recent_shipments_30d: 10,
    recent_shipments_90d: 35,
    ontime_delivery_rate_hist: 0.92,
    delivery_exceptions_90d: 2,
    past_due_ratio_hist: 0.167,
    dispute_rate_hist: 0.03,
    reminder_count: 1,
    credit_tier: 'MEDIUM_RISK',
    credit_limit: 60000.00,
    outstanding_balance: 18900.00,
    utilization_at_invoice: 0.315,
    analysis_status: 'PENDING',
  },
];

async function addMoreCustomers() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connection established.');

    const customerCount = await Customer.count();
    console.log(`\nCurrent customers: ${customerCount}`);

    if (customerCount < 8) {
      const needed = 8 - customerCount;
      console.log(`\nAdding ${Math.min(needed, additionalCustomers.length)} more customers...\n`);

      for (let i = 0; i < Math.min(needed, additionalCustomers.length); i++) {
        try {
          // Check if customer with this accountId already exists
          const existing = await Customer.findOne({
            where: { accountId: additionalCustomers[i].accountId }
          });

          if (!existing) {
            await Customer.create(additionalCustomers[i]);
            console.log(`✓ Added customer: ${additionalCustomers[i].name} (${additionalCustomers[i].accountId})`);
          } else {
            console.log(`- Skipped customer: ${additionalCustomers[i].name} (already exists)`);
          }
        } catch (error) {
          console.error(`✗ Error adding customer ${additionalCustomers[i].name}:`, error.message);
        }
      }

      const newCount = await Customer.count();
      console.log(`\n✓ Done! Total customers: ${newCount}`);
    } else {
      console.log('\n✓ Already have enough customers. No need to add more.');
    }

  } catch (error) {
    console.error('✗ Error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

addMoreCustomers();
