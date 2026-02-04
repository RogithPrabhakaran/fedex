/**
 * Seed Data for 3-Tier DCA Role-Based System
 * 
 * Creates:
 * - 1 FedEx Admin
 * - 2 DCA Agencies (with 1 DCA Admin each)
 * - Multiple DCA Agents (under each admin)
 * - Sample cases assigned across the hierarchy
 */

const bcrypt = require('bcryptjs');
const {
  User,
  DcaAgency,
  Case,
  CaseLog,
  AgentAction,
  sequelize
} = require('../src/models');

// UUID generator
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const seedRoleBasedData = async () => {
  try {
    console.log('\n🌱 Starting role-based seed process...\n');

    // Clear existing data (optional - comment out to keep existing data)
    /*await AgentAction.destroy({ where: {}, truncate: true });
    await CaseLog.destroy({ where: {}, truncate: true });
    await Case.destroy({ where: {}, truncate: true });
    await User.destroy({ where: { role: ['FEDEX_ADMIN', 'DCA_ADMIN', 'DCA_AGENT'] } });
    await DcaAgency.update({ admin_user_id: null }, { where: {} });*/

    const hashedPassword = await bcrypt.hash('password123', 10);

    // ===== 1. Create FedEx Admin =====
    console.log('👤 Creating FedEx Admin...');
    const fedexAdmin = await User.create({
      id: 'fedex-admin-001',
      email: 'fedex@fedex.com',
      password: hashedPassword,
      name: 'Shivram FEDEX',
      role: 'FEDEX_ADMIN',
      dca_id: null,
      parent_dca_admin_id: null,
      status: 'ACTIVE',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fedex',
    });
    console.log('   ✅ FedEx Admin created:', fedexAdmin.email);

    // ===== 2. Create DCA Agencies & Admins =====
    console.log('\n🏢 Creating DCA Agencies and Admins...');

    // Agency 1: Agile Debt Collections
    const dcaAdminAgile = await User.create({
      id: 'dca-admin-agile-001',
      email: 'admin@agile-debt.com',
      password: hashedPassword,
      name: 'Rajesh Kumar',
      role: 'DCA_ADMIN',
      dca_id: 'DCA-AGILE-24',
      parent_dca_admin_id: null,
      status: 'ACTIVE',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh',
    });

    const agileAgency = await DcaAgency.create({
      dca_id: 'DCA-AGILE-24',
      agency_name: 'Agile Debt Collections',
      short_name: 'Agile',
      admin_email: 'admin@agile-debt.com',
      admin_user_id: dcaAdminAgile.id,
      status: 'ACTIVE',
      specialization: 'B2B Corporate Debt',
      regions: 'North India',
      contact_phone: '+91-9876543210',
      contact_email: 'contact@agile-debt.com',
      recovery_rate_overall: 42.50,
      total_cases_handled: 0,
      active_cases: 0,
      recovered_amount: 0.00,
    });
    console.log('   ✅ DCA Admin (Agile):', dcaAdminAgile.email);
    console.log('   ✅ Agency:', agileAgency.agency_name);

    // Agency 2: Core Collections
    const dcaAdminCore = await User.create({
      id: 'dca-admin-core-001',
      email: 'admin@core-collections.com',
      password: hashedPassword,
      name: 'Priya Sharma',
      role: 'DCA_ADMIN',
      dca_id: 'DCA-CORE-43',
      parent_dca_admin_id: null,
      status: 'ACTIVE',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
    });

    const coreAgency = await DcaAgency.create({
      dca_id: 'DCA-CORE-43',
      agency_name: 'Core Collections',
      short_name: 'Core',
      admin_email: 'admin@core-collections.com',
      admin_user_id: dcaAdminCore.id,
      status: 'ACTIVE',
      specialization: 'B2C Small Claims',
      regions: 'South India',
      contact_phone: '+91-8765432109',
      contact_email: 'contact@core-collections.com',
      recovery_rate_overall: 38.20,
      total_cases_handled: 0,
      active_cases: 0,
      recovered_amount: 0.00,
    });
    console.log('   ✅ DCA Admin (Core):', dcaAdminCore.email);
    console.log('   ✅ Agency:', coreAgency.agency_name);

    // ===== 3. Create DCA Agents =====
    console.log('\n👥 Creating DCA Agents...');

    // Agents for Agile Debt Collections
    const agentAgile1 = await User.create({
      id: 'agent-agile-001',
      email: 'agent1@agile-debt.com',
      password: hashedPassword,
      name: 'Amit Patel',
      role: 'DCA_AGENT',
      dca_id: 'DCA-AGILE-24',
      parent_dca_admin_id: dcaAdminAgile.id,
      status: 'ACTIVE',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amit',
    });

    const agentAgile2 = await User.create({
      id: 'agent-agile-002',
      email: 'agent2@agile-debt.com',
      password: hashedPassword,
      name: 'Sneha Reddy',
      role: 'DCA_AGENT',
      dca_id: 'DCA-AGILE-24',
      parent_dca_admin_id: dcaAdminAgile.id,
      status: 'ACTIVE',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sneha',
    });

    console.log('   ✅ Agent (Agile):', agentAgile1.email);
    console.log('   ✅ Agent (Agile):', agentAgile2.email);

    // Agents for Core Collections
    const agentCore1 = await User.create({
      id: 'agent-core-001',
      email: 'agent1@core-collections.com',
      password: hashedPassword,
      name: 'Vikram Singh',
      role: 'DCA_AGENT',
      dca_id: 'DCA-CORE-43',
      parent_dca_admin_id: dcaAdminCore.id,
      status: 'ACTIVE',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vikram',
    });

    const agentCore2 = await User.create({
      id: 'agent-core-002',
      email: 'agent2@core-collections.com',
      password: hashedPassword,
      name: 'Ananya Iyer',
      role: 'DCA_AGENT',
      dca_id: 'DCA-CORE-43',
      parent_dca_admin_id: dcaAdminCore.id,
      status: 'ACTIVE',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ananya',
    });

    console.log('   ✅ Agent (Core):', agentCore1.email);
    console.log('   ✅ Agent (Core):', agentCore2.email);

    // ===== 4. Create Sample Cases =====
    console.log('\n📋 Creating sample cases...');

    // Cases for Agile (assigned to DCA Admin, some to agents)
    const case1 = await Case.create({
      case_id: uuidv4(),
      tracking_no: 'TRK-2024-001',
      debt_category: 'CUSTOMS_DUTY',
      debtor_type: 'B2B',
      debtor_name: 'Acme Logistics Pvt Ltd',
      debtor_phone: '+91-9123456789',
      debtor_email: 'accounts@acme-logistics.com',
      case_amount: 125000.00,
      dpd: 45,
      complexity_score: 7.2,
      recovery_probability: 0.68,
      priority: 'HIGH',
      dca_id: 'DCA-AGILE-24',
      dca_admin_id: dcaAdminAgile.id,
      agent_id: agentAgile1.id,
      assigned_at: new Date(),
      status: 'CONTACTED',
      first_contact_due: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    });

    const case2 = await Case.create({
      case_id: uuidv4(),
      tracking_no: 'TRK-2024-002',
      debt_category: 'FREIGHT',
      debtor_type: 'B2B',
      debtor_name: 'Tech Solutions Inc',
      debtor_phone: '+91-9234567890',
      debtor_email: 'billing@techsolutions.in',
      case_amount: 85000.00,
      dpd: 30,
      complexity_score: 5.5,
      recovery_probability: 0.75,
      priority: 'MEDIUM',
      dca_id: 'DCA-AGILE-24',
      dca_admin_id: dcaAdminAgile.id,
      agent_id: agentAgile2.id,
      assigned_at: new Date(),
      status: 'PROMISED',
      first_contact_due: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    });

    // Case assigned to DCA but not to agent yet
    const case3 = await Case.create({
      case_id: uuidv4(),
      tracking_no: 'TRK-2024-003',
      debt_category: 'ADMIN_FEES',
      debtor_type: 'B2C',
      debtor_name: 'Rajiv Mehta',
      debtor_phone: '+91-9345678901',
      debtor_email: 'rajiv.mehta@gmail.com',
      case_amount: 15000.00,
      dpd: 20,
      complexity_score: 3.2,
      recovery_probability: 0.82,
      priority: 'LOW',
      dca_id: 'DCA-AGILE-24',
      dca_admin_id: dcaAdminAgile.id,
      agent_id: null, // Not assigned to agent yet
      assigned_at: new Date(),
      status: 'ASSIGNED',
      first_contact_due: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    console.log('   ✅ Case created:', case1.tracking_no, '(Agile - Agent 1)');
    console.log('   ✅ Case created:', case2.tracking_no, '(Agile - Agent 2)');
    console.log('   ✅ Case created:', case3.tracking_no, '(Agile - Unassigned to agent)');

    // Cases for Core Collections
    const case4 = await Case.create({
      case_id: uuidv4(),
      tracking_no: 'TRK-2024-004',
      debt_category: 'PENALTIES',
      debtor_type: 'B2C',
      debtor_name: 'Sunita Desai',
      debtor_phone: '+91-9456789012',
      debtor_email: 'sunita.desai@yahoo.com',
      case_amount: 8500.00,
      dpd: 15,
      complexity_score: 2.8,
      recovery_probability:0.88,
      priority: 'LOW',
      dca_id: 'DCA-CORE-43',
      dca_admin_id: dcaAdminCore.id,
      agent_id: agentCore1.id,
      assigned_at: new Date(),
      status: 'NEW',
      first_contact_due: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    });

    const case5 = await Case.create({
      case_id: uuidv4(),
      tracking_no: 'TRK-2024-005',
      debt_category: 'CUSTOMS_DUTY',
      debtor_type: 'B2B',
      debtor_name: 'Global Imports Ltd',
      debtor_phone: '+91-9567890123',
      debtor_email: 'payments@globalimports.co.in',
      case_amount: 95000.00,
      dpd: 50,
      complexity_score: 6.5,
      recovery_probability: 0.62,
      priority: 'HIGH',
      dca_id: 'DCA-CORE-43',
      dca_admin_id: dcaAdminCore.id,
      agent_id: agentCore2.id,
      assigned_at: new Date(),
      status: 'CONTACTED',
      first_contact_due: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    });

    console.log('   ✅ Case created:', case4.tracking_no, '(Core - Agent 1)');
    console.log('   ✅ Case created:', case5.tracking_no, '(Core - Agent 2)');

    // ===== 5. Create Sample Agent Actions =====
    console.log('\n📝 Creating sample agent actions...');

    await AgentAction.create({
      case_id: case1.case_id,
      agent_name: agentAgile1.name,
      action_type: 'PHONE_CALL',
      reasoning: 'Initial contact call. Spoke with CFO. Promised payment by end of month.',
      success: true,
    });

    await AgentAction.create({
      case_id: case2.case_id,
      agent_name: agentAgile2.name,
      action_type: 'EMAIL',
      reasoning: 'Sent payment reminder email. Awaiting response.',
      success: true,
    });

    await AgentAction.create({
      case_id: case5.case_id,
      agent_name: agentCore2.name,
      action_type: 'PHONE_CALL',
      reasoning: 'Contact attempt. Debtor disputes amount. Claims invoice error. Escalating to FedEx.',
      success: false,
    });

    console.log('   ✅ Agent actions created');

    // ===== Summary =====
    console.log('\n✨ Seed complete!\n');
    console.log('📊 Summary:');
    console.log('   - 1 FedEx Admin');
    console.log('   - 2 DCA Agencies');
    console.log('   - 2 DCA Admins (1 per agency)');
    console.log('   - 4 DCA Agents (2 per agency)');
    console.log('   - 5 Sample Cases');
    console.log('   - 3 Agent Actions\n');

    console.log('🔑 Login Credentials (password: password123):');
    console.log('   FedEx Admin:       fedex@fedex.com');
    console.log('   DCA Admin (Agile): admin@agile-debt.com');
    console.log('   DCA Admin (Core):  admin@core-collections.com');
    console.log('   Agent 1 (Agile):   agent1@agile-debt.com');
    console.log('   Agent 2 (Agile):   agent2@agile-debt.com');
    console.log('   Agent 1 (Core):    agent1@core-collections.com');
    console.log('   Agent 2 (Core):    agent2@core-collections.com\n');

  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  sequelize.sync({ alter: true }).then(() => {
    seedRoleBasedData()
      .then(() => {
        console.log('✅ All done!');
        process.exit(0);
      })
      .catch((err) => {
        console.error('Error:', err);
        process.exit(1);
      });
  });
}

module.exports = seedRoleBasedData;
