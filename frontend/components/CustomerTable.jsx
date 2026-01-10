
import React from 'react';
import { CustomerStatus } from '../types';

const getStatusStyles = (status) => {
  switch (status) {
    case CustomerStatus.ACTIVE:
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case CustomerStatus.NEGOTIATING:
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case CustomerStatus.AT_RISK:
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case CustomerStatus.DEFAULTED:
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    case CustomerStatus.REVIEW:
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
};

const CustomerTable = ({
  customers,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  onEdit
}) => {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-surface-border bg-surface-dark shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#1a2028] text-slate-400 text-[10px] uppercase font-bold tracking-widest">
            <tr>
              <th className="px-6 py-4 w-[60px] text-center">
                <input
                  type="checkbox"
                  className="rounded border-surface-border bg-transparent text-primary focus:ring-primary focus:ring-offset-0"
                  onChange={onToggleAll}
                  checked={customers.length > 0 && selectedIds.length === customers.length}
                />
              </th>
              <th className="px-6 py-4">Customer Name</th>
              <th className="px-6 py-4">Account ID</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Assigned Agency</th>
              <th className="px-6 py-4">Total Debt</th>
              <th className="px-6 py-4">Days Overdue</th>
              <th className="px-6 py-4 w-[240px]">Repayment Prob.</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border text-sm text-white">
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="hover:bg-[#202933] group transition-colors cursor-pointer"
                onClick={() => onEdit(customer)}
              >
                <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="rounded border-surface-border bg-transparent text-primary focus:ring-primary focus:ring-offset-0"
                    checked={selectedIds.includes(customer.id)}
                    onChange={() => onToggleSelect(customer.id)}
                  />
                </td>
                <td className="px-6 py-4 font-medium flex items-center gap-3">
                  <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                    {customer.name.substring(0, 2).toUpperCase()}
                  </div>
                  {customer.name}
                </td>
                <td className="px-6 py-4 font-mono text-slate-400">{customer.accountId}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusStyles(customer.status)}`}>
                    <span className={`size-1.5 rounded-full ${getStatusStyles(customer.status).split(' ')[1].replace('text-', 'bg-')}`}></span>
                    {customer.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-300 font-medium">
                  {customer.assignedToDcaId ? (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-blue-400">gavel</span>
                      {customer.assignedToDcaId === 'agency_alpha' ? 'Alpha Collections' :
                        customer.assignedToDcaId === 'agency_beta' ? 'Beta Recovery' :
                          customer.assignedToDcaId}
                    </div>
                  ) : (
                    <span className="text-slate-500 italic">In-House</span>
                  )}
                </td>
                <td className="px-6 py-4 font-bold">
                  ${customer.totalDebt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-slate-400">{customer.daysOverdue} days</td>
                <td className="px-6 py-4">
                  {['Closed', 'Legal Action'].includes(customer.status) ? (
                    <div className="flex items-center gap-2 opacity-50 filter grayscale">
                      <div className="flex-1 h-2 bg-gray-800 rounded-full"></div>
                      <span className="font-bold w-10 text-right text-slate-500 text-xs uppercase tracking-wider">Done</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {/* Processing State: Pulsing Bar and 'AI...' Text */}
                      {customer.analysis_status === 'PROCESSING' ? (
                        <>
                          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full w-full bg-blue-500/50 animate-pulse rounded-full"></div>
                          </div>
                          <span className="font-bold w-10 text-right text-[10px] text-blue-400 animate-pulse">
                            AI...
                          </span>
                        </>
                      ) : customer.analysis_status === 'COMPLETED' ? (
                        /* Completed State: Actual Score */
                        <>
                          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${customer.repaymentProbability > 70 ? 'bg-emerald-500' :
                                customer.repaymentProbability > 40 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                              style={{ width: `${customer.repaymentProbability}%` }}
                            ></div>
                          </div>
                          <span className="font-bold w-10 text-right">
                            {customer.repaymentProbability}%
                          </span>
                        </>
                      ) : (
                        /* Pending/New State: Show Nothing (Blank) */
                        <div className="w-full h-2"></div>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onEdit(customer)}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-surface-border transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-surface-border px-6 py-4 bg-[#161d24]">
        <p className="text-xs text-slate-400">
          Showing <span className="text-white font-bold">{customers.length}</span> results
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-xs font-bold text-slate-400 rounded border border-surface-border hover:bg-surface-border disabled:opacity-50">Previous</button>
          <button className="px-3 py-1 text-xs font-bold text-white rounded bg-surface-border hover:bg-[#3b4754]">Next</button>
        </div>
      </div>
    </div>
  );
};

export default CustomerTable;
