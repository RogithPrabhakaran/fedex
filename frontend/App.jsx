import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { authService } from './services/authService';
import { UserRole } from './types';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/Layout';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import CustomersView from './views/CustomersView';
import CampaignView from './views/CampaignView';
import AgencyDashboard from './views/AgencyDashboard';
import DcaAdminDashboard from './views/DcaAdminDashboard';
import DcaAssignmentsView from './views/DcaAssignmentsView';
import DcaAgentsView from './views/DcaAgentsView';
import AgentDetailView from './views/AgentDetailView';
import ProfileView from './views/ProfileView';
import AdminSettingsView from './views/AdminSettingsView';
import AgentSettingsView from './views/AgentSettingsView';
import DcaLeaderboardView from './views/DcaLeaderboardView';
import IssuesResolveView from './views/IssuesResolveView';
import AgentIssuesView from './views/AgentIssuesView';
import SlaManagementView from './views/SlaManagementView';

// New DCA Admin Components
import Sidebar from './components/Sidebar';
import DcaDashboard from './views/DcaDashboard';
import CasesTable from './components/CasesTable';
import AgentsPage from './views/AgentsPage';

const App = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    const u = localStorage.getItem('dca_user');
    return u ? JSON.parse(u) : null;
  });
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedAgent, setSelectedAgent] = useState(null);

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
    { id: 'DCA Leaderboard', label: 'Leaderboards', icon: 'leaderboard' },
    { id: 'SLA Management', label: 'SLA Management', icon: 'schedule' },
    { id: 'Issues', label: 'Issues', icon: 'report_problem' },
    { id: 'DCA Assignments', label: 'Assignments', icon: 'assignment_ind' },
    { id: 'Automation', label: 'Automation', icon: 'smart_toy' },
  ];

  const DCA_AGENT_TABS = [
    { id: 'Dashboard', label: 'My Queue', icon: 'list_alt' }, // "My Queue" is their Dashboard
    { id: 'DCA Dashboard', label: 'Analytics', icon: 'emoji_events' },
    { id: 'Agents', label: 'My Team', icon: 'people' },
    { id: 'Issues', label: 'Issues', icon: 'forum' },
  ];

  const DCA_ADMIN_TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'cases', label: 'Cases', icon: 'folder' },
    { id: 'agents', label: 'Agents', icon: 'group' },
    { id: 'reports', label: 'Reports', icon: 'bar_chart' },
  ];

  const currentTabs =
    currentUser?.role === UserRole.DCA_AGENT 
      ? DCA_AGENT_TABS 
      : currentUser?.role === UserRole.DCA_ADMIN
      ? DCA_ADMIN_TABS
      : ADMIN_TABS;

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  const renderContent = () => {
    // DCA Admin gets the new modern layout with Sidebar
    if (currentUser.role === UserRole.DCA_ADMIN) {
      switch (activeTab) {
        case 'dashboard':
          return <DcaDashboard />;
        case 'cases':
          return <CasesTable />;
        case 'agents':
          return <AgentsPage />;
        case 'reports':
          return (
            <div className='flex flex-col items-center justify-center h-full p-20 text-center'>
              <span className='material-symbols-outlined text-6xl text-slate-600 mb-4'>
                bar_chart
              </span>
              <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>
                Reports Coming Soon
              </h2>
              <p className='text-slate-400'>
                Analytics and reporting features are under development.
              </p>
            </div>
          );
        case 'Profile':
          return <ProfileView user={currentUser} />;
        default:
          return <DcaDashboard />;
      }
    }

    // If DCA Agent, they get a completely different dashboard experience
    if (currentUser.role === UserRole.DCA_AGENT) {
      switch (activeTab) {
        case 'Dashboard':
        case 'Customers':
          return <AgencyDashboard user={currentUser} />;
        case 'DCA Dashboard':
          return <DcaAdminDashboard />;
        case 'Issues':
          return <AgentIssuesView user={currentUser} />;
        case 'Profile':
          return <ProfileView user={currentUser} />;
        case 'Agent Settings':
          return <AgentSettingsView user={currentUser} />;
        case 'Agent Detail':
          return <AgentDetailView agent={selectedAgent} onBack={() => setActiveTab('Agents')} />;
        case 'Agents':
          return <DcaAgentsView user={currentUser} setActiveTab={setActiveTab} setSelectedAgent={setSelectedAgent} />;
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
                DCA agents only have access to their Recovery Queue, My Team, and Profile.
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
      case 'Agent Detail':
        return <AgentDetailView agent={selectedAgent} onBack={() => setActiveTab('Agents')} />;
      case 'Agents':
        return <DcaAgentsView user={currentUser} setActiveTab={setActiveTab} setSelectedAgent={setSelectedAgent} />;
      case 'Automation':
        return <CampaignView />;
      case 'DCA Leaderboard':
        return <DcaLeaderboardView />;
      case 'SLA Management':
        return <SlaManagementView />;
      case 'Issues':
        return <IssuesResolveView />;
      case 'Profile':
        return <ProfileView user={currentUser} />;
      case 'Admin Settings':
        return <AdminSettingsView user={currentUser} />;
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
    <LanguageProvider>
      <ThemeProvider>
        {!currentUser ? (
          <LoginView onLogin={handleLogin} />
        ) : currentUser.role === UserRole.DCA_ADMIN ? (
          // DCA Admin gets new Sidebar layout
        <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
          />
          <main className="flex-1 overflow-y-auto">
            {renderContent()}
          </main>
        </div>
      ) : (
        // Other roles use existing Layout
        <Layout
            user={currentUser}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
            navItems={currentTabs}
          >
            {renderContent()}
          </Layout>
        )}
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;
