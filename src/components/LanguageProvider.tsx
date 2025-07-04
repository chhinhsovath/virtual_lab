'use client';

import { useEffect } from 'react';
import { setUserLanguage, getUserLanguage } from '@/lib/i18n';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize language to Khmer if no preference is set
    const currentLang = getUserLanguage();
    if (!localStorage.getItem('preferred_language')) {
      setUserLanguage('km');
    } else {
      setUserLanguage(currentLang);
    }
  }, []);

  return <>{children}</>;
}