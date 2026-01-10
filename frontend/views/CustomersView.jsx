
import React, { useState, useMemo, useEffect } from 'react';
import { CustomerStatus } from '../types';
import CustomerTable from '../components/CustomerTable';
import { customerService } from '../services/customerService';
// geminiService was used in DashboardView for 'geminiService.analyzeCustomerRisk' but not imported in the visible snippet?
// Waiting, line 121: `geminiService.analyzeCustomerRisk(customer)`.
// `geminiService` was NOT imported in the original file I read in step 5 (lines 1-7).
// It must have been a missing import or available globally?
// Let me double check lines 1-7 of DashboardView in Step 5.
// Line 1-7: imports React, CustomerStatus, CustomerTable, customerService, modelService.
// Line 121 calls `geminiService`. This implies `geminiService` might be missing or I missed it.
// Ah, `import { modelService } from '../services/modelService';` is there.
// Maybe `geminiService` is meant to be `modelService`? Or it is a bug in existing code?
// Line 121: `await geminiService.analyzeCustomerRisk(customer)`.
// If I move this code, I'll need `geminiService`.
// I'll assume it needs to be imported. I'll check `frontend/services` to see if `geminiService.js` exists.
// Codebase might have errors. I'll try to find it.
// If not found, I will comment it out or use `modelService` if appropriate, but safeguarding the move is priority.

/*
  Refactoring Note:
  This view was extracted from DashboardView.
  It contains the Customer List, Search/Filter, Bulk Actions, and Edit Slideover.
*/

