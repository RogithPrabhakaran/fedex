import { toast } from 'sonner';

/**
 * Simulates random WebSocket events from AI Agents
 * @param {string} role - Current user role (affects alert types)
 */
export const startWebSocketSimulation = (role) => {
  const agentNames = ['SLA_WATCHDOG', 'SOP_COMPLIANCE', 'AUTO_ALLOCATOR', 'RISK_ANALYZER'];
  
  const events = [
    { type: 'error', text: 'Case {id} SLA Breach detected! Immediate action required.' },
    { type: 'warning', text: 'Case {id} is approaching SLA limit (2h remaining).' },
    { type: 'info', text: 'SOP compliance verified for Agency {agency}. Score: {score}%' },
    { type: 'success', text: 'Payment of ${amount} received for Case {id}.' },
    { type: 'info', text: 'Auto-allocation: {count} cases assigned to {agency}.' }
  ];

  const timeout = setInterval(() => {
    // Only show alerts randomly every 8-15 seconds
    if (Math.random() > 0.7) {
      const event = events[Math.floor(Math.random() * events.length)];
      const agent = agentNames[Math.floor(Math.random() * agentNames.length)];
      
      // Personalize message
      let message = event.text
        .replace('{id}', Math.floor(10000 + Math.random() * 90000))
        .replace('{agency}', ['Alpha', 'Beta', 'Gamma'][Math.floor(Math.random() * 3)])
        .replace('{score}', Math.floor(80 + Math.random() * 20))
        .replace('{amount}', Math.floor(100 + Math.random() * 5000))
        .replace('{count}', Math.floor(5 + Math.random() * 20));

      const title = `${agent} ALERT`;

      // Filter alerts based on role relevance (optional)
      // e.g., only Admin sees auto-allocation
      if (role === 'DCA_USER' && message.includes('Auto-allocation')) return;

      toast[event.type](message, {
        description: `Source: ${agent} • Just now`,
        duration: 5000,
      });
    }
  }, 10000);

  return () => clearInterval(timeout);
};
