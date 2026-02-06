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
import CustomerPaymentView from '../views/CustomerPaymentView';

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

            <div className="flex flex-1 overflow-hidden relative">
                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto relative">
                    {/* Simplified Navigation Header */}
                    <header className="bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-surface-border px-6 py-3 flex items-center gap-6 sticky top-0 z-40 shadow-sm">
                        <div className="font-black text-2xl italic tracking-tighter text-slate-900 dark:text-white">FedEx <span className="text-fedex-orange">SMART</span></div>
                        <nav className="flex items-center gap-1">
                            <NavItem to="/customer-payment" label="Customer Payments" active={location.pathname === '/customer-payment'} />
                        </nav>
                        <div className="ml-auto flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-sm font-bold dark:text-white">{user.name || 'Customer User'}</div>
                                <div className="text-xs text-slate-500">Customer</div>
                            </div>
                            <button onClick={onLogout} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <span className="material-symbols-outlined text-slate-500">logout</span>
                            </button>
                        </div>
                    </header>


                    <div className="p-0">
                        <Routes>
                            {/* Default route - redirect to customer payment */}
                            <Route path="/" element={<Navigate to="/customer-payment" replace />} />
                            <Route path="/dashboard" element={<Navigate to="/customer-payment" replace />} />

                            {/* Only Customer Payment page */}
                            <Route path="/customer-payment" element={<CustomerPaymentView />} />

                            {/* Catch all - redirect to customer payment */}
                            <Route path="*" element={<Navigate to="/customer-payment" replace />} />
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
                            <Route path="/login" element={user ? <Navigate to="/" /> : <LoginView onLogin={handleLogin} />} />
                            <Route path="*" element={<AppContent user={user} onLogout={handleLogout} />} />
                        </Routes>
                    </BrowserRouter>
                </LanguageProvider>
            </AppProvider>
        </React.StrictMode>
    );
};

export default App;
