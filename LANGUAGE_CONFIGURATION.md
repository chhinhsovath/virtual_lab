# Khmer Language Configuration

This Virtual Lab LMS system has been configured with **Khmer (ខ្មែរ) as the primary language**.

## Key Configurations Made:

### 1. Default Language Settings
- **Primary Language**: Khmer (`km`)
- **Secondary Language**: English (`en`)
- **Browser Detection**: Defaults to Khmer unless English is explicitly detected
- **Initial Language**: Khmer for new users

### 2. Font Configuration
- **Hanuman Font**: Configured for proper Khmer text rendering
- **Google Fonts**: Loaded via CDN for optimal performance
- **Tailwind Classes**: `font-hanuman` class available for Khmer text

### 3. HTML Configuration
- **Document Language**: Set to `lang="km"`
- **Font Family**: Hanuman font applied to body by default
- **Metadata**: Bilingual titles and descriptions (Khmer first)

### 4. Environment Variables
```bash
DEFAULT_LANGUAGE=km
SUPPORTED_LANGUAGES=km,en
```

### 5. Language Switching
- **LanguageSwitcher Component**: Available for language selection
- **Preference Storage**: User language preference saved in localStorage
- **Language Options**: Khmer shown first in language selector

## Implementation Details:

### Files Modified for Khmer Support:
1. `/src/lib/i18n.ts` - Language detection and defaults
2. `/src/app/layout.tsx` - HTML lang attribute and font loading
3. `/tailwind.config.js` - Hanuman font family
4. `.env.local` and `.env.production` - Environment variables

### Available Translation Keys:
The translation system includes comprehensive Khmer translations for:
- Navigation elements
- Common actions (Create, Edit, Delete, etc.)
- Status indicators
- User roles
- Academic terms
- Form labels
- Error messages

### Usage Example:
```typescript
import { t, getUserLanguage } from '@/lib/i18n';

// Get translated text
const welcomeText = t('common.welcome'); // Returns Khmer by default

// Use in components
const currentLang = getUserLanguage(); // Returns 'km' by default
```

## Next Steps:

1. **Content Translation**: Update static content throughout the application to use the translation system
2. **Database Content**: Consider storing bilingual content in the database
3. **User Preferences**: Implement user-specific language preferences in user profiles
4. **Email Templates**: Create Khmer email templates for notifications

## Font Notes:

The Hanuman font is specifically designed for Khmer text and provides:
- Proper character rendering
- Traditional Khmer typography
- Good readability for educational content
- Multiple font weights (100, 300, 400, 700, 900)

This ensures that Khmer users have the best possible reading experience when using the Virtual Lab LMS system.