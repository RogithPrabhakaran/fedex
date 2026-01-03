
import React, { useState } from 'react';
import { UserRole } from './types';
import Layout from './components/Layout';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import CampaignView from './views/CampaignView';
import AgencyDashboard from './views/AgencyDashboard';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Dashboard');

  const handleLogin = (role) => {
    setCurrentUser({
      id: 'usr_1',
      name: role === UserRole.FEDEX_ADMIN ? 'FedEx Recovery Admin' : 'Agency Specialist',
      email: role === UserRole.FEDEX_ADMIN ? 'admin@fedex.com' : 'smith@agency-alpha.com',
      role,
      avatar: `https://i.pravatar.cc/150?u=${role}`,
      agencyId: role === UserRole.DCA_AGENT ? 'agency_alpha' : undefined
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  const renderContent = () => {
    // If DCA Agent, they get a completely different dashboard experience
    if (currentUser.role === UserRole.DCA_AGENT) {
      switch (activeTab) {
        case 'Dashboard':
        case 'Customers':
          return <AgencyDashboard user={currentUser} />;
        default:
          return (
            <div className="flex flex-col items-center justify-center h-full p-20 text-center">
              <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">lock</span>
              <h2 className="text-2xl font-bold text-white mb-2">Restricted Access</h2>
              <p className="text-slate-400">DCA agents only have access to their Recovery Queue and Profile.</p>
              <button onClick={() => setActiveTab('Dashboard')} className="mt-4 text-primary font-bold">Back to Queue</button>
            </div>
          );
      }
    }

    // FedEx Admin View
    switch (activeTab) {
      case 'Dashboard':
      case 'Customers':
        return <DashboardView />;
      case 'Campaigns':
        return <CampaignView />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full p-20 text-center">
            <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">construction</span>
            <h2 className="text-2xl font-bold text-white mb-2">{activeTab} Page</h2>
            <p className="text-slate-400">This feature is currently under development.</p>
          </div>
        );
    }
  };

  return (
    <Layout 
      user={currentUser} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
