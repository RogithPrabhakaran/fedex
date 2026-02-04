require('dotenv').config();
const sequelize = require('../src/config/database');
const { Invoice, Case, CaseLog } = require('../src/models');

// Simple UUID generator
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper to generate random date in the past
function randomPastDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
}

// Helper to generate date offset from another date
function dateOffset(baseDate, days) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);
  return date;
}

// DCA IDs from seedDcaData.js
const DCA_IDS = [
  'DCA-AGILE-24', 'DCA-AVGRES-06', 'DCA-B2BEXP-05', 'DCA-CARGO-38',
  'DCA-CITY-25', 'DCA-CORE-43', 'DCA-CORP-20', 'DCA-CUSTIND-01',
  'DCA-DELTA-48', 'DCA-DIGITAL-36', 'DCA-DISPUTE-35', 'DCA-EAST-13',
  'DCA-ELITE-46', 'DCA-ENTERP-10', 'DCA-EXPRESS-21', 'DCA-FAST-31',
  'DCA-FIELD-08', 'DCA-FRTGEN-02', 'DCA-GLOBAL-18', 'DCA-HEAVY-34',
  'DCA-LEGAL-04', 'DCA-LINK-41', 'DCA-LOCAL-19', 'DCA-LOGISTIC-28',
  'DCA-METRO-45', 'DCA-MICRO-29', 'DCA-NATION-32', 'DCA-NORTH-11',
  'DCA-OMEGA-47', 'DCA-PARTNER-30'
];

