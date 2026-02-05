import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { agentsService } from '../services/agentsService';

const AgentProgress = ({ agentId, onClose }) => {
  const [agentData, setAgentData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (agentId) {
      fetchAgentProgress();
    }
  }, [agentId]);

  const fetchAgentProgress = async () => {
    setLoading(true);
    try {
      const data = await agentsService.getAgentProgress(agentId);
      setAgentData(data?.agent || null);
      setRecentActivity(Array.isArray(data?.recent_activity) ? data.recent_activity : []);
    } catch (error) {
      console.error('Failed to fetch agent progress:', error);
      alert('Failed to load agent progress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionTypeBadge = (actionType) => {
    const typeConfig = {
      STATUS_CHANGE: { color: 'bg-blue-500/10 text-blue-500', icon: 'sync' },
      CALL_LOG: { color: 'bg-green-500/10 text-green-500', icon: 'call' },
      COMMENT: { color: 'bg-slate-500/10 text-slate-500', icon: 'comment' },
      EMAIL: { color: 'bg-purple-500/10 text-purple-500', icon: 'email' },
      PAYMENT: { color: 'bg-orange-500/10 text-orange-500', icon: 'payments' },
    };
    const config = typeConfig[actionType] || typeConfig.COMMENT;
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${config.color} flex items-center gap-1 w-fit`}>
        <span className="material-symbols-outlined text-[14px]">{config.icon}</span>
        {actionType.replace('_', ' ')}
      </span>
    );
  };

  if (!agentData) {
    return (
      <div className="p-10 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#1E40AF] border-t-transparent rounded-full mx-auto"></div>
        <p className="text-slate-500 dark:text-slate-400 mt-4">Loading agent progress...</p>
      </div>
    );
  }

  // Status Pie Chart
  const statusChartOptions = {
    chart: {
      type: 'donut',
      background: 'transparent',
    },
    labels: Object.keys(agentData?.status_breakdown || {}),
    colors: ['#64748b', '#1E40AF', '#FF6600', '#FCD34D', '#10B981'],
    legend: {
      position: 'bottom',
      labels: {
        colors: '#94a3b8',
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        colors: ['#fff'],
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Cases',
              color: '#94a3b8',
            },
          },
        },
      },
    },
  };

  const statusChartSeries = Object.values(agentData?.status_breakdown || {});

  // Performance Line Chart
  const performanceChartOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      background: 'transparent',
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    xaxis: {
      categories: agentData?.performance_data?.dates || [],
      labels: {
        style: {
          colors: '#94a3b8',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#94a3b8',
        },
      },
    },
    colors: ['#1E40AF', '#10B981'],
    grid: {
      borderColor: '#334155',
    },
    legend: {
      labels: {
        colors: '#94a3b8',
      },
    },
  };

  const performanceChartSeries = [
    {
      name: 'Cases Worked',
      data: agentData?.performance_data?.cases_worked || [],
    },
    {
      name: 'Cases Recovered',
      data: agentData?.performance_data?.cases_recovered || [],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl shadow-2xl max-w-6xl w-full my-8 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-surface-border bg-gradient-to-r from-[#1E40AF] to-[#3B82F6]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-black text-2xl border-2 border-white/30">
                  {agentData.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">
                    {agentData.name}
                  </h2>
                  <p className="text-blue-100 text-sm">{agentData.email}</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="text-blue-100 text-xs font-bold mb-1">Total Cases</div>
                  <div className="text-3xl font-black text-white">{agentData?.total_cases || 0}</div>
                </div>
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="text-blue-100 text-xs font-bold mb-1">Recovery Rate</div>
                  <div className="text-3xl font-black text-white">{agentData?.recovery_rate || 0}%</div>
                </div>
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="text-blue-100 text-xs font-bold mb-1">Avg Days/Case</div>
                  <div className="text-3xl font-black text-white">{agentData?.avg_days_per_case || 0}</div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Status Pie Chart */}
            <div className="p-6 bg-slate-50 dark:bg-[#111418] border border-slate-200 dark:border-surface-border rounded-2xl">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
                Case Status Breakdown
              </h3>
              <div className="h-[300px] flex items-center justify-center">
                <ReactApexChart
                  options={statusChartOptions}
                  series={statusChartSeries}
                  type="donut"
                  height={300}
                />
              </div>
            </div>

            {/* Performance Line Chart */}
            <div className="p-6 bg-slate-50 dark:bg-[#111418] border border-slate-200 dark:border-surface-border rounded-2xl">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
                30-Day Performance
              </h3>
              <div className="h-[300px]">
                <ReactApexChart
                  options={performanceChartOptions}
                  series={performanceChartSeries}
                  type="line"
                  height={300}
                />
              </div>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="p-6 bg-slate-50 dark:bg-[#111418] border border-slate-200 dark:border-surface-border rounded-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
              Recent Activity
            </h3>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 dark:border-surface-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase">
                      Case ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((activity) => (
                    <tr
                      key={activity?.log_id}
                      className="border-b border-slate-200 dark:border-surface-border hover:bg-white dark:hover:bg-surface-dark transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {activity?.date ? formatDate(activity.date) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-mono text-slate-900 dark:text-white">
                          {activity?.case_id ? `${activity.case_id.substring(0, 8)}...` : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getActionTypeBadge(activity?.action_type || 'COMMENT')}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {activity?.description || 'No description'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.log_id}
                  className="p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-xl"
                >
                  <div className="flex items-start justify-between mb-2">
                    {getActionTypeBadge(activity.action_type)}
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(activity.date)}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-2">
                    {activity.case_id.substring(0, 8)}...
                  </div>
                  <p className="text-sm text-slate-900 dark:text-white">
                    {activity.description}
                  </p>
                </div>
              ))}
            </div>

            {recentActivity.length === 0 && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No recent activity
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-surface-border bg-slate-50 dark:bg-[#111418]">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[#1E40AF] text-white rounded-xl font-bold hover:bg-[#1e3a8a] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentProgress;
