import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';

const DcaAgentsView = ({ user, setActiveTab, setSelectedAgent }) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    status: 'Active'
  });

  // Check if user is authorized to view this page
  const isAuthorized = user && user.role === UserRole.DCA_AGENT;

  if (!isAuthorized) {
    return (
      <div className='flex flex-col items-center justify-center h-full p-20 text-center'>
        <span className='material-symbols-outlined text-6xl text-slate-600 mb-4'>
          lock
        </span>
        <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>
          Access Restricted
        </h2>
        <p className='text-slate-400'>
          Only DCA Agents can manage team members. You don't have the required permissions.
        </p>
      </div>
    );
  }

  // Mock data for agents
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setAgents([
        {
          id: 1,
          name: 'John Smith',
          email: 'john.smith@dca.com',
          company: 'ABC Recovery Corp',
          status: 'Active',
          assignedCases: 15,
          recoveryStatus: 'In Progress',
          deadline: '2026-02-15',
          successRate: 78,
          totalRecovered: '$45,000',
          overdueCustomers: ['Acme Co', 'Beta LLC']
        },
        {
          id: 2,
          name: 'Sarah Johnson',
          email: 'sarah.johnson@dca.com',
          company: 'ABC Recovery Corp',
          status: 'Active',
          assignedCases: 12,
          recoveryStatus: 'Closed',
          deadline: '2026-02-20',
          successRate: 85,
          totalRecovered: '$52,500',
          overdueCustomers: ['Zeta Inc']
        },
        {
          id: 3,
          name: 'Michael Chen',
          email: 'michael.chen@dca.com',
          company: 'XYZ Collections',
          status: 'Active',
          assignedCases: 18,
          recoveryStatus: 'Behind Schedule',
          deadline: '2026-02-10',
          successRate: 72,
          totalRecovered: '$38,000',
          overdueCustomers: ['Omega Ltd', 'Gamma LLC', 'Delta Co']
        },
        {
          id: 4,
          name: 'Emily Rodriguez',
          email: 'emily.rodriguez@dca.com',
          company: 'XYZ Collections',
          status: 'Inactive',
          assignedCases: 0,
          recoveryStatus: 'Closed',
          deadline: 'N/A',
          successRate: 0,
          totalRecovered: '$0',
          overdueCustomers: []
        },
        {
          id: 5,
          name: 'David Wilson',
          email: 'david.wilson@dca.com',
          company: 'Global Debt Solutions',
          status: 'Active',
          assignedCases: 20,
          recoveryStatus: 'Closed',
          deadline: '2026-02-25',
          successRate: 92,
          totalRecovered: '$68,000',
          overdueCustomers: ['Global Industries']
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          agent.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || agent.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleAddAgent = (e) => {
    e.preventDefault();
    const newAgent = {
      id: agents.length + 1,
      ...formData,
      assignedCases: 0,
      recoveryStatus: 'In Progress',
      deadline: 'N/A',
      successRate: 0,
      totalRecovered: '$0'
    };
    setAgents([...agents, newAgent]);
    setShowAddModal(false);
    setFormData({ name: '', email: '', company: '', status: 'Active' });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-500/20 text-green-500';
      case 'Inactive': return 'bg-slate-500/20 text-slate-400';
      case 'On Leave': return 'bg-amber-500/20 text-amber-500';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getRecoveryStatusColor = (status) => {
    switch(status) {
      case 'In Progress': return 'bg-amber-500/20 text-amber-500';
      case 'Closed': return 'bg-green-500/20 text-green-500';
      case 'Behind Schedule': return 'bg-red-500/20 text-red-500';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-center'>
          <div className='animate-spin size-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4'></div>
          <p className='text-slate-900 dark:text-white font-bold'>Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-background-dark min-h-full p-8'>
      <div className='max-w-7xl mx-auto space-y-8'>
        {/* Header */}
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2'>Manage Agents</h1>
            <p className='text-slate-400'>Monitor and manage your DCA agents performance and assignments</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className='flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-primary/20'
          >
            <span className='material-symbols-outlined'>add</span>
            Add Agent
          </button>
        </div>

        {/* Filters */}
        <div className='flex gap-4'>
          <div className='flex-1 relative'>
            <input
              type='text'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Search by name, email, or company...'
              className='w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-xl text-white px-4 py-3 pl-12 focus:border-primary focus:ring-2 focus:ring-primary/20'
            />
            <span className='material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'>search</span>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className='bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-xl text-white px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20'
          >
            <option value='all'>All Status</option>
            <option value='Active'>Active</option>
            <option value='Inactive'>Inactive</option>
            <option value='On Leave'>On Leave</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl p-6'>
            <span className='text-slate-400 text-xs font-black uppercase'>Total Agents</span>
            <p className='text-3xl font-black text-slate-900 dark:text-white mt-2'>{agents.length}</p>
          </div>
          <div className='bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl p-6'>
            <span className='text-slate-400 text-xs font-black uppercase'>Active</span>
            <p className='text-3xl font-black text-green-500 mt-2'>{agents.filter(a => a.status === 'Active').length}</p>
          </div>
          <div className='bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl p-6'>
            <span className='text-slate-400 text-xs font-black uppercase'>Total Assigned Cases</span>
            <p className='text-3xl font-black text-primary mt-2'>{agents.reduce((sum, a) => sum + a.assignedCases, 0)}</p>
          </div>
          <div className='bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl p-6'>
            <span className='text-slate-400 text-xs font-black uppercase'>Total Recovered</span>
            <p className='text-3xl font-black text-amber-500 mt-2'>${agents.reduce((sum, a) => sum + parseInt(a.totalRecovered.replace(/[$,]/g, '')), 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Agents Table */}
        <div className='bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-[#111418] border-b border-slate-200 dark:border-surface-border'>
                <tr>
                  <th className='px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider'>Name</th>
                  <th className='px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider'>Status</th>
                  <th className='px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider'>Assigned Cases</th>
                  <th className='px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider'>Success Rate</th>
                  <th className='px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider'>Total Recovered</th>
                  <th className='px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-surface-border'>
                {filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan='6' className='px-6 py-12 text-center'>
                      <div className='flex flex-col items-center justify-center'>
                        <span className='material-symbols-outlined text-5xl text-slate-600 mb-4'>people_alt</span>
                        <p className='text-slate-400 font-bold'>No agents found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAgents.map((agent) => (
                    <tr key={agent.id} className='hover:bg-[#111418] transition-colors'>
                      <td className='px-6 py-4'>
                        <div>
                          <button
                            onClick={() => {
                              setSelectedAgent && setSelectedAgent(agent);
                              setActiveTab && setActiveTab('Agent Detail');
                            }}
                            className='text-left'
                          >
                            <p className='text-slate-900 dark:text-white font-bold underline hover:text-primary'>{agent.name}</p>
                            <p className='text-slate-400 text-sm'>{agent.email}</p>
                          </button>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <span className={`inline-block px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${getStatusColor(agent.status)}`}>
                          {agent.status}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <p className='text-slate-900 dark:text-white font-bold text-center'>{agent.assignedCases}</p>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          <div className='w-12 h-2 bg-slate-700 rounded-full overflow-hidden'>
                            <div 
                              className='h-full bg-primary transition-all'
                              style={{ width: `${agent.successRate}%` }}
                            ></div>
                          </div>
                          <p className='text-slate-900 dark:text-white font-bold'>{agent.successRate}%</p>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <p className='text-slate-900 dark:text-white font-bold text-green-500'>{agent.totalRecovered}</p>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex gap-2'>
                          <button className='p-2 text-slate-400 hover:text-primary rounded-lg hover:bg-surface-border/50 transition-colors' title='Edit'>
                            <span className='material-symbols-outlined text-sm'>edit</span>
                          </button>
                          <button className='p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors' title='Delete'>
                            <span className='material-symbols-outlined text-sm'>delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Agent Modal */}
      {showAddModal && (
        <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <div className='bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl p-8 max-w-md w-full space-y-6'>
            <div className='flex justify-between items-center'>
              <h2 className='text-2xl font-black text-slate-900 dark:text-white'>Add New Agent</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className='text-slate-400 hover:text-slate-900 dark:text-white transition-colors'
              >
                <span className='material-symbols-outlined'>close</span>
              </button>
            </div>

            <form onSubmit={handleAddAgent} className='space-y-4'>
              <div>
                <label className='text-xs font-black text-slate-400 uppercase block mb-2'>Name</label>
                <input
                  type='text'
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className='w-full bg-[#111418] border border-slate-200 dark:border-surface-border rounded-xl text-white px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  placeholder='Agent name'
                  required
                />
              </div>

              <div>
                <label className='text-xs font-black text-slate-400 uppercase block mb-2'>Email</label>
                <input
                  type='email'
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className='w-full bg-[#111418] border border-slate-200 dark:border-surface-border rounded-xl text-white px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  placeholder='agent@dca.com'
                  required
                />
              </div>

              <div>
                <label className='text-xs font-black text-slate-400 uppercase block mb-2'>Company</label>
                <input
                  type='text'
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className='w-full bg-[#111418] border border-slate-200 dark:border-surface-border rounded-xl text-white px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  placeholder='Company name'
                  required
                />
              </div>

              <div>
                <label className='text-xs font-black text-slate-400 uppercase block mb-2'>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className='w-full bg-[#111418] border border-slate-200 dark:border-surface-border rounded-xl text-white px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20'
                >
                  <option value='Active'>Active</option>
                  <option value='Inactive'>Inactive</option>
                  <option value='On Leave'>On Leave</option>
                </select>
              </div>

              <button
                type='submit'
                className='w-full py-3 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all'
              >
                Add Agent
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DcaAgentsView;
