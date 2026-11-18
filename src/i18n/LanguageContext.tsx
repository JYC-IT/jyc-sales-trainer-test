import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Translations, TRANSLATIONS } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof Translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      // Check if user manually selected a language
      const userSelected = localStorage.getItem('jyc_ui_language_user_selected');
      if (userSelected === 'en' || userSelected === 'es') {
        return userSelected;
      }
      // Default to Spanish ('es') so the interface opens natively in Spanish for sales reps
      return 'es';
    } catch {
      return 'es';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('jyc_ui_language_user_selected', lang);
      localStorage.setItem('jyc_ui_language', lang);
    } catch {}
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  const t = (key: keyof Translations): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.es;
    return dict[key] || TRANSLATIONS.es[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
