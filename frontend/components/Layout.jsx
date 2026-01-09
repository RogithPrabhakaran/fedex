import React from 'react';
import { UserRole } from '../types';

const Layout = ({
  user,
  children,
  activeTab,
  setActiveTab,
  onLogout,
  navItems,
}) => {
  return (
    <div className='flex h-screen w-full flex-col overflow-hidden'>
      {/* Header */}
      <header className='sticky top-0 z-50 flex items-center justify-between border-b border-surface-border bg-[#111418] px-4 md:px-10 py-3 shadow-sm shrink-0'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-1 font-black text-2xl tracking-tighter italic'>
            <span className='text-white'>Fed</span>
            <span className='text-fedex-orange'>Ex</span>
          </div>
          <div className='h-6 w-px bg-surface-border mx-2'></div>
          <h2 className='text-white text-lg font-bold leading-tight hidden sm:block'>
            {user.role === UserRole.FEDEX_ADMIN
              ? 'DCA Manager'
              : 'Agent Portal'}
          </h2>
        </div>

        <div className='flex flex-1 justify-end gap-8'>
          <nav className='hidden lg:flex items-center gap-8'>
            {navItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary pb-1'
                    : 'text-slate-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className='flex items-center gap-4'>
            <button className='text-slate-400 hover:text-white transition-colors'>
              <span className='material-symbols-outlined'>notifications</span>
            </button>
            <div className='group relative'>
              <button
                onClick={onLogout}
                className='flex items-center gap-3 focus:outline-none'
              >
                <div
                  className='size-10 rounded-full border-2 border-surface-border bg-cover bg-center'
                  style={{ backgroundImage: `url(${user.avatar})` }}
                />
                <div className='hidden sm:flex flex-col items-start text-left'>
                  <span className='text-xs font-bold text-white'>
                    {user.name}
                  </span>
                  <span className='text-[10px] text-slate-400 uppercase'>
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className='flex-1 overflow-y-auto bg-background-light dark:bg-background-dark'>
        {children}
      </main>
    </div>
  );
};

export default Layout;