// Indian company names and GSTINs
const INDIAN_COMPANIES = [
  { name: 'Tata Motors Ltd', gstin: '27AAACT2727Q1ZV', phone: '+91-9876543210', email: 'accounts@tatamotors.com' },
  { name: 'Reliance Industries', gstin: '27AAACR5055K1Z5', phone: '+91-9876543211', email: 'billing@ril.com' },
  { name: 'Infosys Technologies', gstin: '29AAACI1681G1ZT', phone: '+91-9876543212', email: 'finance@infosys.com' },
  { name: 'Wipro Limited', gstin: '29AAACW3775F1ZT', phone: '+91-9876543213', email: 'payments@wipro.com' },
  { name: 'Mahindra & Mahindra', gstin: '27AAACM0307L1ZV', phone: '+91-9876543214', email: 'ar@mahindra.com' },
  { name: 'Bharti Airtel Ltd', gstin: '07AAACB2983M1ZV', phone: '+91-9876543215', email: 'collections@airtel.in' },
  { name: 'HDFC Bank Ltd', gstin: '27AAACH6188F1ZW', phone: '+91-9876543216', email: 'ops@hdfcbank.com' },
  { name: 'ICICI Bank Ltd', gstin: '27AAACI5190G1Z0', phone: '+91-9876543217', email: 'treasury@icicibank.com' },
  { name: 'Larsen & Toubro', gstin: '27AAACL0287M1ZX', phone: '+91-9876543218', email: 'finance@larsentoubro.com' },
  { name: 'Asian Paints Ltd', gstin: '27AAACA3834R1ZX', phone: '+91-9876543219', email: 'accounts@asianpaints.com' },
  { name: 'Bajaj Auto Ltd', gstin: '27AAACB2934M1Z1', phone: '+91-9876543220', email: 'billing@bajajauto.com' },
  { name: 'Sun Pharma Industries', gstin: '24AAACS3878M1ZZ', phone: '+91-9876543221', email: 'finance@sunpharma.com' },
  { name: 'Maruti Suzuki India', gstin: '07AAACM0551L1Z7', phone: '+91-9876543222', email: 'payments@marutisuzuki.com' },
  { name: 'HCL Technologies', gstin: '09AAACH1849F1ZF', phone: '+91-9876543223', email: 'ar@hcltech.com' },
  { name: 'Tech Mahindra Ltd', gstin: '27AAACT6727M1ZU', phone: '+91-9876543224', email: 'billing@techmahindra.com' },
  { name: 'Adani Ports & SEZ', gstin: '24AAACA1234E1ZY', phone: '+91-9876543225', email: 'finance@adaniports.com' },
  { name: 'Ultratech Cement', gstin: '27AAACL0287M1ZY', phone: '+91-9876543226', email: 'accounts@ultratechcement.com' },
  { name: 'Grasim Industries', gstin: '27AAACG1234M1ZP', phone: '+91-9876543227', email: 'payments@grasim.com' },
  { name: 'Hindalco Industries', gstin: '27AAACH1234M1ZQ', phone: '+91-9876543228', email: 'treasury@hindalco.com' },
  { name: 'JSW Steel Ltd', gstin: '29AAACJ1234M1ZR', phone: '+91-9876543229', email: 'finance@jswsteel.in' },
  { name: 'Vedanta Limited', gstin: '27AAACV1234M1ZS', phone: '+91-9876543230', email: 'ar@vedantalimited.com' },
  { name: 'Coal India Ltd', gstin: '19AAACC1234M1ZT', phone: '+91-9876543231', email: 'billing@coalindia.in' },
  { name: 'NTPC Limited', gstin: '07AAACN1234M1ZU', phone: '+91-9876543232', email: 'finance@ntpc.co.in' },
  { name: 'Power Grid Corp', gstin: '07AAACP1234M1ZV', phone: '+91-9876543233', email: 'accounts@powergrid.in' },
  { name: 'ONGC Ltd', gstin: '27AAACO1234M1ZW', phone: '+91-9876543234', email: 'payments@ongc.co.in' },
  { name: 'Indian Oil Corp', gstin: '07AAACI1234M1ZX', phone: '+91-9876543235', email: 'treasury@iocl.com' },
  { name: 'BPCL', gstin: '27AAACB1234M1ZY', phone: '+91-9876543236', email: 'finance@bharatpetroleum.in' },
  { name: 'HPCL', gstin: '27AAACH1234M1ZZ', phone: '+91-9876543237', email: 'ar@hindustanpetroleum.com' },
  { name: 'Shree Cement Ltd', gstin: '08AAACS1234M1Z1', phone: '+91-9876543238', email: 'billing@shreecement.com' },
  { name: 'Ambuja Cements', gstin: '24AAACA1234M1Z2', phone: '+91-9876543239', email: 'finance@ambujacement.com' },
  { name: 'ACC Limited', gstin: '27AAACA1234M1Z3', phone: '+91-9876543240', email: 'accounts@acclimited.com' },
  { name: 'Godrej Consumer', gstin: '27AAACG1234M1Z4', phone: '+91-9876543241', email: 'payments@godrejcp.com' },
  { name: 'Britannia Industries', gstin: '19AAACB1234M1Z5', phone: '+91-9876543242', email: 'treasury@britannia.co.in' },
  { name: 'Nestle India Ltd', gstin: '09AAACN1234M1Z6', phone: '+91-9876543243', email: 'finance@nestle.in' },
  { name: 'Dabur India Ltd', gstin: '07AAACD1234M1Z7', phone: '+91-9876543244', email: 'ar@dabur.com' },
  { name: 'Marico Limited', gstin: '27AAACM1234M1Z8', phone: '+91-9876543245', email: 'billing@marico.com' },
  { name: 'Colgate Palmolive', gstin: '27AAACC1234M1Z9', phone: '+91-9876543246', email: 'finance@colgate.com' },
  { name: 'Hindustan Unilever', gstin: '27AAACH1234M2Z0', phone: '+91-9876543247', email: 'accounts@hul.co.in' },
  { name: 'ITC Limited', gstin: '19AAACI1234M2Z1', phone: '+91-9876543248', email: 'payments@itc.in' },
  { name: 'Pidilite Industries', gstin: '27AAACP1234M2Z2', phone: '+91-9876543249', email: 'treasury@pidilite.com' },
  { name: 'Berger Paints India', gstin: '19AAACB1234M2Z3', phone: '+91-9876543250', email: 'finance@bergerpaints.com' },
  { name: 'Kansai Nerolac', gstin: '27AAACK1234M2Z4', phone: '+91-9876543251', email: 'ar@kansainerolac.com' },
  { name: 'Tata Steel Ltd', gstin: '20AAACT1234M2Z5', phone: '+91-9876543252', email: 'billing@tatasteel.com' },
  { name: 'Tata Power Company', gstin: '27AAACT1234M2Z6', phone: '+91-9876543253', email: 'finance@tatapower.com' },
  { name: 'Tata Chemicals', gstin: '24AAACT1234M2Z7', phone: '+91-9876543254', email: 'accounts@tatachemicals.com' },
  { name: 'Tata Consumer', gstin: '27AAACT1234M2Z8', phone: '+91-9876543255', email: 'payments@tataconsumer.com' },
  { name: 'Titan Company Ltd', gstin: '29AAACT1234M2Z9', phone: '+91-9876543256', email: 'treasury@titan.co.in' },
  { name: 'Voltas Limited', gstin: '27AAACV1234M3Z0', phone: '+91-9876543257', email: 'finance@voltas.com' },
  { name: 'Crompton Greaves', gstin: '27AAACC1234M3Z1', phone: '+91-9876543258', email: 'ar@crompton.co.in' },
  { name: 'Havells India Ltd', gstin: '07AAACH1234M3Z2', phone: '+91-9876543259', email: 'billing@havells.com' }
];

