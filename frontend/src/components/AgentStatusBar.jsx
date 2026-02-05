import React from 'react';
import { useAppState, ROLES } from '../useAppState';

const AgentStatusBar = () => {
    const { stats, activeRole, setActiveRole } = useAppState();

    const getRoleColor = (role) => {
        switch(role) {
            case ROLES.FEDEX_ADMIN: return 'bg-purple-600';
            case ROLES.DCA_ADMIN: return 'bg-blue-600';
            case ROLES.DCA_AGENT: return 'bg-emerald-600';
            default: return 'bg-gray-600';
        }
    };

    return (
        <div className="w-full bg-slate-800 text-white p-2 px-4 shadow-md flex items-center justify-between z-50 relative">
            {/* Left: Role Switcher & Live Badge */}
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-slate-900/50 p-1 rounded-lg">
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </div>
                    <span className="text-xs font-bold text-green-400 tracking-wider">AGENTS LIVE</span>
                </div>

                <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-400">View as:</span>
                    <select 
                        value={activeRole}
                        onChange={(e) => setActiveRole(e.target.value)}
                        className={`text-sm rounded px-3 py-1 border-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 cursor-pointer transition-colors ${getRoleColor(activeRole)}`}
                    >
                        <option value={ROLES.FEDEX_ADMIN}>FedEx Admin</option>
                        <option value={ROLES.DCA_ADMIN}>DCA Admin</option>
                        <option value={ROLES.DCA_AGENT}>DCA Agent</option>
                    </select>
                </div>
            </div>

            {/* Center: Live Ticker */}
            <div className="hidden md:flex items-center space-x-6 text-sm">
                 <div className="flex flex-col items-center leading-tight">
                    <span className="text-slate-400 text-[10px] uppercase">Active Cases</span>
                    <span className="font-mono font-bold animate-pulse">{stats.activeCases}</span>
                 </div>
                 <div className="h-6 w-px bg-slate-700"></div>
                 <div className="flex flex-col items-center leading-tight">
                     <span className="text-slate-400 text-[10px] uppercase">SLA Breaches</span>
                     <span className={`font-mono font-bold ${stats.slaBreaches > 0 ? 'text-red-400' : 'text-slate-200'}`}>
                        {stats.slaBreaches}
                     </span>
                 </div>
                 <div className="h-6 w-px bg-slate-700"></div>
                 <div className="flex flex-col items-center leading-tight">
                     <span className="text-slate-400 text-[10px] uppercase">SOP Score</span>
                     <span className="font-mono font-bold text-blue-400">{stats.sopCompliance}%</span>
                 </div>
            </div>

            {/* Right: Agent Activity */}
            <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-400 italic hidden sm:block">
                    SLA_WATCHDOG: Scanning Case #{(Date.now() % 1000).toString().padStart(3, '0')}...
                </span>
                <div className="h-2 w-24 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-[progress_2s_ease-in-out_infinite] w-1/2"></div>
                </div>
            </div>
        </div>
    );
};

export default AgentStatusBar;
