
import React, { useState, useMemo, useEffect } from 'react';
import { CustomerStatus } from '../types';
import CustomerTable from '../components/CustomerTable';
import { geminiService } from '../services/geminiService';
import { customerService } from '../services/customerService';
import { modelService } from '../services/modelService';

const DashboardView = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await customerService.fetchAll();
        setCustomers(data);
      } catch (err) {
        console.error('Failed to load customers', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.accountId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  const stats = useMemo(() => {
    const totalDebt = customers.reduce((acc, c) => acc + (Number(c.totalDebt) || 0), 0);
    const highProb = customers.filter(c => (c.repaymentProbability || 0) > 70).reduce((acc, c) => acc + (Number(c.totalDebt) || 0), 0);
    const dcaCount = customers.filter(c => !!c.assignedToDcaId).length;
    return { totalDebt, highProb, dcaCount };
  }, [customers]);

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleToggleAll = () => {
    setSelectedIds(prev => prev.length === filteredCustomers.length ? [] : filteredCustomers.map(c => c.id));
  };

  const handleEdit = async (customer) => {
    // Set customer immediately but mark as analyzing
    setEditingCustomer({ ...customer, __analyzing: true });
    setAiInsight(null);
    setIsAnalyzing(true);

    try {
      // Step 1: Run comprehensive analysis workflow
      // This will: fetch data, check CIN, fetch API data, run ML model, run risk model, update DB
      const analysisResult = await customerService.analyzeCustomer(customer.id);
      
      if (analysisResult.success && analysisResult.customer) {
        // Update the customer with all the analysis results
        const updatedCustomer = {
          ...analysisResult.customer,
          __modelPrediction: analysisResult.mlResult ? {
            risk_score: analysisResult.mlResult.risk_score,
            risk_category: analysisResult.mlResult.risk_category,
            business_action: analysisResult.mlResult.business_action,
            prediction: analysisResult.mlResult.prediction,
          } : null,
          __riskAnalysis: analysisResult.riskAnalysis,
          __analyzing: false,
        };
        
        setEditingCustomer(updatedCustomer);
        
        // Update the customer in the main list
        setCustomers(prev => prev.map(c => 
          c.id === customer.id ? updatedCustomer : c
        ));
      }
    } catch (error) {
      console.error('Customer analysis failed', error);
      // Show error but keep customer open
      setEditingCustomer(prev => ({ 
        ...prev, 
        __analyzing: false,
        __error: error.message || 'Analysis failed'
      }));
      alert(`Analysis failed: ${error.message || 'Unknown error'}`);
    }

    // Step 2: Get AI insight (non-blocking, can fail)
    try {
      const insight = await geminiService.analyzeCustomerRisk(customer);
      setAiInsight(insight);
    } catch (error) {
      console.error("AI Insight failed", error);
      // Don't block UI if AI insight fails
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (editingCustomer) {
      try {
        const updated = await customerService.updateCustomer(editingCustomer.id, editingCustomer);
        setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
        setEditingCustomer(null);
      } catch (err) {
        console.error('Failed to save customer', err);
        alert(err.body?.error || err.message || 'Save failed');
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-10 max-w-[1600px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
            FedEx Internal / Recovery Oversight
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Oversight Dashboard</h1>
          <p className="text-slate-400 text-lg">Tracking performance and Agency progress for all outstanding accounts.</p>
        </div>
        <div className="flex gap-4">
           <button onClick={async () => {
             if (selectedIds.length === 0) return alert('No customers selected');
             try {
               // use bulk assign endpoint
               await customerService.assignToDcaBulk(selectedIds, 'agency_alpha');
               const refreshed = await customerService.fetchAll();
               setCustomers(refreshed);
               setSelectedIds([]);
               alert('Assigned selected customers to agency_alpha (bulk)');
             } catch (err) {
               console.error('Bulk assign failed', err);
               alert(err.body?.error || err.message || 'Assign failed');
             }
           }} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-white font-black shadow-xl shadow-primary/20 hover:bg-blue-600 transition-all">
            <span className="material-symbols-outlined">send_to_mobile</span>
            Assign to Agency
          </button>

          <button onClick={async () => {
            if (!confirm('This will analyze all customers. This may take several minutes. Continue?')) {
              return;
            }
            try {
              setLoading(true);
              const result = await customerService.analyzeAllCustomers();
              const refreshed = await customerService.fetchAll();
              setCustomers(refreshed);
              alert(`Analysis complete! ${result.successCount || 0} customers analyzed successfully.`);
            } catch (err) {
              console.error('Analyze all failed', err);
              alert(err.body?.error || err.message || 'Analysis failed');
            } finally {
              setLoading(false);
            }
          }} className="flex items-center gap-2 rounded-xl border border-surface-border px-6 py-3 text-white font-black hover:bg-surface-border transition-all">
            <span className="material-symbols-outlined">assessment</span>
            Analyze All Customers
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex flex-col gap-4 rounded-2xl p-8 border border-surface-border bg-surface-dark shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-slate-400 text-sm font-black uppercase tracking-widest">Agency Assignments</p>
            <span className="material-symbols-outlined text-primary text-3xl">hub</span>
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-white">{stats.dcaCount} Cases</h3>
            <span className="text-slate-400 text-sm font-bold mb-1.5">Active External</span>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-2xl p-8 border border-surface-border bg-surface-dark shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-slate-400 text-sm font-black uppercase tracking-widest">Total Value at Risk</p>
            <span className="material-symbols-outlined text-fedex-orange text-3xl">monetization_on</span>
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-white">${(stats.totalDebt / 1000).toFixed(0)}k</h3>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-2xl p-8 border border-surface-border bg-surface-dark shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-slate-400 text-sm font-black uppercase tracking-widest">DCA Recovery Rate</p>
            <span className="material-symbols-outlined text-emerald-500 text-3xl">speed</span>
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-white">42%</h3>
            <span className="flex items-center text-emerald-500 text-sm font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full mb-1.5">
              +12% Goal
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl border border-surface-border bg-surface-dark">
          <div className="relative w-full sm:w-96">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
            <input 
              type="text"
              placeholder="Search by Company or Agency ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-[#111418] pl-12 pr-4 py-3 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <CustomerTable 
          customers={filteredCustomers} 
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleAll={handleToggleAll}
          onEdit={handleEdit}
        />
      </div>

      {/* Detail Slideover with Action Log History */}
      {editingCustomer && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-[600px] bg-surface-dark h-full border-l border-surface-border flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-8 border-b border-surface-border shrink-0">
              <div>
                <h3 className="text-2xl font-black text-white">{editingCustomer.name}</h3>
                <p className="text-slate-400 font-mono text-sm">Account Tracking: {editingCustomer.accountId}</p>
                
                {/* Analysis Status */}
                {editingCustomer.__analyzing && (
                  <div className="mt-2 text-sm text-slate-400 flex items-center gap-2">
                    <span className="animate-spin material-symbols-outlined text-[16px]">sync</span>
                    <span>Analyzing customer data...</span>
                  </div>
                )}
                
                {/* ML Model Results */}
                {!editingCustomer.__analyzing && editingCustomer.__modelPrediction && (
                  <div className="mt-2 text-sm text-slate-400 flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px]">ML Model:</span>
                      <span className="bg-[#0b1220] px-3 py-1 rounded-md font-bold text-white">
                        {editingCustomer.__modelPrediction?.risk_score ? Math.round(editingCustomer.__modelPrediction.risk_score * 100) + '%' : 'N/A'}
                      </span>
                      <span className="text-xs text-slate-500">{editingCustomer.__modelPrediction?.risk_category}</span>
                    </div>
                    {editingCustomer.__riskAnalysis && (
                      <div className="flex items-center gap-2">
                        <span className="text-[13px]">Risk:</span>
                        <span className="bg-[#0b1220] px-3 py-1 rounded-md font-bold text-white">
                          {editingCustomer.repaymentProbability || 0}%
                        </span>
                        <span className="text-xs text-slate-500">{editingCustomer.__riskAnalysis.verdict}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Error Message */}
                {editingCustomer.__error && (
                  <div className="mt-2 text-sm text-red-400 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span>{editingCustomer.__error}</span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setEditingCustomer(null)}
                className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-surface-border transition-all"
                disabled={editingCustomer.__analyzing}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-10">
              {/* Recovery Status */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-2xl bg-[#111418] border border-surface-border">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Assigned Agency</p>
                   <p className="text-white font-bold mt-1">{editingCustomer.assignedToDcaId ? 'Agency Alpha' : 'In-House Collection'}</p>
                 </div>
                 <div className="p-4 rounded-2xl bg-[#111418] border border-surface-border">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Status</p>
                   <p className="text-primary font-bold mt-1 uppercase text-sm">{editingCustomer.status}</p>
                 </div>
              </div>

              {/* Action History Feed (Admin View) */}
              <div className="space-y-6">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">history</span>
                  Agency Action Log
                </h4>
                <div className="space-y-4">
                  {editingCustomer.actions.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-[#111418] rounded-2xl border border-dashed border-surface-border">
                      No external agency logs for this period.
                    </div>
                  ) : editingCustomer.actions.map(action => (
                    <div key={action.id} className="p-5 bg-[#111418] border border-surface-border rounded-2xl">
                       <div className="flex justify-between items-center mb-3">
                         <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                           action.type === 'LEGAL_NOTICE' ? 'bg-red-500 text-white' : 'bg-primary/20 text-primary'
                         }`}>{action.type}</span>
                         <span className="text-[10px] text-slate-500 font-bold">{action.date}</span>
                       </div>
                       <p className="text-slate-300 text-sm leading-relaxed">{action.notes}</p>
                       <div className="mt-3 pt-3 border-t border-surface-border text-[9px] text-slate-500 flex justify-between uppercase font-bold">
                         <span>Performed By: {action.performedBy}</span>
                         <span>System Log ID: {action.id}</span>
                       </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit Form - Only Admin can change company details */}
              <form className="space-y-6 pt-10 border-t border-surface-border" onSubmit={saveEdit}>
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Administrative Override</h4>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Company Name</label>
                  <input 
                    type="text"
                    value={editingCustomer.name}
                    onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})}
                    className="w-full rounded-xl border border-surface-border bg-[#111418] px-4 py-3 text-white focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Global Status</label>
                  <select 
                    value={editingCustomer.status}
                    onChange={(e) => setEditingCustomer({...editingCustomer, status: e.target.value})}
                    className="w-full rounded-xl border border-surface-border bg-[#111418] px-4 py-3 text-white focus:border-primary"
                  >
                    {Object.values(CustomerStatus).map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </form>
            </div>

            <div className="p-8 border-t border-surface-border bg-[#161d24] flex gap-4">
              <button 
                onClick={() => setEditingCustomer(null)}
                className="flex-1 py-4 text-sm font-bold text-white rounded-xl border border-surface-border hover:bg-surface-border"
              >
                Close
              </button>
              <button 
                onClick={saveEdit}
                className="flex-1 py-4 text-sm font-black text-white bg-primary rounded-xl hover:bg-blue-600 shadow-xl shadow-primary/20"
              >
                Save Edits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
