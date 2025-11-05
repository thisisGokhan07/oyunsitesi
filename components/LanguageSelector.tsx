'use client';

import { useState, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function LanguageSelector() {
  const { languages, currentLanguage, setLanguage, isLoading } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);

  const handleLanguageChange = async (languageCode: string) => {
    if (isChanging || currentLanguage?.code === languageCode) return;
    
    setIsChanging(true);
    try {
      await setLanguage(languageCode);
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setIsChanging(false);
    }
  };

  if (isLoading || languages.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 h-9 px-3"
          disabled={isChanging}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentLanguage?.flag_emoji || '🌐'} {currentLanguage?.native_name || 'TR'}
          </span>
          <span className="sm:hidden">
            {currentLanguage?.flag_emoji || '🌐'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="cursor-pointer flex items-center justify-between"
            disabled={isChanging}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{language.flag_emoji}</span>
              <span>{language.native_name}</span>
              <span className="text-xs text-muted-foreground ml-1">
                ({language.name})
              </span>
            </div>
            {currentLanguage?.code === language.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

