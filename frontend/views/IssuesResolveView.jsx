import React, { useEffect, useMemo, useState } from 'react';
import { issuesService } from '../services/issuesService';

const IssueRow = ({ issue, onResolve, onView, onAssign }) => (
  <tr className='border-t border-slate-200 dark:border-surface-border'>
    <td className='py-3'>{issue.id}</td>
    <td className='py-3 text-slate-900 dark:text-white font-bold'>{issue.title}</td>
    <td className='py-3 text-slate-300'>{issue.priority}</td>
    <td className='py-3 text-slate-300'>{issue.status}</td>
    <td className='py-3 text-slate-300'>{issue.reported_by || issue.reported_email}</td>
    <td className='py-3 text-slate-300'>{new Date(issue.created_at).toLocaleString()}</td>
    <td className='py-3'>
      <div className='flex gap-2'>
        {issue.status !== 'RESOLVED' && <button onClick={() => onResolve(issue)} className='px-3 py-1 bg-primary rounded-md text-white'>Resolve</button>}
        <button onClick={() => onView(issue)} className='px-3 py-1 bg-[#111418] rounded-md text-white border border-slate-200 dark:border-surface-border'>View</button>
      </div>
    </td>
  </tr>
);

const IssuesResolveView = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const list = await issuesService.list();
      setIssues(list || []);
    } catch (err) {
      console.error('Failed to load issues', err);
    } finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    return issues.filter(i => {
      if (filterStatus !== 'ALL' && i.status !== filterStatus) return false;
      if (priorityFilter !== 'ALL' && i.priority !== priorityFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!(i.title || '').toLowerCase().includes(s) && !(i.description || '').toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [issues, filterStatus, priorityFilter, search]);

  // Computed stats for dashboard cards
  const stats = useMemo(() => {
    const total = issues.length;
    const open = issues.filter(i => i.status === 'OPEN').length;
    const inProgress = issues.filter(i => i.status === 'IN_PROGRESS').length;
    const resolved = issues.filter(i => i.status === 'RESOLVED').length;
    const highCount = issues.filter(i => i.priority === 'HIGH').length;

    const resolvedWithDates = issues.filter(i => i.status === 'RESOLVED' && i.created_at && i.updated_at);
    const avgDays = resolvedWithDates.length === 0 ? '—' : (resolvedWithDates.reduce((s, it) => s + ((new Date(it.updated_at) - new Date(it.created_at)) / (1000*60*60*24)), 0) / resolvedWithDates.length).toFixed(1);

    const openPct = total ? Math.round((open / total) * 100) : 0;
    const inPct = total ? Math.round((inProgress / total) * 100) : 0;
    const resPct = total ? Math.round((resolved / total) * 100) : 0;

    return { total, open, inProgress, resolved, highCount, avgDays, openPct, inPct, resPct };
  }, [issues]);

  const handleResolve = async (issue) => {
    const note = prompt('Resolution notes (optional)');
    try {
      await issuesService.update(issue.id, { status: 'RESOLVED', resolution_notes: note });
      load();
      alert('Issue marked resolved');
    } catch (err) {
      console.error('Resolve failed', err);
      alert('Failed to resolve issue');
    }
  };

  const handleView = (issue) => setSelected(issue);

  const handleDelete = async (id) => {
    if (!confirm('Delete this issue?')) return;
    try {
      await issuesService.remove(id);
      load();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete');
    }
  };

  return (
    <div className='p-6 max-w-6xl mx-auto'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-black text-slate-900 dark:text-white'>Issues & Complaints</h1>
          <p className='text-slate-400'>Resolve and manage complaints lodged by agents or customers.</p>
        </div>
        <div>
          <button onClick={load} className='px-4 py-2 bg-[#111418] text-white rounded-md border border-slate-200 dark:border-surface-border'>Refresh</button>
        </div>
      </div>

      {/* Top stat cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <div className='p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl'>
          <div className='text-slate-400 text-xs uppercase font-bold'>Open / In-progress</div>
          <div className='text-2xl font-black text-slate-900 dark:text-white mt-2'>{stats.open + stats.inProgress}/{stats.total}</div>
          <div className='text-slate-500 text-sm mt-1'>{stats.highCount} high priority</div>
        </div>

        <div className='p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl'>
          <div className='text-slate-400 text-xs uppercase font-bold'>Avg Resolution (days)</div>
          <div className='text-2xl font-black text-slate-900 dark:text-white mt-2'>{stats.avgDays}</div>
          <div className='text-slate-500 text-sm mt-1'>Based on resolved issues</div>
        </div>

        <div className='p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl'>
          <div className='text-slate-400 text-xs uppercase font-bold'>Status Distribution</div>
          <div className='mt-2 space-y-3'>
            <div className='text-slate-300 text-xs'>Open
              <div className='bg-[#0f1416] h-3 rounded mt-1 overflow-hidden'>
                <div style={{ width: `${stats.openPct}%` }} className='bg-primary h-3 rounded'></div>
              </div>
            </div>
            <div className='text-slate-300 text-xs'>In Progress
              <div className='bg-[#0f1416] h-3 rounded mt-1 overflow-hidden'>
                <div style={{ width: `${stats.inPct}%` }} className='bg-amber-500 h-3 rounded'></div>
              </div>
            </div>
            <div className='text-slate-300 text-xs'>Resolved
              <div className='bg-[#0f1416] h-3 rounded mt-1 overflow-hidden'>
                <div style={{ width: `${stats.resPct}%` }} className='bg-green-500 h-3 rounded'></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-200 dark:border-surface-border mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <input placeholder='Search title or description' value={search} onChange={(e) => setSearch(e.target.value)} className='p-2 rounded-md bg-[#0f1316] text-white px-4' />

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className='p-2 rounded-md bg-[#0f1316] text-white'>
            <option value='ALL'>All Statuses</option>
            <option value='OPEN'>Open</option>
            <option value='IN_PROGRESS'>In Progress</option>
            <option value='RESOLVED'>Resolved</option>
            <option value='CLOSED'>Closed</option>
          </select>

          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className='p-2 rounded-md bg-[#0f1316] text-white'>
            <option value='ALL'>All Priorities</option>
            <option value='LOW'>Low</option>
            <option value='MEDIUM'>Medium</option>
            <option value='HIGH'>High</option>
          </select>
        </div>

      </div>

      <div className='bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-200 dark:border-surface-border overflow-auto'>
        <table className='w-full text-sm'>
          <thead className='text-slate-400 text-xs text-left'>
            <tr>
              <th className='py-2'>ID</th>
              <th className='py-2'>Title</th>
              <th className='py-2'>Priority</th>
              <th className='py-2'>Status</th>
              <th className='py-2'>Reported By</th>
              <th className='py-2'>Created</th>
              <th className='py-2'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className='py-6 text-center text-slate-400'>Loading...</td></tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} className='py-6 text-center text-slate-500'>No issues found</td></tr>
            )}

            {!loading && filtered.map(i => (
              <IssueRow key={i.id} issue={i} onResolve={handleResolve} onView={handleView} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Drawer / Modal for viewing/creating */}
      {selected !== null && (
        <IssueModal
          issue={selected}
          onClose={() => { setSelected(null); load(); }}
        />
      )}
    </div>
  );
};

const IssueModal = ({ issue, onClose }) => {
  const isNew = !issue || !issue.id;
  const [form, setForm] = useState({ ...(issue || { title: '', description: '', priority: 'MEDIUM', reported_by: '', reported_email: '' }) });

  useEffect(() => setForm({ ...(issue || { title: '', description: '', priority: 'MEDIUM', reported_by: '', reported_email: '' }) }), [issue]);

  const handleSave = async () => {
    try {
      if (isNew) await issuesService.create(form);
      else await issuesService.update(issue.id, form);
      alert('Saved');
      onClose();
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save');
    }
  };

  const handleDelete = async () => {
    if (!issue.id) return onClose();
    if (!confirm('Delete this issue?')) return;
    try {
      await issuesService.remove(issue.id);
      onClose();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete');
    }
  };

  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50'>
      <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl w-full max-w-2xl border border-slate-200 dark:border-surface-border'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-xl font-bold text-slate-900 dark:text-white'>{isNew ? 'Create Issue' : `Issue #${issue.id}`}</h3>
          <div className='flex gap-2'>
            {!isNew && <button onClick={handleDelete} className='px-3 py-1 bg-rose-600 text-white rounded-md'>Delete</button>}
            <button onClick={onClose} className='px-3 py-1 bg-[#111418] rounded-md text-white'>Close</button>
          </div>
        </div>

        <div className='space-y-4'>
          <div>
            <label className='text-sm text-slate-400'>Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className='w-full mt-2 p-3 rounded-md bg-[#0f1316] text-white' />
          </div>

          <div>
            <label className='text-sm text-slate-400'>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className='w-full mt-2 p-3 rounded-md bg-[#0f1316] text-white min-h-[120px]' />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-sm text-slate-400'>Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className='w-full mt-2 p-3 rounded-md bg-[#0f1316] text-white'>
                <option value='LOW'>Low</option>
                <option value='MEDIUM'>Medium</option>
                <option value='HIGH'>High</option>
              </select>
            </div>

            <div>
              <label className='text-sm text-slate-400'>Reported By (name)</label>
              <input value={form.reported_by} onChange={(e) => setForm({ ...form, reported_by: e.target.value })} className='w-full mt-2 p-3 rounded-md bg-[#0f1316] text-white' />
            </div>
          </div>

          <div className='flex justify-end gap-3'>
            <button onClick={handleSave} className='px-6 py-2 bg-primary text-white rounded-md'>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssuesResolveView;
