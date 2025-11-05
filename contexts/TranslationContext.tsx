'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getActiveLanguages, getDefaultLanguage, getTranslations, getLanguagePreference, saveLanguagePreference, Language, TranslationDict } from '@/lib/translations';

interface TranslationContextType {
  languages: Language[];
  currentLanguage: Language | null;
  translations: TranslationDict;
  isLoading: boolean;
  setLanguage: (languageCode: string) => Promise<void>;
  t: (namespace: string, key: string, fallback?: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null);
  const [translations, setTranslations] = useState<TranslationDict>({});
  const [isLoading, setIsLoading] = useState(true);

  // Initialize language
  useEffect(() => {
    async function initialize() {
      try {
        // Load languages
        const activeLanguages = await getActiveLanguages();
        setLanguages(activeLanguages);

        // Get preferred language or default
        const preferredCode = getLanguagePreference();
        let defaultLang = activeLanguages.find(l => l.code === preferredCode) || null;
        
        if (!defaultLang) {
          const systemDefault = await getDefaultLanguage();
          defaultLang = systemDefault || activeLanguages[0] || null;
        }

        if (defaultLang) {
          setCurrentLanguage(defaultLang);
          saveLanguagePreference(defaultLang.code);
          
          // Load translations
          const translationData = await getTranslations(defaultLang.code);
          setTranslations(translationData);
        }
      } catch (error) {
        console.error('Error initializing translations:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, []);

  // Set language
  const setLanguage = async (languageCode: string) => {
    try {
      const language = languages.find(l => l.code === languageCode);
      if (!language) return;

      setCurrentLanguage(language);
      saveLanguagePreference(languageCode);
      
      // Load translations for new language
      const translationData = await getTranslations(languageCode);
      setTranslations(translationData);
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  // Translation function
  const t = (namespace: string, key: string, fallback?: string): string => {
    if (translations[namespace] && translations[namespace][key]) {
      return translations[namespace][key];
    }
    return fallback || key;
  };

  return (
    <TranslationContext.Provider
      value={{
        languages,
        currentLanguage,
        translations,
        isLoading,
        setLanguage,
        t,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

