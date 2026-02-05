export const mockCases = [
    { id: 101, accountId: 'ACC-8392', name: 'Global Logistics Inc', totalDebt: 12500, daysOverdue: 45, status: 'Active', assignedToDcaId: 'agency_alpha', hoursToSla: 24.5, slaStatus: 'OK', sopComplianceScore: 92, repaymentProbability: 85, agentAlerts: [] },
    { id: 102, accountId: 'ACC-1204', name: 'TechStart Solutions', totalDebt: 45000, daysOverdue: 92, status: 'Active', assignedToDcaId: 'agency_beta', hoursToSla: 4.2, slaStatus: 'WARNING', sopComplianceScore: 78, repaymentProbability: 45, agentAlerts: [] },
    { id: 103, accountId: 'ACC-9921', name: 'Midwest Retailers', totalDebt: 8200, daysOverdue: 120, status: 'Legal Action', assignedToDcaId: 'agency_alpha', hoursToSla: 0, slaStatus: 'BREACHED', sopComplianceScore: 65, repaymentProbability: 10, agentAlerts: [] },
    { id: 104, accountId: 'ACC-3342', name: 'Apex Manufacturing', totalDebt: 15600, daysOverdue: 32, status: 'Active', assignedToDcaId: 'agency_alpha', hoursToSla: 12.0, slaStatus: 'OK', sopComplianceScore: 88, repaymentProbability: 92, agentAlerts: [] },
    { id: 105, accountId: 'ACC-7728', name: 'Beta Systems Corp', totalDebt: 22000, daysOverdue: 60, status: 'Active', assignedToDcaId: 'agency_beta', hoursToSla: 18.5, slaStatus: 'OK', sopComplianceScore: 95, repaymentProbability: 75, agentAlerts: [] },
    { id: 106, accountId: 'ACC-1122', name: 'Urban Outfitters Ltd', totalDebt: 5500, daysOverdue: 15, status: 'Active', assignedToDcaId: null, hoursToSla: 48.0, slaStatus: 'OK', sopComplianceScore: 100, repaymentProbability: 95, agentAlerts: [] },
    { id: 107, accountId: 'ACC-4455', name: 'Summit Groups', totalDebt: 128000, daysOverdue: 180, status: 'Active', assignedToDcaId: 'agency_beta', hoursToSla: 1.5, slaStatus: 'WARNING', sopComplianceScore: 50, repaymentProbability: 20, agentAlerts: [] },
    { id: 108, accountId: 'ACC-6677', name: 'Rapid Transport', totalDebt: 3400, daysOverdue: 5, status: 'Active', assignedToDcaId: null, hoursToSla: 72.0, slaStatus: 'OK', sopComplianceScore: 100, repaymentProbability: 98, agentAlerts: [] },
    { id: 109, accountId: 'ACC-8899', name: 'NextGen Tech', totalDebt: 67000, daysOverdue: 75, status: 'Active', assignedToDcaId: 'agency_alpha', hoursToSla: 8.0, slaStatus: 'OK', sopComplianceScore: 82, repaymentProbability: 60, agentAlerts: [] },
    { id: 110, accountId: 'ACC-0011', name: 'Old Town Store', totalDebt: 1500, daysOverdue: 200, status: 'Closed', assignedToDcaId: 'agency_beta', hoursToSla: 0, slaStatus: 'OK', sopComplianceScore: 90, repaymentProbability: 100, agentAlerts: [] },
];

export const mockAgencies = [
    { id: 'agency_alpha', name: 'Alpha Collections', score: 92, activeCases: 4, recovered: 125000 },
    { id: 'agency_beta', name: 'Beta Recovery', score: 78, activeCases: 3, recovered: 98000 },
];

export const mockAgentAlerts = [
    { id: 1, type: 'warning', message: 'SLA Warning: Case-102 approaching limit', timestamp: new Date(Date.now() - 100000).toISOString(), agent: 'SLA_WATCHDOG' },
    { id: 2, type: 'info', message: 'SOP Check completed for Alpha Collections', timestamp: new Date(Date.now() - 500000).toISOString(), agent: 'SOP_AGENT' },
];

export const mockCaseLogs = [
    { id: 101, caseId: 'CASE-101', actor: 'SYSTEM', message: 'Case assigned to Alpha Collections', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: 102, caseId: 'CASE-101', actor: 'SLA_WATCHDOG', message: 'SLA Timer started (48h)', timestamp: new Date(Date.now() - 86390000).toISOString() },
    { id: 103, caseId: 'CASE-102', actor: 'DCA_USER', message: 'Updated payment terms negotiation', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 104, caseId: 'CASE-103', actor: 'SYSTEM', message: 'Legal Notice Triggered', timestamp: new Date(Date.now() - 200000).toISOString() },
    { id: 105, caseId: 'CASE-105', actor: 'SOP_AGENT', message: 'Compliance verified: Step 2', timestamp: new Date(Date.now() - 100000).toISOString() },
];
