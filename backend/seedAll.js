require('dotenv').config();
const sequelize = require('./src/config/database');
const bcrypt = require('bcryptjs');
const {
  User,
  Customer,
  DcaAgency,
  DcaPerformanceByType,
  DcaSlaCompliance,
  DcaCasesSummary,
  Invoice,
  Case,
  CaseLog
} = require('./src/models');

/**
 * Comprehensive seed script for FedEx SMART application
 * Seeds all necessary data without using force: true
 * Includes: Users (3 roles), Customers, DCA Agencies, Invoices, Cases, Case Logs
 */

const seedAllData = async () => {
  console.log('🌱 Starting comprehensive seed process...\n');

  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established\n');

    // Sync models without dropping tables (no force: true)
    await sequelize.sync({ alter: false });
    console.log('✓ Database models synchronized\n');

    // ==================== SEED USERS (3 Roles) ====================
    console.log('Seeding users with 3 roles...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await User.bulkCreate([
      {
        id: 'fedex-admin-001',
        email: 'admin@fedex.com',
        password: hashedPassword,
        name: 'FedEx Admin',
        role: 'FEDEX_ADMIN',
        avatar: 'https://via.placeholder.com/40',
      },
      {
        id: 'dca-admin-001',
        email: 'dcaadmin@agency.com',
        password: hashedPassword,
        name: 'DCA Admin',
        role: 'DCA_ADMIN',
        agencyId: 'DCA-CUSTIND-01', // Will be created below
      },
      {
        id: 'dca-agent-001',
        email: 'agent@agency.com',
        password: hashedPassword,
        name: 'DCA Agent',
        role: 'DCA_AGENT',
        agencyId: 'DCA-CUSTIND-01',
      },
    ], { ignoreDuplicates: true });
    console.log('✓ Created 3 users (FEDEX_ADMIN, DCA_ADMIN, DCA_AGENT)\n');

    // ==================== SEED DCA AGENCIES ====================
    console.log('Seeding DCA agencies...');
    const dcaAgenciesData = require('./seeds/dcaAgenciesData');
    await DcaAgency.bulkCreate(dcaAgenciesData.slice(0, 10), { ignoreDuplicates: true });
    console.log(`✓ Created 10 DCA agencies\n`);

    // ==================== SEED CUSTOMERS ====================
    console.log('Seeding customers...');
    const customersData = [
      {
        id: 'cust-001',
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
        id: 'cust-002',
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
        credit_tier: 'LOW_RISK',
        dispute_rate_hist: 0.0,
        past_due_ratio_hist: 0.0,
        reminder_count: 0
      },
      {
        id: 'cust-003',
        name: 'Soylent Corp',
        accountId: 'FX-445120',
        contactEmail: 'collections@soylent.com',
        contactPhone: '+1 (555) 234-5678',
        region: 'North America',
        status: 'At Risk',
        totalDebt: 28900.00,
        daysOverdue: 60,
        repaymentProbability: 35,
        assignedToDcaId: 'DCA-CUSTIND-01',
        credit_tier: 'HIGH_RISK',
        dispute_rate_hist: 0.2,
        past_due_ratio_hist: 0.5,
        reminder_count: 3
      },
      {
        id: 'cust-004',
        name: 'Initech',
        accountId: 'FX-332110',
        contactEmail: 'peters@initech.com',
        contactPhone: '+1 (555) 888-1234',
        region: 'Asia Pacific',
        status: 'Defaulted',
        totalDebt: 3100.00,
        daysOverdue: 90,
        repaymentProbability: 12,
        assignedToDcaId: 'DCA-CUSTIND-01',
        credit_tier: 'HIGH_RISK',
        dispute_rate_hist: 0.1,
        past_due_ratio_hist: 0.8,
        reminder_count: 5
      },
      {
        id: 'cust-005',
        name: 'Massive Dynamic',
        accountId: 'FX-772190',
        contactEmail: 'finance@massivedynamic.com',
        contactPhone: '+1 (555) 555-0100',
        region: 'North America',
        status: 'Closed',
        totalDebt: 150000.00,
        daysOverdue: 0,
        repaymentProbability: 100,
        assignedToDcaId: 'DCA-FRTGEN-02',
        credit_tier: 'LOW_RISK',
        dispute_rate_hist: 0.0,
        reminder_count: 0
      }
    ];
    await Customer.bulkCreate(customersData, { ignoreDuplicates: true });
    console.log(`✓ Created ${customersData.length} customers\n`);

    // ==================== SEED INVOICES ====================
    console.log('Seeding invoices...');
    const invoicesData = [];
    for (let i = 0; i < 20; i++) {
      invoicesData.push({
        invoice_id: `INV-2026-${String(i + 1).padStart(5, '0')}`,
        customer_name: customersData[i % customersData.length].name,
        total_amount: Math.floor(Math.random() * 50000) + 5000,
        invoice_date: new Date(2026, 0, i + 1),
        due_date: new Date(2026, 1, i + 1),
      });
    }
    await Invoice.bulkCreate(invoicesData, { ignoreDuplicates: true });
    console.log(`✓ Created ${invoicesData.length} invoices\n`);

    // ==================== SEED CASES ====================
    console.log('Seeding cases...');
    const casesData = [];
    for (let i = 0; i < 30; i++) {
      const customer = customersData[i % customersData.length];
      casesData.push({
        invoice_id: invoicesData[i % invoicesData.length].invoice_id,
        tracking_no: `TRK${200000 + i}`,
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
        dca_id: i % 3 === 0 ? 'DCA-CUSTIND-01' : i % 3 === 1 ? 'DCA-FRTGEN-02' : null,
        assigned_at: i % 3 !== 2 ? new Date() : null,
        status: i % 6 === 0 ? 'RECOVERED' : i % 6 === 1 ? 'PARTIAL_PAYMENT' : i % 6 === 2 ? 'CONTACTED' : 'NEW',
        first_contact_due: new Date(Date.now() + 24 * 60 * 60 * 1000),
        recovery_due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }
    await Case.bulkCreate(casesData, { ignoreDuplicates: true });
    console.log(`✓ Created ${casesData.length} cases\n`);

    // ==================== SEED CASE LOGS ====================
    console.log('Seeding case logs...');
    const caseLogsData = [];
    const actionTypes = ['CALL_CUSTOMER', 'EMAIL_SENT', 'FIELD_VISIT', 'PROMISE_TO_PAY', 'PAYMENT_RECEIVED'];
    
    for (let i = 0; i < 50; i++) {
      const caseItem = casesData[i % casesData.length];
      caseLogsData.push({
        case_id: null, // Will be set after cases are created
        action_type: actionTypes[i % actionTypes.length],
        action_details: `Action taken for ${caseItem.debtor_name}`,
        outcome: i % 3 === 0 ? 'PROMISE_RECEIVED' : i % 3 === 1 ? 'NO_RESPONSE' : 'CONTACTED',
        next_action: 'FOLLOW_UP',
        next_action_date: new Date(Date.now() + 48 * 60 * 60 * 1000),
        logged_by: 'dca-agent-001',
      });
    }
    
    // Get actual case IDs and update logs
    const createdCases = await Case.findAll({ limit: casesData.length });
    caseLogsData.forEach((log, index) => {
      log.case_id = createdCases[index % createdCases.length].case_id;
    });
    
    await CaseLog.bulkCreate(caseLogsData, { ignoreDuplicates: true });
    console.log(`✓ Created ${caseLogsData.length} case logs\n`);

    // ==================== SUMMARY ====================
    console.log('\n✅ All seed data created successfully!\n');
    console.log('Summary:');
    console.log('  - Users: 3 (FEDEX_ADMIN, DCA_ADMIN, DCA_AGENT)');
    console.log('  - DCA Agencies: 10');
    console.log(`  - Customers: ${customersData.length}`);
    console.log(`  - Invoices: ${invoicesData.length}`);
    console.log(`  - Cases: ${casesData.length}`);
    console.log(`  - Case Logs: ${caseLogsData.length}`);
    console.log('\nLogin credentials:');
    console.log('  FedEx Admin: admin@fedex.com / password123');
    console.log('  DCA Admin: dcaadmin@agency.com / password123');
    console.log('  DCA Agent: agent@agency.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedAllData();
