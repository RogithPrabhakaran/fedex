import React, { useState } from 'react';

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'cases', label: 'Cases', icon: 'folder' },
    { id: 'agents', label: 'Agents', icon: 'group' },
    { id: 'reports', label: 'Reports', icon: 'bar_chart' },
  ];

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1E40AF] text-white rounded-lg shadow-lg hover:bg-[#1e3a8a] transition-colors"
      >
        <span className="material-symbols-outlined">
          {isMobileOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-[#111418] border-r border-slate-200 dark:border-surface-border flex flex-col transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-200 dark:border-surface-border">
          <div className="flex items-center gap-2 font-black text-2xl tracking-tighter italic">
            <span className="text-slate-900 dark:text-white">Fed</span>
            <span className="text-fedex-orange">Ex</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
            DCA Admin Portal
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-[#1E40AF] text-white shadow-lg shadow-[#1E40AF]/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-border/50'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-200 dark:border-surface-border">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-500 hover:bg-red-500/10 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
