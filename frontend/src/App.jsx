import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';

// Context & Utils
import { AppProvider, useAppState, ROLES } from './useAppState';
import { LanguageProvider } from '../contexts/LanguageContext';
import { startWebSocketSimulation } from './utils/WebSocketSimulator';
import AgentStatusBar from './components/AgentStatusBar';
import LiveAlertsPanel from './components/LiveAlertsPanel';
import SopStepper from './components/SopStepper';

// Views
import LoginView from '../views/LoginView';
import DashboardView from '../views/DashboardView';
import CustomersView from '../views/CustomersView';
import DcaAgentsView from '../views/DcaAgentsView';
import ProfileView from '../views/ProfileView';
import DcaLeaderboardView from '../views/DcaLeaderboardView';
import DcaAdminDashboard from '../views/DcaAdminDashboard';
import AgencyDashboard from '../views/AgencyDashboard';

// New Pages
import SlaMonitor from './pages/SlaMonitor';
import SopCompliance from './pages/SopCompliance';
import AuditLogs from './pages/AuditLogs';

const AppContent = ({ user, onLogout }) => {
    const location = useLocation();
    const { activeRole, setActiveRole } = useAppState();

    // Sync Role from User Object
    useEffect(() => {
        if (user && user.role && user.role !== activeRole) {
            setActiveRole(user.role);
        }
    }, [user]);

    // Start WebSocket Simulation
    useEffect(() => {
        if (user) {
            const cleanup = startWebSocketSimulation(activeRole);
            return cleanup;
        }
    }, [user, activeRole]);

    if (!user) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
            {/* Top Bar for Role Switching & Agents */}
            <AgentStatusBar />

            <div className="flex flex-1 overflow-hidden relative">
                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto relative">
                    {/* Navigation Header (Mock) */}
                     <header className="bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-surface-border px-6 py-3 flex items-center gap-6 sticky top-0 z-40 shadow-sm">
                        <div className="font-black text-2xl italic tracking-tighter text-slate-900 dark:text-white">FedEx <span className="text-fedex-orange">SMART</span></div>
                        <nav className="flex items-center gap-1">
                            <NavItem to="/" label="Dashboard" active={location.pathname === '/' || location.pathname === '/dashboard'} />
                            <NavItem to="/customers" label="Debtors" active={location.pathname === '/customers'} />
                            <NavItem to="/agents" label={activeRole === ROLES.FEDEX_ADMIN ? 'Agencies' : 'Agents'} active={location.pathname === '/agents'} />
                            
                            {/* Role Specific Nav Items - Only show for FEDEX_ADMIN */}
                            {activeRole === ROLES.FEDEX_ADMIN && (
                                <>
                                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
                                    <NavItem to="/sla-monitor" label="SLA Monitor" active={location.pathname === '/sla-monitor'} badge="Live" />
                                    <NavItem to="/sop-compliance" label="SOP Compliance" active={location.pathname === '/sop-compliance'} />
                                    <NavItem to="/audit-logs" label="Audit Logs" active={location.pathname === '/audit-logs'} />
                                </>
                            )}
                        </nav>
                        <div className="ml-auto flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-sm font-bold dark:text-white">{user.name || 'Admin User'}</div>
                                <div className="text-xs text-slate-500">{activeRole}</div>
                            </div>
                           <button onClick={onLogout} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                               <span className="material-symbols-outlined text-slate-500">logout</span>
                           </button>
                        </div>
                    </header>

                    <div className="p-0">
                        <Routes>
                            <Route path="/" element={
                                <div className="relative">
                                     {activeRole === ROLES.FEDEX_ADMIN && (
                                        <div>
                                            <DashboardView />
                                            <div className="fixed bottom-6 right-6 w-80 h-64 z-50 pointer-events-auto transform transition-transform hover:scale-105">
                                                <LiveAlertsPanel />
                                            </div>
                                        </div>
                                     )}
                                     {activeRole === ROLES.DCA_ADMIN && <DcaAdminDashboard />}
                                     {activeRole === ROLES.DCA_AGENT && <AgencyDashboard user={user} />}
                                </div>
                            } />
                            <Route path="/dashboard" element={<Navigate to="/" />} />
                            <Route path="/customers" element={<CustomersView />} />
                            <Route path="/agents" element={
                                activeRole === ROLES.FEDEX_ADMIN ? <DcaLeaderboardView /> : <DcaAgentsView user={user} />
                            } />
                            <Route path="/profile" element={<ProfileView />} />
                            
                            {/* FedEx Admin Only Routes */}
                            {activeRole === ROLES.FEDEX_ADMIN && (
                                <>
                                    <Route path="/sla-monitor" element={<SlaMonitor />} />
                                    <Route path="/sop-compliance" element={<SopCompliance />} />
                                    <Route path="/audit-logs" element={<AuditLogs />} />
                                </>
                            )}
                        </Routes>
                    </div>
                </main>
            </div>
        </div>
    );
};

// Simple Nav Item Component
import { Link } from 'react-router-dom';

const NavItem = ({ to, label, active, badge }) => (
    <Link to={to} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${active ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400'}`}>
        {badge && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
        {label}
    </Link>
);


const App = () => {
    // Auth State
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('dca_user');
        return stored ? JSON.parse(stored) : null;
    });

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('dca_user');
        localStorage.removeItem('dca_token');
        setUser(null);
    };

    return (
        <React.StrictMode>
            <AppProvider>
                <LanguageProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/login" element={ user ? <Navigate to="/" /> : <LoginView onLogin={handleLogin} /> } />
                            <Route path="*" element={<AppContent user={user} onLogout={handleLogout} />} />
                        </Routes>
                        <Toaster position="top-right" theme="dark" richColors closeButton />
                    </BrowserRouter>
                </LanguageProvider>
            </AppProvider>
        </React.StrictMode>
    );
};

export default App;
