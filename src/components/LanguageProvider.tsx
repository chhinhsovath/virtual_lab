'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Language, getUserLanguage, setUserLanguage, t, formatDate, formatTime, formatNumber, getLocalizedContent, getFontClass } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  formatDate: (date: Date | string) => string;
  formatTime: (date: Date | string) => string;
  formatNumber: (num: number) => string;
  getLocalizedContent: (content: any, baseKey: string) => string;
  getFontClass: () => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('km'); // Default to Khmer for Cambodian students
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize language on client side
    const savedLang = getUserLanguage();
    setLanguageState(savedLang);
    setUserLanguage(savedLang);
    setIsInitialized(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setUserLanguage(lang);
    setLanguageState(lang);
    // Update document language
    document.documentElement.lang = lang;
    // Update body font class
    document.body.className = document.body.className.replace(/font-\w+/, getFontClass(lang));
  }, []);

  const translate = useCallback((key: string) => t(key, language), [language]);
  const formatDateLang = useCallback((date: Date | string) => formatDate(date, language), [language]);
  const formatTimeLang = useCallback((date: Date | string) => formatTime(date, language), [language]);
  const formatNumberLang = useCallback((num: number) => formatNumber(num, language), [language]);
  const getLocalizedContentLang = useCallback((content: any, baseKey: string) => getLocalizedContent(content, baseKey, language), [language]);
  const getFontClassLang = useCallback(() => getFontClass(language), [language]);

  // Don't render until language is initialized on client side
  if (!isInitialized) {
    return null;
  }

  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t: translate,
    formatDate: formatDateLang,
    formatTime: formatTimeLang,
    formatNumber: formatNumberLang,
    getLocalizedContent: getLocalizedContentLang,
    getFontClass: getFontClassLang,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}