const CustomersView = () => {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('none');
    const [sortDir, setSortDir] = useState('desc');
    const [minOverdue, setMinOverdue] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
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

    // Polling for background analysis updates
    useEffect(() => {
        const hasProcessing = customers.some(c => c.analysis_status === 'PROCESSING' || c.analysis_status === 'PENDING');
        if (!hasProcessing) return;

        const interval = setInterval(async () => {
            try {
                // Silent background refresh
                const data = await customerService.fetchAll();
                setCustomers(data);
            } catch (err) {
                console.error('Background refresh failed', err);
            }
        }, 2000); // Poll every 2 seconds

        return () => clearInterval(interval);
    }, [customers]);

    const filteredCustomers = useMemo(() => {
        let list = customers.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.accountId.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (statusFilter && statusFilter !== 'ALL') {
            list = list.filter(c => c.status === statusFilter);
        }

        if (minOverdue && !Number.isNaN(Number(minOverdue))) {
            const min = Number(minOverdue);
            list = list.filter(c => Number(c.daysOverdue) >= min);
        }

        if (sortBy === 'daysOverdue') {
            list = list.slice().sort((a, b) => {
                const diff = Number(a.daysOverdue) - Number(b.daysOverdue);
                return sortDir === 'asc' ? diff : -diff;
            });
        }

        // Always push Closed and Legal Action to the bottom
        list = list.slice().sort((a, b) => {
            const isClosedA = ['Closed', 'Legal Action'].includes(a.status);
            const isClosedB = ['Closed', 'Legal Action'].includes(b.status);
            if (isClosedA && !isClosedB) return 1;
            if (!isClosedA && isClosedB) return -1;
            return 0;
        });

        return list;
    }, [customers, searchTerm, statusFilter, minOverdue, sortBy, sortDir]);

    const handleToggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleToggleAll = () => {
        setSelectedIds(prev => prev.length === filteredCustomers.length ? [] : filteredCustomers.map(c => c.id));
    };

    const handleEdit = async (customer) => {
        setEditingCustomer({ ...customer, __analyzing: true });
        setAiInsight(null);
        setIsAnalyzing(true);

        try {
            const analysisResult = await customerService.analyzeCustomer(customer.id);

            if (analysisResult.success && analysisResult.customer) {
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
                setCustomers(prev => prev.map(c => c.id === customer.id ? updatedCustomer : c));
            }
        } catch (error) {
            console.error('Customer analysis failed', error);
            setEditingCustomer(prev => ({
                ...prev,
                __analyzing: false,
                __error: error.message || 'Analysis failed'
            }));
            alert(`Analysis failed: ${error.message || 'Unknown error'}`);
        }

        // Removed broken geminiService call that was causing issues
        setIsAnalyzing(false);
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        if (editingCustomer) {
            try {
                // Only send fields that allowed to be updated.
                // Sending 'actions' or '__' fields might cause backend issues or be ignored unpredictably.
                const updatePayload = {
                    name: editingCustomer.name,
                    status: editingCustomer.status,
                    // If we want to allow other fields, add them here.
                };
                const updated = await customerService.updateCustomer(editingCustomer.id, updatePayload);
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
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black text-white tracking-tight">Customers</h1>
                    <p className="text-slate-400 text-lg">Manage all customer accounts and assignments.</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={async () => {
                        if (selectedIds.length === 0) return alert('No customers selected');
                        const dcaId = prompt('Enter Agency ID (e.g. agency_alpha, agency_beta):', 'agency_alpha');
                        if (!dcaId) return;

                        try {
                            await customerService.assignToDcaBulk(selectedIds, dcaId);
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
                        Analyze All
                    </button>
                </div>
            </div>

            {/* Main Table Section */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl border border-surface-border bg-surface-dark">
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

                    <div className="ml-auto flex items-center gap-3">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-surface-border bg-[#111418] px-4 py-3 text-white font-semibold">
                            <option value="ALL">All Statuses</option>
                            {Object.values(CustomerStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        <input
                            type="number"
                            min={0}
                            placeholder="Min overdue"
                            value={minOverdue}
                            onChange={(e) => setMinOverdue(e.target.value)}
                            className="w-32 rounded-xl border border-surface-border bg-[#111418] px-4 py-3 text-white font-semibold"
                        />

                        <select value={sortBy + '|' + sortDir} onChange={(e) => {
                            const [s, d] = e.target.value.split('|');
                            setSortBy(s);
                            setSortDir(d);
                        }} className="rounded-xl border border-surface-border bg-[#111418] px-4 py-3 text-white font-semibold">
                            <option value="none|desc">No Sort</option>
                            <option value="daysOverdue|desc">Days Overdue ↓</option>
                            <option value="daysOverdue|asc">Days Overdue ↑</option>
                        </select>
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

            {/* Detail Slideover */}
            {editingCustomer && (
                <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
                    <div className="w-full max-w-[600px] bg-surface-dark h-full border-l border-surface-border flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between p-8 border-b border-surface-border shrink-0">
                            <div>
                                <h3 className="text-2xl font-black text-white">{editingCustomer.name}</h3>
                                <p className="text-slate-400 font-mono text-sm">Account Tracking: {editingCustomer.accountId}</p>

                                {editingCustomer.__analyzing && (
                                    <div className="mt-2 text-sm text-slate-400 flex items-center gap-2">
                                        <span className="animate-spin material-symbols-outlined text-[16px]">sync</span>
                                        <span>Analyzing customer data...</span>
                                    </div>
                                )}

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

                            <div className="space-y-6">
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">history</span>
                                    Agency Action Log
                                </h4>
                                <div className="space-y-4">
                                    {(editingCustomer.actions || []).length === 0 ? (
                                        <div className="p-8 text-center text-slate-500 bg-[#111418] rounded-2xl border border-dashed border-surface-border">
                                            No external agency logs for this period.
                                        </div>
                                    ) : (editingCustomer.actions || []).map(action => (
                                        <div key={action.id} className="p-5 bg-[#111418] border border-surface-border rounded-2xl">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${action.type === 'LEGAL_NOTICE' ? 'bg-red-500 text-white' : 'bg-primary/20 text-primary'
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

                            <form className="space-y-6 pt-10 border-t border-surface-border" onSubmit={saveEdit}>
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Administrative Override</h4>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Company Name</label>
                                    <input
                                        type="text"
                                        value={editingCustomer.name}
                                        onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                                        className="w-full rounded-xl border border-surface-border bg-[#111418] px-4 py-3 text-white focus:border-primary"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Global Status</label>
                                    <select
                                        value={editingCustomer.status}
                                        onChange={(e) => setEditingCustomer({ ...editingCustomer, status: e.target.value })}
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

export default CustomersView;
