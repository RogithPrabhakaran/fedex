import React, { useState } from 'react';
import { useAppState } from '../useAppState';

const AuditLogs = () => {
    const { logs } = useAppState();
    const [filter, setFilter] = useState('ALL');

    const filteredLogs = filter === 'ALL' 
        ? logs 
        : logs.filter(l => l.actor === filter || (filter === 'AGENTS' && ['SLA_WATCHDOG', 'SOP_AGENT'].includes(l.actor)));

    return (
        <div className="p-6 h-[calc(100vh-80px)] flex flex-col animate-in fade-in duration-500">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Audit Logs</h1>
                    <p className="text-slate-500 dark:text-slate-400">Complete immutable record of all system and user actions.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setFilter('ALL')}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${filter === 'ALL' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300'}`}
                    >
                        All Events
                    </button>
                    <button 
                         onClick={() => setFilter('AGENTS')}
                         className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${filter === 'AGENTS' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300'}`}
                    >
                        AI Agents Only
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-surface-border overflow-hidden flex flex-col">
                <div className="overflow-x-auto overflow-y-auto flex-1">
                    <table className="w-full text-sm text-left relative">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-3">Timestamp</th>
                                <th className="px-6 py-3">Actor</th>
                                <th className="px-6 py-3">Case ID</th>
                                <th className="px-6 py-3">Action/Message</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredLogs.map((log, index) => (
                                <tr key={log.id || index} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-500">
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
                                        <span className="text-slate-300 ml-2 text-[10px]">{new Date(log.timestamp).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider
                                            ${log.actor === 'SLA_WATCHDOG' ? 'bg-red-100 text-red-700' : 
                                              log.actor === 'SOP_AGENT' ? 'bg-blue-100 text-blue-700' : 
                                              log.actor === 'SYSTEM' ? 'bg-slate-100 text-slate-600' : 
                                              'bg-emerald-100 text-emerald-700'}`}>
                                            {log.actor}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">
                                        {log.caseId}
                                    </td>
                                    <td className="px-6 py-4 dark:text-slate-300">
                                        {log.message}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
