require('dotenv').config();
const sequelize = require('./src/config/database');
const bcrypt = require('bcryptjs');
const {
  User,
  Customer,
  DcaAgency,
  DcaAgent,
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

    // ==================== SEED DCA AGENTS ====================
    console.log('Seeding DCA agents...');
    const agentsData = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@customsrecovery.in',
        phone: '+91-9876543210',
        dca_admin_id: 'dca-admin-001',
        status: 'ACTIVE',
        assigned_cases_count: 0,
        recovery_rate: 0.00,
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@customsrecovery.in',
        phone: '+91-9876543211',
        dca_admin_id: 'dca-admin-001',
        status: 'ACTIVE',
        assigned_cases_count: 0,
        recovery_rate: 0.00,
      },
      {
        name: 'Amit Patel',
        email: 'amit.patel@customsrecovery.in',
        phone: '+91-9876543212',
        dca_admin_id: 'dca-admin-001',
        status: 'ACTIVE',
        assigned_cases_count: 0,
        recovery_rate: 0.00,
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@customsrecovery.in',
        phone: '+91-9876543213',
        dca_admin_id: 'dca-admin-001',
        status: 'ACTIVE',
        assigned_cases_count: 0,
        recovery_rate: 0.00,
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.singh@customsrecovery.in',
        phone: '+91-9876543214',
        dca_admin_id: 'dca-admin-001',
        status: 'ACTIVE',
        assigned_cases_count: 0,
        recovery_rate: 0.00,
      },
      {
        name: 'Ananya Iyer',
        email: 'ananya.iyer@customsrecovery.in',
        phone: '+91-9876543215',
        dca_admin_id: 'dca-admin-001',
        status: 'ACTIVE',
        assigned_cases_count: 0,
        recovery_rate: 0.00,
      },
      {
        name: 'Karthik Menon',
        email: 'karthik.menon@customsrecovery.in',
        phone: '+91-9876543216',
        dca_admin_id: 'dca-admin-001',
        status: 'ACTIVE',
        assigned_cases_count: 0,
        recovery_rate: 0.00,
      },
      {
        name: 'Divya Nair',
        email: 'divya.nair@customsrecovery.in',
        phone: '+91-9876543217',
        dca_admin_id: 'dca-admin-001',
        status: 'INACTIVE',
        assigned_cases_count: 0,
        recovery_rate: 0.00,
      },
    ];
    
    const createdAgents = await DcaAgent.bulkCreate(agentsData, { ignoreDuplicates: true });
    console.log(`✓ Created ${createdAgents.length} DCA agents\n`);

    // ==================== SEED CUSTOMERS ====================
    console.log('Seeding customers...');
    const customersData = [
      { id: 'cust-001', name: 'Acme Logistics Corp', accountId: 'FX-883920', contactEmail: 'jane.doe@acme.com', contactPhone: '+1 (555) 123-4567', region: 'North America', status: 'Negotiating', totalDebt: 12450.00, daysOverdue: 15, repaymentProbability: 85, assignedToDcaId: null, credit_tier: 'MEDIUM_RISK', dispute_rate_hist: 0.05, past_due_ratio_hist: 0.1, reminder_count: 1 },
      { id: 'cust-002', name: 'Globex Inc', accountId: 'FX-992104', contactEmail: 'billing@globex.io', contactPhone: '+1 (555) 987-6543', region: 'Europe', status: 'Active', totalDebt: 5200.00, daysOverdue: 5, repaymentProbability: 95, assignedToDcaId: null, credit_tier: 'LOW_RISK', dispute_rate_hist: 0.0, past_due_ratio_hist: 0.0, reminder_count: 0 },
      { id: 'cust-003', name: 'Soylent Corp', accountId: 'FX-445120', contactEmail: 'collections@soylent.com', contactPhone: '+1 (555) 234-5678', region: 'North America', status: 'At Risk', totalDebt: 28900.00, daysOverdue: 60, repaymentProbability: 35, assignedToDcaId: 'DCA-CUSTIND-01', credit_tier: 'HIGH_RISK', dispute_rate_hist: 0.2, past_due_ratio_hist: 0.5, reminder_count: 3 },
      { id: 'cust-004', name: 'Initech', accountId: 'FX-332110', contactEmail: 'peters@initech.com', contactPhone: '+1 (555) 888-1234', region: 'Asia Pacific', status: 'Defaulted', totalDebt: 3100.00, daysOverdue: 90, repaymentProbability: 12, assignedToDcaId: 'DCA-CUSTIND-01', credit_tier: 'HIGH_RISK', dispute_rate_hist: 0.1, past_due_ratio_hist: 0.8, reminder_count: 5 },
      { id: 'cust-005', name: 'Massive Dynamic', accountId: 'FX-772190', contactEmail: 'finance@massivedynamic.com', contactPhone: '+1 (555) 555-0100', region: 'North America', status: 'Closed', totalDebt: 150000.00, daysOverdue: 0, repaymentProbability: 100, assignedToDcaId: 'DCA-FRTGEN-02', credit_tier: 'LOW_RISK', dispute_rate_hist: 0.0, reminder_count: 0 },
      { id: 'cust-006', name: 'Hooli Indian Exports', accountId: 'FX-663821', contactEmail: 'billing@hooli.in', contactPhone: '+91-9842100001', region: 'Asia Pacific', status: 'Active', totalDebt: 45000.00, daysOverdue: 12, repaymentProbability: 75, assignedToDcaId: 'DCA-CUSTIND-01', credit_tier: 'MEDIUM_RISK', dispute_rate_hist: 0.02, reminder_count: 2 },
      { id: 'cust-007', name: 'Pied Piper Tech', accountId: 'FX-552719', contactEmail: 'richard@piedpiper.com', contactPhone: '+1 (555) 321-7654', region: 'North America', status: 'At Risk', totalDebt: 12000.00, daysOverdue: 45, repaymentProbability: 55, assignedToDcaId: 'DCA-CUSTIND-01', credit_tier: 'MEDIUM_RISK', dispute_rate_hist: 0.08, reminder_count: 3 },
      { id: 'cust-008', name: 'Ravindra Steel Works', accountId: 'FX-112233', contactEmail: 'accounts@ravindra.in', contactPhone: '+91-9842100008', region: 'Asia Pacific', status: 'Defaulted', totalDebt: 85000.00, daysOverdue: 120, repaymentProbability: 10, assignedToDcaId: 'DCA-B2BEXP-05', credit_tier: 'HIGH_RISK', dispute_rate_hist: 0.15, reminder_count: 7 },
      { id: 'cust-009', name: 'Galaxy Logistics Europe', accountId: 'FX-998877', contactEmail: 'ops@galaxy-logistics.eu', contactPhone: '+44 20 7946 0011', region: 'Europe', status: 'Active', totalDebt: 32000.00, daysOverdue: 8, repaymentProbability: 88, assignedToDcaId: 'DCA-FRTGEN-02', credit_tier: 'LOW_RISK', dispute_rate_hist: 0.01, reminder_count: 1 },
      { id: 'cust-010', name: 'Tata Motors - Delhi Hub', accountId: 'FX-445566', contactEmail: 'billing@tata.com', contactPhone: '+91-11-23456789', region: 'Asia Pacific', status: 'Active', totalDebt: 450000.00, daysOverdue: 5, repaymentProbability: 98, assignedToDcaId: null, credit_tier: 'LOW_RISK', dispute_rate_hist: 0.00, reminder_count: 0 },
      { id: 'cust-011', name: 'Reliance Industries', accountId: 'FX-778899', contactEmail: 'finance@ril.com', contactPhone: '+91-22-66667777', region: 'Asia Pacific', status: 'Active', totalDebt: 1200000.00, daysOverdue: 10, repaymentProbability: 95, assignedToDcaId: null, credit_tier: 'LOW_RISK', dispute_rate_hist: 0.02, reminder_count: 1 },
      { id: 'cust-012', name: 'Infosys BPM', accountId: 'FX-223344', contactEmail: 'accounts@infosys.com', contactPhone: '+91-80-12345678', region: 'Asia Pacific', status: 'At Risk', totalDebt: 55000.00, daysOverdue: 75, repaymentProbability: 40, assignedToDcaId: 'DCA-CUSTIND-01', credit_tier: 'MEDIUM_RISK', dispute_rate_hist: 0.05, reminder_count: 4 },
      { id: 'cust-013', name: 'Wipro Technologies', accountId: 'FX-334455', contactEmail: 'billing@wipro.com', contactPhone: '+91-80-22334455', region: 'Asia Pacific', status: 'Negotiating', totalDebt: 42000.00, daysOverdue: 30, repaymentProbability: 60, assignedToDcaId: 'DCA-CUSTIND-01', credit_tier: 'MEDIUM_RISK', dispute_rate_hist: 0.03, reminder_count: 2 },
      { id: 'cust-014', name: 'Mahindra & Mahindra', accountId: 'FX-556677', contactEmail: 'finance@mahindra.com', contactPhone: '+91-22-33445566', region: 'Asia Pacific', status: 'Active', totalDebt: 850000.00, daysOverdue: 15, repaymentProbability: 90, assignedToDcaId: 'DCA-B2BEXP-05', credit_tier: 'LOW_RISK', dispute_rate_hist: 0.01, reminder_count: 1 },
      { id: 'cust-015', name: 'HDFC Bank Corporate', accountId: 'FX-667788', contactEmail: 'billing@hdfc.com', contactPhone: '+91-22-12345678', region: 'Asia Pacific', status: 'Active', totalDebt: 95000.00, daysOverdue: 5, repaymentProbability: 99, assignedToDcaId: null, credit_tier: 'LOW_RISK', dispute_rate_hist: 0.00, reminder_count: 0 },
      { id: 'cust-016', name: 'ICICI Logistics', accountId: 'FX-889900', contactEmail: 'accounts@icici.com', contactPhone: '+91-22-87654321', region: 'Asia Pacific', status: 'Active', totalDebt: 120000.00, daysOverdue: 20, repaymentProbability: 85, assignedToDcaId: 'DCA-FRTGEN-02', credit_tier: 'LOW_RISK', dispute_rate_hist: 0.02, reminder_count: 2 },
      { id: 'cust-017', name: 'Bajaj Auto', accountId: 'FX-111222', contactEmail: 'finance@bajaj.com', contactPhone: '+91-20-22221111', region: 'Asia Pacific', status: 'Defaulted', totalDebt: 45000.00, daysOverdue: 150, repaymentProbability: 5, assignedToDcaId: 'DCA-LEGAL-04', credit_tier: 'HIGH_RISK', dispute_rate_hist: 0.25, reminder_count: 10 },
      { id: 'cust-018', name: 'Adani Exports', accountId: 'FX-333444', contactEmail: 'billing@adani.com', contactPhone: '+91-79-44443333', region: 'Asia Pacific', status: 'At Risk', totalDebt: 250000.00, daysOverdue: 90, repaymentProbability: 30, assignedToDcaId: 'DCA-B2BEXP-05', credit_tier: 'HIGH_RISK', dispute_rate_hist: 0.12, reminder_count: 6 },
      { id: 'cust-019', name: 'Larsen & Toubro', accountId: 'FX-555666', contactEmail: 'accounts@lntecc.com', contactPhone: '+91-44-66665555', region: 'Asia Pacific', status: 'Negotiating', totalDebt: 180000.00, daysOverdue: 45, repaymentProbability: 50, assignedToDcaId: 'DCA-CUSTIND-01', credit_tier: 'MEDIUM_RISK', dispute_rate_hist: 0.07, reminder_count: 3 },
      { id: 'cust-020', name: 'ITC Limited', accountId: 'FX-777888', contactEmail: 'finance@itc.in', contactPhone: '+91-33-88887777', region: 'Asia Pacific', status: 'Active', totalDebt: 320000.00, daysOverdue: 12, repaymentProbability: 92, assignedToDcaId: null, credit_tier: 'LOW_RISK', dispute_rate_hist: 0.01, reminder_count: 1 },
      { id: 'cust-021', name: 'JSW Steel', accountId: 'FX-999000', contactEmail: 'billing@jsw.in', contactPhone: '+91-22-00009999', region: 'Asia Pacific', status: 'Active', totalDebt: 650000.00, daysOverdue: 25, repaymentProbability: 80, assignedToDcaId: 'DCA-B2BEXP-05', credit_tier: 'MEDIUM_RISK', dispute_rate_hist: 0.04, reminder_count: 3 },
      { id: 'cust-022', name: 'Godrej Industries', accountId: 'FX-121212', contactEmail: 'accounts@godrej.com', contactPhone: '+91-22-12121212', region: 'Asia Pacific', status: 'At Risk', totalDebt: 85000.00, daysOverdue: 65, repaymentProbability: 45, assignedToDcaId: 'DCA-CUSTIND-01', credit_tier: 'MEDIUM_RISK', dispute_rate_hist: 0.09, reminder_count: 4 },
      { id: 'cust-023', name: 'Bharti Airtel', accountId: 'FX-343434', contactEmail: 'billing@airtel.in', contactPhone: '+91-11-34343434', region: 'Asia Pacific', status: 'Active', totalDebt: 450000.00, daysOverdue: 5, repaymentProbability: 97, assignedToDcaId: null, credit_tier: 'LOW_RISK', dispute_rate_hist: 0.00, reminder_count: 0 },
      { id: 'cust-024', name: 'Maruti Suzuki', accountId: 'FX-565656', contactEmail: 'finance@maruti.co.in', contactPhone: '+91-11-56565656', region: 'Asia Pacific', status: 'Active', totalDebt: 950000.00, daysOverdue: 15, repaymentProbability: 88, assignedToDcaId: 'DCA-FRTGEN-02', credit_tier: 'LOW_RISK', dispute_rate_hist: 0.02, reminder_count: 2 },
      { id: 'cust-025', name: 'ONGC Corporate', accountId: 'FX-787878', contactEmail: 'accounts@ongc.co.in', contactPhone: '+91-11-78787878', region: 'Asia Pacific', status: 'Active', totalDebt: 1200000.00, daysOverdue: 20, repaymentProbability: 85, assignedToDcaId: null, credit_tier: 'LOW_RISK', dispute_rate_hist: 0.03, reminder_count: 2 },
      { id: 'cust-026', name: 'Indian Oil', accountId: 'FX-909090', contactEmail: 'billing@iocl.com', contactPhone: '+91-11-90909090', region: 'Asia Pacific', status: 'At Risk', totalDebt: 340000.00, daysOverdue: 85, repaymentProbability: 35, assignedToDcaId: 'DCA-LEGAL-04', credit_tier: 'HIGH_RISK', dispute_rate_hist: 0.15, reminder_count: 5 },
      { id: 'cust-027', name: 'Hindalco Industries', accountId: 'FX-131313', contactEmail: 'finance@hindalco.adityabirla.com', contactPhone: '+91-22-13131313', region: 'Asia Pacific', status: 'Negotiating', totalDebt: 120000.00, daysOverdue: 40, repaymentProbability: 55, assignedToDcaId: 'DCA-CUSTIND-01', credit_tier: 'MEDIUM_RISK', dispute_rate_hist: 0.06, reminder_count: 3 },
      { id: 'cust-028', name: 'Zomato Logistics', accountId: 'FX-242424', contactEmail: 'billing@zomato.com', contactPhone: '+91-124-2424242', region: 'Asia Pacific', status: 'Active', totalDebt: 55000.00, daysOverdue: 10, repaymentProbability: 90, assignedToDcaId: 'DCA-FRTGEN-02', credit_tier: 'LOW_RISK', dispute_rate_hist: 0.02, reminder_count: 1 },
      { id: 'cust-029', name: 'Swiggy Delivery Corp', accountId: 'FX-353535', contactEmail: 'finance@swiggy.in', contactPhone: '+91-80-35353535', region: 'Asia Pacific', status: 'Active', totalDebt: 65000.00, daysOverdue: 12, repaymentProbability: 88, assignedToDcaId: 'DCA-FRTGEN-02', credit_tier: 'LOW_RISK', dispute_rate_hist: 0.02, reminder_count: 2 },
      { id: 'cust-030', name: 'Flipkart Tech Supplies', accountId: 'FX-464646', contactEmail: 'accounts@flipkart.com', contactPhone: '+91-80-46464646', region: 'Asia Pacific', status: 'At Risk', totalDebt: 180000.00, daysOverdue: 55, repaymentProbability: 60, assignedToDcaId: 'DCA-B2BEXP-05', credit_tier: 'MEDIUM_RISK', dispute_rate_hist: 0.08, reminder_count: 4 },
      { id: 'cust-031', name: 'Amazon India Seller Svcs', accountId: 'FX-575757', contactEmail: 'billing@amazon.in', contactPhone: '+91-80-57575757', region: 'Asia Pacific', status: 'Active', totalDebt: 450000.00, daysOverdue: 15, repaymentProbability: 95, assignedToDcaId: null, credit_tier: 'LOW_RISK', dispute_rate_hist: 0.01, reminder_count: 1 },
      { id: 'cust-032', name: 'Delhivery B2B', accountId: 'FX-686868', contactEmail: 'ops@delhivery.com', contactPhone: '+91-124-6868686', region: 'Asia Pacific', status: 'Active', totalDebt: 32000.00, daysOverdue: 20, repaymentProbability: 82, assignedToDcaId: 'DCA-FRTGEN-02', credit_tier: 'MEDIUM_RISK', dispute_rate_hist: 0.03, reminder_count: 2 }
    ];
    await Customer.bulkCreate(customersData, { ignoreDuplicates: true });
    console.log(`✓ Created ${customersData.length} customers\n`);

    // ==================== SEED INVOICES ====================
    console.log('Seeding invoices...');
    const invoicesData = [];
    const today = new Date();
    for (let i = 0; i < 150; i++) {
      const invoiceDate = new Date();
      invoiceDate.setDate(today.getDate() - Math.floor(Math.random() * 180)); // Last 6 months
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(invoiceDate.getDate() + 30);
      
      invoicesData.push({
        invoice_id: `INV-2026-${String(i + 1).padStart(5, '0')}`,
        customer_name: customersData[i % customersData.length].name,
        invoice_date: invoiceDate,
        due_date: dueDate,
      });
    }
    await Invoice.bulkCreate(invoicesData, { ignoreDuplicates: true });
    console.log(`✓ Created ${invoicesData.length} invoices\n`);

    // ==================== SEED CASES ====================
    console.log('Seeding cases...');
    const casesData = [];
    const agentIds = createdAgents.map(agent => agent.id);
    let casesAssignedToAgents = 0;
    
    // Status distribution: 20% RECOVERED, 20% PARTIAL_PAYMENT, 30% CONTACTED, 20% NEW, 10% PROMISED
    const statuses = ['RECOVERED', 'PARTIAL_PAYMENT', 'CONTACTED', 'NEW', 'PROMISED'];
    const statusWeights = [0.2, 0.2, 0.3, 0.2, 0.1];
    
    const getRandomStatus = () => {
      const r = Math.random();
      let sum = 0;
      for (let i = 0; i < statuses.length; i++) {
        sum += statusWeights[i];
        if (r < sum) return statuses[i];
      }
      return 'NEW';
    };

    const categories = ['CUSTOMS_DUTY', 'FREIGHT', 'ADMIN_FEES', 'PENALTIES'];

    for (let i = 0; i < 200; i++) {
      const customer = customersData[i % customersData.length];
      const assignToAgent = Math.random() < 0.75;
      const agentId = assignToAgent ? agentIds[i % agentIds.length] : null;
      
      // Select dca and admin
      const dcaId = assignToAgent ? 'DCA-CUSTIND-01' : (i % 4 === 0 ? 'DCA-CUSTIND-01' : i % 4 === 1 ? 'DCA-FRTGEN-02' : i % 4 === 2 ? 'DCA-B2BEXP-05' : null);
      const dcaAdminId = dcaId ? 'dca-admin-001' : null;
      
      if (assignToAgent) casesAssignedToAgents++;
      
      const caseAmount = Math.floor(Math.random() * 50000) + 5000;
      const dpd = Math.floor(Math.random() * 120);

      casesData.push({
        invoice_id: invoicesData[i % invoicesData.length].invoice_id,
        tracking_no: `TRK${255000 + i}`,
        debt_category: categories[Math.floor(Math.random() * categories.length)],
        debtor_type: caseAmount > 40000 ? 'B2B' : 'B2C',
        debtor_name: customer.name,
        debtor_gstin: customer.accountId.replace('FX-', 'GSTIN'),
        debtor_phone: customer.contactPhone,
        debtor_email: customer.contactEmail,
        case_amount: caseAmount,
        dpd: dpd,
        complexity_score: Math.min(10, (dpd / 12) + (Math.random() * 2)),
        recovery_probability: Math.max(0, 1 - (dpd / 200) - (Math.random() * 0.2)),
        priority: dpd > 90 ? 'HIGH' : dpd > 45 ? 'MEDIUM' : 'LOW',
        dca_id: dcaId,
        dca_admin_id: dcaAdminId,
        agent_id: agentId,
        assigned_at: dcaId ? new Date(today.getTime() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)) : null,
        status: getRandomStatus(),
        first_contact_due: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        recovery_due: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
      });
    }
    await Case.bulkCreate(casesData, { ignoreDuplicates: true });
    console.log(`✓ Created ${casesData.length} cases (${casesAssignedToAgents} assigned to agents)\n`);

    // ==================== SEED CASE LOGS ====================
    console.log('Seeding case logs...');
    const caseLogsData = [];
    const actionTypes = ['CALL_CUSTOMER', 'EMAIL_SENT', 'FIELD_VISIT', 'PROMISE_TO_PAY', 'PAYMENT_RECEIVED'];
    const logDetails = [
      'Customer requested a call back after 3 PM',
      'Sent payment reminder email with invoice attached',
      'Site visit conducted, verified business address',
      'Debtor promised to pay by end of the week',
      'Partial payment received via bank transfer',
      'Contacted finance dept, person on leave',
      'Dispute raised regarding freight charges',
      'Call disconnected repeatedly',
      'Promise received for 50% payment'
    ];
    const outcomes = ['PROMISE_RECEIVED', 'NO_RESPONSE', 'CONTACTED', 'PARTIAL_PAYMENT', 'DISPUTE_RAISED'];

    // Get actual case IDs
    const createdCases = await Case.findAll({ order: [['created_at', 'DESC']], limit: 200 });
    
    for (let i = 0; i < 500; i++) {
      const caseItem = createdCases[i % createdCases.length];
      const logDate = new Date();
      logDate.setDate(today.getDate() - Math.floor(Math.random() * 30));

      caseLogsData.push({
        case_id: caseItem.case_id,
        action_type: actionTypes[Math.floor(Math.random() * actionTypes.length)],
        action_details: logDetails[Math.floor(Math.random() * logDetails.length)],
        outcome: outcomes[Math.floor(Math.random() * outcomes.length)],
        next_action: 'FOLLOW_UP',
        next_action_date: new Date(today.getTime() + (Math.floor(Math.random() * 7) + 1) * 24 * 60 * 60 * 1000),
        logged_by: 'dca-agent-001', // General agent ID string or use real one
        created_at: logDate
      });
    }
    
    await CaseLog.bulkCreate(caseLogsData, { ignoreDuplicates: true });
    console.log(`✓ Created ${caseLogsData.length} case logs\n`);

    // ==================== SUMMARY ====================
    console.log('\n✅ All seed data created successfully!\n');
    console.log('Summary:');
    console.log('  - Users: 3 (FEDEX_ADMIN, DCA_ADMIN, DCA_AGENT)');
    console.log(`  - DCA Agencies: ${dcaAgenciesData.length}`);
    console.log(`  - DCA Agents: ${createdAgents.length}`);
    console.log(`  - Customers: ${customersData.length}`);
    console.log(`  - Invoices: ${invoicesData.length}`);
    console.log(`  - Cases: ${casesData.length} (${casesAssignedToAgents} assigned to agents)`);
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
