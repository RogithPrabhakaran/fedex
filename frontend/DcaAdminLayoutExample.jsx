import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DcaDashboard from './views/DcaDashboard';
import CasesTable from './components/CasesTable';
import AgentsPage from './views/AgentsPage';

/**
 * Complete DCA Admin Layout Example
 * 
 * This demonstrates the full integration of:
 * - Sidebar navigation
 * - DcaDashboard (from Prompt 1)
 * - CasesTable (from Prompt 2)
 * - AgentsPage (from Prompt 3)
 */
const CompleteDcaAdminExample = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    console.log('Logging out...');
    // Add your logout logic here
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DcaDashboard />;
      case 'cases':
        return <CasesTable />;
      case 'agents':
        return <AgentsPage />;
      case 'reports':
        return (
          <div className="p-10">
            <h2 className="text-2xl font-bold">Reports View</h2>
            <p className="text-slate-500">Reports and analytics content goes here...</p>
          </div>
        );
      default:
        return <DcaDashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Sidebar Component */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default CompleteDcaAdminExample;
