
export enum UserRole {
  FEDEX_ADMIN = 'FEDEX_ADMIN',
  DCA_AGENT = 'DCA_AGENT'
}

export enum CustomerStatus {
  ACTIVE = 'Active',
  NEGOTIATING = 'Negotiating',
  NEW = 'New',
  AT_RISK = 'At Risk',
  DEFAULTED = 'Defaulted',
  REVIEW = 'Review',
  LEGAL_ACTION = 'Legal Action',
  CLOSED = 'Closed'
}

export type ActionType = 'CALL' | 'VISIT' | 'LEGAL_NOTICE' | 'RECOVERY_PLAN';

export interface DcaAction {
  id: string;
  type: ActionType;
  date: string;
  notes: string;
  performedBy: string;
}

export interface Customer {
  id: string;
  name: string;
  accountId: string;
  contactEmail: string;
  contactPhone: string;
  region: string;
  status: CustomerStatus;
  totalDebt: number;
  daysOverdue: number;
  repaymentProbability: number;
  lastUpdated: string;
  notes?: string;
  assignedToDcaId?: string;
  actions: DcaAction[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  agencyId?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  description: string;
  image: string;
}
