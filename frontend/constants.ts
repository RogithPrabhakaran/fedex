
import { Customer, CustomerStatus, EmailTemplate, UserRole } from './types';

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'Acme Logistics Corp',
    accountId: 'FX-883920',
    contactEmail: 'jane.doe@acme.com',
    contactPhone: '+1 (555) 123-4567',
    region: 'North America',
    status: CustomerStatus.NEGOTIATING,
    totalDebt: 12450.00,
    daysOverdue: 15,
    repaymentProbability: 85,
    lastUpdated: 'Oct 24, 2023',
    notes: 'Preferred delivery window: 9AM - 5PM EST.',
    actions: []
  },
  {
    id: '2',
    name: 'Globex Inc',
    accountId: 'FX-992104',
    contactEmail: 'billing@globex.io',
    contactPhone: '+1 (555) 987-6543',
    region: 'Europe',
    status: CustomerStatus.NEW,
    totalDebt: 5200.00,
    daysOverdue: 5,
    repaymentProbability: 92,
    lastUpdated: 'Oct 23, 2023',
    actions: []
  },
  {
    id: '3',
    name: 'Soylent Corp',
    accountId: 'FX-445120',
    contactEmail: 'collections@soylent.com',
    contactPhone: '+1 (555) 234-5678',
    region: 'North America',
    status: CustomerStatus.AT_RISK,
    totalDebt: 28900.00,
    daysOverdue: 45,
    repaymentProbability: 45,
    lastUpdated: 'Oct 22, 2023',
    actions: [
      { id: 'a1', type: 'CALL', date: 'Oct 20, 2023', notes: 'First reminder call. Customer promised payment next week.', performedBy: 'System' }
    ]
  },
  {
    id: '4',
    name: 'Initech',
    accountId: 'FX-332110',
    contactEmail: 'peters@initech.com',
    contactPhone: '+1 (555) 888-1234',
    region: 'Asia Pacific',
    status: CustomerStatus.DEFAULTED,
    totalDebt: 3100.00,
    daysOverdue: 90,
    repaymentProbability: 12,
    lastUpdated: 'Oct 20, 2023',
    assignedToDcaId: 'agency_alpha',
    actions: [
      { id: 'a2', type: 'CALL', date: 'Oct 21, 2023', notes: 'DCA Initial Contact. No answer.', performedBy: 'Agent Smith' },
      { id: 'a3', type: 'VISIT', date: 'Oct 23, 2023', notes: 'Site visit. Premises appears abandoned.', performedBy: 'Agent Smith' }
    ]
  },
  {
    id: '5',
    name: 'Umbrella Corp',
    accountId: 'FX-881230',
    contactEmail: 'wesker@umbrella.com',
    contactPhone: '+1 (555) 666-7777',
    region: 'North America',
    status: CustomerStatus.LEGAL_ACTION,
    totalDebt: 150000.00,
    daysOverdue: 120,
    repaymentProbability: 5,
    lastUpdated: 'Oct 25, 2023',
    assignedToDcaId: 'agency_alpha',
    actions: [
      { id: 'a4', type: 'LEGAL_NOTICE', date: 'Oct 22, 2023', notes: 'Legal notice served via certified mail.', performedBy: 'Legal Dept' }
    ]
  }
];

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl_1',
    name: 'Q3 Shipping Update',
    subject: 'Important Updates Regarding Your Q3 Shipments',
    description: 'Standard quarterly update regarding rate adjustments and holiday hours.',
    image: 'https://picsum.photos/400/225?random=1',
    body: `Dear {{ContactName}},\n\nWe are writing to inform you about upcoming changes to our shipping schedules for the North American region. As a valued partner with {{Status}} status, we want to ensure your logistics operations remain seamless.\n\nAction Required:\nPlease review your shipment manifest for the week of October 15th via your dashboard.\n\nBest regards,\nThe FedEx Logistics Team`
  },
  {
    id: 'tpl_2',
    name: 'Service Alert',
    subject: 'Urgent: Service Interruption Notice',
    description: 'Urgent notification for weather delays or system maintenance.',
    image: 'https://picsum.photos/400/225?random=2',
    body: `URGENT: Service Alert\n\nDear {{ContactName}},\n\nDue to severe weather conditions, some services in your region may experience delays. We are monitoring the situation closely.\n\nBest regards,\nFedEx Operations`
  },
  {
    id: 'tpl_3',
    name: 'Payment Reminder',
    subject: 'Reminder: Outstanding Balance for Account {{AccountID}}',
    description: 'Soft reminder for upcoming or slightly overdue payments.',
    image: 'https://picsum.photos/400/225?random=3',
    body: `Dear {{ContactName}},\n\nThis is a friendly reminder regarding your outstanding balance of {{DebtAmount}}. We value your business and would like to ensure your account remains in good standing.\n\nBest regards,\nFedEx Billing`
  }
];
