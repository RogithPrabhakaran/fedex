import React, { useEffect, useRef } from 'react';
import { useAppState } from '../useAppState';

const LiveAlertsPanel = () => {
    const { alerts } = useAppState();
    const scrollRef = useRef(null);

    // Auto-scroll to top when new alerts arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [alerts]);

    return (
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full max-h-[400px]">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-surface-border bg-slate-50 dark:bg-surface-dark flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    Agent Activity Feed
                </h3>
                <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300">
                    Live
                </span>
            </div>
            
            <div ref={scrollRef} className="overflow-y-auto p-0 scroll-smooth">
                {alerts.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                        Waiting for agent events...
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {alerts.map((alert, i) => (
                            <div key={`${alert.id}-${i}`} className={`p-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors animate-in fade-in slide-in-from-top-2 duration-300 border-l-4 ${
                                alert.type === 'error' || alert.message.includes('Breach') ? 'border-red-500 bg-red-50/10' : 
                                alert.type === 'warning' ? 'border-amber-500' : 
                                alert.type === 'success' ? 'border-emerald-500' : 
                                'border-blue-500'
                            }`}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-mono text-slate-400">
                                        {new Date(alert.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        {alert.agent || 'SYSTEM'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-tight">
                                    {alert.message}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveAlertsPanel;
