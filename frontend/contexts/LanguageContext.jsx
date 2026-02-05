import React, { createContext, useContext, useState, useEffect } from 'react';
import translator from '../utils/translator';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    const [currentLanguage, setCurrentLanguage] = useState(() => {
        return localStorage.getItem('ui_language') || 'en';
    });
    const [translating, setTranslating] = useState(false);

    useEffect(() => {
        localStorage.setItem('ui_language', currentLanguage);
    }, [currentLanguage]);

    const changeLanguage = (languageCode) => {
        setCurrentLanguage(languageCode);
    };

    // Helper function to translate text
    const t = async (text) => {
        if (!text || currentLanguage === 'en') {
            return text;
        }

        try {
            setTranslating(true);
            const translated = await translator.translate(text, currentLanguage);
            return translated;
        } catch (err) {
            console.error('Translation error:', err);
            return text;
        } finally {
            setTranslating(false);
        }
    };

    // Translate multiple texts at once (batch operation)
    const translateBatch = async (texts) => {
        if (!texts || texts.length === 0 || currentLanguage === 'en') {
            return texts;
        }

        try {
            setTranslating(true);
            const translated = await translator.translateBatch(texts, currentLanguage);
            return translated;
        } catch (err) {
            console.error('Batch translation error:', err);
            return texts;
        } finally {
            setTranslating(false);
        }
    };

    const value = {
        currentLanguage,
        changeLanguage,
        t,
        translateBatch,
        translating,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
