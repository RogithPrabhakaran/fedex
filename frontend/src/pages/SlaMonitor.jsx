import React from 'react';
import { useAppState } from '../useAppState';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const SlaMonitor = () => {
  const { cases } = useAppState();

  const activeBreaches = cases.filter(c => c.slaStatus === 'BREACHED');
  const atRisk = cases.filter(c => c.slaStatus === 'WARNING');
  
  // Mock chart data derived from live cases
  const chartData = [
    { name: '0-4h', cases: cases.filter(c => c.hoursToSla < 4 && c.hoursToSla > 0).length },
    { name: '4-12h', cases: cases.filter(c => c.hoursToSla >= 4 && c.hoursToSla < 12).length },
    { name: '12-24h', cases: cases.filter(c => c.hoursToSla >= 12 && c.hoursToSla < 24).length },
    { name: '24h+', cases: cases.filter(c => c.hoursToSla >= 24).length },
    { name: 'Breached', cases: activeBreaches.length },
  ];

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">SLA Monitor Center</h1>
          <p className="text-slate-500 dark:text-slate-400">Real-time oversight of agency performance against SLA contracts.</p>
        </div>
        <div className="flex gap-4">
             <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-xl border border-red-200 dark:border-red-800">
                <span className="block text-xs uppercase text-red-600 dark:text-red-400 font-bold">Active Breaches</span>
                <span className="text-2xl font-mono font-bold text-red-700 dark:text-red-500">{activeBreaches.length}</span>
             </div>
             <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                <span className="block text-xs uppercase text-amber-600 dark:text-amber-400 font-bold">At Risk (&lt;20h)</span>
                <span className="text-2xl font-mono font-bold text-amber-700 dark:text-amber-500">{atRisk.length}</span>
             </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-surface-border">
          <h3 className="text-lg font-semibold mb-4 dark:text-slate-200">SLA Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="cases" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-surface-border">
             <h3 className="text-lg font-semibold mb-4 dark:text-slate-200">Breach Velocity (Last 1h)</h3>
             <div className="h-64 flex items-center justify-center text-slate-400 italic">
                {/* Placeholder for line chart if we had historical data */}
                <span className="animate-pulse">Analyzing real-time trend...</span>
             </div>
        </div>
      </div>

      {/* Live Table */}
      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-surface-border overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-surface-border">
          <h3 className="font-semibold dark:text-slate-200">Priority Cases (Approaching Breach)</h3>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-6 py-3">Case ID</th>
              <th className="px-6 py-3">Agency</th>
              <th className="px-6 py-3">SLA Status</th>
              <th className="px-6 py-3">Time Remaining</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {[...activeBreaches, ...atRisk].slice(0, 10).map((c, i) => (
              <tr key={c.id || i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium dark:text-slate-300">{c.accountId || c.id}</td>
                <td className="px-6 py-4 dark:text-slate-400">{c.agencyName || 'Unknown Agency'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                    ${c.slaStatus === 'BREACHED' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                    {c.slaStatus}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono font-bold dark:text-slate-300">
                    {c.hoursToSla <= 0 ? (
                        <span className="text-red-500">EXPIRED</span>
                    ) : (
                        <span className="animate-pulse">{c.hoursToSla.toFixed(2)}h</span>
                    )}
                </td>
                <td className="px-6 py-4">
                   <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">Escalate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SlaMonitor;
