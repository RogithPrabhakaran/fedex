
import React, { useState, useMemo } from 'react';
import { CustomerStatus } from '../types';
import CustomerTable from '../components/CustomerTable';
import { Translate } from '../hooks/useTranslation.jsx';
import { useAppState } from '../src/useAppState';
import SopStepper from '../src/components/SopStepper';
import { toast } from 'sonner';

const CustomersView = () => {
    // DEMO MODE: Use Live Global State
    const { cases: liveCases } = useAppState();

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('none');
    const [sortDir, setSortDir] = useState('desc');
    const [minOverdue, setMinOverdue] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedIds, setSelectedIds] = useState([]);
    const [editingCustomer, setEditingCustomer] = useState(null);

    // Filter Logic
    const filteredCustomers = useMemo(() => {
        let list = [...liveCases]; // Copy from global state

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            list = list.filter(c =>
                (c?.name || '').toLowerCase().includes(term) ||
                (c?.accountId || '').toLowerCase().includes(term)
            );
        }

        if (statusFilter && statusFilter !== 'ALL') {
            list = list.filter(c => c?.status === statusFilter);
        }

        if (minOverdue && !Number.isNaN(Number(minOverdue))) {
            const min = Number(minOverdue);
            list = list.filter(c => Number(c?.daysOverdue) >= min);
        }

        if (sortBy === 'daysOverdue') {
            list.sort((a, b) => {
                const diff = (Number(a?.daysOverdue) || 0) - (Number(b?.daysOverdue) || 0);
                return sortDir === 'asc' ? diff : -diff;
            });
        }

        return list;
    }, [liveCases, searchTerm, statusFilter, minOverdue, sortBy, sortDir]);

    const handleToggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleToggleAll = () => {
        setSelectedIds(prev => prev.length === filteredCustomers.length ? [] : filteredCustomers.map(c => c.id));
    };

    // simplified edit handler for demo
    const handleEdit = (customer) => {
        setEditingCustomer({ ...customer });
    };

    const saveEdit = (e) => {
        e.preventDefault();
        toast.success('Customer updated (Demo Mode)');
        setEditingCustomer(null);
    };

    return (
        <div className="flex flex-col gap-8 p-4 md:p-10 max-w-[1600px] mx-auto w-full">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight"><Translate text="Customers" /></h1>
                    <p className="text-slate-400 text-lg"><Translate text="Manage all customer accounts and assignments." /></p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => {
                        if (selectedIds.length === 0) return toast.error('No customers selected');
                        toast.success(`Allocated ${selectedIds.length} cases to Agency Alpha`);
                        setSelectedIds([]);
                    }} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-white font-black shadow-xl shadow-primary/20 hover:bg-blue-600 transition-all">
                        <span className="material-symbols-outlined">send_to_mobile</span>
                        <Translate text="Assign to Agency" />
                    </button>

                    <button onClick={() => {
                       toast.info('Starting AI Analysis on full portfolio...');
                       setTimeout(() => toast.success('Analysis Complete: 3 High Risk accounts identified'), 2000);
                    }} className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-surface-border px-6 py-3 text-white font-black hover:bg-surface-border transition-all">
                        <span className="material-symbols-outlined">assessment</span>
                        <Translate text="Analyze All" />
                    </button>
                </div>
            </div>

            {/* Main Table Section */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl border border-slate-200 dark:border-surface-border bg-white dark:bg-surface-dark">
                    <div className="relative w-full sm:w-96">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
                        <input
                            type="text"
                            placeholder="Search by Company or Agency ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 dark:border-surface-border bg-[#111418] pl-12 pr-4 py-3 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 dark:border-surface-border bg-[#111418] px-4 py-3 text-white font-semibold">
                            <option value="ALL"><Translate text="All Statuses" /></option>
                            {Object.values(CustomerStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        <select value={sortBy + '|' + sortDir} onChange={(e) => {
                            const [s, d] = e.target.value.split('|');
                            setSortBy(s);
                            setSortDir(d);
                        }} className="rounded-xl border border-slate-200 dark:border-surface-border bg-[#111418] px-4 py-3 text-white font-semibold">
                            <option value="none|desc"><Translate text="No Sort" /></option>
                            <option value="daysOverdue|desc"><Translate text="Days Overdue" /> ↓</option>
                            <option value="daysOverdue|asc"><Translate text="Days Overdue" /> ↑</option>
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
                    <div className="w-full max-w-[600px] bg-white dark:bg-surface-dark h-full border-l border-slate-200 dark:border-surface-border flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between p-8 border-b border-slate-200 dark:border-surface-border shrink-0">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{editingCustomer.name}</h3>
                                <p className="text-slate-400 font-mono text-sm">Account Tracking: {editingCustomer.accountId}</p>
                                
                                <div className="mt-2 text-sm text-slate-400 flex items-center gap-3 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[13px]">Propensity:</span>
                                        <span className="bg-[#0b1220] px-3 py-1 rounded-md font-bold text-white">
                                            {editingCustomer.repaymentProbability || 0}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setEditingCustomer(null)}
                                className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-surface-border transition-all"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-10">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-[#111418] border border-slate-200 dark:border-surface-border">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest"><Translate text="Assigned Agency" /></p>
                                    <p className="text-slate-900 dark:text-white font-bold mt-1">{editingCustomer.assignedToDcaId ? 'Agency Alpha' : 'In-House'}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-[#111418] border border-slate-200 dark:border-surface-border">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest"><Translate text="Current Status" /></p>
                                    <p className="text-primary font-bold mt-1 uppercase text-sm">{editingCustomer.status}</p>
                                </div>
                            </div>

                            {/* New SOP Stepper */}
                            <div className="p-4 rounded-2xl bg-[#111418] border border-slate-200 dark:border-surface-border">
                                <SopStepper 
                                    currentStep={editingCustomer.status === 'Closed' ? 5 : editingCustomer.status === 'Legal Action' ? 4 : 2} 
                                    complianceScore={editingCustomer.sopComplianceScore || 85} 
                                />
                            </div>

                            <form className="space-y-6 pt-10 border-t border-slate-200 dark:border-surface-border" onSubmit={saveEdit}>
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest"><Translate text="Administrative Override" /></h4>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest"><Translate text="Company Name" /></label>
                                    <input
                                        type="text"
                                        value={editingCustomer.name}
                                        onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                                        className="w-full rounded-xl border border-slate-200 dark:border-surface-border bg-[#111418] px-4 py-3 text-white focus:border-primary"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest"><Translate text="Global Status" /></label>
                                    <select
                                        value={editingCustomer.status}
                                        onChange={(e) => setEditingCustomer({ ...editingCustomer, status: e.target.value })}
                                        className="w-full rounded-xl border border-slate-200 dark:border-surface-border bg-[#111418] px-4 py-3 text-white focus:border-primary"
                                    >
                                        {Object.values(CustomerStatus).map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                            </form>
                        </div>

                        <div className="p-8 border-t border-slate-200 dark:border-surface-border bg-[#161d24] flex gap-4">
                            <button
                                onClick={() => setEditingCustomer(null)}
                                className="flex-1 py-4 text-sm font-bold text-white rounded-xl border border-slate-200 dark:border-surface-border hover:bg-surface-border"
                            >
                                <Translate text="Close" />
                            </button>
                            <button
                                onClick={saveEdit}
                                className="flex-1 py-4 text-sm font-black text-white bg-primary rounded-xl hover:bg-blue-600 shadow-xl shadow-primary/20"
                            >
                                <Translate text="Save Edits" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomersView;
