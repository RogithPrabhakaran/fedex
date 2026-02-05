import React, { useState, useEffect } from 'react';

const AddAgentModal = ({ agent, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [sendLoginEmail, setSendLoginEmail] = useState(true);

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || '',
        email: agent.email || '',
        phone: agent.phone || '',
      });
    }
  }, [agent]);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^[+]?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const dataToSave = {
      ...formData,
      sendLoginEmail: !agent && sendLoginEmail, // Only send email for new agents
    };

    onSave(dataToSave);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const isEditing = !!agent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-surface-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {isEditing ? 'Edit Agent' : 'Add New Agent'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isEditing 
                  ? 'Update agent information'
                  : 'Create a new DCA agent account'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-border/50 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="John Doe"
              className={`w-full px-4 py-3 bg-slate-50 dark:bg-[#111418] border ${
                errors.name 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-slate-200 dark:border-surface-border focus:ring-[#1E40AF]'
              } rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
              Email Address * {!isEditing && <span className="text-xs font-normal text-slate-500">(must be unique)</span>}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="john.doe@dcaagile.com"
              className={`w-full px-4 py-3 bg-slate-50 dark:bg-[#111418] border ${
                errors.email 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-slate-200 dark:border-surface-border focus:ring-[#1E40AF]'
              } rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+91-9876543210"
              className={`w-full px-4 py-3 bg-slate-50 dark:bg-[#111418] border ${
                errors.phone 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-slate-200 dark:border-surface-border focus:ring-[#1E40AF]'
              } rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all`}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Send Login Email Checkbox (only for new agents) */}
          {!isEditing && (
            <div className="p-4 bg-[#1E40AF]/10 border border-[#1E40AF]/30 rounded-xl">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendLoginEmail}
                  onChange={(e) => setSendLoginEmail(e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded border-slate-300 text-[#1E40AF] focus:ring-[#1E40AF]"
                />
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    Send Login Email
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Automatically send login credentials and instructions to the agent's email address
                  </div>
                </div>
              </label>
            </div>
          )}

          {/* Info Banner */}
          {!isEditing && (
            <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-blue-500 text-[20px] flex-shrink-0">
                  info
                </span>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  The agent will be created with role <strong>DCA_AGENT</strong> and linked to your DCA admin account. They will have access to assigned cases only.
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-surface-border flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-surface-border text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-surface-border/70 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 bg-[#1E40AF] text-white rounded-xl font-bold hover:bg-[#1e3a8a] transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isEditing ? 'save' : 'person_add'}
            </span>
            {isEditing ? 'Update Agent' : 'Create Agent'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAgentModal;
