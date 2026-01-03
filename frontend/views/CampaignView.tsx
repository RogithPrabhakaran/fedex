import React, { useState, useMemo, useEffect } from 'react';
import { Customer, EmailTemplate } from '../types';
import { apiService } from '../services/apiService';
import { geminiService } from '../services/geminiService';

const CampaignView: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [step, setStep] = useState(2);
  const [aiSnippet, setAiSnippet] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [templatesData, customersData] = await Promise.all([
        apiService.getEmailTemplates(),
        apiService.getCustomers()
      ]);
      setEmailTemplates(templatesData);
      setCustomers(customersData);
      if (templatesData.length > 0) {
        setSelectedTemplate(templatesData[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const activeCustomers = customers.filter(c => selectedCustomers.includes(c.id));

  useEffect(() => {
    if (selectedTemplate) {
      const fetchSnippet = async () => {
        try {
          const text = await geminiService.generateCampaignContent(selectedTemplate.name, selectedCustomers.length);
          setAiSnippet(text || '');
        } catch (e) {
          console.error("AI campaign generation failed", e);
        }
      };
      fetchSnippet();
    }
  }, [selectedTemplate, selectedCustomers.length]);

  const handleLaunch = async () => {
    if (!selectedTemplate || selectedCustomers.length === 0) return;
    
    setIsSending(true);
    try {
      await apiService.sendEmail({
        templateId: selectedTemplate.id,
        customerIds: selectedCustomers
      });
      alert(`Campaign "${selectedTemplate.name}" successfully launched to ${selectedCustomers.length} customers!`);
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to send emails');
    } finally {
      setIsSending(false);
    }
  };

  const toggleCustomer = (id: string) => {
    setSelectedCustomers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
        {error}
      </div>
    );
  }

  if (!selectedTemplate) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">No email templates available</div>
      </div>
    );
  }

  const previewBody = useMemo(() => {
    if (!selectedTemplate) return '';
    
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
      <aside className="w-[400px] border-r border-surface-border bg-surface-dark flex flex-col shrink-0">
        <div className="p-8 pb-4 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black text-white tracking-tight">Select Audience</h2>
            <p className="text-slate-400 text-sm">Target customers for this automated campaign.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4 px-4">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{customers.length} Customers Found</span>
             <button onClick={() => setSelectedCustomers(customers.map(c => c.id))} className="text-xs text-primary font-bold hover:underline">Select All</button>
          </div>
          <div className="flex flex-col gap-2">
            {customers.map(c => (
              <div 
                key={c.id} 
                onClick={() => toggleCustomer(c.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedCustomers.includes(c.id) 
                  ? 'border-primary bg-primary/5' 
                  : 'border-surface-border bg-transparent hover:border-slate-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-white">{c.name}</span>
                  <input 
                    type="checkbox" 
                    checked={selectedCustomers.includes(c.id)} 
                    onChange={() => {}}
                    className="accent-primary"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">{c.accountId} • ${c.totalDebt.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <div className="p-8 border-b border-surface-border bg-surface-dark">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white">Email Campaign</h1>
              <p className="text-slate-400">Compose and send automated communications</p>
            </div>
            <button 
              onClick={handleLaunch}
              disabled={isSending || selectedCustomers.length === 0}
              className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 disabled:opacity-50"
            >
              {isSending ? 'Sending...' : `Launch to ${selectedCustomers.length} customers`}
            </button>
          </div>
        </div>

        <div className="flex-1 p-8">
          <div className="grid grid-cols-2 gap-8 h-full">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white">Select Template</h3>
              <div className="grid gap-4">
                {emailTemplates.map(tpl => (
                  <div 
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplate?.id === tpl.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-surface-border hover:border-slate-500'
                    }`}
                  >
                    <h4 className="font-bold text-white">{tpl.name}</h4>
                    <p className="text-sm text-slate-400 mt-1">{tpl.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white">Preview</h3>
              <div className="flex-1 p-4 bg-surface-dark border border-surface-border rounded-xl">
                <div className="text-sm text-slate-400 mb-2">Subject: {selectedTemplate?.subject}</div>
                <div className="text-white whitespace-pre-wrap">{previewBody}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CampaignView;
