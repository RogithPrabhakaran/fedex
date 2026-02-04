import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const emptySla = { name: '', target_hours: 48, description: '' };

const SlaRow = ({ sla, idx, onChange, onRemove }) => (
  <div className='flex gap-3 items-center mb-3'>
    <div className='w-1/12 text-slate-400'>{idx + 1}</div>
    <input
      className='w-3/12 p-2 rounded-md bg-[#0f1316] text-white'
      placeholder='SLA name'
      value={sla.name}
      onChange={(e) => onChange({ ...sla, name: e.target.value })}
    />
    <input
      type='number'
      className='w-2/12 p-2 rounded-md bg-[#0f1316] text-white'
      value={sla.target_hours}
      onChange={(e) => onChange({ ...sla, target_hours: Number(e.target.value) })}
    />
    <input
      className='flex-1 p-2 rounded-md bg-[#0f1316] text-white'
      placeholder='Description (optional)'
      value={sla.description}
      onChange={(e) => onChange({ ...sla, description: e.target.value })}
    />
    <button onClick={onRemove} className='px-3 py-2 bg-rose-600 rounded-md text-white'>Remove</button>
  </div>
);

const SlaManagementView = () => {
  const [loading, setLoading] = useState(true);
  const [slas, setSlas] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/settings/sla-definitions');
      setSlas(res.sla_definitions?.list || []);
    } catch (err) {
      console.error('Failed to load SLA definitions', err);
      setError('Failed to load SLA definitions');
    } finally { setLoading(false); }
  };

  const addRow = () => setSlas(s => [...s, { ...emptySla }]);
  const updateRow = (idx, value) => setSlas(s => s.map((r, i) => i === idx ? value : r));
  const removeRow = (idx) => setSlas(s => s.filter((_, i) => i !== idx));

  const handleSave = async () => {
    // Basic validation: all names present, target_hours positive
    for (let i = 0; i < slas.length; i++) {
      if (!slas[i].name || slas[i].name.trim() === '') {
        return setError('All SLA entries must have a name');
      }
      if (!Number.isFinite(slas[i].target_hours) || slas[i].target_hours <= 0) {
        return setError('Target hours must be a positive number');
      }
    }

    try {
      setSaving(true);
      setError(null);
      await api.put('/settings/sla-definitions', { sla_definitions: { list: slas } });
      setSuccess('SLA definitions saved');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Save SLA failed', err);
      setError('Failed to save SLA definitions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-black text-slate-900 dark:text-white'>SLA Management</h1>
          <p className='text-slate-400'>Configure Service Level Agreement definitions used across the platform.</p>
        </div>
        <div>
          <button onClick={load} className='px-4 py-2 bg-[#111418] rounded-md text-white border border-slate-200 dark:border-surface-border'>Refresh</button>
        </div>
      </div>

      {error && <div className='mb-4 bg-rose-600/10 border border-rose-600/30 text-rose-500 px-4 py-3 rounded'>{error}</div>}
      {success && <div className='mb-4 bg-green-600/10 border border-green-600/30 text-green-500 px-4 py-3 rounded'>{success}</div>}

      <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-surface-border'>
        <div className='flex gap-3 items-center mb-4'>
          <div className='w-3/12 text-slate-400 uppercase font-bold'>#</div>
          <div className='w-3/12 text-slate-400 uppercase font-bold'>Name</div>
          <div className='w-2/12 text-slate-400 uppercase font-bold'>Target (hrs)</div>
          <div className='flex-1 text-slate-400 uppercase font-bold'>Description</div>
          <div className='w-24'></div>
        </div>

        {loading ? (
          <div className='text-slate-400'>Loading...</div>
        ) : (
          <div>
            {slas.map((s, i) => (
              <SlaRow key={i} sla={s} idx={i} onChange={(v) => updateRow(i, v)} onRemove={() => removeRow(i)} />
            ))}

            {slas.length === 0 && <div className='text-slate-500'>No SLAs defined. Add a new one.</div>}

            <div className='mt-4 flex gap-3'>
              <button onClick={addRow} className='px-4 py-2 bg-primary rounded-md text-white'>Add SLA</button>
              <button onClick={handleSave} className='px-4 py-2 bg-green-600 rounded-md text-white' disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlaManagementView;
