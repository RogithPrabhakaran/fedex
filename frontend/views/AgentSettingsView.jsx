import React, { useEffect, useState } from 'react';
import { dcaService } from '../services/dcaService';

const AgentSettingsView = ({ user }) => {
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteResult, setInviteResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.agencyId) return setLoading(false);
      try {
        setLoading(true);
        const a = await dcaService.getAgency(user.agencyId);
        setAgency(a);
        const ag = await dcaService.listAgents(user.agencyId);
        setAgents(ag);
      } catch (err) {
        console.error('Failed to load agency data', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await dcaService.updateAgency(agency.dca_id, agency);
      alert('Agency settings saved');
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save agency settings');
    }
  };

  const handleRegenerateKey = async () => {
    if (!agency) return;
    try {
      const res = await dcaService.regenerateKey(agency.dca_id);
      setAgency({ ...agency, api_auth_token: res.api_auth_token });
      alert('API key regenerated');
    } catch (err) {
      console.error('Regenerate key failed', err);
      alert('Failed to regenerate API key');
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return alert('Name and email required');
    try {
      const res = await dcaService.inviteAgent(agency.dca_id, { name: inviteName, email: inviteEmail });
      setInviteResult(res);
      setAgents((s) => [...s, { id: res.id, email: res.email, name: inviteName }]);
      setInviteName('');
      setInviteEmail('');
      alert('Invitation sent (mock)');
    } catch (err) {
      console.error('Invite failed', err);
      alert('Failed to invite agent');
    }
  };

  const handleRemoveAgent = async (id) => {
    if (!confirm('Remove this agent?')) return;
    try {
      await dcaService.removeAgent(agency.dca_id, id);
      setAgents((s) => s.filter(a => a.id !== id));
      alert('Agent removed');
    } catch (err) {
      console.error('Remove failed', err);
      alert('Failed to remove agent');
    }
  };

  if (loading) return <div className='p-6'>Loading agency settings...</div>;
  if (!agency) return <div className='p-6 text-slate-400'>No agency linked to your account</div>;

  return (
    <div className='p-6 max-w-3xl'>
      <h1 className='text-2xl font-bold text-white mb-4'>Agency Settings</h1>
      <p className='text-slate-400 mb-6'>Update your agency profile, webhook, API key, team, and payment details.</p>

      <form onSubmit={handleSave} className='space-y-6 bg-surface-dark p-6 rounded-2xl border border-surface-border'>
        <div>
          <label className='text-sm text-slate-400'>Contact person</label>
          <input value={agency.contact_person || ''} onChange={(e) => setAgency({ ...agency, contact_person: e.target.value })} className='w-full mt-2 p-3 rounded-md bg-[#0f1316] text-white' />
        </div>

        <div>
          <label className='text-sm text-slate-400'>Contact email</label>
          <input value={agency.contact_email || ''} onChange={(e) => setAgency({ ...agency, contact_email: e.target.value })} className='w-full mt-2 p-3 rounded-md bg-[#0f1316] text-white' />
        </div>

        <div>
          <label className='text-sm text-slate-400'>Contact phone</label>
          <input value={agency.contact_phone || ''} onChange={(e) => setAgency({ ...agency, contact_phone: e.target.value })} className='w-full mt-2 p-3 rounded-md bg-[#0f1316] text-white' />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='text-sm text-slate-400'>Monthly case limit</label>
            <input type='number' value={agency.monthly_capacity_limit || ''} onChange={(e) => setAgency({ ...agency, monthly_capacity_limit: Number(e.target.value) })} className='w-full mt-2 p-3 rounded-md bg-[#0f1316] text-white' />
          </div>

          <div>
            <label className='text-sm text-slate-400'>Status</label>
            <select value={agency.status} onChange={(e) => setAgency({ ...agency, status: e.target.value })} className='w-full mt-2 p-3 rounded-md bg-[#0f1316] text-white'>
              <option value='ACTIVE'>Active</option>
              <option value='WARNING'>Warning</option>
              <option value='SUSPENDED'>Offline</option>
            </select>
          </div>
        </div>

        <div>
          <label className='text-sm text-slate-400'>Webhook URL</label>
          <input value={agency.api_endpoint || ''} onChange={(e) => setAgency({ ...agency, api_endpoint: e.target.value })} className='w-full mt-2 p-3 rounded-md bg-[#0f1316] text-white' />
        </div>

        <div className='flex items-center gap-3'>
          <div>
            <label className='text-sm text-slate-400'>API Key</label>
            <div className='mt-2 p-3 rounded-md bg-[#0f1316] text-white break-all'>{agency.api_auth_token || '—'}</div>
          </div>
          <div>
            <button type='button' onClick={handleRegenerateKey} className='px-4 py-2 bg-primary rounded-md text-white'>Generate / Roll Key</button>
          </div>
        </div>

        <div>
          <label className='text-sm text-slate-400'>Bank Details (for commissions)</label>
          <textarea value={agency.bank_details ? JSON.stringify(agency.bank_details, null, 2) : ''} onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              setAgency({ ...agency, bank_details: parsed });
            } catch (err) {
              setAgency({ ...agency, bank_details: e.target.value });
            }
          }} className='w-full mt-2 p-3 rounded-md bg-[#0f1316] text-white min-h-[80px]' />
        </div>

        <div className='flex justify-end'>
          <button className='px-6 py-3 bg-primary rounded-lg text-white font-bold'>Save Agency Settings</button>
        </div>
      </form>

      {/* Team Management */}
      <div className='mt-8 bg-surface-dark p-6 rounded-2xl border border-surface-border'>
        <h3 className='text-xl font-bold text-white mb-4'>Team & Workflow</h3>

        <form onSubmit={handleInvite} className='flex gap-3 mb-4'>
          <input placeholder='Name' value={inviteName} onChange={(e) => setInviteName(e.target.value)} className='p-3 rounded-md bg-[#0f1316] text-white' />
          <input placeholder='Email' value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className='p-3 rounded-md bg-[#0f1316] text-white' />
          <button type='submit' className='px-4 py-2 bg-primary rounded-md text-white'>Invite</button>
        </form>

        {inviteResult && (
          <div className='mb-4 text-sm text-slate-300 bg-[#081013] p-3 rounded-md'>
            <div><strong>Invited:</strong> {inviteResult.email}</div>
            <div><strong>Temp Password:</strong> <code className='bg-black/10 px-2 rounded'>{inviteResult.tempPassword}</code></div>
          </div>
        )}

        <div>
          <table className='w-full text-sm'>
            <thead className='text-slate-400 text-xs text-left'>
              <tr><th>Name</th><th>Email</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {agents.map(a => (
                <tr key={a.id} className='border-t border-surface-border'>
                  <td className='py-3 text-white'>{a.name || '—'}</td>
                  <td className='py-3 text-slate-300'>{a.email}</td>
                  <td className='py-3'><button onClick={() => handleRemoveAgent(a.id)} className='text-red-400'>Remove</button></td>
                </tr>
              ))}
              {agents.length === 0 && <tr><td colSpan={3} className='py-3 text-slate-500'>No agents</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgentSettingsView;
