import React, { useState, useEffect, useMemo } from 'react';
import CustomerTable from '../components/CustomerTable';
import { customerService } from '../services/customerService';
import { Translate } from '../hooks/useTranslation.jsx';

const DcaAssignmentsView = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await customerService.fetchAssigned();
        setCustomers(data);
      } catch (err) {
        console.error('Failed to load assigned customers', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleToggleAll = () => {
    setSelectedIds(prev => prev.length === customers.length ? [] : customers.map(c => c.id));
  };

  const reassignSelected = async () => {
    if (selectedIds.length === 0) return alert('No customers selected');
    const dcaId = prompt('Enter DCA agency ID to assign selected customers to (e.g. agency_alpha):');
    if (!dcaId) return;
    try {
      await customerService.assignToDcaBulk(selectedIds, dcaId);
      const refreshed = await customerService.fetchAssigned();
      setCustomers(refreshed);
      setSelectedIds([]);
      alert(`Assigned ${selectedIds.length} customers to ${dcaId}`);
    } catch (err) {
      console.error('Bulk reassign failed', err);
      alert(err.body?.error || err.message || 'Reassign failed');
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-10 max-w-[1600px] mx-auto w-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight"><Translate text="DCA Assignments" /></h1>
          <p className="text-slate-400 mt-1"><Translate text="Customers currently submitted to external DCA agencies." /></p>
        </div>
        <div className="flex gap-3">
          <button onClick={reassignSelected} className="rounded-xl bg-primary px-6 py-3 text-white font-black shadow-xl hover:bg-blue-600"><Translate text="Reassign Selected" /></button>
        </div>
      </div>

      <CustomerTable
        customers={customers}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleAll={handleToggleAll}
        onEdit={() => { }}
      />
    </div>
  );
};

export default DcaAssignmentsView;