const DEBT_CATEGORIES = ['CUSTOMS_DUTY', 'FREIGHT', 'ADMIN_FEES', 'PENALTIES'];
const DEBTOR_TYPES = ['B2B', 'B2C'];
const CASE_STATUSES = ['NEW', 'ASSIGNED', 'CONTACTED', 'PROMISED', 'PARTIAL_PAYMENT', 'RECOVERED', 'WRITE_OFF'];
const ACTION_TYPES = ['STATUS_CHANGE', 'COMMENT', 'CALL_LOG', 'EMAIL_SENT', 'PAYMENT_RECEIVED', 'PROMISE_TO_PAY'];

const seedInvoicesCasesCaseLogs = async () => {
  console.log('Starting Invoices, Cases, and Case Logs seeding...');

  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await CaseLog.destroy({ where: {}, truncate: true });
    await Case.destroy({ where: {}, truncate: true });
    await Invoice.destroy({ where: {}, truncate: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✓ Existing data cleared');

    // Generate Invoices (50 invoices)
    console.log('Seeding invoices...');
    const invoices = [];
    for (let i = 0; i < 50; i++) {
      const company = INDIAN_COMPANIES[i % INDIAN_COMPANIES.length];
      const invoiceDate = randomPastDate(180); // Random date in last 180 days
      const daysOverdue = Math.floor(Math.random() * 120);
      
      invoices.push({
        invoice_id: `INV-2025-${String(10000 + i).padStart(5, '0')}`,
        master_edi: `EDI${String(100000 + i).padStart(6, '0')}`,
        invoice_no: `FX${String(200000 + i).padStart(6, '0')}`,
        invoice_date: invoiceDate,
        type: 'O',
        settle: daysOverdue > 30 ? 'D' : null,
        inv_charge: parseFloat((Math.random() * 50000 + 5000).toFixed(2)),
        trans_cnt: Math.floor(Math.random() * 5) + 1,
        tracking_no: `${String(780000000000 + i).substring(0, 12)}`,
        country: 'IN',
        balance_due: parseFloat((Math.random() * 50000 + 5000).toFixed(2)),
        payment_status: daysOverdue > 0 ? 'UNPAID' : Math.random() > 0.7 ? 'PARTIAL' : 'UNPAID',
        tax_id: company.gstin,
        awb_number: `AWB${String(300000 + i).padStart(6, '0')}`,
        bill_of_entry: `BOE${String(400000 + i).padStart(6, '0')}`,
        duty_tax_amount: parseFloat((Math.random() * 10000 + 1000).toFixed(2)),
        total_amount: parseFloat((Math.random() * 60000 + 6000).toFixed(2)),
        total_lines: Math.floor(Math.random() * 10) + 1,
        file_name: `fedex_invoices_2025_batch_${Math.floor(i / 10) + 1}.csv`,
        processed_at: new Date(),
        csv_row_number: (i % 10) + 2,
        createdAt: invoiceDate,
        updatedAt: new Date()
      });
    }
    await Invoice.bulkCreate(invoices);
    console.log(`✓ Created ${invoices.length} invoices`);

    // Generate Cases (60 cases - 50 linked to invoices, 10 standalone)
    console.log('Seeding cases...');
    const cases = [];
    const caseIds = [];
    
    for (let i = 0; i < 60; i++) {
      const company = INDIAN_COMPANIES[i % INDIAN_COMPANIES.length];
      const caseId = uuidv4();
      caseIds.push(caseId);
      
      const invoiceId = i < 50 ? invoices[i].invoice_id : null;
      const trackingNo = i < 50 ? invoices[i].tracking_no : `${String(780000000000 + i).substring(0, 12)}`;
      
      const debtCategory = DEBT_CATEGORIES[Math.floor(Math.random() * DEBT_CATEGORIES.length)];
      const caseAmount = parseFloat((Math.random() * 100000 + 5000).toFixed(2));
      const debtorType = caseAmount > 50000 ? 'B2B' : (Math.random() > 0.3 ? 'B2B' : 'B2C');
      
      const dpd = Math.floor(Math.random() * 150);
      const complexityScore = parseFloat((Math.random() * 7 + 3).toFixed(1)); // 3.0 to 10.0
      const recoveryProbability = parseFloat((Math.random() * 0.8 + 0.2).toFixed(3)); // 0.200 to 1.000
      
      let priority = 'LOW';
      if (complexityScore > 7 || dpd > 90 || caseAmount > 100000) priority = 'HIGH';
      else if (complexityScore > 5 || dpd > 45 || caseAmount > 30000) priority = 'MEDIUM';
      
      // 60% of cases are assigned to DCAs, 40% are unassigned
      const isAssigned = Math.random() > 0.4;
      const dcaId = isAssigned ? DCA_IDS[Math.floor(Math.random() * DCA_IDS.length)] : null;
      
      let status = 'NEW';
      if (isAssigned) {
        const statusOptions = ['ASSIGNED', 'CONTACTED', 'PROMISED', 'PARTIAL_PAYMENT', 'RECOVERED'];
        status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
      } else {
        status = Math.random() > 0.8 ? 'WRITE_OFF' : 'NEW';
      }
      
      const createdAt = randomPastDate(90);
      const assignedAt = isAssigned ? dateOffset(createdAt, Math.floor(Math.random() * 5)) : null;
      const firstContactDue = dateOffset(createdAt, 2);
      const recoveryDue = dateOffset(createdAt, 30);
      const slaWarningThreshold = dateOffset(createdAt, 25);
      const lastAgentCheck = isAssigned ? dateOffset(assignedAt, Math.floor(Math.random() * 10)) : null;
      
      cases.push({
        case_id: caseId,
        invoice_id: invoiceId,
        tracking_no: trackingNo,
        debt_category: debtCategory,
        debtor_type: debtorType,
        debtor_name: company.name,
        debtor_gstin: company.gstin,
        debtor_phone: company.phone,
        debtor_email: company.email,
        case_amount: caseAmount,
        dpd: dpd,
        complexity_score: complexityScore,
        recovery_probability: recoveryProbability,
        priority: priority,
        dca_id: dcaId,
        assigned_at: assignedAt,
        status: status,
        first_contact_due: firstContactDue,
        recovery_due: recoveryDue,
        sla_warning_threshold: slaWarningThreshold,
        last_agent_check: lastAgentCheck,
        created_at: createdAt,
        createdAt: createdAt,
        updatedAt: new Date()
      });
    }
    await Case.bulkCreate(cases);
    console.log(`✓ Created ${cases.length} cases (${cases.filter(c => c.dca_id).length} assigned, ${cases.filter(c => !c.dca_id).length} unassigned)`);

    // Generate Case Logs (3-8 logs per case)
    console.log('Seeding case logs...');
    const caseLogs = [];
    
    for (let i = 0; i < cases.length; i++) {
      const caseData = cases[i];
      const numLogs = Math.floor(Math.random() * 6) + 3; // 3 to 8 logs per case
      
      for (let j = 0; j < numLogs; j++) {
        const logCreatedAt = dateOffset(caseData.created_at, j * Math.floor(Math.random() * 3) + 1);
        
        let actor = 'System';
        let actionType = 'STATUS_CHANGE';
        let description = `Case created with status: ${caseData.status}`;
        
        if (j === 0) {
          actor = 'System';
          actionType = 'STATUS_CHANGE';
          description = `Case created with status: NEW`;
        } else if (j === 1 && caseData.dca_id) {
          actor = 'System';
          actionType = 'STATUS_CHANGE';
          description = `Case assigned to DCA: ${caseData.dca_id}`;
        } else {
          const actionTypeOptions = ['COMMENT', 'CALL_LOG', 'EMAIL_SENT', 'STATUS_CHANGE'];
          actionType = actionTypeOptions[Math.floor(Math.random() * actionTypeOptions.length)];
          
          if (caseData.dca_id) {
            actor = Math.random() > 0.3 ? `DCA_Agent_${caseData.dca_id}` : 'FedEx_Admin';
          } else {
            actor = 'System';
          }
          
          const descriptions = {
            'COMMENT': [
              'Debtor requested payment extension',
              'Debtor confirmed receipt of invoice',
              'Debtor disputed the charges',
              'Debtor promised to pay by end of month',
              'Debtor is facing cash flow issues',
              'Debtor requested detailed invoice breakdown'
            ],
            'CALL_LOG': [
              'Called debtor - no answer, left voicemail',
              'Spoke with debtor - promised payment in 7 days',
              'Debtor unreachable - phone disconnected',
              'Productive call - debtor agreed to payment plan',
              'Debtor requested callback next week',
              'Spoke with accounts team - processing payment'
            ],
            'EMAIL_SENT': [
              'Sent payment reminder email',
              'Sent final notice before legal action',
              'Sent invoice copy as requested',
              'Sent payment plan proposal',
              'Sent SLA warning notification',
              'Sent settlement offer'
            ],
            'STATUS_CHANGE': [
              `Status changed to: ${caseData.status}`,
              'Case escalated to senior team',
              'Case marked for legal review',
              'Payment plan activated',
              'Partial payment received',
              'Case resolved successfully'
            ]
          };
          
          description = descriptions[actionType][Math.floor(Math.random() * descriptions[actionType].length)];
        }
        
        caseLogs.push({
          case_id: caseData.case_id,
          actor: actor,
          action_type: actionType,
          description: description,
          created_at: logCreatedAt
        });
      }
    }
    await CaseLog.bulkCreate(caseLogs);
    console.log(`✓ Created ${caseLogs.length} case logs`);

    console.log('\n✅ Seed data created successfully!');
    console.log(`\nSummary:`);
    console.log(`- Invoices: ${invoices.length}`);
    console.log(`- Cases: ${cases.length} (${cases.filter(c => c.dca_id).length} assigned to DCAs)`);
    console.log(`- Case Logs: ${caseLogs.length}`);
    console.log(`\nCase Status Distribution:`);
    const statusCounts = {};
    cases.forEach(c => {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    });
    Object.keys(statusCounts).forEach(status => {
      console.log(`  - ${status}: ${statusCounts[status]}`);
    });

  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
};

module.exports = seedInvoicesCasesCaseLogs;
