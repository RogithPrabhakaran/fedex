import React, { useEffect, useMemo, useState } from 'react';
import { dashboardService } from '../services/dashboardService';

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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const a = await dashboardService.fetchAgencies();
        setAgencies(a || []);
      } catch (err) {
        console.error('Failed to load agencies', err);
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
          <h1 className='text-3xl font-black text-slate-900 dark:text-white'>DCA Leaderboard</h1>
          <p className='text-slate-400'>Ranking of DCA partners and quick stats for actions this month.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <StatCard title='Top Performing DCA (This Month)' value={topPerforming[0] ? `${topPerforming[0].name || topPerforming[0].agency_name}` : '—'} subtitle={topPerforming[0] ? `${numberFormat(topPerforming[0].recovered_amount || topPerforming[0].recovered_amount) } • ${(topPerforming[0].recovery_rate || 0).toFixed(1)}%` : ''} />
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
              <th className='py-2'>#</th>
              <th className='py-2'>Name</th>
              <th className='py-2'>Region</th>
              <th className='py-2'>Recovery Rate</th>
              <th className='py-2'>Recovered</th>
              <th className='py-2'>Cases</th>
              <th className='py-2'>Avg Days</th>
              <th className='py-2'>Status</th>
              <th className='py-2'>Commission %</th>
              <th className='py-2'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={10} className='py-6 text-center text-slate-400'>Loading...</td></tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr><td colSpan={10} className='py-6 text-center text-slate-500'>No agencies found</td></tr>
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
