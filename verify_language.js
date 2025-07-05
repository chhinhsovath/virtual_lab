// Test script to verify language behavior
// Run this in browser console on localhost:3000

console.log('=== Language System Verification ===');

// Check localStorage
const stored = localStorage.getItem('preferred_language');
console.log('Stored language preference:', stored);

// Check browser language
console.log('Browser language:', navigator.language);

// Clear localStorage and reload to test default
console.log('Clearing localStorage...');
localStorage.removeItem('preferred_language');

// Check what getBrowserLanguage would return
console.log('After clearing, reload page and check default language');

// Helper function to check translation
function checkTranslation(key) {
  // This would work if we had access to the translation function
  console.log(`Translation for "${key}":`, window.t ? window.t(key) : 't function not available');
}

console.log('Manual check - look at page title and content for Khmer text');
console.log('Expected: មន្ទីរពិសោធន៍និម្មិតកម្ពុជា (Khmer title)');
console.log('Page title:', document.title);