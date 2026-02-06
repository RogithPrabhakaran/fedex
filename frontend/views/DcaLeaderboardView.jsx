import React, { useEffect, useMemo, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import { Translate } from '../hooks/useTranslation.jsx';

const numberFormat = (v) => (v ? `$${Number(v).toLocaleString()}` : '$0');

const StatCard = ({ title, value, subtitle }) => (
  <div className='p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl'>
    <div className='text-slate-400 text-xs font-black uppercase'>{title}</div>
    <div className='text-2xl font-black text-slate-900 dark:text-white mt-2'>{value}</div>
    {subtitle && <div className='text-sm text-slate-500 mt-1'>{subtitle}</div>}
  </div>
);

const DcaLeaderboardView = () => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('recovery_rate');
  const [sortDir, setSortDir] = useState('desc');

  // Mock realistic agency data
  const mockAgencies = [
    {
      dca_id: 'DCA-CUSTIND-01',
      name: 'Customs Recovery India',
      agency_name: 'Customs Recovery Specialists India Pvt Ltd',
      regions: 'South India, North India',
      recovery_rate: 0.78,
      recovered_amount: 1250000,
      total_cases_handled: 145,
      avg_days_to_recovery: 28,
      status: 'ACTIVE',
      performance_score: 8.4
    },
    {
      dca_id: 'DCA-FRTGEN-02',
      name: 'Freight Collections Nationwide',
      agency_name: 'Freight Collections Nationwide',
      regions: 'All India',
      recovery_rate: 0.82,
      recovered_amount: 2100000,
      total_cases_handled: 210,
      avg_days_to_recovery: 22,
      status: 'ACTIVE',
      performance_score: 8.8
    },
    {
      dca_id: 'DCA-B2BEXP-05',
      name: 'B2B Collections Experts',
      agency_name: 'B2B Collections Experts',
      regions: 'Industrial Hubs',
      recovery_rate: 0.85,
      recovered_amount: 1950000,
      total_cases_handled: 180,
      avg_days_to_recovery: 25,
      status: 'ACTIVE',
      performance_score: 9.1
    },
    {
      dca_id: 'DCA-LEGAL-04',
      name: 'Legal Recovery Services',
      agency_name: 'Legal Recovery Services',
      regions: 'Metro Cities',
      recovery_rate: 0.72,
      recovered_amount: 890000,
      total_cases_handled: 95,
      avg_days_to_recovery: 35,
      status: 'ACTIVE',
      performance_score: 7.9
    },
    {
      dca_id: 'DCA-EXPRESS-21',
      name: 'Express Collections',
      agency_name: 'Express Collections',
      regions: 'Urban Areas',
      recovery_rate: 0.80,
      recovered_amount: 1650000,
      total_cases_handled: 165,
      avg_days_to_recovery: 26,
      status: 'ACTIVE',
      performance_score: 8.5
    },
    {
      dca_id: 'DCA-TECH-08',
      name: 'Tech-Enabled Recovery',
      agency_name: 'Tech-Enabled Recovery Solutions',
      regions: 'Tier 1 & 2 Cities',
      recovery_rate: 0.88,
      recovered_amount: 2300000,
      total_cases_handled: 240,
      avg_days_to_recovery: 20,
      status: 'ACTIVE',
      performance_score: 9.3
    },
    {
      dca_id: 'DCA-RETAIL-12',
      name: 'Retail Debt Specialists',
      agency_name: 'Retail Debt Specialists',
      regions: 'Shopping Districts',
      recovery_rate: 0.75,
      recovered_amount: 920000,
      total_cases_handled: 120,
      avg_days_to_recovery: 32,
      status: 'WARNING',
      performance_score: 7.5
    }
  ];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const a = await dashboardService.fetchAgencies();
        setAgencies((Array.isArray(a) && a.length > 0) ? a : mockAgencies);
      } catch (err) {
        console.error('Failed to load agencies', err);
        setAgencies(mockAgencies);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = [...agencies];
    if (filterText) {
      const t = filterText.toLowerCase();
      list = list.filter(a => (a.agency_name || a.name || '').toLowerCase().includes(t) || (a.regions || '').toLowerCase().includes(t));
    }
    if (statusFilter !== 'ALL') {
      list = list.filter(a => (a.status || 'ACTIVE') === statusFilter);
    }

    list.sort((x, y) => {
      const a = x[sortBy] == null ? 0 : Number(x[sortBy]);
      const b = y[sortBy] == null ? 0 : Number(y[sortBy]);
      if (sortDir === 'asc') return a - b;
      return b - a;
    });

    return list;
  }, [agencies, filterText, statusFilter, sortBy, sortDir]);

  const topPerforming = filtered.slice(0, 3);

  return (
    <div className='p-6 max-w-6xl mx-auto'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-black text-slate-900 dark:text-white'><Translate text="DCA Leaderboard" /></h1>
          <p className='text-slate-400'><Translate text="Ranking of DCA partners and quick stats for actions this month." /></p>
        </div>
      </div>

      {/* Stat cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <StatCard title='Top Performing DCA (This Month)' value={topPerforming[0] ? `${topPerforming[0].name || topPerforming[0].agency_name}` : '—'} subtitle={topPerforming[0] ? `${numberFormat(topPerforming[0].recovered_amount || topPerforming[0].recovered_amount)} • ${(topPerforming[0].recovery_rate || 0).toFixed(1)}%` : ''} />
        <StatCard title='Total Recovered (All DCAs)' value={numberFormat(agencies.reduce((s, a) => s + (Number(a.recovered_amount) || 0), 0))} subtitle={`${agencies.length} agencies`} />
        <StatCard title='Average Recovery Days' value={agencies.length ? `${Math.round(agencies.reduce((s, a) => s + (Number(a.avg_days_to_recovery) || 0), 0) / agencies.length)} days` : '—'} />
      </div>

      {/* Filters & Sorting */}
      <div className='bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-200 dark:border-surface-border mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <input placeholder='Search agencies or regions' value={filterText} onChange={(e) => setFilterText(e.target.value)} className='p-2 rounded-md bg-[#0f1316] text-white px-4' />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className='p-2 rounded-md bg-[#0f1316] text-white'>
            <option value='ALL'>All Statuses</option>
            <option value='ACTIVE'>Active</option>
            <option value='WARNING'>Warning</option>
            <option value='SUSPENDED'>Offline</option>
          </select>
        </div>

        <div className='flex items-center gap-3'>
          <label className='text-slate-400 text-sm'>Sort by</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className='p-2 rounded-md bg-[#0f1316] text-white'>
            <option value='recovery_rate'>Recovery Rate</option>
            <option value='recovered_amount'>Recovered Amount</option>
            <option value='total_cases_handled'>Cases Handled</option>
            <option value='avg_days_to_recovery'>Avg Recovery Days</option>
          </select>

          <select value={sortDir} onChange={(e) => setSortDir(e.target.value)} className='p-2 rounded-md bg-[#0f1316] text-white'>
            <option value='desc'>Desc</option>
            <option value='asc'>Asc</option>
          </select>
        </div>
      </div>

      {/* Leaderboard table */}
      <div className='bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-200 dark:border-surface-border overflow-auto'>
        <table className='w-full text-sm'>
          <thead className='text-slate-400 text-xs text-left'>
            <tr>
              <th className='py-2'><Translate text="#" /></th>
              <th className='py-2'><Translate text="Name" /></th>
              <th className='py-2'><Translate text="Region" /></th>
              <th className='py-2'><Translate text="Recovery Rate" /></th>
              <th className='py-2'><Translate text="Recovered" /></th>
              <th className='py-2'><Translate text="Cases" /></th>
              <th className='py-2'><Translate text="Avg Days" /></th>
              <th className='py-2'><Translate text="Status" /></th>
              <th className='py-2'><Translate text="Commission %" /></th>
              <th className='py-2'><Translate text="Actions" /></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={10} className='py-6 text-center text-slate-400'><Translate text="Loading..." /></td></tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr><td colSpan={10} className='py-6 text-center text-slate-500'><Translate text="No agencies found" /></td></tr>
            )}

            {!loading && filtered.map((a, idx) => (
              <tr key={a.dca_id || a.id || idx} className='border-t border-slate-200 dark:border-surface-border'>
                <td className='py-3'>{idx + 1}</td>
                <td className='py-3 text-slate-900 dark:text-white font-bold'>{a.name || a.agency_name}</td>
                <td className='py-3 text-slate-400'>{a.regions || 'Global'}</td>
                <td className='py-3 text-slate-900 dark:text-white'>{(a.recovery_rate || 0).toFixed(1)}%</td>
                <td className='py-3 text-slate-300'>{numberFormat(a.recovered_amount || a.recovered_amount)}</td>
                <td className='py-3 text-slate-300'>{a.total_cases_handled || a.cases_handled || '—'}</td>
                <td className='py-3 text-slate-300'>{a.avg_days_to_recovery || a.avg_days_to_recovery || '—'}</td>
                <td className='py-3'><span className={`px-3 py-1 rounded-full text-xs font-bold ${a.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500' : (a.status === 'WARNING' ? 'bg-amber-500/20 text-amber-500' : 'bg-rose-500/20 text-rose-500')}`}>{a.status}</span></td>
                <td className='py-3 text-slate-300'>{a.commission_rate != null ? `${a.commission_rate}%` : '—'}</td>
                <td className='py-3'><button onClick={() => alert('Open agency details for ' + (a.name || a.agency_name))} className='px-3 py-1 bg-[#111418] rounded-md text-white border border-slate-200 dark:border-surface-border'>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DcaLeaderboardView;
