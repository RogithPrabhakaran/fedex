import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { authService } from './services/authService';
import { UserRole } from './types';
import Layout from './components/Layout';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import CustomersView from './views/CustomersView';
import CampaignView from './views/CampaignView';
import AgencyDashboard from './views/AgencyDashboard';
import DcaAssignmentsView from './views/DcaAssignmentsView';
import ProfileView from './views/ProfileView';

const App = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    const u = localStorage.getItem('dca_user');
    return u ? JSON.parse(u) : null;
  });
  const [activeTab, setActiveTab] = useState('Dashboard');

  useEffect(() => {
    const t = localStorage.getItem('dca_token');
    if (t) api.setToken(t);
  }, []);

  const handleLogin = (user, token) => {
    api.setToken(token);
    localStorage.setItem('dca_token', token);
    localStorage.setItem('dca_user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setActiveTab('Dashboard');
  };

  const ADMIN_TABS = [
    { id: 'Dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'Customers', label: 'Customers', icon: 'group' },
    { id: 'DCA Assignments', label: 'Assignments', icon: 'assignment_ind' },
    { id: 'Automation', label: 'Automation', icon: 'smart_toy' },
  ];

  const DCA_AGENT_TABS = [
    { id: 'Dashboard', label: 'My Queue', icon: 'list_alt' }, // "My Queue" is their Dashboard
    { id: 'Profile', label: 'My Profile', icon: 'person' },
  ];

  const currentTabs =
    currentUser?.role === UserRole.DCA_AGENT ? DCA_AGENT_TABS : ADMIN_TABS;

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
        case 'Profile':
          return <ProfileView user={currentUser} />;
        default:
          return (
            <div className='flex flex-col items-center justify-center h-full p-20 text-center'>
              <span className='material-symbols-outlined text-6xl text-slate-600 mb-4'>
                lock
              </span>
              <h2 className='text-2xl font-bold text-white mb-2'>
                Restricted Access
              </h2>
              <p className='text-slate-400'>
                DCA agents only have access to their Recovery Queue and Profile.
              </p>
              <button
                onClick={() => setActiveTab('Dashboard')}
                className='mt-4 text-primary font-bold'
              >
                Back to Queue
              </button>
            </div>
          );
      }
    }

    // FedEx Admin View
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardView />;
      case 'Customers':
        return <CustomersView />;
      case 'DCA Assignments':
        return <DcaAssignmentsView />;
      case 'Automation':
        return <CampaignView />;
      default:
        return (
          <div className='flex flex-col items-center justify-center h-full p-20 text-center'>
            <span className='material-symbols-outlined text-6xl text-slate-600 mb-4'>
              construction
            </span>
            <h2 className='text-2xl font-bold text-white mb-2'>
              {activeTab} Page
            </h2>
            <p className='text-slate-400'>
              This feature is currently under development.
            </p>
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
      navItems={currentTabs}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
