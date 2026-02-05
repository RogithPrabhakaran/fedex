import React, { useState, useRef, useEffect } from 'react';
import { UserRole } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import LanguageDropdown from './LanguageDropdown';
import { Translate } from '../hooks/useTranslation.jsx';

const Layout = ({
  user,
  children,
  activeTab,
  setActiveTab,
  onLogout,
  navItems,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const menuRef = useRef(null);
  const { theme, toggleTheme, isDark } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='flex flex-col h-screen w-full overflow-hidden'>
      {/* Top Navigation Bar */}
      <header className='bg-white dark:bg-[#111418] border-b border-slate-200 dark:border-surface-border shrink-0 px-6 py-4 flex items-center justify-between shadow-sm'>
        {/* Left side - Logo and Designation */}
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2 font-black text-2xl tracking-tighter italic'>
            <span className='text-slate-900 dark:text-white'>Fed</span>
            <span className='text-fedex-orange'>Ex</span>
          </div>
          <div className='h-6 w-px bg-slate-200 dark:bg-surface-border'></div>
          <h2 className='text-slate-900 dark:text-white text-sm font-bold hidden sm:block'>
            {user.role === UserRole.FEDEX_ADMIN
              ? <Translate text="DCA Manager" />
              : <Translate text="Agent Portal" />}
          </h2>
        </div>

        {/* Right side - Theme Toggle, Notifications and Profile */}
        <div className='flex items-center gap-4'>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className='text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-border/50 group'
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            <span className='material-symbols-outlined transition-transform group-hover:rotate-180 duration-500'>
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Language dropdown - integrated with translation system */}
          <LanguageDropdown />

          <button className='text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-border/50'>
            <span className='material-symbols-outlined'>notifications</span>
          </button>
          <div className='group relative' ref={menuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className='flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-border/50 transition-colors'
            >
              <div
                className='size-10 rounded-full border-2 border-slate-200 dark:border-surface-border bg-cover bg-center cursor-pointer hover:border-primary transition-colors'
                style={{ backgroundImage: `url(${user.avatar})` }}
              />
              <div className='hidden sm:flex flex-col items-start text-left'>
                <span className='text-xs font-bold text-slate-900 dark:text-white'>
                  {user.name}
                </span>
                <span className='text-[10px] text-slate-500 dark:text-slate-400 uppercase'>
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            </button>

            {showProfileMenu && (
              <div className='absolute right-0 top-full mt-2 w-48 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in duration-200'>
                <div className='p-3 border-b border-slate-200 dark:border-surface-border'>
                  <p className='text-slate-900 dark:text-white font-bold text-sm'>{user.name}</p>
                  <p className='text-slate-500 dark:text-slate-400 text-xs'>{user.email}</p>
                </div>
                <div className='py-2'>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setActiveTab('Profile');
                    }}
                    className='w-full flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors text-sm font-medium'
                  >
                    <span className='material-symbols-outlined text-[18px]'>person</span>
                    <Translate text="Profile" />
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      // Navigate to role-specific settings
                      if (user?.role === UserRole.FEDEX_ADMIN) {
                        setActiveTab('Admin Settings');
                      } else if (user?.role === UserRole.DCA_AGENT) {
                        setActiveTab('Agent Settings');
                      } else {
                        setActiveTab('Profile');
                      }
                    }}
                    className='w-full flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors text-sm font-medium'
                  >
                    <span className='material-symbols-outlined text-[18px]'>settings</span>
                    <Translate text="Settings" />
                  </button>
                  <div className='h-px bg-slate-200 dark:bg-surface-border my-1'></div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className='w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 transition-colors text-sm font-medium'
                  >
                    <span className='material-symbols-outlined text-[18px]'>logout</span>
                    <Translate text="Logout" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Wrapper */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Left Sidebar Navigation */}
        <aside className={`bg-white dark:bg-[#111418] border-r border-slate-200 dark:border-surface-border flex flex-col shrink-0 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'
          }`}>
          {/* Toggle Button */}
          <div className='p-4 border-b border-slate-200 dark:border-surface-border flex justify-center'>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className='text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-border/50'
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <span className='material-symbols-outlined'>
                {sidebarOpen ? 'menu_open' : 'menu'}
              </span>
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className='flex-1 overflow-y-auto p-4 space-y-2'>
            {navItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-border/50'
                  } ${!sidebarOpen && 'justify-center'}`}
                title={!sidebarOpen ? tab.label : ''}
              >
                <span className='material-symbols-outlined text-[20px] shrink-0'>{tab.icon}</span>
                {sidebarOpen && <span className='text-sm'><Translate text={tab.label} /></span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className='flex-1 overflow-y-auto bg-background-light dark:bg-background-dark'>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
