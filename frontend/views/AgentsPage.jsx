import React, { useState, useEffect } from 'react';
import AddAgentModal from '../components/AddAgentModal';
import AgentProgress from './AgentProgress';
import { agentsService } from '../services/agentsService';

const AgentsPage = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(null);

  // Fetch agents from API
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const data = await agentsService.getAllAgents();
      console.log('Fetched agents data:', data); // Debug log
      // Ensure data is an array
      if (Array.isArray(data)) {
        setAgents(data);
      } else {
        console.error('API returned non-array data:', data);
        setAgents([]);
        alert('Received invalid data from server. Please try again.');
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      setAgents([]); // Set to empty array on error
      
      // More detailed error message
      const errorMsg = error.response?.data?.error || error.message || 'Failed to fetch agents';
      alert(`Error: ${errorMsg}. Please check your login and try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAgent = async (agentData) => {
    try {
      await agentsService.createAgent(agentData);
      await fetchAgents(); // Refresh the list
      setShowAddModal(false);
      
      // Show success message
      alert(`Agent created successfully!${agentData.sendLoginEmail ? ` Login email sent to ${agentData.email}` : ''}`);
    } catch (error) {
      console.error('Failed to create agent:', error);
      alert(error.response?.data?.error || 'Failed to create agent. Please try again.');
    }
  };

  const handleEditAgent = (agent) => {
    setEditingAgent(agent);
    setShowAddModal(true);
  };

  const handleUpdateAgent = async (agentData) => {
    try {
      await agentsService.updateAgent(editingAgent.id, agentData);
      await fetchAgents(); // Refresh the list
      
      setShowAddModal(false);
      setEditingAgent(null);
      alert('Agent updated successfully!');
    } catch (error) {
      console.error('Failed to update agent:', error);
      alert(error.response?.data?.error || 'Failed to update agent. Please try again.');
    }
  };

  const handleDeleteAgent = async (agentId) => {
    if (!confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      return;
    }

    try {
      await agentsService.deleteAgent(agentId);
      await fetchAgents(); // Refresh the list
      alert('Agent deleted successfully!');
    } catch (error) {
      console.error('Failed to delete agent:', error);
      alert(error.response?.data?.error || 'Failed to delete agent. Please try again.');
    }
  };

  const handleViewProgress = (agentId) => {
    setSelectedAgentId(agentId);
    setShowProgressModal(true);
  };

  const getStatusBadge = (status) => {
    const config = {
      ACTIVE: { color: 'bg-green-500/10 text-green-500', label: 'Active' },
      INACTIVE: { color: 'bg-slate-500/10 text-slate-500', label: 'Inactive' },
    };
    const statusConfig = config[status] || config.ACTIVE;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig.color}`}>
        {statusConfig.label}
      </span>
    );
  };

  // Ensure agents is always an array
  const safeAgents = Array.isArray(agents) ? agents : [];

  const totalCases = safeAgents.reduce((sum, a) => sum + (a?.assigned_cases || 0), 0);
  const avgRecoveryRate = safeAgents.length > 0 
    ? safeAgents.reduce((sum, a) => sum + (a?.recovery_rate || 0), 0) / safeAgents.length 
    : 0;
  const activeAgents = safeAgents.filter(a => a?.status === 'ACTIVE').length;

  // Show loading spinner
  if (loading && safeAgents.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E40AF] mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
            Agents Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage your DCA agents and track their performance
          </p>
        </div>
        <button
          onClick={() => {
            setEditingAgent(null);
            setShowAddModal(true);
          }}
          className="px-6 py-3 bg-[#1E40AF] text-white rounded-xl font-bold hover:bg-[#1e3a8a] transition-colors flex items-center gap-2 shadow-lg shadow-[#1E40AF]/30"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Add Agent
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-[#1E40AF]/10 rounded-xl">
              <span className="material-symbols-outlined text-[#1E40AF] text-2xl">
                group
              </span>
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
            {safeAgents.length}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Total Agents
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <span className="material-symbols-outlined text-green-500 text-2xl">
                check_circle
              </span>
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
            {activeAgents}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Active Agents
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-[#FF6600]/10 rounded-xl">
              <span className="material-symbols-outlined text-[#FF6600] text-2xl">
                folder
              </span>
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
            {totalCases}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Total Assigned Cases
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <span className="material-symbols-outlined text-purple-500 text-2xl">
                trending_up
              </span>
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
            {avgRecoveryRate.toFixed(1)}%
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Avg Recovery Rate
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="mb-8 p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl">
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
          Top Performers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safeAgents
            .sort((a, b) => (b?.recovery_rate || 0) - (a?.recovery_rate || 0))
            .slice(0, 4)
            .map((agent, index) => (
              <div
                key={agent?.id || index}
                className="p-4 bg-slate-50 dark:bg-[#111418] border border-slate-200 dark:border-surface-border rounded-xl flex items-center gap-4"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] rounded-full flex items-center justify-center text-white font-black text-lg">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {agent?.name || 'Unknown'}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {agent?.assigned_cases || 0} cases • {(agent?.recovery_rate || 0).toFixed(1)}% recovery
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-[#1E40AF]">
                    {(agent?.recovery_rate || 0).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Agents Table - Desktop */}
      <div className="hidden lg:block bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-[#111418] border-b border-slate-200 dark:border-surface-border">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase">
                  Assigned Cases
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase">
                  Recovery Rate
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {safeAgents.map((agent) => (
                <tr
                  key={agent.id}
                  className="border-b border-slate-200 dark:border-surface-border hover:bg-slate-50 dark:hover:bg-surface-border/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] rounded-full flex items-center justify-center text-white font-bold">
                        {(agent?.name || 'A').charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {agent?.name || 'Unknown'}
                        </div>
                        <div className="text-xs text-slate-500">{agent?.phone || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900 dark:text-white">
                      {agent?.email || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {agent?.assigned_cases || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-surface-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#1E40AF] to-[#3B82F6]"
                          style={{ width: `${Math.min(agent?.recovery_rate || 0, 100)}%` }}
                        />
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white w-12 text-right">
                        {(agent?.recovery_rate || 0).toFixed(1)}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(agent?.status || 'INACTIVE')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewProgress(agent.id)}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-[#1E40AF] hover:bg-[#1E40AF]/10 rounded-lg transition-colors"
                        title="View Progress"
                      >
                        <span className="material-symbols-outlined text-[20px]">analytics</span>
                      </button>
                      <button
                        onClick={() => handleEditAgent(agent)}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-[#1E40AF] hover:bg-[#1E40AF]/10 rounded-lg transition-colors"
                        title="Edit Agent"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteAgent(agent.id)}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Agent"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agents Cards - Mobile */}
      <div className="lg:hidden space-y-4">
        {safeAgents.map((agent) => (
          <div
            key={agent.id}
            className="p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {(agent?.name || 'A').charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {agent?.name || 'Unknown'}
                  </div>
                  <div className="text-xs text-slate-500">{agent?.email || 'N/A'}</div>
                </div>
              </div>
              {getStatusBadge(agent?.status || 'INACTIVE')}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Assigned Cases
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {agent?.assigned_cases || 0}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Recovery Rate
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {(agent?.recovery_rate || 0).toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleViewProgress(agent.id)}
                className="px-4 py-2 bg-[#1E40AF]/10 text-[#1E40AF] rounded-lg font-bold hover:bg-[#1E40AF]/20 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">analytics</span>
                Progress
              </button>
              <button
                onClick={() => handleEditAgent(agent)}
                className="flex-1 px-4 py-2 bg-[#1E40AF] text-white rounded-lg font-bold hover:bg-[#1e3a8a] transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit
              </button>
              <button
                onClick={() => handleDeleteAgent(agent.id)}
                className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg font-bold hover:bg-red-500/20 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {safeAgents.length === 0 && !loading && (
        <div className="text-center py-12 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl">
          <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">
            group_off
          </span>
          <p className="text-slate-500 dark:text-slate-400 mb-4">No agents found</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-[#1E40AF] text-white rounded-xl font-bold hover:bg-[#1e3a8a] transition-colors"
          >
            Add Your First Agent
          </button>
        </div>
      )}

      {/* Add/Edit Agent Modal */}
      {showAddModal && (
        <AddAgentModal
          agent={editingAgent}
          onClose={() => {
            setShowAddModal(false);
            setEditingAgent(null);
          }}
          onSave={editingAgent ? handleUpdateAgent : handleAddAgent}
        />
      )}

      {/* Agent Progress Modal */}
      {showProgressModal && (
        <AgentProgress
          agentId={selectedAgentId}
          onClose={() => {
            setShowProgressModal(false);
            setSelectedAgentId(null);
          }}
        />
      )}
    </div>
  );
};

export default AgentsPage;
