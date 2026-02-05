import React from 'react';
import ReactApexChart from 'react-apexcharts';

const DcaDashboard = () => {
  // Mock Data - In a real app, this would come from an API
  const [data, setData] = React.useState({
    projectCode: 'DCA-AGILE-24',
    totalCases: 0,
    recoveryRate: 0,
    activeAgents: 0,
    slaCompliance: 0,
  });
  const [loading, setLoading] = React.useState(false);

  // Future API Hook:
  // useEffect(() => { fetchDashboardData(); }, []);

  const stats = data || {};

  // Chart 1: Cases by Status (Donut Chart)
  const casesByStatusOptions = {
    chart: {
      type: 'donut',
      background: 'transparent',
    },
    labels: ['Open', 'In Progress', 'Resolved', 'Closed'],
    colors: ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD'],
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
        },
      },
    },
  };

  const casesByStatusSeries = [8, 12, 5, 3];

  // Chart 2: Recovery Trend (Line Chart)
  const recoveryTrendOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      background: 'transparent',
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      labels: {
        style: {
          colors: '#94a3b8',
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => `${val}%`,
        style: {
          colors: '#94a3b8',
        },
      },
    },
    colors: ['#FF6600'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
      },
    },
    grid: {
      borderColor: '#334155',
    },
    tooltip: {
      y: {
        formatter: (val) => `${val}%`,
      },
    },
  };

  const recoveryTrendSeries = [
    {
      name: 'Recovery Rate',
      data: [25, 28, 30, 29, 31, 32],
    },
  ];

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
          DCA Admin Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Project: <span className="font-bold text-[#1E40AF]">{stats.projectCode || 'N/A'}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Cases Card */}
        <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#1E40AF]/10 rounded-xl">
              <span className="material-symbols-outlined text-[#1E40AF] text-2xl">
                folder
              </span>
            </div>
            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
              +12%
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
            {stats.totalCases || 0}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Total Cases
          </div>
        </div>

        {/* Recovery Rate Card */}
        <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#FF6600]/10 rounded-xl">
              <span className="material-symbols-outlined text-[#FF6600] text-2xl">
                trending_up
              </span>
            </div>
            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
              +5%
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
            {stats.recoveryRate || 0}%
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Recovery Rate
          </div>
        </div>

        {/* Active Agents Card */}
        <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <span className="material-symbols-outlined text-blue-500 text-2xl">
                group
              </span>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-500/10 px-2 py-1 rounded-full">
              Active
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
            {stats.activeAgents || 0}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Active Agents
          </div>
        </div>

        {/* SLA Compliance Card */}
        <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <span className="material-symbols-outlined text-green-500 text-2xl">
                verified
              </span>
            </div>
            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
              Excellent
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
            {stats.slaCompliance || 0}%
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            SLA Compliance
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases by Status Chart */}
        <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl shadow-sm">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
            Cases by Status
          </h3>
          <div className="h-[300px] flex items-center justify-center">
            <ReactApexChart
              options={casesByStatusOptions}
              series={casesByStatusSeries}
              type="donut"
              height={300}
            />
          </div>
        </div>

        {/* Recovery Trend Chart */}
        <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl shadow-sm">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
            Recovery Trend (Last 6 Months)
          </h3>
          <div className="h-[300px]">
            <ReactApexChart
              options={recoveryTrendOptions}
              series={recoveryTrendSeries}
              type="area"
              height={300}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DcaDashboard;
