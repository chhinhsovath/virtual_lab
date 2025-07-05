// Direct test of i18n functions
const translations = {
  'home.title': { en: 'Virtual Lab Cambodia', km: 'មន្ទីរពិសោធន៍និម្មិតកម្ពុជា' },
  'ui.login': { en: 'Login', km: 'ចូលប្រើ' }
};

function getBrowserLanguage() {
  // Always default to Khmer for Cambodian students
  return 'km';
}

function getUserLanguage() {
  if (typeof window === 'undefined') return 'km';
  
  const stored = localStorage.getItem('preferred_language');
  return stored || getBrowserLanguage();
}

function t(key, lang) {
  const currentLang = lang || getUserLanguage();
  const translation = translations[key];
  
  if (!translation) {
    console.warn(`Translation missing for key: ${key}`);
    return key;
  }
  
  return translation[currentLang] || translation.km || translation.en || key;
}

// Test the functions
console.log('=== Direct i18n Test ===');
console.log('getBrowserLanguage():', getBrowserLanguage());

// Clear localStorage first
if (typeof localStorage !== 'undefined') {
  localStorage.removeItem('preferred_language');
}

console.log('getUserLanguage() after clearing localStorage:', getUserLanguage());
console.log('t("home.title"):', t('home.title'));
console.log('t("ui.login"):', t('ui.login'));

// Test with explicit language
console.log('t("home.title", "km"):', t('home.title', 'km'));
console.log('t("home.title", "en"):', t('home.title', 'en'));

module.exports = { getBrowserLanguage, getUserLanguage, t };