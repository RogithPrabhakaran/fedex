
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

    // 2. DCA Agencies
    await DcaAgency.bulkCreate([
      {
        dca_id: 'agency_alpha',
        agency_name: 'Alpha Collections Partners',
        short_name: 'Alpha',
        specialization: 'Commercial High Value',
        regions: 'North America',
        contact_person: 'John Smith',
        contact_email: 'john@alphacollect.com',
        status: 'ACTIVE',
        performance_score: 8.5,
        commission_rate: 15.00,
      },
      {
        dca_id: 'agency_beta',
        agency_name: 'Beta Global Recovery',
        short_name: 'Beta',
        specialization: 'International Logistics',
        regions: 'Europe, Asia',
        contact_person: 'Sarah Connor',
        contact_email: 'sarah@betarecovery.com',
        status: 'ACTIVE',
        performance_score: 9.2,
        commission_rate: 18.50,
      }
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
    const invoices = await Invoice.bulkCreate(customers.map((c, i) => ({
      invoice_id: `INV-${1000 + i}`,
      customer_name: c.name, // Required
      customer_email: c.contactEmail,
      customer_phone: c.contactPhone,
      total_amount: c.totalDebt, // Was 'amount' incorrect
      amount_duty: 0,
      invoice_date: new Date(new Date().setDate(new Date().getDate() - c.daysOverdue - 30)),
      due_date: new Date(new Date().setDate(new Date().getDate() - c.daysOverdue)),
      // Removed: customer_id, status (not in Invoice model)
    })));

    // 5. DCA Actions
    await DcaAction.bulkCreate([
      {
        customerId: customers[3].id, // Initech
        type: 'CALL',
        date: new Date(new Date().setDate(new Date().getDate() - 5)),
        notes: 'Called CFO, no answer. Left voicemail.',
        performedBy: 'System'
      },
      {
        customerId: customers[3].id,
        type: 'LEGAL_NOTICE',
        date: new Date(),
        notes: 'Sent final demand letter.',
        performedBy: 'Agency Alpha'
      },
      {
        customerId: customers[0].id, // Acme
        type: 'RECOVERY_PLAN',
        date: new Date(new Date().setDate(new Date().getDate() - 2)),
        notes: 'Proposed 3-month payment plan.',
        performedBy: 'Admin'
      },
      {
        customerId: customers[6].id, // Umbrella
        type: 'LEGAL_NOTICE',
        date: new Date(new Date().setDate(new Date().getDate() - 20)),
        notes: 'Case filed in district court.',
        performedBy: 'Agency Alpha Legal Team'
      }
    ]);

    // 6. Cases & Logs
    const cases = await Case.bulkCreate(invoices.map((inv, i) => ({
      invoice_id: inv.invoice_id,
      bucket_category: 'FREIGHT',
      priority_score: customers[i].repaymentProbability < 50 ? 9 : 3,
      life_cycle_status: customers[i].assignedToDcaId ? 'ASSIGNED' : 'WIP',
      amount_recovered: customers[i].status === 'Closed' ? customers[i].totalDebt : 0,
      // Fix: assigned_agency_id is INTEGER in Case model, but agencies use STRING ids.
      // Setting to null or 0 to avoid type mismatch as we cannot change schema.
      // Or if there is a mapping, we'd use it. For now leaving null.
      assigned_agency_id: null,
    })));

    // 7. Performance Data
    await DcaPerformanceByType.bulkCreate([
      { dca_id: 'agency_alpha', debt_category: 'Freight', cases_handled: 120, recovery_rate: 75.5, recovered_amount: 500000 },
      { dca_id: 'agency_beta', debt_category: 'Customs', cases_handled: 85, recovery_rate: 82.0, recovered_amount: 320000 },
    ]);

    await DcaSlaCompliance.bulkCreate([
      { dca_id: 'agency_alpha', sla_type: 'First Contact', target_hours: 24, compliance_rate: 98.5 },
      { dca_id: 'agency_beta', sla_type: 'First Contact', target_hours: 24, compliance_rate: 95.0 },
    ]);

    await DcaCasesSummary.bulkCreate([
      { dca_id: 'agency_alpha', month_year: '2023-10', total_cases_assigned: 50, cases_recovered: 30, recovered_amount: 150000 },
      { dca_id: 'agency_beta', month_year: '2023-10', total_cases_assigned: 40, cases_recovered: 28, recovered_amount: 120000 },
    ]);

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
