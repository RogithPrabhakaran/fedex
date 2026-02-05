// Example component demonstrating translation usage
// This file shows different ways to use the translation system in your components

import React from 'react';
import { useTranslation, Translate } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';

// Example 1: Using the useTranslation hook
export const Example1 = () => {
    const { translated } = useTranslation('Welcome to FedEx DCA Manager');

    return (
        <div>
            <h1>{translated}</h1>
        </div>
    );
};

// Example 2: Using the Translate component
export const Example2 = () => {
    return (
        <div>
            <h1>
                <Translate text="Dashboard" />
            </h1>
            <p>
                <Translate text="Manage your DCA assignments and track performance." />
            </p>
        </div>
    );
};

// Example 3: Using the language context directly for programmatic translation
export const Example3 = () => {
    const { currentLanguage, changeLanguage, t } = useLanguage();

    const handleButtonClick = async () => {
        const message = await t('Button clicked!');
        alert(message);
    };

    return (
        <div>
            <p>Current Language: {currentLanguage}</p>
            <button onClick={handleButtonClick}>
                <Translate text="Click Me" />
            </button>
        </div>
    );
};

// Example 4: Translating dynamic content
export const Example4 = ({ userName }) => {
    const { t } = useLanguage();
    const [greeting, setGreeting] = React.useState('');

    React.useEffect(() => {
        const translateGreeting = async () => {
            const translated = await t(`Hello, ${userName}!`);
            setGreeting(translated);
        };
        translateGreeting();
    }, [userName, t]);

    return <h2>{greeting}</h2>;
};

// You can apply these patterns to any component in your app
// Just remember to:
// 1. Add the Google Cloud Translation API key in utils/translator.js
// 2. Wrap static text with <Translate> or use useTranslation()
// 3. Use the language context's t() function for dynamic/programmatic translations
