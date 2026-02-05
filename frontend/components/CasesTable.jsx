import React, { useState, useEffect } from 'react';
import AssignAgentModal from './AssignAgentModal';
import CaseDetailsModal from './CaseDetailsModal';
import { casesService } from '../services/casesService';
import { agentsService } from '../services/agentsService';

const CasesTable = () => {
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCases, setSelectedCases] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignModalData, setAssignModalData] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    status: 'ALL',
    priority: 'ALL',
    dpdMin: '',
    dpdMax: '',
  });

  const [agents, setAgents] = useState([]);

  // Mock API call - Replace with actual API
  useEffect(() => {
    fetchCases();
    fetchAgents();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const data = await casesService.getAllCases();
      const caseArray = Array.isArray(data) ? data : [];
      setCases(caseArray);
      setFilteredCases(caseArray);
    } catch (error) {
      console.error('Failed to fetch cases:', error);
      setCases([]);
      setFilteredCases([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const data = await agentsService.getAllAgents();
      setAgents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      setAgents([]);
    }
  };

  const safeCases = Array.isArray(cases) ? cases : [];
  const safeAgents = Array.isArray(agents) ? agents : [];

  // Apply filters
  useEffect(() => {
    let filtered = [...safeCases];

    if (filters.status !== 'ALL') {
      filtered = filtered.filter(c => c?.status === filters.status);
    }

    if (filters.priority !== 'ALL') {
      filtered = filtered.filter(c => c?.priority === filters.priority);
    }

    if (filters.dpdMin !== '') {
      filtered = filtered.filter(c => (Number(c?.dpd) || 0) >= parseInt(filters.dpdMin));
    }

    if (filters.dpdMax !== '') {
      filtered = filtered.filter(c => (Number(c?.dpd) || 0) <= parseInt(filters.dpdMax));
    }

    setFilteredCases(filtered);
  }, [filters, cases]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCases(filteredCases.map(c => c.case_id));
    } else {
      setSelectedCases([]);
    }
  };

  const handleSelectCase = (caseId) => {
    if (selectedCases.includes(caseId)) {
      setSelectedCases(selectedCases.filter(id => id !== caseId));
    } else {
      setSelectedCases([...selectedCases, caseId]);
    }
  };

  const handleBulkAssign = () => {
    if (selectedCases.length === 0) {
      alert('Please select at least one case');
      return;
    }
    setAssignModalData({ type: 'bulk', caseIds: selectedCases });
    setShowAssignModal(true);
  };

  const handleSingleAssign = (caseData) => {
    setSelectedCaseId(caseData.case_id);
    setShowDetailsModal(true);
  };

  const handleAssignComplete = (agentId) => {
    // Update cases with assigned agent
    console.log('Assigned agent:', agentId, 'to cases:', assignModalData);
    setShowAssignModal(false);
    setSelectedCases([]);
    // Refresh data
    fetchCases();
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
      HIGH: 'text-red-500',
      MEDIUM: 'text-yellow-500',
      LOW: 'text-green-500',
    };
    return <span className={`font-bold ${priorityConfig[priority] || ''}`}>{priority}</span>;
  };

   const getAgentName = (agentId) => {
    const agent = safeAgents.find(a => a.id === agentId);
    return agent ? agent.name : 'Unassigned';
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
          Cases Management
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage and assign cases to agents
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-[#111418] border border-slate-200 dark:border-surface-border rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
            >
              <option value="ALL">All Status</option>
              <option value="NEW">New</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="CONTACTED">Contacted</option>
              <option value="PROMISED">Promised</option>
              <option value="PARTIAL_PAYMENT">Partial Payment</option>
              <option value="RECOVERED">Recovered</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-[#111418] border border-slate-200 dark:border-surface-border rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
            >
              <option value="ALL">All Priority</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
              DPD Min
            </label>
            <input
              type="number"
              value={filters.dpdMin}
              onChange={(e) => setFilters({ ...filters, dpdMin: e.target.value })}
              placeholder="0"
              className="w-full px-4 py-2 bg-slate-50 dark:bg-[#111418] border border-slate-200 dark:border-surface-border rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
              DPD Max
            </label>
            <input
              type="number"
              value={filters.dpdMax}
              onChange={(e) => setFilters({ ...filters, dpdMax: e.target.value })}
              placeholder="999"
              className="w-full px-4 py-2 bg-slate-50 dark:bg-[#111418] border border-slate-200 dark:border-surface-border rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCases.length > 0 && (
        <div className="mb-4 p-4 bg-[#1E40AF]/10 border border-[#1E40AF]/30 rounded-xl flex items-center justify-between">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {selectedCases.length} case(s) selected
          </span>
          <button
            onClick={handleBulkAssign}
            className="px-4 py-2 bg-[#1E40AF] text-white rounded-lg font-bold hover:bg-[#1e3a8a] transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Assign Selected
          </button>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-[#111418] border-b border-slate-200 dark:border-surface-border">
              <tr>
                <th className="px-4 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCases.length === filteredCases.length && filteredCases.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-[#1E40AF] focus:ring-[#1E40AF]"
                  />
                </th>
                <th className="px-4 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase">
                  Case ID
                </th>
                <th className="px-4 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase">
                  Customer
                </th>
                <th className="px-4 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase">
                  Amount
                </th>
                <th className="px-4 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase">
                  DPD
                </th>
                <th className="px-4 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase">
                  Status
                </th>
                <th className="px-4 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase">
                  Agent
                </th>
                <th className="px-4 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase">
                  Last Activity
                </th>
                <th className="px-4 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((caseData) => (
                <tr
                  key={caseData.case_id}
                  className="border-b border-slate-200 dark:border-surface-border hover:bg-slate-50 dark:hover:bg-surface-border/30 transition-colors"
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCases.includes(caseData.case_id)}
                      onChange={() => handleSelectCase(caseData.case_id)}
                      className="w-4 h-4 rounded border-slate-300 text-[#1E40AF] focus:ring-[#1E40AF]"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-mono text-slate-900 dark:text-white">
                      {caseData.case_id.substring(0, 8)}...
                    </div>
                    <div className="text-xs text-slate-500">{caseData.invoice_id}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {caseData.debtor_name}
                    </div>
                    <div className="text-xs text-slate-500">{getPriorityBadge(caseData.priority)}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(caseData.case_amount)}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className={`text-sm font-bold ${caseData.dpd > 45 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                      {caseData.dpd} days
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {getStatusBadge(caseData.status)}
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={caseData.agent_id || ''}
                      onChange={(e) => {
                        // Handle agent assignment
                        console.log('Assign agent:', e.target.value, 'to case:', caseData.case_id);
                      }}
                      className="px-3 py-1.5 bg-slate-50 dark:bg-[#111418] border border-slate-200 dark:border-surface-border rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    >
                       <option value="">Unassigned</option>
                      {safeAgents.map(agent => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-slate-500">
                      {formatDate(caseData.last_agent_check)}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleSingleAssign(caseData)}
                      className="p-2 text-slate-600 dark:text-slate-400 hover:text-[#1E40AF] hover:bg-[#1E40AF]/10 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {filteredCases.map((caseData) => (
          <div
            key={caseData.case_id}
            className="p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedCases.includes(caseData.case_id)}
                  onChange={() => handleSelectCase(caseData.case_id)}
                  className="w-4 h-4 rounded border-slate-300 text-[#1E40AF] focus:ring-[#1E40AF]"
                />
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {caseData.debtor_name}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    {caseData.case_id.substring(0, 8)}...
                  </div>
                </div>
              </div>
              {getStatusBadge(caseData.status)}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Amount</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {formatCurrency(caseData.case_amount)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">DPD</div>
                <div className={`text-sm font-bold ${caseData.dpd > 45 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                  {caseData.dpd} days
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Priority</div>
                <div className="text-sm">{getPriorityBadge(caseData.priority)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Agent</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {getAgentName(caseData.agent_id)}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={caseData.agent_id || ''}
                onChange={(e) => {
                  console.log('Assign agent:', e.target.value, 'to case:', caseData.case_id);
                }}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-[#111418] border border-slate-200 dark:border-surface-border rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
              >
                 <option value="">Assign Agent</option>
                {safeAgents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleSingleAssign(caseData)}
                className="px-4 py-2 bg-[#1E40AF] text-white rounded-lg font-bold hover:bg-[#1e3a8a] transition-colors"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCases.length === 0 && !loading && (
        <div className="text-center py-12 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl">
          <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">
            folder_off
          </span>
          <p className="text-slate-500 dark:text-slate-400">No cases found</p>
        </div>
      )}

      {/* Assign Agent Modal */}
      {showAssignModal && (
         <AssignAgentModal
          data={assignModalData}
          agents={safeAgents}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssignComplete}
        />
      )}

      {/* Case Details Modal */}
      {showDetailsModal && (
        <CaseDetailsModal
          caseId={selectedCaseId}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedCaseId(null);
          }}
        />
      )}
    </div>
  );
};

export default CasesTable;
