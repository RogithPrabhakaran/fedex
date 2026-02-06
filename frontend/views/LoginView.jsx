import React, { useState } from 'react';
import { UserRole } from '../types';
import { authService } from '../services/authService';

const LoginView = ({ onLogin }) => {
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

      {/* Right side: Role Selection */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center items-center px-6 py-12 lg:px-20 bg-background-dark">
        <div className="w-full max-w-[440px] flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-black text-white tracking-tight">Select Role</h1>
            <p className="text-slate-400 text-lg">Choose a persona for the live demo.</p>
          </div>

          <div className="flex flex-col gap-4">
            {/* FedEx Admin Button */}
            <button
              onClick={() => {
                const user = { name: 'FedEx Administrator', email: 'admin@fedex.com', role: UserRole.FEDEX_ADMIN };
                localStorage.setItem('dca_token', 'mock-token');
                localStorage.setItem('dca_user', JSON.stringify(user));
                onLogin(user, 'mock-token');
              }}
              className="group relative flex items-center justify-between p-6 rounded-2xl border border-surface-border bg-surface-dark hover:border-primary transition-all hover:bg-surface-border/50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary font-black group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">corporate_fare</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-black text-white">FedEx Admin</h3>
                  <p className="text-sm text-slate-400">SLA Monitoring & Auto-Allocation</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-500 group-hover:text-white transition-colors">arrow_forward_ios</span>
            </button>

            {/* DCA Admin Button */}
            <button
              onClick={() => {
                const user = { name: 'DCA Manager', email: 'manager@agency.com', role: UserRole.DCA_ADMIN };
                localStorage.setItem('dca_token', 'mock-token');
                localStorage.setItem('dca_user', JSON.stringify(user));
                onLogin(user, 'mock-token');
              }}
              className="group relative flex items-center justify-between p-6 rounded-2xl border border-surface-border bg-surface-dark hover:border-purple-500 transition-all hover:bg-surface-border/50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-500 font-black group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-black text-white">DCA Admin</h3>
                  <p className="text-sm text-slate-400">SOP Compliance & Agency Stats</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-500 group-hover:text-white transition-colors">arrow_forward_ios</span>
            </button>

            {/* DCA Agent Button */}
            <button
              onClick={() => {
                const user = { name: 'Support Agent', email: 'agent@agency.com', role: UserRole.DCA_AGENT };
                localStorage.setItem('dca_token', 'mock-token');
                localStorage.setItem('dca_user', JSON.stringify(user));
                onLogin(user, 'mock-token');
              }}
              className="group relative flex items-center justify-between p-6 rounded-2xl border border-surface-border bg-surface-dark hover:border-fedex-orange transition-all hover:bg-surface-border/50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-fedex-orange/20 text-fedex-orange font-black group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">support_agent</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-black text-white">DCA Agent</h3>
                  <p className="text-sm text-slate-400">Audit Logs & Case Handling</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-500 group-hover:text-white transition-colors">arrow_forward_ios</span>
            </button>

            {/* Customer Button */}
            <button
              onClick={() => {
                const user = { name: 'Customer User', email: 'customer@company.com', role: UserRole.CUSTOMER };
                localStorage.setItem('dca_token', 'mock-token');
                localStorage.setItem('dca_user', JSON.stringify(user));
                onLogin(user, 'mock-token');
              }}
              className="group relative flex items-center justify-between p-6 rounded-2xl border border-surface-border bg-surface-dark hover:border-blue-500 transition-all hover:bg-surface-border/50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-500 font-black group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">account_circle</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-black text-white">Customer</h3>
                  <p className="text-sm text-slate-400">Payment Info & Discount Requests</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-500 group-hover:text-white transition-colors">arrow_forward_ios</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginView;
