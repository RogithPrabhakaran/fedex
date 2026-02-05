import React, { useState, useEffect } from 'react';

const steps = [
  { id: 1, label: 'Initial Contact', timeframe: '24h' },
  { id: 2, label: 'Follow-up', timeframe: '48h' },
  { id: 3, label: 'Negotiation', timeframe: '7 days' },
  { id: 4, label: 'Payment Plan', timeframe: 'Custom' },
  { id: 5, label: 'Resolution', timeframe: '-' },
];

const SopStepper = ({ currentStep = 2, complianceScore = 85 }) => {
  const [activeStep, setActiveStep] = useState(currentStep);
  const [displayScore, setDisplayScore] = useState(complianceScore);

  // Animate score changes
  useEffect(() => {
    setDisplayScore(complianceScore);
  }, [complianceScore]);

  return (
    <div className="w-full py-4">
      <div className="flex justify-between mb-6">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">SOP Progress Tracker</h4>
          <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Compliance Score:</span>
              <span className={`text-lg font-bold font-mono transition-colors duration-500 ${
                  displayScore > 80 ? 'text-emerald-500' : displayScore > 50 ? 'text-amber-500' : 'text-red-500'
              }`}>
                  {displayScore}%
              </span>
          </div>
      </div>

      <div className="relative flex items-center justify-between w-full">
        {/* Progress Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-700 z-0"></div>
        <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 z-0 transition-all duration-1000"
            style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
           const isCompleted = index + 1 < activeStep;
           const isCurrent = index + 1 === activeStep;
           const isUpcoming = index + 1 > activeStep;

           return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
               <div className={`
                   w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white dark:bg-surface-dark
                   ${isCompleted ? 'border-blue-500 text-blue-500' : 
                     isCurrent ? 'border-blue-500 ring-4 ring-blue-500/20' : 
                     'border-slate-300 dark:border-slate-600'
                    }
               `}>
                 {isCompleted ? (
                   <span className="material-symbols-outlined text-sm font-bold">check</span>
                 ) : isCurrent ? (
                   <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                 ) : (
                   <span className="text-xs text-slate-400">{step.id}</span>
                 )}
               </div>
               
               <div className="absolute top-10 flex flex-col items-center min-w-[100px]">
                 <span className={`text-xs font-medium transition-colors ${isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
                    {step.label}
                 </span>
                 <span className="text-[10px] text-slate-400 mt-0.5">{step.timeframe}</span>
               </div>
            </div>
           );
        })}
      </div>
    </div>
  );
};

export default SopStepper;
