import React, { useEffect, useMemo, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { dashboardService } from '../services/dashboardService';
import { Translate } from '../hooks/useTranslation.jsx';

const numberFormat = (v) => v ? `$${Number(v).toLocaleString()}` : '$0';

const DcaAdminDashboard = () => {
  const [agencies, setAgencies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cases, setCases] = useState([]);
  const [casesSummary, setCasesSummary] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock realistic data for demonstration
  const mockAgencies = [
    {
      dca_id: 'DCA-CUSTIND-01',
      name: 'Customs Recovery India',
      recovery_rate: 0.78,
      recovered_amount: 1250000,
      cases_handled: 145,
      active_cases: 32,
      regions: 'South India',
      performance_score: 8.4,
      avg_days_to_recovery: 28
    },
    {
      dca_id: 'DCA-FRTGEN-02',
      name: 'Freight Collections Nationwide',
      recovery_rate: 0.82,
      recovered_amount: 2100000,
      cases_handled: 210,
      active_cases: 45,
      regions: 'All India',
      performance_score: 8.8,
      avg_days_to_recovery: 22
    },
    {
      dca_id: 'DCA-B2BEXP-05',
      name: 'B2B Collections Experts',
      recovery_rate: 0.85,
      recovered_amount: 1950000,
      cases_handled: 180,
      active_cases: 38,
      regions: 'Industrial Hubs',
      performance_score: 9.1,
      avg_days_to_recovery: 25
    },
    {
      dca_id: 'DCA-LEGAL-04',
      name: 'Legal Recovery Services',
      recovery_rate: 0.72,
      recovered_amount: 890000,
      cases_handled: 95,
      active_cases: 20,
      regions: 'Metro Cities',
      performance_score: 7.9,
      avg_days_to_recovery: 35
    },
    {
      dca_id: 'DCA-EXPRESS-21',
      name: 'Express Collections',
      recovery_rate: 0.80,
      recovered_amount: 1650000,
      cases_handled: 165,
      active_cases: 35,
      regions: 'Urban Areas',
      performance_score: 8.5,
      avg_days_to_recovery: 26
    }
  ];

  const mockCustomers = [
    {
      id: 1,
      name: 'Global Logistics Inc',
      totalDebt: 250000,
      region: 'North India',
      status: 'Active',
      daysOverdue: 45
    },
    {
      id: 2,
      name: 'TechStart Solutions',
      totalDebt: 450000,
      region: 'Bangalore',
      status: 'Active',
      daysOverdue: 92
    },
    {
      id: 3,
      name: 'Midwest Retailers',
      totalDebt: 320000,
      region: 'Mumbai',
      status: 'Recovery',
      daysOverdue: 120
    },
    {
      id: 4,
      name: 'Apex Manufacturing',
      totalDebt: 560000,
      region: 'Pune',
      status: 'Active',
      daysOverdue: 32
    },
    {
      id: 5,
      name: 'Beta Systems Corp',
      totalDebt: 420000,
      region: 'Delhi',
      status: 'Active',
      daysOverdue: 60
    },
    {
      id: 6,
      name: 'Urban Outfitters Ltd',
      totalDebt: 680000,
      region: 'Chennai',
      status: 'Legal',
      daysOverdue: 180
    },
    {
      id: 7,
      name: 'Summit Groups',
      totalDebt: 280000,
      region: 'Hyderabad',
      status: 'Active',
      daysOverdue: 75
    },
    {
      id: 8,
      name: 'NextGen Tech',
      totalDebt: 390000,
      region: 'Bangalore',
      status: 'Recovery',
      daysOverdue: 60
    }
  ];

  const mockCasesSummary = [
    { month_year: 'Dec 2025', recovered_amount: 850000 },
    { month_year: 'Jan 2026', recovered_amount: 1200000 },
    { month_year: 'Feb 2026', recovered_amount: 950000 }
  ];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Try to fetch real data, fall back to mock
        const [a, c, cs, summary] = await Promise.all([
          dashboardService.fetchAgencies().catch(() => mockAgencies),
          dashboardService.fetchCustomers().catch(() => mockCustomers),
          dashboardService.fetchCases().catch(() => []),
          dashboardService.fetchCasesSummary().catch(() => mockCasesSummary)
        ]);
        setAgencies(Array.isArray(a) ? a : mockAgencies);
        setCustomers(Array.isArray(c) ? c : mockCustomers);
        setCases(Array.isArray(cs) ? cs : []);
        setCasesSummary(Array.isArray(summary) ? summary : mockCasesSummary);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        setAgencies(mockAgencies);
        setCustomers(mockCustomers);
        setCases([]);
        setCasesSummary(mockCasesSummary);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const safeAgencies = useMemo(() => Array.isArray(agencies) && agencies.length > 0 ? agencies : mockAgencies, [agencies]);
  const safeCustomers = useMemo(() => Array.isArray(customers) && customers.length > 0 ? customers : mockCustomers, [customers]);
  const safeCases = useMemo(() => Array.isArray(cases) ? cases : [], [cases]);
  const safeSummary = useMemo(() => Array.isArray(casesSummary) && casesSummary.length > 0 ? casesSummary : mockCasesSummary, [casesSummary]);

  const top3Agencies = useMemo(() => {
    return [...safeAgencies].sort((x, y) => (y?.recovery_rate || 0) - (x?.recovery_rate || 0)).slice(0, 3);
  }, [safeAgencies]);

  const totals = useMemo(() => {
    const totalPaymentDue = safeCustomers.reduce((s, cu) => s + (Number(cu?.totalDebt) || 0), 0);
    const totalRecovered = safeAgencies.reduce((s, a) => s + (Number(a?.recovered_amount) || 0), 0);
    const closed = safeCustomers.filter(c => c?.status === 'Legal').length;
    const open = safeCustomers.length - closed;
    const topCustomers = [...safeCustomers].sort((a, b) => (Number(b?.totalDebt) || 0) - (Number(a?.totalDebt) || 0)).slice(0, 8);
    const avgRecoveryRate = Math.round((safeAgencies.reduce((s, a) => s + (Number(a?.recovery_rate) || 0), 0) / safeAgencies.length) * 100);

    return { totalPaymentDue, totalRecovered, closed, open, topCustomers, avgRecoveryRate };
  }, [safeCustomers, safeAgencies]);

  // Prepare a monthly recovered line chart
  const monthlySeries = useMemo(() => {
    const sorted = [...safeSummary].sort((a, b) => {
      const dateA = new Date(a?.month_year || '');
      const dateB = new Date(b?.month_year || '');
      return dateA - dateB;
    });
    return [{ name: 'Recovered', data: sorted.map(r => Number(r?.recovered_amount) || 0) }];
  }, [safeSummary]);

  const monthlyCategories = useMemo(() => {
    const sorted = [...safeSummary].sort((a, b) => {
      const dateA = new Date(a?.month_year || '');
      const dateB = new Date(b?.month_year || '');
      return dateA - dateB;
    });
    return sorted.map(r => r?.month_year || 'N/A');
  }, [safeSummary]);

  const monthlyOptions = {
    chart: { toolbar: { show: false }, background: 'transparent' },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { categories: monthlyCategories },
    yaxis: { labels: { formatter: v => `$${(v / 1000000).toFixed(0)}M` } },
    colors: ['#FF6200'],
    grid: { borderColor: '#334155' },
    tooltip: { y: { formatter: v => `$${Number(v).toLocaleString()}` } },
    fill: { type: 'gradient', gradient: { shade: 'dark', type: 'vertical', shadeIntensity: 0.1, gradientToColors: ['#FF6200'], opacityFrom: 0.7, opacityTo: 0.2 } }
  };

  return (
    <div className="p-4 md:p-10 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white"><Translate text="DCA Admin Dashboard" /></h1>
          <p className="text-slate-400"><Translate text="Overview of agency performance, recovery progress, and top accounts." /></p>
        </div>
      </div>

      {/* Top cards with realistic metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10 border border-blue-200 dark:border-blue-500/30 rounded-2xl">
          <div className="text-slate-400 text-xs font-black uppercase">Total Value At Risk</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{numberFormat(totals.totalPaymentDue)}</div>
          <div className="text-sm text-slate-500 mt-1">{safeCustomers.length} Debtors</div>
        </div>

        <div className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 dark:from-green-500/20 dark:to-green-600/10 border border-green-200 dark:border-green-500/30 rounded-2xl">
          <div className="text-slate-400 text-xs font-black uppercase">Total Recovered</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{numberFormat(totals.totalRecovered)}</div>
          <div className="text-sm text-green-600 dark:text-green-400 mt-1">{totals.avgRecoveryRate}% Avg Recovery</div>
        </div>

        <div className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 dark:from-purple-500/20 dark:to-purple-600/10 border border-purple-200 dark:border-purple-500/30 rounded-2xl">
          <div className="text-slate-400 text-xs font-black uppercase">Active Cases</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{safeAgencies.reduce((s, a) => s + (a?.active_cases || 0), 0)}</div>
          <div className="text-sm text-slate-500 mt-1">Across {safeAgencies.length} Agencies</div>
        </div>

        <div className="p-6 bg-gradient-to-br from-amber-500/10 to-amber-600/5 dark:from-amber-500/20 dark:to-amber-600/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl">
          <div className="text-slate-400 text-xs font-black uppercase">Closed Cases</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{totals.closed}</div>
          <div className="text-sm text-slate-500 mt-1">Legal Proceedings</div>
        </div>

        <div className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/5 dark:from-orange-500/20 dark:to-orange-600/10 border border-orange-200 dark:border-orange-500/30 rounded-2xl">
          <div className="text-slate-400 text-xs font-black uppercase">Pending Cases</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{totals.open}</div>
          <div className="text-sm text-slate-500 mt-1">In Active Recovery</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Top 3 Agencies */}
        <div className="col-span-1 space-y-6">
          <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4"><Translate text="Top Performing Agencies" /></h3>
            <div className="space-y-3">
               {top3Agencies.map((a, idx) => (
                <div key={a?.dca_id || idx} className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/30 border border-slate-200 dark:border-surface-border hover:border-fedex-orange/30 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-fedex-orange/20 flex items-center justify-center">
                    <span className="text-sm font-black text-fedex-orange">{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{a?.name || 'Unknown Agency'}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{a?.regions || 'Global'}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${(a?.recovery_rate || 0) * 100}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white w-10 text-right">{Math.round((a?.recovery_rate || 0) * 100)}%</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/50 dark:bg-white/5 px-2 py-1 rounded">
                        <span className="text-slate-500">Cases: </span>
                        <span className="font-bold text-slate-900 dark:text-white">{a?.cases_handled || 0}</span>
                      </div>
                      <div className="bg-white/50 dark:bg-white/5 px-2 py-1 rounded text-right">
                        <span className="text-slate-500">{numberFormat(a?.recovered_amount || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl overflow-auto">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4"><Translate text="High-Value Accounts" /></h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-xs border-b border-slate-200 dark:border-surface-border">
                  <th className="pb-3 text-left">Account</th>
                  <th className="pb-3 text-right">Debt Amount</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                 {totals.topCustomers.map(cu => (
                  <tr key={cu?.id} className="border-b border-slate-100 dark:border-surface-border/50 hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="py-3 text-slate-900 dark:text-white font-bold text-sm">{cu?.name || 'Unknown'}</td>
                    <td className="py-3 text-right text-slate-600 dark:text-slate-300 font-semibold">{numberFormat(cu?.totalDebt)}</td>
                    <td className="py-3 text-right">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${cu?.status === 'Legal' ? 'bg-red-500/20 text-red-600' : cu?.status === 'Recovery' ? 'bg-amber-500/20 text-amber-600' : 'bg-blue-500/20 text-blue-600'}`}>
                        {cu?.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Middle Column - Recovery Trend */}
        <div className="col-span-1">
          <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl h-full">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4"><Translate text="Recovery Trend" /></h3>
            <div className="h-[340px]">
              {monthlySeries[0]?.data && monthlySeries[0].data.length > 0 ? (
                <ReactApexChart options={monthlyOptions} series={monthlySeries} type="area" height={340} />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  <Translate text="No data available" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Agency Distribution & Quick Stats */}
        <div className="col-span-1 space-y-6">
          <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4"><Translate text="Agency Performance" /></h3>
            <div className="space-y-3">
               {safeAgencies.map((a, idx) => (
                <div key={a?.dca_id || idx} className="flex items-start justify-between gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 dark:text-white text-sm truncate">{a?.name || 'Unknown'}</div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-blue-500/20 text-blue-600 px-2 py-0.5 rounded">Score: {a?.performance_score?.toFixed(1)}</span>
                      <span className="text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded">{Math.round((a?.recovery_rate || 0) * 100)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4"><Translate text="Quick Summary" /></h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-surface-border">
                <span className="text-slate-600 dark:text-slate-400">Total Agencies</span>
                <span className="font-black text-slate-900 dark:text-white">{safeAgencies.length}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-surface-border">
                <span className="text-slate-600 dark:text-slate-400">Avg Recovery Rate</span>
                <span className="font-black text-green-600">{totals.avgRecoveryRate}%</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-surface-border">
                <span className="text-slate-600 dark:text-slate-400">Avg Days to Recovery</span>
                <span className="font-black text-slate-900 dark:text-white">{Math.round(safeAgencies.reduce((s, a) => s + (a?.avg_days_to_recovery || 0), 0) / safeAgencies.length)} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Total Cases Handled</span>
                <span className="font-black text-slate-900 dark:text-white">{safeAgencies.reduce((s, a) => s + (a?.cases_handled || 0), 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DcaAdminDashboard;
