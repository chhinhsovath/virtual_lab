'use client';

import { useLanguage } from '../../components/LanguageProvider';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function TestLanguagePage() {
  const { language, setLanguage, t, getFontClass } = useLanguage();
  
  const clearAndReset = () => {
    localStorage.removeItem('preferred_language');
    window.location.reload();
  };
  
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Language System Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Current Language:</strong> {language}
            </div>
            <div>
              <strong>Font Class:</strong> {getFontClass()}
            </div>
          </div>
          
          <div className="space-y-2">
            <div><strong>Sample Translations:</strong></div>
            <div className={getFontClass()}>
              <div>Title: {t('home.title')}</div>
              <div>Login: {t('ui.login')}</div>
              <div>Hero: {t('home.hero_title')}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div><strong>Browser Info:</strong></div>
            <div>Navigator Language: {typeof window !== 'undefined' ? navigator.language : 'Server'}</div>
            <div>Stored Preference: {typeof window !== 'undefined' ? localStorage.getItem('preferred_language') || 'None' : 'Server'}</div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => setLanguage('km')}>Set Khmer</Button>
            <Button onClick={() => setLanguage('en')}>Set English</Button>
            <Button onClick={clearAndReset} variant="outline">Clear & Reset</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}