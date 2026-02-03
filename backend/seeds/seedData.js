
const bcrypt = require('bcryptjs');
const {
  User,
  Customer,
  EmailTemplate,
  DcaAction,
  DcaAgency,
  DcaPerformanceByType,
  DcaSlaCompliance,
  DcaCasesSummary,
  Invoice,
  Case,
  CaseLog
} = require('../src/models');

// Simple UUID generator to avoid external dependency issues
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const seedData = async () => {
  try {
    console.log('Starting seed process...');

    // 1. Users
    const hashedPassword = await bcrypt.hash('password123', 10);
    await User.bulkCreate([
      {
        id: 'user-1',
        email: 'admin@fedex.com',
        password: hashedPassword,
        name: 'FedEx Admin',
        role: 'FEDEX_ADMIN',
        avatar: 'https://via.placeholder.com/40',
      },
      {
        id: 'user-2',
        email: 'agent@dca.com',
        password: hashedPassword,
        name: 'DCA Agent',
        role: 'DCA_AGENT',
        avatar: 'https://via.placeholder.com/40',
        agencyId: 'agency_alpha',
      },
    ]);



    // 3. Customers
    // Need varied statuses and assignments to populate Leaderboard and Charts
    const customers = await Customer.bulkCreate([
      {
        id: uuidv4(),
        name: 'Acme Logistics Corp',
        accountId: 'FX-883920',
        contactEmail: 'jane.doe@acme.com',
        contactPhone: '+1 (555) 123-4567',
        region: 'North America',
        status: 'Negotiating',
        totalDebt: 12450.00,
        daysOverdue: 15,
        repaymentProbability: 85,
        assignedToDcaId: null,
        credit_tier: 'MEDIUM_RISK',
        dispute_rate_hist: 0.05,
        past_due_ratio_hist: 0.1,
        reminder_count: 1
      },
      {
        id: uuidv4(),
        name: 'Globex Inc',
        accountId: 'FX-992104',
        contactEmail: 'billing@globex.io',
        contactPhone: '+1 (555) 987-6543',
        region: 'Europe',
        status: 'Active',
        totalDebt: 5200.00,
        daysOverdue: 5,
        repaymentProbability: 95,
        assignedToDcaId: null,
        credit_tier: 'LOW_RISK', // High Credit Score -> High Prob
        dispute_rate_hist: 0.0,
        past_due_ratio_hist: 0.0,
        reminder_count: 0
      },
      {
        id: uuidv4(),
        name: 'Soylent Corp',
        accountId: 'FX-445120',
        contactEmail: 'collections@soylent.com',
        contactPhone: '+1 (555) 234-5678',
        region: 'North America',
        status: 'At Risk',
        totalDebt: 28900.00,
        daysOverdue: 60,
        repaymentProbability: 35,
        assignedToDcaId: null,
        credit_tier: 'HIGH_RISK', // Low Credit Score -> Low Prob
        dispute_rate_hist: 0.2,
        past_due_ratio_hist: 0.5,
        reminder_count: 3
      },
      {
        id: uuidv4(),
        name: 'Initech',
        accountId: 'FX-332110',
        contactEmail: 'peters@initech.com',
        contactPhone: '+1 (555) 888-1234',
        region: 'Asia Pacific',
        status: 'Defaulted',
        totalDebt: 3100.00,
        daysOverdue: 90,
        repaymentProbability: 12,
        assignedToDcaId: 'agency_alpha',
        credit_tier: 'HIGH_RISK',
        dispute_rate_hist: 0.1,
        past_due_ratio_hist: 0.8,
        reminder_count: 5
      },
      // Customers for Leaderboard (Paid/Settled assigned to Agencies)
      {
        id: uuidv4(),
        name: 'Massive Dynamic',
        accountId: 'FX-772190',
        contactEmail: 'finance@massivedynamic.com',
        contactPhone: '+1 (555) 555-0100',
        region: 'North America',
        status: 'Closed',
        totalDebt: 150000.00, // Large amount to show on leaderboard
        daysOverdue: 0,
        repaymentProbability: 100,
        assignedToDcaId: 'agency_alpha',
        credit_tier: 'LOW_RISK',
        dispute_rate_hist: 0.0,
        reminder_count: 0
      },
      {
        id: uuidv4(),
        name: 'Hooli',
        accountId: 'FX-112233',
        contactEmail: 'gavin@hooli.xyz',
        contactPhone: '+1 (555) 666-1337',
        region: 'North America',
        status: 'Closed',
        totalDebt: 75000.00,
        daysOverdue: 120,
        repaymentProbability: 100,
        assignedToDcaId: 'agency_beta',
        credit_tier: 'MEDIUM_RISK',
        dispute_rate_hist: 0.1,
        reminder_count: 2
      },
      {
        id: uuidv4(),
        name: 'Umbrella Corp',
        accountId: 'FX-666999',
        contactEmail: 'wesker@umbrella.com',
        contactPhone: '+1 (555) 999-8888',
        region: 'Europe',
        status: 'Legal Action',
        totalDebt: 500000.00,
        daysOverdue: 200,
        repaymentProbability: 5,
        assignedToDcaId: 'agency_alpha',
        credit_tier: 'HIGH_RISK',
        dispute_rate_hist: 0.4,
        reminder_count: 10
      },
      {
        id: uuidv4(),
        name: 'Stark Industries',
        accountId: 'FX-888777',
        contactEmail: 'pepper@stark.com',
        contactPhone: '+1 (555) 777-6666',
        region: 'North America',
        status: 'Review',
        totalDebt: 12000.00,
        daysOverdue: 30,
        repaymentProbability: 60,
        assignedToDcaId: 'agency_beta',
        credit_tier: 'MEDIUM_RISK',
        dispute_rate_hist: 0.0,
        reminder_count: 1
      }
    ]);

    // 4. Invoices (Fixed against Schema)
    // Schema required: invoice_id, customer_name, total_amount, invoice_date, due_date
   

    // 6. Cases & Logs
    // Create cases for each customer with auto-generated UUID case_ids
    const cases = await Case.bulkCreate(customers.map((customer, i) => ({
      // case_id will be auto-generated as UUID
      invoice_id: null, // Can be linked later when invoices are created
      tracking_no: `TRK${100000 + i}`,
      debt_category: 'FREIGHT',
      debtor_type: customer.totalDebt > 50000 ? 'B2B' : 'B2C',
      debtor_name: customer.name,
      debtor_gstin: customer.accountId.replace('FX-', 'GSTIN'),
      debtor_phone: customer.contactPhone,
      debtor_email: customer.contactEmail,
      case_amount: customer.totalDebt,
      dpd: customer.daysOverdue,
      complexity_score: customer.repaymentProbability < 50 ? 8.5 : 3.2,
      recovery_probability: customer.repaymentProbability / 100,
      priority: customer.repaymentProbability < 40 ? 'HIGH' : customer.repaymentProbability < 70 ? 'MEDIUM' : 'LOW',
      dca_id: customer.assignedToDcaId,
      assigned_at: customer.assignedToDcaId ? new Date() : null,
      status: customer.status === 'Closed' ? 'RECOVERED' : customer.status === 'Legal Action' ? 'WRITE_OFF' : 'NEW',
      first_contact_due: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      recovery_due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    })));


    // 8. Email Templates
    await EmailTemplate.bulkCreate([
      {
        id: 'tpl_1',
        name: 'Payment Reminder',
        subject: 'Reminder: Outstanding Balance',
        body: 'Dear {{ContactName}}, please pay us.',
        description: 'Standard reminder for outstanding payments',
      }
    ]);

    console.log('Seed data created successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

module.exports = seedData;
