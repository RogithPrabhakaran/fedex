import React from 'react';
import { useAppState } from '../useAppState';

const SopCompliance = () => {
  const { agencies, cases } = useAppState();

  return (
    <div className='p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold dark:text-white'>
            SOP Compliance Dashboard
          </h1>
          <p className='text-slate-500 dark:text-slate-400'>
            Monitoring agency adherence to Standard Operating Procedures.
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {agencies.map((agency) => {
          // Use actual score from agency data with small variance
          const baseScore = agency.score || 75;
          const liveScore = Math.min(
            100,
            Math.max(0, baseScore + (Math.random() * 4 - 2))
          );
          const status =
            liveScore >= 90
              ? 'Excellent'
              : liveScore >= 75
              ? 'Good'
              : 'Needs Improvement';
          const colorClass =
            liveScore >= 90
              ? 'text-emerald-500'
              : liveScore >= 75
              ? 'text-blue-500'
              : 'text-amber-500';

          // Calculate realistic audit flags (0-3) based on score
          const auditFlags = Math.max(0, Math.floor(5 - liveScore / 20));

          return (
            <div
              key={agency.id}
              className='bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-surface-border relative overflow-hidden group'
            >
              <div className='absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity'>
                <span className='material-symbols-outlined text-6xl'>
                  verified_user
                </span>
              </div>

              <h3 className='text-lg font-bold dark:text-white mb-1'>
                {agency.name}
              </h3>
              <span
                className={`inline-block px-2 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 ${colorClass} mb-4`}
              >
                {status}
              </span>

              <div className='space-y-4'>
                <div>
                  <div className='flex justify-between text-sm mb-1'>
                    <span className='text-slate-500'>Compliance Score</span>
                    <span className='font-mono font-bold dark:text-slate-200'>
                      {Math.round(liveScore)}%
                    </span>
                  </div>
                  <div className='w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-blue-500 transition-all duration-1000'
                      style={{ width: `${liveScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div className='bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg'>
                    <span className='block text-xs text-slate-500'>
                      Active Cases
                    </span>
                    <span className='font-bold dark:text-slate-300'>
                      {agency.activeCases || 5}
                    </span>
                  </div>
                  <div className='bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg'>
                    <span className='block text-xs text-slate-500'>
                      Audit Flags
                    </span>
                    <span className='font-bold text-red-500'>{auditFlags}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className='h-100 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-surface-border p-6'>
        <h3 className='font-semibold mb-4 dark:text-slate-200'>
          Agency Leaderboard
        </h3>
        {/* Placeholder for leaderboard list */}
        <div className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='flex items-center p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-colors'
            >
              <span className='w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mr-4'>
                {i}
              </span>
              <div className='flex-1'>
                <h4 className='font-medium dark:text-slate-200'>
                  Agency {String.fromCharCode(64 + i)}
                </h4>
                <p className='text-xs text-slate-400'>score increasing</p>
              </div>
              <span className='font-mono font-bold text-lg dark:text-slate-200'>
                {99 - i * 2}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SopCompliance;
