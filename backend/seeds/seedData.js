const bcrypt = require('bcryptjs');
const { User, Customer, EmailTemplate, DcaAction } = require('../src/models');

const seedData = async () => {
  try {
    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.bulkCreate([
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

    // Create customers
    const customers = await Customer.bulkCreate([
      {
        id: '1',
        name: 'Acme Logistics Corp',
        accountId: 'FX-883920',
        contactEmail: 'jane.doe@acme.com',
        contactPhone: '+1 (555) 123-4567',
        region: 'North America',
        status: 'Negotiating',
        totalDebt: 12450.00,
        daysOverdue: 15,
        repaymentProbability: 85,
        notes: 'Preferred delivery window: 9AM - 5PM EST.',
      },
      {
        id: '2',
        name: 'Globex Inc',
        accountId: 'FX-992104',
        contactEmail: 'billing@globex.io',
        contactPhone: '+1 (555) 987-6543',
        region: 'Europe',
        status: 'New',
        totalDebt: 5200.00,
        daysOverdue: 5,
        repaymentProbability: 92,
      },
      {
        id: '3',
        name: 'Soylent Corp',
        accountId: 'FX-445120',
        contactEmail: 'collections@soylent.com',
        contactPhone: '+1 (555) 234-5678',
        region: 'North America',
        status: 'At Risk',
        totalDebt: 28900.00,
        daysOverdue: 45,
        repaymentProbability: 45,
      },
      {
        id: '4',
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
      },
      {
        id: '5',
        name: 'Umbrella Corp',
        accountId: 'FX-881230',
        contactEmail: 'wesker@umbrella.com',
        contactPhone: '+1 (555) 666-7777',
        region: 'North America',
        status: 'Legal Action',
        totalDebt: 150000.00,
        daysOverdue: 120,
        repaymentProbability: 5,
        assignedToDcaId: 'agency_alpha',
      },
    ]);

    // Create DCA actions
    await DcaAction.bulkCreate([
      {
        id: 'a1',
        customerId: '3',
        type: 'CALL',
        date: new Date('2023-10-20'),
        notes: 'First reminder call. Customer promised payment next week.',
        performedBy: 'System',
      },
      {
        id: 'a2',
        customerId: '4',
        type: 'CALL',
        date: new Date('2023-10-21'),
        notes: 'DCA Initial Contact. No answer.',
        performedBy: 'Agent Smith',
      },
      {
        id: 'a3',
        customerId: '4',
        type: 'VISIT',
        date: new Date('2023-10-23'),
        notes: 'Site visit. Premises appears abandoned.',
        performedBy: 'Agent Smith',
      },
      {
        id: 'a4',
        customerId: '5',
        type: 'LEGAL_NOTICE',
        date: new Date('2023-10-22'),
        notes: 'Legal notice served via certified mail.',
        performedBy: 'Legal Dept',
      },
    ]);

    // Create email templates
    await EmailTemplate.bulkCreate([
      {
        id: 'tpl_1',
        name: 'Q3 Shipping Update',
        subject: 'Important Updates Regarding Your Q3 Shipments',
        description: 'Standard quarterly update regarding rate adjustments and holiday hours.',
        image: 'https://picsum.photos/400/225?random=1',
        body: `Dear {{ContactName}},

We are writing to inform you about upcoming changes to our shipping schedules for the North American region. As a valued partner with {{Status}} status, we want to ensure your logistics operations remain seamless.

Action Required:
Please review your shipment manifest for the week of October 15th via your dashboard.

Best regards,
The FedEx Logistics Team`,
      },
      {
        id: 'tpl_2',
        name: 'Service Alert',
        subject: 'Urgent: Service Interruption Notice',
        description: 'Urgent notification for weather delays or system maintenance.',
        image: 'https://picsum.photos/400/225?random=2',
        body: `URGENT: Service Alert

Dear {{ContactName}},

Due to severe weather conditions, some services in your region may experience delays. We are monitoring the situation closely.

Best regards,
FedEx Operations`,
      },
      {
        id: 'tpl_3',
        name: 'Payment Reminder',
        subject: 'Reminder: Outstanding Balance for Account {{AccountID}}',
        description: 'Soft reminder for upcoming or slightly overdue payments.',
        image: 'https://picsum.photos/400/225?random=3',
        body: `Dear {{ContactName}},

This is a friendly reminder regarding your outstanding balance of {{DebtAmount}}. We value your business and would like to ensure your account remains in good standing.

Best regards,
FedEx Billing`,
      },
    ]);

    console.log('Seed data created successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

module.exports = seedData;
