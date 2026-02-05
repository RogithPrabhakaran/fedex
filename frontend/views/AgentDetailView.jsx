import React from 'react';
import { Translate } from '../hooks/useTranslation.jsx';

const AgentDetailView = ({ agent, onBack }) => {
  if (!agent) {
    return (
      <div className='bg-background-dark min-h-full p-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='bg-surface-dark border border-surface-border rounded-2xl p-8 text-center'>
            <p className='text-slate-400'><Translate text="No agent selected." /></p>
            <button
              onClick={() => onBack && onBack()}
              className='mt-4 px-4 py-2 bg-primary text-white rounded-xl'
            >
              <Translate text="Back" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Generate mock assigned cases (replace with real API data when available)
  const sampleCustomers = ['Acme Co', 'Beta LLC', 'Gamma LLC', 'Delta Co', 'Zeta Inc', 'Omega Ltd'];
  const cases = (agent.assignedCasesList && agent.assignedCasesList.length)
    ? agent.assignedCasesList.map(c => ({ ...c, customer: c.customer || 'N/A' }))
    : Array.from({ length: Math.max(3, Math.min(8, agent.assignedCases || 3)) }).map((_, i) => ({
      id: `${agent.id}-${i + 1}`,
      name: `Case ${i + 1}`,
      customer: sampleCustomers[i % sampleCustomers.length],
      recoveryStatus: i % 3 === 0 ? 'Closed' : i % 3 === 1 ? 'In Progress' : 'Behind Schedule',
      deadline: new Date(Date.now() + (i + 1) * 86400000 * 7).toISOString().slice(0, 10) // spaced by weeks
    }));

  return (
    <div className='bg-background-dark min-h-full p-8'>
      <div className='max-w-6xl mx-auto space-y-8'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-4xl font-black text-white tracking-tight mb-2'><Translate text="Agent Profile" /></h1>
            <p className='text-slate-400'><Translate text="Overview & assigned cases" /></p>
          </div>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => onBack && onBack()}
              className='px-4 py-2 bg-surface-dark border border-surface-border rounded-xl text-slate-300 hover:bg-[#111418]'
            >
              <Translate text="Back" />
            </button>
          </div>
        </div>

        {/* Profile header */}
        <div className='bg-surface-dark border border-surface-border rounded-2xl p-6 flex items-center gap-6'>
          <div className='w-28 h-28 bg-slate-700 rounded-full flex items-center justify-center text-3xl text-white font-black'>
            {agent.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div className='flex-1'>
            <h2 className='text-2xl font-black text-white'>{agent.name}</h2>
            <p className='text-slate-400 mt-1'>Agent ID: <span className='text-white font-bold'>{agent.id}</span></p>
            <div className='mt-3 grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <p className='text-xs text-slate-400 uppercase font-black'><Translate text="Contact" /></p>
                <p className='text-white font-medium'>{agent.email || 'N/A'}</p>
              </div>
              <div>
                <p className='text-xs text-slate-400 uppercase font-black'><Translate text="Phone" /></p>
                <p className='text-white font-medium'>{agent.phone || 'N/A'}</p>
              </div>
              <div>
                <p className='text-xs text-slate-400 uppercase font-black'><Translate text="Date of Joining" /></p>
                <p className='text-white font-medium'>{agent.doj || 'N/A'}</p>
              </div>
            </div>
          </div>
          <div className='w-56 text-right'>
            <p className='text-xs text-slate-400 uppercase font-black'><Translate text="Assigned Cases" /></p>
            <p className='text-3xl font-black text-white mt-2'>{agent.assignedCases || 0}</p>
            <p className='text-xs text-slate-400 uppercase font-black mt-4'><Translate text="Success Rate" /></p>
            <p className='text-2xl font-black text-white mt-2'>{agent.successRate || 0}%</p>
          </div>
        </div>

        {/* Two cards for charts */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='bg-surface-dark border border-surface-border rounded-2xl p-6'>
            <p className='text-slate-400 text-xs font-black uppercase mb-3'><Translate text="Recovery Over Time" /></p>
            <div className='h-40 bg-[#0d1113] rounded-lg flex items-center justify-center text-slate-500'>
              <Translate text="Chart placeholder" />
            </div>
          </div>

          <div className='bg-surface-dark border border-surface-border rounded-2xl p-6'>
            <p className='text-slate-400 text-xs font-black uppercase mb-3'><Translate text="Recovery by Case Type" /></p>
            <div className='h-40 bg-[#0d1113] rounded-lg flex items-center justify-center text-slate-500'>
              <Translate text="Chart placeholder" />
            </div>
          </div>
        </div>

        {/* Assigned cases table */}
        <div className='bg-surface-dark border border-surface-border rounded-2xl overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-[#111418] border-b border-surface-border'>
                <tr>
                  <th className='px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider'><Translate text="Case ID" /></th>
                  <th className='px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider'><Translate text="Case" /></th>
                  <th className='px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider'><Translate text="Customer" /></th>
                  <th className='px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider'><Translate text="Recovery Status" /></th>
                  <th className='px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider'><Translate text="Deadline" /></th>
                </tr>
              </thead>
              <tbody className='divide-y divide-surface-border'>
                {cases.map(c => (
                  <tr key={c.id} className='hover:bg-[#111418] transition-colors'>
                    <td className='px-6 py-4'>
                      <p className='text-white font-bold'>{c.id}</p>
                    </td>
                    <td className='px-6 py-4'>
                      <p className='text-white font-medium'>{c.name}</p>
                    </td>
                    <td className='px-6 py-4'>
                      <p className='text-white font-medium'>{c.customer || '—'}</p>
                    </td>
                    <td className='px-6 py-4'>
                      <span className={`inline-block px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${c.recoveryStatus === 'Closed' ? 'bg-green-500/20 text-green-500' : c.recoveryStatus === 'In Progress' ? 'bg-amber-500/20 text-amber-500' : 'bg-red-500/20 text-red-500'}`}>
                        {c.recoveryStatus}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <p className='text-white font-medium'>{c.deadline}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetailView;