import React, { useEffect, useState } from 'react';
import { issuesService } from '../services/issuesService';

const Message = ({ c }) => (
  <div className='mb-3 p-3 bg-[#0b1113] border border-surface-border rounded-lg'>
    <div className='flex items-center gap-3 mb-2'>
      <div className='size-8 rounded-full bg-surface-border flex items-center justify-center text-white text-xs'>{(c.author_name || 'U').slice(0,1)}</div>
      <div className='text-sm'>
        <div className='text-white font-bold'>{c.author_name || 'Unknown'}</div>
        <div className='text-slate-400 text-xs'>{new Date(c.created_at).toLocaleString()}</div>
      </div>
    </div>
    <div className='text-slate-200'>{c.content}</div>
  </div>
);

const AgentIssuesView = ({ user }) => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const list = await issuesService.list('?status=OPEN');
      setThreads(list || []);
    } catch (err) {
      console.error('Failed to load threads', err);
    } finally { setLoading(false); }
  };

  const openThread = async (t) => {
    try {
      setSelected({ ...t, comments: [] });
      const comments = await issuesService.listComments(t.id);
      setSelected({ ...t, comments });
    } catch (err) { console.error('Failed to load comments', err); }
  };

  const postComment = async () => {
    if (!selected || !comment.trim()) return;
    try {
      const payload = { author_id: user.id, author_name: user.name, content: comment };
      await issuesService.createComment(selected.id, payload);
      setComment('');
      openThread(selected);
    } catch (err) { console.error('Post comment failed', err); alert('Failed to post'); }
  };

  const createThread = async () => {
    if (!newTitle.trim()) return alert('Title required');
    try {
      const payload = { title: newTitle, description: newDesc, reported_by: user.name, reported_email: user.email, priority: 'MEDIUM' };
      await issuesService.create(payload);
      setNewTitle(''); setNewDesc('');
      load();
      alert('Thread created');
    } catch (err) { console.error('Create failed', err); alert('Failed to create thread'); }
  };

  return (
    <div className='p-6 max-w-6xl mx-auto'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-black text-white'>Community Forum (Issues)</h1>
          <p className='text-slate-400'>Lodge and discuss issues with the FedEx support team — forum-style.</p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left column - threads list */}
        <div className='col-span-1'>
          <div className='bg-surface-dark p-4 rounded-2xl border border-surface-border mb-4'>
            <div className='flex items-center gap-2 mb-3'>
              <input placeholder='Search threads' className='flex-1 p-2 rounded-md bg-[#0f1316] text-white' />
              <button onClick={load} className='px-3 py-2 bg-[#111418] rounded-md text-white border border-surface-border'>Refresh</button>
            </div>

            <div className='space-y-3 max-h-[480px] overflow-auto'>
              {loading && <div className='text-slate-400'>Loading...</div>}
              {!loading && threads.map(t => (
                <div key={t.id} onClick={() => openThread(t)} className='p-3 bg-[#081013] hover:bg-[#0c1517] cursor-pointer rounded-lg border border-surface-border'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='text-white font-bold'>{t.title}</div>
                      <div className='text-slate-400 text-xs'>{t.reported_by || t.reported_email}</div>
                    </div>
                    <div className='text-slate-300 text-xs'>{new Date(t.created_at).toLocaleString()}</div>
                  </div>
                  <div className='text-slate-300 text-sm mt-2 line-clamp-2'>{t.description}</div>
                </div>
              ))}

              {!loading && threads.length === 0 && <div className='text-slate-500'>No threads. Create one below.</div>}
            </div>

            {/* Create new thread */}
            <div className='mt-4 border-t border-surface-border pt-4'>
              <input placeholder='Thread title' value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className='w-full p-2 rounded-md bg-[#0f1416] text-white mb-2' />
              <textarea placeholder='Describe your issue' value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className='w-full p-2 rounded-md bg-[#0f1416] text-white min-h-[80px]' />
              <div className='flex justify-end mt-2'>
                <button onClick={createThread} className='px-4 py-2 bg-primary rounded-md text-white'>Create Thread</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - thread view */}
        <div className='col-span-2'>
          <div className='bg-surface-dark p-4 rounded-2xl border border-surface-border min-h-[480px] flex flex-col'>
            {!selected && <div className='text-slate-400'>Select a thread from the left to view details and participate.</div>}

            {selected && (
              <div className='flex-1 overflow-auto pr-4'>
                <div className='mb-4'>
                  <h2 className='text-xl font-bold text-white'>{selected.title}</h2>
                  <div className='text-slate-400 text-sm mb-2'>{selected.reported_by || selected.reported_email} • {new Date(selected.created_at).toLocaleString()}</div>
                  <div className='text-slate-300'>{selected.description}</div>
                </div>

                <div className='mt-4'>
                  {(selected.comments || []).map(c => <Message key={c.id} c={c} />)}
                </div>
              </div>
            )}

            {/* Composer */}
            <div className='mt-4'>
              <div className='flex gap-3'>
                <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder={selected ? 'Write a reply...' : 'Select a thread to reply or create new thread'} className='flex-1 p-3 rounded-md bg-[#0f1416] text-white' disabled={!selected} />
                <button onClick={postComment} className='px-4 py-2 bg-primary rounded-md text-white' disabled={!selected}>Reply</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentIssuesView;
