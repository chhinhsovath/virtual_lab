'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import { getUserLanguage, setUserLanguage, languageOptions, type Language } from '@/lib/i18n';

export function LanguageSwitcher() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('km');

  useEffect(() => {
    setCurrentLanguage(getUserLanguage());
  }, []);

  const handleLanguageChange = (language: Language) => {
    setUserLanguage(language);
    setCurrentLanguage(language);
    // Refresh the page to apply language changes throughout the app
    window.location.reload();
  };

  const currentOption = languageOptions.find(option => option.value === currentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline-block">
            {currentOption?.nativeLabel || 'ខ្មែរ'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languageOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleLanguageChange(option.value as Language)}
            className={currentLanguage === option.value ? 'bg-accent' : ''}
          >
            <div className="flex flex-col">
              <span className="font-medium">{option.nativeLabel}</span>
              <span className="text-xs text-muted-foreground">{option.label}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}