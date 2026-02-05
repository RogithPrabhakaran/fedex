import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { userService } from '../services/userService';
import { Translate } from '../hooks/useTranslation.jsx';

const AdminSettingsView = ({ user }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const s = await api.get('/settings');
        setSettings(s);
      } catch (err) {
        console.error('Failed to load settings', err);
        setError('Failed to load settings');
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSaveSettings = async () => {
    try {
      await api.put('/settings', settings);
      alert('Settings saved');
    } catch (err) {
      console.error('Save settings failed', err);
      alert('Failed to save settings');
    }
  };

  const handleProfileSave = async (form) => {
    try {
      await userService.updateProfile(form);
      // update local storage & UI
      const stored = JSON.parse(localStorage.getItem('dca_user')) || {};
      localStorage.setItem('dca_user', JSON.stringify({ ...stored, ...form }));
      alert('Profile updated');
    } catch (err) {
      console.error('Update profile failed', err);
      alert('Failed to update profile');
    }
  };

  if (loading) return <div className='p-6'><Translate text="Loading settings..." /></div>;
  if (error) return <div className='p-6 text-red-400'>{error}</div>;

  return (
    <div className='p-6 max-w-4xl'>
      <h1 className='text-3xl font-black text-white mb-4'><Translate text="FedEx Admin Settings" /></h1>
      <p className='text-slate-400 mb-6'><Translate text="Configure application-wide settings, risk model thresholds, DCA & financial defaults, and notification rules." /></p>

      {/* Profile Management */}
      <div className='bg-surface-dark p-6 rounded-2xl border border-surface-border mb-6'>
        <h3 className='font-bold text-white mb-3'><Translate text="Profile Management" /></h3>
        <p className='text-slate-400 text-sm mb-4'><Translate text="Update Name, Avatar URL, and change password." /></p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='text-sm text-slate-400'>Full Name</label>
            <input value={user.name || ''} onChange={(e) => handleProfileSave({ name: e.target.value, avatar: user.avatar })} className='w-full mt-2 p-3 rounded-md bg-[#0f1316] text-white' />
          </div>

          <div>
            <label className='text-sm text-slate-400'>Avatar URL</label>
            <input value={user.avatar || ''} onChange={(e) => handleProfileSave({ avatar: e.target.value, name: user.name })} className='w-full mt-2 p-3 rounded-md bg-[#0f1316] text-white' />
          </div>

          <div className='md:col-span-2'>
            <button className='mt-2 px-4 py-2 bg-[#111418] rounded-md text-white border border-surface-border' onClick={async () => {
              const current = prompt('Enter current password');
              if (!current) return;
              const n = prompt('Enter new password (min 6 chars)');
              if (!n || n.length < 6) return alert('Password too short');
              try {
                await userService.changePassword(current, n);
                alert('Password changed');
              } catch (err) {
                console.error('Password change failed', err);
                alert('Failed to change password');
              }
            }}><Translate text="Change Password" /></button>
          </div>
        </div>
      </div>

      {/* General */}
      <div className='bg-surface-dark p-6 rounded-2xl border border-surface-border mb-6'>
        <h3 className='font-bold text-white mb-3'><Translate text="General Application" /></h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='text-sm text-slate-400'>Organization Name</label>
            <input value={settings.org_name || ''} onChange={(e) => setSettings({ ...settings, org_name: e.target.value })} className='w-full mt-2 p-3 rounded-md bg-[#0f1316] text-white' />
          </div>

          <div>
            <label className='text-sm text-slate-400'>Notification: Large debt threshold ($)</label>
            <input type='number' value={(settings.notification_rules?.large_debt_threshold || 50000)} onChange={(e) => setSettings({ ...settings, notification_rules: { ...(settings.notification_rules || {}), large_debt_threshold: Number(e.target.value) } })} className='w-full mt-2 p-3 rounded-md bg-[#0f1316] text-white' />
          </div>

          <div className='md:col-span-2'>
            <label className='text-sm text-slate-400'>Notification on DCA SLA breach</label>
            <div className='flex items-center gap-3 mt-2'>
              <input type='checkbox' checked={!!settings.notification_rules?.sla_breach} onChange={(e) => setSettings({ ...settings, notification_rules: { ...(settings.notification_rules || {}), sla_breach: e.target.checked } })} />
              <span className='text-slate-300'>Notify on SLA breach</span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Model */}
      <div className='bg-surface-dark p-6 rounded-2xl border border-surface-border mb-6'>
        <h3 className='font-bold text-white mb-3'>Risk Model Configuration</h3>
        <p className='text-slate-400 text-sm mb-4'>Adjust risk thresholds used by the model (non-coders can update these safely).</p>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label className='text-sm text-slate-400'>Low risk max (%)</label>
            <input type='number' value={Math.round((settings.risk_thresholds?.low_max || 0.3) * 100)} onChange={(e) => setSettings({ ...settings, risk_thresholds: { ...(settings.risk_thresholds || {}), low_max: Number(e.target.value) / 100 } })} className='w-full mt-2 p-3 rounded-md bg-[#0f1316] text-white' />
          </div>
          <div>
            <label className='text-sm text-slate-400'>Medium risk min (%)</label>
            <input type='number' value={Math.round((settings.risk_thresholds?.med_min || 0.31) * 100)} onChange={(e) => setSettings({ ...settings, risk_thresholds: { ...(settings.risk_thresholds || {}), med_min: Number(e.target.value) / 100 } })} className='w-full mt-2 p-3 rounded-md bg-[#0f1316] text-white' />
          </div>
          <div>
            <label className='text-sm text-slate-400'>Medium risk max (%)</label>
            <input type='number' value={Math.round((settings.risk_thresholds?.med_max || 0.7) * 100)} onChange={(e) => setSettings({ ...settings, risk_thresholds: { ...(settings.risk_thresholds || {}), med_max: Number(e.target.value) / 100 } })} className='w-full mt-2 p-3 rounded-md bg-[#0f1316] text-white' />
          </div>

          <div>
            <label className='text-sm text-slate-400'>High risk min (%)</label>
            <input type='number' value={Math.round((settings.risk_thresholds?.high_min || 0.71) * 100)} onChange={(e) => setSettings({ ...settings, risk_thresholds: { ...(settings.risk_thresholds || {}), high_min: Number(e.target.value) / 100 } })} className='w-full mt-2 p-3 rounded-md bg-[#0f1316] text-white' />
          </div>

          <div className='md:col-span-2'>
            <label className='text-sm text-slate-400'>Auto-action rules (simple description)</label>
            <textarea value={settings.auto_actions?.description || 'If Propensity > 90% → Auto-send "Gentle Reminder" Email\nIf Propensity < 20% → Auto-assign to "High Volume" DCA'} onChange={(e) => setSettings({ ...settings, auto_actions: { ...(settings.auto_actions || {}), description: e.target.value } })} className='w-full mt-2 p-3 rounded-md bg-[#0f1316] text-white min-h-[80px]' />
          </div>
        </div>
      </div>

      {/* DCA & Financial Rules */}
      <div className='bg-surface-dark p-6 rounded-2xl border border-surface-border mb-6'>
        <h3 className='font-bold text-white mb-3'>DCA & Financial Rules</h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='text-sm text-slate-400'>Global Commission Rate (%)</label>
            <input type='number' value={Number(settings.commission_rate || 15)} onChange={(e) => setSettings({ ...settings, commission_rate: Number(e.target.value) })} className='w-full mt-2 p-3 rounded-md bg-[#0f1316] text-white' />
          </div>

          <div>
            <label className='text-sm text-slate-400'>SLA - First contact hours</label>
            <input type='number' value={(settings.sla_definitions?.first_contact_hours || 48)} onChange={(e) => setSettings({ ...settings, sla_definitions: { ...(settings.sla_definitions || {}), first_contact_hours: Number(e.target.value) } })} className='w-full mt-2 p-3 rounded-md bg-[#0f1316] text-white' />
          </div>
        </div>
      </div>

      <div className='flex justify-end gap-3'>
        <button onClick={handleSaveSettings} className='px-6 py-3 bg-primary rounded-lg text-white font-bold'>Save All</button>
        <button className='px-6 py-3 border border-surface-border rounded-lg text-white'>Cancel</button>
      </div>
    </div>
  );
};

export default AdminSettingsView;
