import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

// Frontend language dropdown component with Google Translate integration.
// - Supports 30+ world languages with native names and flags
// - Auto-translates entire page using Google Translate API
// - Stores selected language preference in localStorage

const DEFAULT_LANG = 'en';

const LANGUAGES = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  ru: { name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  'zh-CN': { name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  ar: { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  ko: { name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  nl: { name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  sv: { name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  no: { name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  da: { name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  fi: { name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  pl: { name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  tr: { name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  he: { name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱' },
  th: { name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  vi: { name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  id: { name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  cs: { name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  el: { name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  ro: { name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
  hu: { name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
  bg: { name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬' },
  uk: { name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  ca: { name: 'Catalan', nativeName: 'Català', flag: '🇪🇸' },
  ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
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
    // Trigger Google Translate to the selected language
    if (window.google && window.google.translate) {
      const element = document.querySelector('.goog-te-combo');
      if (element) {
        element.value = code === 'en' ? 'en' : code;
        element.dispatchEvent(new Event('change'));
      }
    }
    setOpen(false);
  };

  const currentLang = LANGUAGES[currentLanguage] || LANGUAGES['en'];

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
        <span className='text-sm hidden sm:inline font-medium'>{currentLang.flag} {currentLang.nativeName}</span>
      </button>

      {open && (
        <div className='absolute right-0 mt-2 w-72 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto'>
          <div className='p-4 border-b border-slate-200 dark:border-surface-border'>
            <h3 className='text-sm font-bold text-slate-900 dark:text-white'>Select Language</h3>
          </div>
          <div className='grid grid-cols-2 gap-2 p-3'>
            {Object.entries(LANGUAGES).map(([code, lang]) => (
              <button
                key={code}
                onClick={() => handleSelect(code)}
                className={`flex flex-col items-start gap-1 p-3 rounded-lg transition-colors ${
                  currentLanguage === code
                    ? 'bg-primary/20 text-primary dark:text-primary border border-primary/50'
                    : 'hover:bg-slate-100 dark:hover:bg-surface-border/50 text-slate-900 dark:text-white'
                }`}
              >
                <span className='text-lg'>{lang.flag} {lang.nativeName}</span>
                <span className='text-xs text-slate-500 dark:text-slate-400'>{lang.name}</span>
              </button>
            ))}
          </div>
          <div className='border-t border-slate-200 dark:border-surface-border p-3 text-xs text-slate-500 dark:text-slate-400'>
            <p>🌐 Powered by Google Translate</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;
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
