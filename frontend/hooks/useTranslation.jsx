import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Custom hook for translating text in components
 * Usage: const translatedText = useTranslation('Hello World');
 */
export const useTranslation = (text) => {
    const { currentLanguage, t } = useLanguage();
    const [translated, setTranslated] = useState(text);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!text) {
            setTranslated('');
            return;
        }

        // If language is English, no need to translate
        if (currentLanguage === 'en') {
            setTranslated(text);
            return;
        }

        let mounted = true;
        setLoading(true);

        t(text)
            .then((result) => {
                if (mounted) {
                    setTranslated(result);
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error('Translation error:', err);
                if (mounted) {
                    setTranslated(text); // Fallback to original
                    setLoading(false);
                }
            });

        return () => {
            mounted = false;
        };
    }, [text, currentLanguage, t]);

    return { translated, loading };
};

/**
 * Component wrapper for translating text
 * Usage: <Translate text="Hello World" />
 */
export const Translate = ({ text, children }) => {
    const { translated, loading } = useTranslation(text || children);

    if (loading) {
        return <span className="opacity-50">{text || children}</span>;
    }

    return <>{translated}</>;
};
