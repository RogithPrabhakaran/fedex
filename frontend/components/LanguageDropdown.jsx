import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

// Frontend language dropdown component with translation integration.
// - Stores selected language in localStorage under 'ui_language'
// - Uses LanguageContext to trigger app-wide translations
// - Integrates with Google Cloud Translation API (requires API key in utils/translator.js)

const DEFAULT_LANG = 'en';

const LANGUAGES = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  ja: 'Japanese',
  zh: 'Chinese (Simplified)',
  ar: 'Arabic',
  hi: 'Hindi',
  ko: 'Korean',
  nl: 'Dutch',
  sv: 'Swedish',
  no: 'Norwegian',
  da: 'Danish',
  fi: 'Finnish',
  pl: 'Polish',
  tr: 'Turkish',
  he: 'Hebrew',
  th: 'Thai',
  vi: 'Vietnamese',
  id: 'Indonesian',
  cs: 'Czech',
  el: 'Greek',
  ro: 'Romanian',
  hu: 'Hungarian',
  bg: 'Bulgarian',
  uk: 'Ukrainian',
  ca: 'Catalan',
};

const flagFor = (code) => {
  const map = {
    en: '🇺🇸', es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪', it: '🇮🇹', pt: '🇵🇹', ru: '🇷🇺', ja: '🇯🇵', zh: '🇨🇳', ar: '🇸🇦', hi: '🇮🇳',
    ko: '🇰🇷', nl: '🇳🇱', sv: '🇸🇪', no: '🇳🇴', da: '🇩🇰', fi: '🇫🇮', pl: '🇵🇱', tr: '🇹🇷', he: '🇮🇱', th: '🇹🇭',
    vi: '🇻🇳', id: '🇮🇩', cs: '🇨🇿', el: '🇬🇷', ro: '🇷🇴', hu: '🇭🇺', bg: '🇧🇬', uk: '🇺🇦', ca: '🇪🇸',
  };
  return map[code] || '🏳️';
};

const LanguageDropdown = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleSelect = (code) => {
    changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className='relative' ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup='menu'
        aria-expanded={open}
        className='flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-border/50'
        title='Select language'
      >
        <span className='material-symbols-outlined'>translate</span>
        <span className='hidden sm:inline text-sm'>{flagFor(currentLanguage)} {LANGUAGES[currentLanguage]}</span>
      </button>

      {open && (
        <div className='absolute right-0 top-full mt-2 w-56 max-h-64 overflow-y-auto bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-xl shadow-lg z-50'>
          <div className='p-2'>
            {Object.entries(LANGUAGES).map(([code, name]) => (
              <button
                key={code}
                onClick={() => handleSelect(code)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-surface-border/50 ${currentLanguage === code ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-700 dark:text-slate-300'}`}
              >
                <span className='text-lg'>{flagFor(code)}</span>
                <span className='text-sm'>{name}</span>
                {currentLanguage === code && (
                  <span className='material-symbols-outlined ml-auto text-sm'>check</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;
