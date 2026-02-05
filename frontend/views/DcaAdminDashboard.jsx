import React, { useEffect, useMemo, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { dashboardService } from '../services/dashboardService';

const numberFormat = (v) => v ? `$${Number(v).toLocaleString()}` : '$0';

const DcaAdminDashboard = () => {
  const [agencies, setAgencies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cases, setCases] = useState([]);
  const [casesSummary, setCasesSummary] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [a, c, cs, summary] = await Promise.all([
          dashboardService.fetchAgencies(),
          dashboardService.fetchCustomers(),
          dashboardService.fetchCases(),
          dashboardService.fetchCasesSummary()
        ]);
        setAgencies(Array.isArray(a) ? a : []);
        setCustomers(Array.isArray(c) ? c : []);
        setCases(Array.isArray(cs) ? cs : []);
        setCasesSummary(Array.isArray(summary) ? summary : []);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        setAgencies([]);
        setCustomers([]);
        setCases([]);
        setCasesSummary([]);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const safeAgencies = useMemo(() => Array.isArray(agencies) ? agencies : [], [agencies]);
  const safeCustomers = useMemo(() => Array.isArray(customers) ? customers : [], [customers]);
  const safeCases = useMemo(() => Array.isArray(cases) ? cases : [], [cases]);
  const safeSummary = useMemo(() => Array.isArray(casesSummary) ? casesSummary : [], [casesSummary]);

  const top3Agencies = useMemo(() => {
    return [...safeAgencies].sort((x, y) => (y?.recovery_rate || 0) - (x?.recovery_rate || 0)).slice(0, 3);
  }, [safeAgencies]);

  const totals = useMemo(() => {
    const totalPaymentDue = safeCustomers.reduce((s, cu) => s + (Number(cu?.totalDebt) || 0), 0);
    const totalRecovered = safeCases.reduce((s, cs) => s + (Number(cs?.amount_recovered) || 0), 0);
    const closed = safeCases.filter(c => c?.life_cycle_status === 'CLOSED').length;
    const open = safeCases.length - closed;

    // Top customers by outstanding debt
    const topCustomers = [...safeCustomers].sort((a, b) => (Number(b?.totalDebt) || 0) - (Number(a?.totalDebt) || 0)).slice(0, 8);

    return { totalPaymentDue, totalRecovered, closed, open, topCustomers };
  }, [safeCustomers, safeCases]);

  // Prepare a monthly recovered line chart if casesSummary available
  const monthlySeries = useMemo(() => {
    const sorted = [...safeSummary].sort((a, b) => new Date(a?.month_year) - new Date(b?.month_year));
    return [{ name: 'Recovered', data: sorted.map(r => Number(r?.recovered_amount) || 0) }];
  }, [safeSummary]);

  const monthlyCategories = useMemo(() => {
    const sorted = [...safeSummary].sort((a, b) => new Date(a?.month_year) - new Date(b?.month_year));
    return sorted.map(r => r?.month_year || 'N/A');
  }, [safeSummary]);

  const monthlyOptions = {
    chart: { toolbar: { show: false }, background: 'transparent' },
    stroke: { curve: 'smooth' },
    xaxis: { categories: monthlyCategories },
    yaxis: { labels: { formatter: v => `$${(v/1000).toFixed(0)}k` } },
    colors: ['#00E396'],
    grid: { borderColor: '#334155' },
    tooltip: { y: { formatter: v => `$${Number(v).toLocaleString()}` } }
  };

  return (
    <div className="p-4 md:p-10 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">DCA Admin Dashboard</h1>
          <p className="text-slate-400">Overview of agency performance, recovery progress, and top accounts.</p>
        </div>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl">
          <div className="text-slate-400 text-xs font-black uppercase">Total Value At Risk</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{numberFormat(totals.totalPaymentDue)}</div>
        </div>

        <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl">
          <div className="text-slate-400 text-xs font-black uppercase">Total Recovered</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{numberFormat(totals.totalRecovered)}</div>
          <div className="text-sm text-slate-500 mt-1">{totals.totalPaymentDue > 0 ? `${Math.round((totals.totalRecovered / totals.totalPaymentDue) * 100)}% recovered` : '—'}</div>
        </div>

        <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl">
          <div className="text-slate-400 text-xs font-black uppercase">Successful Transactions</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{totals.closed}</div>
        </div>

        <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl">
          <div className="text-slate-400 text-xs font-black uppercase">Unsuccessful / Open</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{totals.open}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Top 3 Agencies + Leaderboard */}
        <div className="col-span-1 space-y-6">
          <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">Top 3 Agents</h3>
            <div className="space-y-3">
               {top3Agencies.map(a => (
                <div key={a?.dca_id || a?.id} className="flex justify-between items-center p-3 rounded-xl bg-[#0f1316] border border-slate-200 dark:border-surface-border">
                  <div>
                    <div className="text-slate-900 dark:text-white font-bold">{a?.name || 'Unknown Agent'}</div>
                    <div className="text-slate-500 text-xs">{a?.regions || 'Global'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-900 dark:text-white font-black">{numberFormat(a?.recovered_amount)}</div>
                    <div className="text-slate-400 text-xs">{(Number(a?.recovery_rate) || 0).toFixed(1)}% recovery</div>
                  </div>
                </div>
              ))}
              {top3Agencies.length === 0 && <div className="text-slate-500">No agent data</div>}
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl overflow-auto">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">Top Customers</h3>
            <table className="w-full text-sm table-auto">
              <thead>
                <tr className="text-slate-400 text-xs text-left">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Debt</th>
                  <th className="pb-2">Region</th>
                </tr>
              </thead>
              <tbody>
                 {totals.topCustomers.map(cu => (
                  <tr key={cu?.id} className="border-t border-slate-200 dark:border-surface-border">
                    <td className="py-3 text-slate-900 dark:text-white font-bold">{cu?.name || 'Unknown'}</td>
                    <td className="py-3 text-slate-300">{numberFormat(cu?.totalDebt)}</td>
                    <td className="py-3 text-slate-400">{cu?.region || 'Global'}</td>
                  </tr>
                ))}
                {totals.topCustomers.length === 0 && (
                  <tr><td colSpan={3} className="py-4 text-slate-500">No customers found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Middle Column - Monthly Recovered Trend */}
        <div className="col-span-1">
          <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl min-h-[420px]">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">Recovered - Last 12 Months</h3>
            <div className="h-[320px]">
              <ReactApexChart options={monthlyOptions} series={monthlySeries} type="area" height={320} />
            </div>
          </div>
        </div>

        {/* Right Column - Quick Metrics & Agency Distribution */}
        <div className="col-span-1 space-y-6">
          <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">Agents Distribution</h3>
            <div className="space-y-2">
               {safeAgencies.map(a => (
                <div key={a?.dca_id || a?.id} className="flex items-center justify-between text-sm text-slate-300 py-2">
                  <div className="w-2/3">
                    <div className="font-bold text-slate-900 dark:text-white">{a?.name || 'Unknown Agent'}</div>
                    <div className="text-xs text-slate-500">{a?.regions || 'Global'}</div>
                  </div>
                  <div className="text-right w-1/3">
                    <div className="text-slate-900 dark:text-white">{numberFormat(a?.recovered_amount)}</div>
                    <div className="text-slate-400 text-xs">{(Number(a?.recovery_rate) || 0).toFixed(0)}%</div>
                  </div>
                </div>
              ))}
              {agencies.length === 0 && <div className="text-slate-500">No agents available</div>}
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">Quick Actions</h3>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-primary rounded-lg text-white font-bold">Export CSV</button>
              <button className="px-4 py-2 border border-slate-200 dark:border-surface-border rounded-lg text-slate-900 dark:text-white">Refresh</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DcaAdminDashboard;
