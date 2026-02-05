
import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Translate } from '../hooks/useTranslation.jsx';
import { useAppState } from '../src/useAppState';

const DashboardView = () => {
  // DEMO MODE: Access Global State
  const appState = useAppState();
  const liveCases = appState?.cases || [];
  
  // Stats Calculation
  const stats = useMemo(() => {
    const safeData = Array.isArray(liveCases) ? liveCases : [];
    const totalDebt = safeData.reduce((acc, c) => acc + (Number(c?.totalDebt) || 0), 0);
    // Determine High Probability (>70%)
    const highProb = safeData
        .filter(c => (Number(c?.repaymentProbability) || 0) > 70)
        .reduce((acc, c) => acc + (Number(c?.totalDebt) || 0), 0);
    // Count Assigned
    const dcaCount = safeData.filter(c => !!c?.assignedToDcaId).length;
    
    // Recovery Rate Mock (Can be derived from log actions if avail, else static mock logic)
    // For demo, we might want to simulate this growing? 
    // We'll stick to a static calculation based on "Closed" status for now.
    const recoveryRate = 42; 

    return { totalDebt, highProb, dcaCount, recoveryRate };
  }, [liveCases]);

  // Chart Configuration
  const { riskSeries, riskOptions, agencySeries, agencyOptions, leaderboardSeries, leaderboardOptions } = useMemo(() => {
    const safeData = Array.isArray(liveCases) ? liveCases : [];
    
    // 1. Risk Distribution
    let low = 0, medium = 0, high = 0;
    safeData.forEach(c => {
      const prob = Number(c?.repaymentProbability) || 0;
      if (prob >= 70) low++;
      else if (prob >= 30) medium++;
      else high++;
    });
    
    const total = low + medium + high || 1;
    const riskSeries = [
      Math.round((low / total) * 100),
      Math.round((medium / total) * 100),
      Math.round((high / total) * 100)
    ];

    const riskOptions = {
      chart: { type: 'radialBar', background: 'transparent', sparkline: { enabled: true } },
      plotOptions: {
        radialBar: {
          startAngle: -90, endAngle: 90,
          track: { background: "#334155", strokeWidth: '97%', margin: 5, dropShadow: { enabled: true, top: 2, left: 0, color: '#000', opacity: 1, blur: 2 } },
          dataLabels: { name: { show: false }, value: { offsetY: -2, fontSize: '22px', color: 'white', fontWeight: 900 } }
        }
      },
      grid: { padding: { top: -10 } },
      fill: {
        type: 'gradient',
        gradient: { shade: 'dark', type: 'horizontal', shadeIntensity: 0.5, gradientToColors: ['#00E396', '#FEB019', '#FF4560'], inverseColors: true, opacityFrom: 1, opacityTo: 1, stops: [0, 100] }
      },
      labels: ['Low Risk', 'Medium Risk', 'High Risk'],
      colors: ['#00C49F', '#FFBB28', '#FF8042'],
      legend: { show: true, position: 'bottom', labels: { colors: '#94a3b8' } },
    };

    // 2. Agency Performance (Bar)
    const agencyCounts = {};
    const agencyPerformance = {};

    const getAgencyName = (id) => {
      if (!id) return 'In-House';
      if (id === 'agency_alpha') return 'Alpha Collections';
      if (id === 'agency_beta') return 'Beta Recovery';
      return id;
    };

    safeData.forEach(c => {
      const agencyName = getAgencyName(c?.assignedToDcaId);
      if (!agencyCounts[agencyName]) agencyCounts[agencyName] = { active: 0, closed: 0 };
      if (!agencyPerformance[agencyName]) agencyPerformance[agencyName] = 0;

      const isClosed = ['PAID_IN_FULL', 'SETTLED', 'CLOSED', 'LEGAL_ACTION', 'Closed', 'Legal Action'].includes(c?.status);
      if (isClosed) {
        agencyCounts[agencyName].closed++;
        agencyPerformance[agencyName] += (Number(c?.totalDebt) || 0);
      } else {
        agencyCounts[agencyName].active++;
      }
    });

    const categories = Object.keys(agencyCounts);
    const agencySeries = [
      { name: 'Active Cases', data: categories.map(k => agencyCounts[k].active) },
      { name: 'Resolved / Legal', data: categories.map(k => agencyCounts[k].closed) }
    ];

    const agencyOptions = {
        chart: { type: 'bar', background: 'transparent', toolbar: { show: false }, zoom: { enabled: false } },
        colors: ['#4d148c', '#FF6200'],
        plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 8, borderRadiusApplication: 'end' } },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 2, colors: ['transparent'] },
        xaxis: { categories: categories, labels: { style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 700 } }, axisBorder: { show: false }, axisTicks: { show: false } },
        yaxis: { labels: { style: { colors: '#94a3b8' } } },
        fill: { opacity: 1 },
        grid: { borderColor: '#334155', strokeDashArray: 4, yaxis: { lines: { show: true } } },
        legend: { position: 'top', horizontalAlign: 'right', labels: { colors: '#94a3b8' } },
        tooltip: { theme: 'dark' }
    };

    // 3. Leaderboard
    const leaderboardData = Object.entries(agencyPerformance)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    const leaderboardSeries = [{ name: 'Total Recovered', data: leaderboardData.map(d => d.amount) }];
    const leaderboardOptions = {
      chart: { type: 'bar', background: 'transparent', toolbar: { show: false } },
      plotOptions: { bar: { borderRadius: 4, horizontal: true, barHeight: '50%', distributed: true } },
      colors: ['#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a'],
      dataLabels: { enabled: true, textAnchor: 'start', style: { colors: ['#fff'] }, formatter: val => "$" + val.toLocaleString(), offsetX: 0 },
      xaxis: { categories: leaderboardData.map(d => d.name), labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
      yaxis: { labels: { style: { colors: '#fff', fontSize: '14px', fontWeight: 600 } } },
      grid: { show: false },
      tooltip: { theme: 'dark', y: { formatter: val => "$" + val.toLocaleString() } },
      legend: { show: false }
    };

    return { riskSeries, riskOptions, agencySeries, agencyOptions, leaderboardSeries, leaderboardOptions };
  }, [liveCases]);


  // Safety Check
  if (!appState) return <div className="p-10 text-red-500">Error: AppState Context Missing</div>;

  return (
    <div className="flex flex-col gap-8 p-4 md:p-10 max-w-[1600px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
            <Translate text="FedEx Internal / Recovery Oversight" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight"><Translate text="Oversight Dashboard" /></h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg"><Translate text="Tracking performance and Agency progress for all outstanding accounts." /></p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="flex flex-col gap-4 rounded-2xl p-8 border border-slate-200 dark:border-surface-border bg-white dark:bg-surface-dark shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-black uppercase tracking-widest"><Translate text="Agency Assignments" /></p>
            <span className="material-symbols-outlined text-primary text-3xl">hub</span>
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-slate-900 dark:text-white">{stats.dcaCount} <Translate text="Cases" /></h3>
            <span className="text-slate-600 dark:text-slate-400 text-sm font-bold mb-1.5"><Translate text="Active External" /></span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex flex-col gap-4 rounded-2xl p-8 border border-slate-200 dark:border-surface-border bg-white dark:bg-surface-dark shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-black uppercase tracking-widest"><Translate text="Total Value at Risk" /></p>
            <span className="material-symbols-outlined text-fedex-orange text-3xl">monetization_on</span>
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-slate-900 dark:text-white">${(stats.totalDebt / 1000).toFixed(0)}k</h3>
          </div>
        </div>

        {/* Card 3 */}
        <div className="flex flex-col gap-4 rounded-2xl p-8 border border-slate-200 dark:border-surface-border bg-white dark:bg-surface-dark shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-black uppercase tracking-widest"><Translate text="DCA Recovery Rate" /></p>
            <span className="material-symbols-outlined text-emerald-500 text-3xl">speed</span>
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-slate-900 dark:text-white">{stats.recoveryRate}%</h3>
            <span className="flex items-center text-emerald-500 text-sm font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full mb-1.5">
              +12% Goal
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Radial */}
        <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-surface-border bg-white dark:bg-surface-dark p-6 min-h-[450px] lg:col-span-1">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">donut_large</span>
            <Translate text="Risk Portfolio" />
          </h3>
          <div className="flex-1 w-full min-h-0 flex items-center justify-center">
             <ReactApexChart options={riskOptions} series={riskSeries} type="radialBar" height={350} width={'100%'} />
          </div>
        </div>

        {/* Agency Bar */}
        <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-surface-border bg-white dark:bg-surface-dark p-6 min-h-[450px] lg:col-span-1">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">bar_chart</span>
            <Translate text="Agency Assignments" />
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ReactApexChart options={agencyOptions} series={agencySeries} type="bar" height={350} width={'100%'} />
          </div>
        </div>

        {/* Leaderboard */}
        <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-surface-border bg-white dark:bg-surface-dark p-6 min-h-[450px] lg:col-span-1">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-400">emoji_events</span>
            <Translate text="Top Performers" />
          </h3>
          <div className="flex-1 w-full min-h-0">
             <ReactApexChart options={leaderboardOptions} series={leaderboardSeries} type="bar" height={350} width={'100%'} />
             <p className="text-center text-xs text-slate-500 mt-2"><Translate text="Ranked by Total Recovered Amount" /></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
