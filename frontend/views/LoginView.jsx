
import React, { useState } from 'react';
import { UserRole } from '../types';

const LoginView = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-dark">
      {/* Left side: Branding */}
      <div className="relative hidden lg:flex w-1/2 flex-col justify-end p-16 overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-110" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2000')" }}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-background-dark via-background-dark/70 to-primary/20"></div>
        <div className="relative z-20 max-w-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-3xl">local_shipping</span>
            </div>
            <h1 className="text-3xl font-black italic tracking-tighter text-white">FedEx <span className="text-fedex-orange font-bold">DCA</span></h1>
          </div>
          <h2 className="text-5xl font-black tracking-tight text-white leading-tight mb-4">
            Intelligent Debt Recovery.
          </h2>
          <p className="text-xl text-slate-300 font-medium">
            Centralized case allocation, AI-powered predictions, and structured agency collaboration.
          </p>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center items-center px-6 py-12 lg:px-20 bg-background-dark">
        <div className="w-full max-w-[440px] flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-black text-white tracking-tight">Welcome Back</h1>
            <p className="text-slate-400 text-lg">Sign in to access your management portal.</p>
          </div>

          <form className="flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); onLogin(UserRole.FEDEX_ADMIN); }}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">Email Address</label>
              <div className="relative group">
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-surface-border bg-surface-dark text-white px-4 py-4 pl-12 focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-slate-500 transition-all"
                  placeholder="admin@fedex.com"
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">mail</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">Password</label>
                <a href="#" className="text-sm font-bold text-primary hover:text-blue-400 transition-colors">Forgot?</a>
              </div>
              <div className="relative group">
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-surface-border bg-surface-dark text-white px-4 py-4 pl-12 focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-slate-500 transition-all"
                  placeholder="••••••••"
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">lock</span>
              </div>
            </div>

            <button 
              type="submit"
              className="mt-4 w-full rounded-xl bg-primary py-4 text-lg font-black text-white shadow-xl shadow-primary/20 hover:bg-blue-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Sign In
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-surface-border"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase font-black tracking-widest">or login as</span>
            <div className="flex-grow border-t border-surface-border"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => onLogin(UserRole.FEDEX_ADMIN)}
              className="flex items-center justify-center gap-2 p-4 rounded-xl border border-surface-border bg-surface-dark hover:border-primary transition-all text-white font-bold"
            >
              <span className="material-symbols-outlined text-primary">corporate_fare</span>
              FedEx Admin
            </button>
            <button 
              onClick={() => onLogin(UserRole.DCA_AGENT)}
              className="flex items-center justify-center gap-2 p-4 rounded-xl border border-surface-border bg-surface-dark hover:border-fedex-orange transition-all text-white font-bold"
            >
              <span className="material-symbols-outlined text-fedex-orange">support_agent</span>
              DCA Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
