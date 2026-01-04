
import React, { useState, useMemo, useEffect } from 'react';
import { CustomerStatus } from '../types';
import { customerService } from '../services/customerService';

const AgencyDashboard = ({ user }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [actionNotes, setActionNotes] = useState('');
  const [actionType, setActionType] = useState('CALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await customerService.fetchAll();
        setCustomers(data);
      } catch (err) {
        console.error('Failed to load customers', err);
      } finally { setLoading(false); }
    };

    load();
  }, []);

  // DCA Agents only see customers assigned to them or those that are defaulted
  const myCases = useMemo(() => {
    return customers.filter(c => 
      c.assignedToDcaId === user.agencyId || 
      c.status === CustomerStatus.DEFAULTED || 
      c.status === CustomerStatus.LEGAL_ACTION
    );
  }, [customers, user.agencyId]);

  const handleLogAction = async (e) => {
    e.preventDefault();
    if (!selectedCase || !actionNotes.trim()) return;

    const newAction = {
      type: actionType,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      notes: actionNotes,
      performedBy: user.name
    };

    try {
      const saved = await customerService.addAction(selectedCase.id, newAction);
      // refresh the customer actions
      const refreshed = await customerService.fetchById(selectedCase.id);
      setCustomers(prev => prev.map(c => c.id === selectedCase.id ? refreshed : c));
      setSelectedCase(refreshed);
      setActionNotes('');
    } catch (err) {
      console.error('Failed to log action', err);
      alert(err.body?.error || err.message || 'Failed to log action');
    }
  };

  const updateStatus = async (status) => {
    if (!selectedCase) return;
    try {
      const updated = await customerService.updateCustomer(selectedCase.id, { ...selectedCase, status });
      setCustomers(prev => prev.map(c => c.id === selectedCase.id ? updated : c));
      setSelectedCase(updated);
    } catch (err) {
      console.error('Failed to update status', err);
      alert(err.body?.error || err.message || 'Update failed');
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background-dark">
      {/* Case List Sidebar */}
      <aside className="w-[450px] border-r border-surface-border bg-surface-dark flex flex-col shrink-0">
        <div className="p-8 border-b border-surface-border">
          <h2 className="text-2xl font-black text-white mb-2">My Recovery Queue</h2>
          <div className="flex gap-2">
            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase">
              {myCases.length} ACTIVE CASES
            </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {myCases.map(c => (
            <div 
              key={c.id}
              onClick={() => setSelectedCase(c)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer group ${
                selectedCase?.id === c.id 
                ? 'bg-primary/10 border-primary ring-1 ring-primary/30' 
                : 'bg-[#111418] border-surface-border hover:border-slate-500'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                  <span className="text-white font-bold text-lg">{c.name}</span>
                  <span className="text-slate-500 font-mono text-xs">{c.accountId}</span>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                  c.status === CustomerStatus.LEGAL_ACTION ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-amber-500/20 text-amber-500'
                }`}>
                  {c.status}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Debt Amount</span>
                  <span className="text-white font-black text-xl">${c.totalDebt.toLocaleString()}</span>
                </div>
                <div className="text-right">
                   <span className="text-slate-400 text-[10px] font-bold uppercase">Overdue</span>
                   <p className="text-white font-bold">{c.daysOverdue} Days</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Case Detail View */}
      <section className="flex-1 overflow-y-auto">
        {selectedCase ? (
          <div className="p-12 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
            {/* Case Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-5xl font-black text-white tracking-tighter mb-2">{selectedCase.name}</h1>
                <p className="text-slate-400 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">location_on</span> {selectedCase.region}
                  <span className="mx-2">•</span>
                  <span className="material-symbols-outlined text-[18px]">mail</span> {selectedCase.contactEmail}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Update Case Status</label>
                <select 
                  value={selectedCase.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  className="bg-surface-dark border-surface-border rounded-xl text-white font-bold px-6 py-3 focus:ring-primary focus:border-primary"
                >
                  <option value={CustomerStatus.DEFAULTED}>Defaulted</option>
                  <option value={CustomerStatus.LEGAL_ACTION}>Legal Action</option>
                  <option value={CustomerStatus.NEGOTIATING}>Negotiating</option>
                  <option value={CustomerStatus.CLOSED}>Closed / Collected</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-[#111418] border border-surface-border rounded-3xl p-8">
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Recovery Probability</span>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="text-4xl font-black text-white">{selectedCase.repaymentProbability}%</div>
                    <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-primary" style={{ width: `${selectedCase.repaymentProbability}%` }} />
                    </div>
                  </div>
               </div>
               <div className="bg-[#111418] border border-surface-border rounded-3xl p-8">
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Last Activity</span>
                  <div className="mt-4 text-2xl font-black text-white">{selectedCase.lastUpdated}</div>
               </div>
               <div className="bg-[#111418] border border-surface-border rounded-3xl p-8">
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Actions</span>
                  <div className="mt-4 text-2xl font-black text-white">{selectedCase.actions.length} Logs</div>
               </div>
            </div>

            {/* Recovery Timeline & Action Logger */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Log New Action */}
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-white">Log Recovery Activity</h3>
                <form onSubmit={handleLogAction} className="bg-surface-dark border border-surface-border rounded-3xl p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setActionType('CALL')}
                      className={`py-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${actionType === 'CALL' ? 'bg-primary border-primary text-white' : 'border-surface-border text-slate-400'}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">call</span> Call
                    </button>
                    <button 
                      type="button"
                      onClick={() => setActionType('VISIT')}
                      className={`py-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${actionType === 'VISIT' ? 'bg-primary border-primary text-white' : 'border-surface-border text-slate-400'}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">person_pin_circle</span> Visit
                    </button>
                    <button 
                      type="button"
                      onClick={() => setActionType('LEGAL_NOTICE')}
                      className={`py-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${actionType === 'LEGAL_NOTICE' ? 'bg-primary border-primary text-white' : 'border-surface-border text-slate-400'}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">gavel</span> Legal
                    </button>
                    <button 
                      type="button"
                      onClick={() => setActionType('RECOVERY_PLAN')}
                      className={`py-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${actionType === 'RECOVERY_PLAN' ? 'bg-primary border-primary text-white' : 'border-surface-border text-slate-400'}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">contract</span> Plan
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Interaction Notes</label>
                    <textarea 
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      rows={5}
                      className="bg-[#111418] border-surface-border rounded-2xl text-white p-4 focus:ring-primary focus:border-primary resize-none"
                      placeholder="Detailed outcome of the action..."
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                  >
                    Submit Log Entry
                    <span className="material-symbols-outlined">add_task</span>
                  </button>
                </form>
              </div>

              {/* Activity History */}
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-white">Action History</h3>
                <div className="space-y-4">
                  {selectedCase.actions.length === 0 ? (
                    <div className="text-center p-12 bg-surface-dark border border-dashed border-surface-border rounded-3xl text-slate-500">
                      No activity logged yet for this case.
                    </div>
                  ) : selectedCase.actions.map(action => (
                    <div key={action.id} className="relative pl-8 pb-8 last:pb-0 group">
                      <div className="absolute left-0 top-1.5 bottom-0 w-px bg-surface-border group-last:bg-transparent"></div>
                      <div className="absolute left-[-4px] top-1.5 size-2 rounded-full bg-primary ring-4 ring-primary/20"></div>
                      <div className="bg-surface-dark border border-surface-border rounded-2xl p-6">
                        <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-3">
                              <span className="text-white font-black text-sm uppercase">{action.type.replace('_', ' ')}</span>
                              <span className="text-slate-500 text-[10px] font-bold">{action.date}</span>
                           </div>
                           <span className="text-[10px] text-slate-400">By {action.performedBy}</span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">{action.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-20">
            <div className="size-24 rounded-full bg-surface-dark border border-surface-border flex items-center justify-center text-slate-600 mb-6">
              <span className="material-symbols-outlined text-4xl">assignment</span>
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Select a Case</h2>
            <p className="text-slate-400 max-w-sm">Pick a customer from the left queue to view details, log actions, or update recovery status.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default AgencyDashboard;
