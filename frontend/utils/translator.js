// Translation utility for FedEx DCA Manager
// Uses Google Cloud Translation API for dynamic text translation
// Falls back to original text if translation fails
const CACHE_KEY_PREFIX = 'translation_cache_';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

class Translator {
    constructor() {
        this.apiKey = "AIzaSyADB7GzwGsnJAHBKLT19-yxk3cvTlizqas"; // TODO: Add your Google Cloud Translation API key here
        // Example: this.apiKey = 'YOUR_GOOGLE_CLOUD_TRANSLATION_API_KEY';

        this.baseUrl = 'https://translation.googleapis.com/language/translate/v2';
        this.cache = this.loadCache();
    }

    loadCache() {
        try {
            const cache = localStorage.getItem(CACHE_KEY_PREFIX + 'store');
            return cache ? JSON.parse(cache) : {};
        } catch {
            return {};
        }
    }

    saveCache() {
        try {
            localStorage.setItem(CACHE_KEY_PREFIX + 'store', JSON.stringify(this.cache));
        } catch (err) {
            console.warn('Failed to save translation cache:', err);
        }
    }

    getCacheKey(text, targetLang) {
        return `${text}_${targetLang}`;
    }

    async translate(text, targetLang = 'en') {
        // If target is English or no API key, return original text
        if (targetLang === 'en' || !text) {
            return text;
        }

        // Check cache first
        const cacheKey = this.getCacheKey(text, targetLang);
        const cached = this.cache[cacheKey];

        if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY_MS) {
            return cached.translation;
        }

        // If no API key configured, return original text
        if (!this.apiKey) {
            console.warn('Translation API key not configured. Returning original text.');
            return text;
        }

        try {
            const response = await fetch(
                `${this.baseUrl}?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        q: text,
                        target: targetLang,
                        format: 'text',
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`Translation API error: ${response.status}`);
            }

            const data = await response.json();
            const translation = data.data.translations[0].translatedText;

            // Cache the result
            this.cache[cacheKey] = {
                translation,
                timestamp: Date.now(),
            };
            this.saveCache();

            return translation;
        } catch (err) {
            console.error('Translation failed:', err);
            return text; // Fallback to original text
        }
    }

    async translateBatch(texts, targetLang = 'en') {
        if (targetLang === 'en' || !texts || texts.length === 0) {
            return texts;
        }

        if (!this.apiKey) {
            console.warn('Translation API key not configured. Returning original texts.');
            return texts;
        }

        try {
            const response = await fetch(
                `${this.baseUrl}?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        q: texts,
                        target: targetLang,
                        format: 'text',
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`Translation API error: ${response.status}`);
            }

            const data = await response.json();
            return data.data.translations.map((t) => t.translatedText);
        } catch (err) {
            console.error('Batch translation failed:', err);
            return texts; // Fallback to original texts
        }
    }

    clearCache() {
        this.cache = {};
        localStorage.removeItem(CACHE_KEY_PREFIX + 'store');
    }
}

// Singleton instance
const translator = new Translator();

export default translator;
