import React, { createContext, useContext, useEffect, useState } from 'react';
// Mock data fallback if file is missing, or import from real source if available
// Assuming mockData exists or we define it here inline for robustness
import { mockCases as initialCases, mockAgencies, mockAgentAlerts, mockCaseLogs } from './mockData';

const AppStateContext = createContext();

export const ROLES = {
  FEDEX_ADMIN: 'FEDEX_ADMIN',
  DCA_ADMIN: 'DCA_ADMIN',
  DCA_AGENT: 'DCA_AGENT',
  CUSTOMER: 'CUSTOMER'
};

export const AppProvider = ({ children }) => {
  const [activeRole, setActiveRole] = useState(ROLES.FEDEX_ADMIN);
  const [cases, setCases] = useState(initialCases || []);
  const [agencies, setAgencies] = useState(mockAgencies || []);
  const [alerts, setAlerts] = useState(mockAgentAlerts || []);
  const [logs, setLogs] = useState(mockCaseLogs || []);

  // Stats
  const [stats, setStats] = useState({
    activeCases: 47,
    valueAtRisk: 2300000,
    recoveryRate: 84.2,
    slaBreaches: 3,
    sopCompliance: 78,
    escalations: 2
  });

  // Auto-allocation simulation
  useEffect(() => {
    if (activeRole === ROLES.FEDEX_ADMIN) {
      setTimeout(() => {
        // Dynamic import to avoid circular dependency issues if any
        import('sonner').then(({ toast }) => {
          toast.success("Auto-Allocation Protocol Initiated", {
            description: "Distributing 142 overdue cases to partner agencies...",
            duration: 6000,
            icon: '🤖'
          });
        });
      }, 1500);
    }
  }, [activeRole]);

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Update Cases (SLA countdown, random SLA status, SOP score)
      setCases(prevCases => prevCases.map(c => {
        const isTarget = Math.random() > 0.9;

        let newHours = Math.max(0, c.hoursToSla - 0.1); // Fast countdown
        let newSlaStatus = c.slaStatus;
        let newSopScore = c.sopComplianceScore;
        const newAlerts = c.agentAlerts ? [...c.agentAlerts] : [];

        // SLA Logic
        if (newHours < 20 && newHours > 0) newSlaStatus = "WARNING";
        if (newHours <= 0) newSlaStatus = "BREACHED";

        // Randomly breach or fix
        if (isTarget) {
          // SOP Updates
          newSopScore = Math.min(100, Math.max(0, c.sopComplianceScore + (Math.random() > 0.5 ? 2 : -2)));

          // Generate Case Alert
          if (Math.random() > 0.8) {
            newAlerts.push({
              type: 'info',
              message: `SOP Check: ${Math.random() > 0.5 ? 'Passed' : 'Verify step'}`,
              timestamp: new Date().toISOString()
            });
          }
        }

        return {
          ...c,
          hoursToSla: Number(newHours.toFixed(2)),
          slaStatus: newSlaStatus,
          sopComplianceScore: newSopScore,
          agentAlerts: newAlerts,
          lastUpdated: new Date().toISOString()
        };
      }));

      // 2. Global Stats Jitter
      if (Math.random() > 0.6) {
        setStats(prev => ({
          ...prev,
          recoveryRate: Number((prev.recoveryRate + (Math.random() - 0.5) * 0.2).toFixed(1)),
          sopCompliance: Math.min(100, Math.max(0, prev.sopCompliance + (Math.random() > 0.5 ? 1 : -1))),
        }));
      }

      // 3. New Global Log
      if (Math.random() > 0.85) {
        const newLog = {
          id: Date.now(),
          caseId: `CASE-${Math.floor(Math.random() * 1000)}`,
          actor: Math.random() > 0.6 ? "SLA_WATCHDOG" : "SOP_AGENT",
          message: Math.random() > 0.5 ? "Compliance verification completed" : "SLA Timer update",
          timestamp: new Date().toISOString(),
          type: 'system'
        };
        setLogs(prev => [newLog, ...prev].slice(0, 50));
      }

    }, 1500); // 1.5s tick for visible liveliness

    return () => clearInterval(interval);
  }, []);

  return (
    <AppStateContext.Provider value={{
      cases, agencies, alerts, logs, stats,
      activeRole, setActiveRole
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => useContext(AppStateContext);
