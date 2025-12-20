import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Korean translations
import koCommon from './locales/ko/common.json';
import koTargets from './locales/ko/targets.json';
import koAuth from './locales/ko/auth.json';

// English translations
import enCommon from './locales/en/common.json';
import enTargets from './locales/en/targets.json';
import enAuth from './locales/en/auth.json';

const resources = {
    ko: {
        common: koCommon,
        targets: koTargets,
        auth: koAuth,
    },
    en: {
        common: enCommon,
        targets: enTargets,
        auth: enAuth,
    },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        defaultNS: 'common',
        ns: ['common', 'targets', 'auth'],
        interpolation: {
            escapeValue: false, // React already escapes values
        },
        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
            lookupLocalStorage: 'updater-language',
        },
    });

export default i18n;
