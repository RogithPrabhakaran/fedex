
import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_CUSTOMERS, EMAIL_TEMPLATES } from '../constants';

const CampaignView = () => {
  // Default to Payment Reminder, no selection needed
  const [selectedTemplate] = useState(EMAIL_TEMPLATES.find(t => t.name === 'Payment Reminder') || EMAIL_TEMPLATES[0]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [step, setStep] = useState(2); // Mocking being on Step 2 (Compose)
  const [aiSnippet, setAiSnippet] = useState('');

  const activeCustomers = MOCK_CUSTOMERS.filter(c => selectedCustomers.includes(c.id));

  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        const text = await geminiService.generateCampaignContent(selectedTemplate.name, selectedCustomers.length);
        setAiSnippet(text || '');
      } catch (e) {
        console.error("AI campaign generation failed", e);
      }
    };
    fetchSnippet();
  }, [selectedTemplate, selectedCustomers.length]);

  const handleLaunch = () => {
    setIsSending(true);
    setTimeout(() => {
      alert(`Reminder "${selectedTemplate.name}" successfully sent to ${selectedCustomers.length} customers!`);
      setIsSending(false);
    }, 2000);
  };

  const toggleCustomer = (id) => {
    setSelectedCustomers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const previewBody = useMemo(() => {
    let body = selectedTemplate.body;
    if (activeCustomers.length > 0) {
      const c = activeCustomers[0];
      body = body
        .replace('{{ContactName}}', c.name)
        .replace('{{Status}}', c.status)
        .replace('{{DebtAmount}}', `$${c.totalDebt.toLocaleString()}`)
        .replace('{{AccountID}}', c.accountId);
    }
    return body;
  }, [selectedTemplate, activeCustomers]);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar: Audience Selection */}
      <aside className="w-[400px] border-r border-slate-200 dark:border-surface-border bg-white dark:bg-surface-dark flex flex-col shrink-0">
        <div className="p-8 pb-4 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Select Audience</h2>
            <p className="text-slate-400 text-sm">Target customers for this automated reminder.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Region</label>
              <select className="bg-[#111418] border-slate-200 dark:border-surface-border rounded-xl text-white px-4 py-3 text-sm focus:ring-primary">
                <option>All Regions</option>
                <option>North America</option>
                <option>Europe</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Risk Level</label>
              <div className="flex flex-wrap gap-2">
                {['Low', 'Medium', 'High', 'Critical'].map(level => (
                  <button key={level} className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#111418] border border-slate-200 dark:border-surface-border text-slate-400 hover:border-primary hover:text-white transition-all">
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4 px-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{MOCK_CUSTOMERS.length} Customers Found</span>
            <button onClick={() => setSelectedCustomers(MOCK_CUSTOMERS.map(c => c.id))} className="text-xs text-primary font-bold hover:underline">Select All</button>
          </div>
          <div className="flex flex-col gap-2">
            {MOCK_CUSTOMERS.map(c => (
              <div
                key={c.id}
                onClick={() => toggleCustomer(c.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedCustomers.includes(c.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-200 dark:border-surface-border bg-transparent hover:border-slate-500'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{c.name}</span>
                  <input
                    type="checkbox"
                    checked={selectedCustomers.includes(c.id)}
                    onChange={() => { }}
                    className="rounded border-slate-200 dark:border-surface-border text-primary focus:ring-offset-0"
                  />
                </div>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-[10px] text-slate-500 font-mono">{c.accountId}</span>
                  <span className={`text-[10px] font-bold ${c.repaymentProbability > 70 ? 'text-emerald-500' : 'text-amber-500'}`}>{c.repaymentProbability}% Prob.</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Panel: Editor */}
      <section className="flex-1 bg-background-dark overflow-y-auto p-12">
        <div className="max-w-4xl mx-auto flex flex-col gap-10">
          {/* Stepper */}
          <div className="flex items-center gap-4">
            {[1, 2, 3].map(i => (
              <React.Fragment key={i}>
                <div className={`size-10 rounded-full flex items-center justify-center font-black text-sm transition-all ${step >= i ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-border text-slate-500'
                  }`}>
                  {i}
                </div>
                {i < 3 && <div className={`h-px w-10 ${step > i ? 'bg-primary' : 'bg-surface-border'}`} />}
              </React.Fragment>
            ))}
            <div className="ml-4">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Compose Reminder</h2>
              <p className="text-slate-400">Design your email template and AI messaging.</p>
            </div>
          </div>



          {/* Preview */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Live Preview</h3>
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                AI Content Active
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-surface-border bg-white dark:bg-surface-dark overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-surface-border bg-[#161d24] flex items-center gap-4">
                <span className="text-slate-500 text-xs w-16 text-right font-bold">To:</span>
                <span className="bg-primary/10 text-primary px-3 py-0.5 rounded-lg text-xs font-mono">
                  {activeCustomers.length > 0 ? activeCustomers[0].contactEmail : '{{CustomerEmail}}'}
                </span>
              </div>
              <div className="px-6 py-4 border-b border-slate-200 dark:border-surface-border bg-[#161d24] flex items-center gap-4">
                <span className="text-slate-500 text-xs w-16 text-right font-bold">Subject:</span>
                <span className="text-slate-900 dark:text-white text-sm font-bold">{selectedTemplate.subject}</span>
              </div>
              <div className="p-10 bg-white text-slate-800 font-sans leading-relaxed whitespace-pre-wrap">
                <div className="max-w-2xl mx-auto flex flex-col gap-6">
                  <div className="flex items-center gap-1 font-black text-3xl italic tracking-tighter mb-4">
                    <span className="text-[#111418]">Fed</span>
                    <span className="text-[#ff6600]">Ex</span>
                  </div>
                  {previewBody}
                  {aiSnippet && (
                    <div className="mt-4 p-4 bg-slate-50 border-l-4 border-primary italic text-slate-600 text-sm">
                      {aiSnippet}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Action Bar */}
      <aside className="w-[340px] border-l border-slate-200 dark:border-surface-border bg-white dark:bg-surface-dark p-8 flex flex-col shrink-0 gap-8">
        <div className="flex flex-col gap-6 flex-1">
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#111418] border border-slate-200 dark:border-surface-border">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recipients</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{selectedCustomers.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#111418] border border-slate-200 dark:border-surface-border">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Est. Time</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">~1m</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Task Name</label>
              <input
                type="text"
                defaultValue="Q3 Recovery Initiative"
                className="w-full bg-[#111418] border-slate-200 dark:border-surface-border rounded-xl text-white px-4 py-3 text-sm focus:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Schedule</label>
              <select className="w-full bg-[#111418] border-slate-200 dark:border-surface-border rounded-xl text-white px-4 py-3 text-sm focus:ring-primary">
                <option>Launch Immediately</option>
                <option>Schedule for later</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex gap-3">
            <span className="material-symbols-outlined text-primary text-[20px]">info</span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <strong>Variables</strong> matched correctly for 98% of selected audience.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleLaunch}
            disabled={isSending || selectedCustomers.length === 0}
            className="w-full py-4 rounded-2xl bg-primary font-black text-white shadow-2xl shadow-primary/20 hover:bg-blue-600 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSending ? 'Sending...' : 'Send Reminders'}
            <span className="material-symbols-outlined">send</span>
          </button>
          <button className="w-full py-2 text-sm font-bold text-slate-400 hover:text-slate-900 dark:text-white transition-colors">Save as Draft</button>
        </div>
      </aside>
    </div>
  );
};

export default CampaignView;
