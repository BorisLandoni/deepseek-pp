import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Language, Translations } from './translations';
import { TRANSLATIONS } from './translations';

const STORAGE_KEY = 'deepseek_pp_language';

interface LanguageContextValue {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
  isFirstRun: boolean;
  completeOnboarding: () => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  t: TRANSLATIONS.en,
  setLanguage: () => {},
  isFirstRun: false,
  completeOnboarding: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEY]).then((data) => {
      const stored = data[STORAGE_KEY] as Language | undefined;
      if (!stored) {
        setIsFirstRun(true);
        setLanguageState('en');
      } else {
        setLanguageState(stored as Language);
      }
      setReady(true);
    });
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    chrome.storage.local.set({ [STORAGE_KEY]: lang });
  }, []);

  const completeOnboarding = useCallback(() => {
    setIsFirstRun(false);
  }, []);

  if (!ready) return null;

  return (
    <LanguageContext.Provider
      value={{
        language,
        t: TRANSLATIONS[language],
        setLanguage,
        isFirstRun,
        completeOnboarding,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
