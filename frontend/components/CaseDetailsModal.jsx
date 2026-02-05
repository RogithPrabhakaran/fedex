import React, { useState, useEffect } from 'react';

const CaseDetailsModal = ({ caseId, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [caseData, setCaseData] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [caseLogs, setCaseLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (caseId) {
      fetchCaseDetails();
    }
  }, [caseId]);

  const fetchCaseDetails = async () => {
    setLoading(true);
    try {
      // Mock API calls - Replace with actual endpoints
      // const caseResponse = await fetch(`/api/cases/${caseId}`);
      // const invoiceResponse = await fetch(`/api/cases/${caseId}/invoice`);
      // const logsResponse = await fetch(`/api/cases/${caseId}/logs`);

      // Mock data
      const mockCase = {
        case_id: caseId,
        invoice_id: 'INV-2024-001',
        tracking_no: 'FDX123456789',
        debt_category: 'CUSTOMS_DUTY',
        debtor_type: 'B2B',
        debtor_name: 'Acme Corporation',
        debtor_gstin: '29AABCU9603R1ZX',
        debtor_phone: '+91-9876543210',
        debtor_email: 'finance@acme.com',
        case_amount: 45000.00,
        dpd: 45,
        complexity_score: 7.5,
        recovery_probability: 0.65,
        priority: 'HIGH',
        dca_id: 'DCA-AGILE-24',
        agent_id: '1',
        status: 'ASSIGNED',
        assigned_at: '2024-01-15T10:30:00Z',
        created_at: '2024-01-10T09:00:00Z',
      };

      const mockInvoice = {
        invoice_id: 'INV-2024-001',
        invoice_no: 'FDX-INV-2024-001',
        invoice_date: '2024-01-05',
        tracking_no: 'FDX123456789',
        inv_charge: 45000.00,
        balance_due: 45000.00,
        payment_status: 'UNPAID',
        tax_id: '29AABCU9603R1ZX',
        awb_number: 'AWB123456',
        total_amount: 45000.00,
        country: 'IN',
      };

      const mockLogs = [
        {
          log_id: 1,
          case_id: caseId,
          actor: 'John Doe',
          action_type: 'STATUS_CHANGE',
          description: 'Case assigned to agent',
          created_at: '2024-01-15T10:30:00Z',
        },
        {
          log_id: 2,
          case_id: caseId,
          actor: 'John Doe',
          action_type: 'CALL_LOG',
          description: 'Called debtor. No response. Left voicemail.',
          created_at: '2024-01-16T14:20:00Z',
        },
        {
          log_id: 3,
          case_id: caseId,
          actor: 'John Doe',
          action_type: 'CALL_LOG',
          description: 'Spoke with finance manager. Promised payment by end of month.',
          created_at: '2024-01-18T11:15:00Z',
        },
        {
          log_id: 4,
          case_id: caseId,
          actor: 'System',
          action_type: 'COMMENT',
          description: 'Payment deadline approaching. Follow-up required.',
          created_at: '2024-01-25T09:00:00Z',
        },
      ];

      setCaseData(mockCase);
      setInvoiceData(mockInvoice);
      setCaseLogs(mockLogs);
    } catch (error) {
      console.error('Failed to fetch case details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogCall = () => {
    const description = prompt('Enter call log details:');
    if (description) {
      // Mock API call - Replace with actual endpoint
      console.log('Logging call:', description);
      alert('Call logged successfully!');
      fetchCaseDetails(); // Refresh logs
    }
  };

  const handleSendEmail = () => {
    const message = prompt('Enter email message:');
    if (message) {
      // Mock API call - Replace with actual endpoint
      console.log('Sending email:', message);
      alert('Email sent successfully!');
      fetchCaseDetails(); // Refresh logs
    }
  };

  const handleRecordPayment = () => {
    const amount = prompt('Enter payment amount:');
    if (amount) {
      // Mock API call - Replace with actual endpoint
      console.log('Recording payment:', amount);
      alert('Payment recorded successfully!');
      fetchCaseDetails(); // Refresh data
    }
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      NEW: { color: 'bg-slate-500/10 text-slate-500', label: 'New' },
      ASSIGNED: { color: 'bg-blue-500/10 text-blue-500', label: 'Assigned' },
      CONTACTED: { color: 'bg-orange-500/10 text-orange-500', label: 'Contacted' },
      PROMISED: { color: 'bg-yellow-500/10 text-yellow-500', label: 'Promised' },
      PARTIAL_PAYMENT: { color: 'bg-purple-500/10 text-purple-500', label: 'Partial' },
      RECOVERED: { color: 'bg-green-500/10 text-green-500', label: 'Recovered' },
      WRITE_OFF: { color: 'bg-red-500/10 text-red-500', label: 'Write-off' },
    };
    const config = statusConfig[status] || statusConfig.NEW;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      HIGH: { color: 'bg-red-500/10 text-red-500', icon: 'arrow_upward' },
      MEDIUM: { color: 'bg-yellow-500/10 text-yellow-500', icon: 'remove' },
      LOW: { color: 'bg-green-500/10 text-green-500', icon: 'arrow_downward' },
    };
    const config = priorityConfig[priority] || priorityConfig.MEDIUM;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.color} flex items-center gap-1`}>
        <span className="material-symbols-outlined text-[14px]">{config.icon}</span>
        {priority}
      </span>
    );
  };

  const getActionTypeBadge = (actionType) => {
    const typeConfig = {
      STATUS_CHANGE: { color: 'bg-blue-500/10 text-blue-500', icon: 'sync' },
      CALL_LOG: { color: 'bg-green-500/10 text-green-500', icon: 'call' },
      COMMENT: { color: 'bg-slate-500/10 text-slate-500', icon: 'comment' },
      EMAIL: { color: 'bg-purple-500/10 text-purple-500', icon: 'email' },
      PAYMENT: { color: 'bg-orange-500/10 text-orange-500', icon: 'payments' },
    };
    const config = typeConfig[actionType] || typeConfig.COMMENT;
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${config.color} flex items-center gap-1`}>
        <span className="material-symbols-outlined text-[14px]">{config.icon}</span>
        {actionType.replace('_', ' ')}
      </span>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'invoice', label: 'Invoice', icon: 'receipt' },
    { id: 'debtor', label: 'Debtor', icon: 'person' },
    { id: 'logs', label: 'Logs', icon: 'history' },
    { id: 'actions', label: 'Actions', icon: 'touch_app' },
  ];

  if (!caseData) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-surface-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Case Details
                </h2>
                {getStatusBadge(caseData.status)}
                {getPriorityBadge(caseData.priority)}
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span className="font-mono">{caseData.case_id}</span>
                <span>•</span>
                <span>{caseData.debtor_name}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-border/50 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-surface-border bg-slate-50 dark:bg-[#111418]">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-[#1E40AF] border-b-2 border-[#1E40AF] bg-white dark:bg-surface-dark'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 dark:bg-[#111418] rounded-xl border border-slate-200 dark:border-surface-border">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Case ID</div>
                  <div className="text-sm font-mono text-slate-900 dark:text-white">
                    {caseData.case_id}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#111418] rounded-xl border border-slate-200 dark:border-surface-border">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Case Amount</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {formatCurrency(caseData.case_amount)}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#111418] rounded-xl border border-slate-200 dark:border-surface-border">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Days Past Due</div>
                  <div className={`text-lg font-black ${caseData.dpd > 45 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                    {caseData.dpd} days
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#111418] rounded-xl border border-slate-200 dark:border-surface-border">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Status</div>
                  <div className="mt-1">{getStatusBadge(caseData.status)}</div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#111418] rounded-xl border border-slate-200 dark:border-surface-border">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Priority</div>
                  <div className="mt-1">{getPriorityBadge(caseData.priority)}</div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#111418] rounded-xl border border-slate-200 dark:border-surface-border">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Assigned Agent</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {caseData.agent_id ? `Agent #${caseData.agent_id}` : 'Unassigned'}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#111418] rounded-xl border border-slate-200 dark:border-surface-border">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Complexity Score</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {caseData.complexity_score}/10
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#111418] rounded-xl border border-slate-200 dark:border-surface-border">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Recovery Probability</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {(caseData.recovery_probability * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invoice Tab */}
          {activeTab === 'invoice' && invoiceData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 dark:bg-[#111418] rounded-xl border border-slate-200 dark:border-surface-border">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Invoice ID</div>
                  <div className="text-sm font-mono text-slate-900 dark:text-white">
                    {invoiceData.invoice_id}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#111418] rounded-xl border border-slate-200 dark:border-surface-border">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Invoice Number</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {invoiceData.invoice_no}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#111418] rounded-xl border border-slate-200 dark:border-surface-border">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tracking Number</div>
                  <div className="text-sm font-mono text-slate-900 dark:text-white">
                    {invoiceData.tracking_no}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#111418] rounded-xl border border-slate-200 dark:border-surface-border">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Invoice Charge</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {formatCurrency(invoiceData.inv_charge)}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#111418] rounded-xl border border-slate-200 dark:border-surface-border">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Balance Due</div>
                  <div className="text-lg font-black text-red-500">
                    {formatCurrency(invoiceData.balance_due)}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#111418] rounded-xl border border-slate-200 dark:border-surface-border">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Payment Status</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {invoiceData.payment_status}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#111418] rounded-xl border border-slate-200 dark:border-surface-border">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Invoice Date</div>
                  <div className="text-sm text-slate-900 dark:text-white">
                    {invoiceData.invoice_date}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#111418] rounded-xl border border-slate-200 dark:border-surface-border">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">AWB Number</div>
                  <div className="text-sm font-mono text-slate-900 dark:text-white">
                    {invoiceData.awb_number || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Debtor Tab */}
          {activeTab === 'debtor' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 dark:bg-[#111418] rounded-xl border border-slate-200 dark:border-surface-border">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Debtor Name</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {caseData.debtor_name}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#111418] rounded-xl border border-slate-200 dark:border-surface-border">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Debtor Type</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {caseData.debtor_type}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#111418] rounded-xl border border-slate-200 dark:border-surface-border">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Phone</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-green-500">call</span>
                    {caseData.debtor_phone}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#111418] rounded-xl border border-slate-200 dark:border-surface-border">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Email</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-blue-500">email</span>
                    {caseData.debtor_email}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#111418] rounded-xl border border-slate-200 dark:border-surface-border md:col-span-2">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">GSTIN</div>
                  <div className="text-sm font-mono text-slate-900 dark:text-white">
                    {caseData.debtor_gstin || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              {caseLogs.length > 0 ? (
                caseLogs.map((log) => (
                  <div
                    key={log.log_id}
                    className="p-4 bg-slate-50 dark:bg-[#111418] rounded-xl border border-slate-200 dark:border-surface-border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getActionTypeBadge(log.action_type)}
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          by <span className="font-bold">{log.actor}</span>
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-900 dark:text-white">
                      {log.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  No logs available
                </div>
              )}
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleLogCall}
                  className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl flex flex-col items-center gap-3"
                >
                  <span className="material-symbols-outlined text-4xl">call</span>
                  <span>Log Call</span>
                </button>
                <button
                  onClick={handleSendEmail}
                  className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex flex-col items-center gap-3"
                >
                  <span className="material-symbols-outlined text-4xl">email</span>
                  <span>Send Email</span>
                </button>
                <button
                  onClick={handleRecordPayment}
                  className="p-6 bg-gradient-to-br from-[#FF6600] to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl flex flex-col items-center gap-3"
                >
                  <span className="material-symbols-outlined text-4xl">payments</span>
                  <span>Record Payment</span>
                </button>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-blue-500 text-[20px] flex-shrink-0">
                    info
                  </span>
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    <strong>Quick Actions:</strong> Use these buttons to log activities, send communications, or record payments. All actions will be automatically logged in the case history.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-surface-border bg-slate-50 dark:bg-[#111418]">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[#1E40AF] text-white rounded-xl font-bold hover:bg-[#1e3a8a] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailsModal;
