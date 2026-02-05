
import React, { useState, useMemo, useEffect } from 'react';
import { customerService } from '../services/customerService';
import ReactApexChart from 'react-apexcharts';

const DashboardView = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await customerService.fetchAll();
        setCustomers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load customers for stats', err);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const safeCustomers = useMemo(() => Array.isArray(customers) ? customers : [], [customers]);

  const stats = useMemo(() => {
    const totalDebt = safeCustomers.reduce((acc, c) => acc + (Number(c?.totalDebt) || 0), 0);
    const highProb = safeCustomers.filter(c => (Number(c?.repaymentProbability) || 0) > 70).reduce((acc, c) => acc + (Number(c?.totalDebt) || 0), 0);
    const dcaCount = safeCustomers.filter(c => !!c?.assignedToDcaId).length;
    return { totalDebt, highProb, dcaCount };
  }, [safeCustomers]);

  // Chart Data Preparation
  const { riskSeries, riskOptions, agencySeries, agencyOptions, leaderboardSeries, leaderboardOptions } = useMemo(() => {
    // 1. Risk Distribution Data
    let low = 0, medium = 0, high = 0;
    safeCustomers.forEach(c => {
      const prob = Number(c?.repaymentProbability) || 0;
      if (prob >= 70) low++;
      else if (prob >= 30) medium++;
      else high++;
    });

    const total = low + medium + high || 1;
    // RadialBar expects percentages [Low%, Medium%, High%]
    const riskSeries = [
      Math.round((low / total) * 100),
      Math.round((medium / total) * 100),
      Math.round((high / total) * 100)
    ];

    const riskOptions = {
      chart: {
        type: 'radialBar',
        background: 'transparent',
        sparkline: { enabled: true }
      },
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          track: {
            background: "#334155",
            strokeWidth: '97%',
            margin: 5,
            dropShadow: {
              enabled: true,
              top: 2,
              left: 0,
              color: '#000',
              opacity: 1,
              blur: 2
            }
          },
          dataLabels: {
            name: { show: false },
            value: {
              offsetY: -2,
              fontSize: '22px',
              color: 'white',
              fontWeight: 900
            }
          }
        }
      },
      grid: { padding: { top: -10 } },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'horizontal',
          shadeIntensity: 0.5,
          gradientToColors: ['#00E396', '#FEB019', '#FF4560'],
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 100]
        }
      },
      labels: ['Low Risk', 'Medium Risk', 'High Risk'],
      colors: ['#00C49F', '#FFBB28', '#FF8042'], // Fallbacks
      legend: { show: true, position: 'bottom', labels: { colors: '#94a3b8' } },
    };


    // 2. Agency Performance Data (Bar Chart)
    const agencyCounts = {};
    const agencyPerformance = {}; // { agencyName: recoveredAmount }

    // Initialize generic list or handle dynamic from seed values
    // Using mapping or raw IDs
    const getAgencyName = (id) => {
      if (!id) return 'In-House';
      if (id === 'agency_alpha') return 'Alpha Collections';
      if (id === 'agency_beta') return 'Beta Recovery';
      return id;
    };

    safeCustomers.forEach(c => {
      const agencyId = c?.assignedToDcaId;
      const agencyName = getAgencyName(agencyId);

      if (!agencyCounts[agencyName]) agencyCounts[agencyName] = { active: 0, closed: 0 };
      if (!agencyPerformance[agencyName]) agencyPerformance[agencyName] = 0;

      const isClosed = ['PAID_IN_FULL', 'SETTLED', 'CLOSED', 'LEGAL_ACTION', 'Closed', 'Legal Action'].includes(c?.status);
      if (isClosed) {
        agencyCounts[agencyName].closed++;
        // Rough estimate: we assume closed means recovered for this demo since we lack transaction table access here
        agencyPerformance[agencyName] += (Number(c?.totalDebt) || 0);
      } else {
        agencyCounts[agencyName].active++;
      }
    });

    const categories = Object.keys(agencyCounts);
    const activeData = categories.map(k => agencyCounts[k].active);
    const closedData = categories.map(k => agencyCounts[k].closed);

    const agencySeries = [
      { name: 'Active Cases', data: activeData },
      { name: 'Resolved / Legal', data: closedData }
    ];

    const agencyOptions = {
      chart: {
        type: 'bar',
        background: 'transparent',
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      colors: ['#4d148c', '#FF6200'], // Fedex Purple and Orange
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 8,
          borderRadiusApplication: 'end',
        },
      },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ['transparent'] },
      xaxis: {
        categories: categories,
        labels: { style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 700 } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: { labels: { style: { colors: '#94a3b8' } } },
      fill: { opacity: 1 },
      grid: {
        borderColor: '#334155',
        strokeDashArray: 4,
        yaxis: { lines: { show: true } }
      },
      legend: { position: 'top', horizontalAlign: 'right', labels: { colors: '#94a3b8' } },
      tooltip: { theme: 'dark' }
    };

    // 3. Leaderboard Data (Horizontal Bar Sorted by Recovery)
    // Convert performance object to array, sort, and slice
    const leaderboardData = Object.entries(agencyPerformance)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    const leaderboardSeries = [{
      name: 'Total Recovered',
      data: leaderboardData.map(d => d.amount)
    }];

    const leaderboardOptions = {
      chart: {
        type: 'bar',
        background: 'transparent',
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: true,
          barHeight: '50%',
          distributed: true // colorful bars
        }
      },
      colors: ['#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a'],
      dataLabels: {
        enabled: true,
        textAnchor: 'start',
        style: { colors: ['#fff'] },
        formatter: function (val, opt) {
          return "$" + val.toLocaleString()
        },
        offsetX: 0,
      },
      xaxis: {
        categories: leaderboardData.map(d => d.name),
        labels: { show: false }, // clean look
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: {
          style: { colors: '#fff', fontSize: '14px', fontWeight: 600 }
        }
      },
      grid: { show: false },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: function (val) {
            return "$" + val.toLocaleString()
          }
        }
      },
      legend: { show: false }
    };

    return { riskSeries, riskOptions, agencySeries, agencyOptions, leaderboardSeries, leaderboardOptions };
  }, [safeCustomers]);

  if (loading && safeCustomers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-slate-500 font-medium">Crunching dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-10 max-w-[1600px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
            FedEx Internal / Recovery Oversight
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Oversight Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Tracking performance and Agency progress for all outstanding accounts.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex flex-col gap-4 rounded-2xl p-8 border border-slate-200 dark:border-surface-border bg-white dark:bg-surface-dark shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-black uppercase tracking-widest">Agency Assignments</p>
            <span className="material-symbols-outlined text-primary text-3xl">hub</span>
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-slate-900 dark:text-white">{stats.dcaCount} Cases</h3>
            <span className="text-slate-600 dark:text-slate-400 text-sm font-bold mb-1.5">Active External</span>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-2xl p-8 border border-slate-200 dark:border-surface-border bg-white dark:bg-surface-dark shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-black uppercase tracking-widest">Total Value at Risk</p>
            <span className="material-symbols-outlined text-fedex-orange text-3xl">monetization_on</span>
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-slate-900 dark:text-white">${(stats.totalDebt / 1000).toFixed(0)}k</h3>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-2xl p-8 border border-slate-200 dark:border-surface-border bg-white dark:bg-surface-dark shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-black uppercase tracking-widest">DCA Recovery Rate</p>
            <span className="material-symbols-outlined text-emerald-500 text-3xl">speed</span>
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-slate-900 dark:text-white">42%</h3>
            <span className="flex items-center text-emerald-500 text-sm font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full mb-1.5">
              +12% Goal
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Risk Distribution Chart - Radial Bar */}
        <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-surface-border bg-white dark:bg-surface-dark p-6 min-h-[450px] lg:col-span-1">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">donut_large</span>
            Risk Portfolio
          </h3>
          <div className="flex-1 w-full min-h-0 flex items-center justify-center">
            <ReactApexChart
              options={riskOptions}
              series={riskSeries}
              type="radialBar"
              height={350}
              width={'100%'}
            />
          </div>
        </div>

        {/* Agency Status Chart - Modern Bar */}
        <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-surface-border bg-white dark:bg-surface-dark p-6 min-h-[450px] lg:col-span-1">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">bar_chart</span>
            Agency Assignments
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ReactApexChart
              options={agencyOptions}
              series={agencySeries}
              type="bar"
              height={350}
              width={'100%'}
            />
          </div>
        </div>

        {/* Agency Leaderboard - Horizontal Bar */}
        <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-surface-border bg-white dark:bg-surface-dark p-6 min-h-[450px] lg:col-span-1">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-400">emoji_events</span>
            Top Performers
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ReactApexChart
              options={leaderboardOptions}
              series={leaderboardSeries}
              type="bar"
              height={350}
              width={'100%'}
            />
            <p className="text-center text-xs text-slate-500 mt-2">Ranked by Total Recovered Amount</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardView;
