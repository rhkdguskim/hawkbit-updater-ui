import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import i18n from '@/i18n';

export type Language = 'ko' | 'en' | 'zh';

interface LanguageState {
    language: Language;
    setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            language: (i18n.language?.substring(0, 2) as Language) || 'ko',
            setLanguage: (lang) => {
                i18n.changeLanguage(lang);
                set({ language: lang });
            },
        }),
        {
            name: 'updater-language-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                // Sync i18n with persisted language on rehydration
                if (state?.language) {
                    i18n.changeLanguage(state.language);
                }
            },
        }
    )
);
