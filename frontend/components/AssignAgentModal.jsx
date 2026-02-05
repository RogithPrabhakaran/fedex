import React, { useState } from 'react';

const AssignAgentModal = ({ data, agents, onClose, onAssign }) => {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [notes, setNotes] = useState('');

  const handleAssign = () => {
    if (!selectedAgent) {
      alert('Please select an agent');
      return;
    }
    onAssign(selectedAgent, notes);
  };

  const isBulk = data?.type === 'bulk';
  const caseCount = isBulk ? data.caseIds.length : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-surface-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Assign Agent
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isBulk 
                  ? `Assign ${caseCount} selected case${caseCount > 1 ? 's' : ''} to an agent`
                  : `Assign case to an agent`
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-border/50 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Case Details (for single assignment) */}
          {!isBulk && data?.case && (
            <div className="p-4 bg-slate-50 dark:bg-[#111418] rounded-xl border border-slate-200 dark:border-surface-border">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Customer</div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {data.case.debtor_name}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Amount</div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    ₹{Number(data.case.case_amount).toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">DPD</div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {data.case.dpd} days
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Priority</div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {data.case.priority}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Assignment Info */}
          {isBulk && (
            <div className="p-4 bg-[#1E40AF]/10 border border-[#1E40AF]/30 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#1E40AF] text-2xl">
                  folder_copy
                </span>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {caseCount} Case{caseCount > 1 ? 's' : ''} Selected
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    All selected cases will be assigned to the chosen agent
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Agent Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
              Select Agent *
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111418] border border-slate-200 dark:border-surface-border rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E40AF] transition-all"
            >
              <option value="">Choose an agent...</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
              Assignment Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special instructions or notes for the agent..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111418] border border-slate-200 dark:border-surface-border rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E40AF] transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-surface-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-surface-border text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-surface-border/70 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            className="flex-1 px-4 py-3 bg-[#1E40AF] text-white rounded-xl font-bold hover:bg-[#1e3a8a] transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Assign {isBulk ? `(${caseCount})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignAgentModal;
