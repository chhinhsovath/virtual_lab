# Bilingual Implementation Documentation

## Overview

The Cambodia Virtual Lab platform has been fully implemented with bilingual support (Khmer as default, English as secondary). This documentation outlines the implementation details and usage guidelines.

## Implementation Details

### 1. Core Translation System

**Location**: `/src/lib/i18n.ts`

The translation system includes:
- 600+ translation keys covering all UI elements
- Khmer as the default language (`km`)
- English as the secondary language (`en`)
- Automatic browser language detection (defaulting to Khmer)

### 2. Language Provider

**Location**: `/src/components/LanguageProvider.tsx`

Features:
- React Context API for global language state
- `useLanguage()` hook for accessing translations
- Font class management for Khmer typography
- Persistent language preference in localStorage

### 3. Key Components Updated

#### Authentication Pages
- Login page: Full bilingual support with language switcher
- Demo account descriptions in both languages
- Error messages and validation texts

#### Dashboard Pages
- **Student Dashboard**: Complete bilingual interface with welcome messages, navigation, and interactive elements
- **Assessment Entry**: Bilingual form labels, validation messages, and success notifications
- **Student Selection**: Drag-and-drop interface with bilingual instructions
- **Analytics**: Charts, statistics, and report generation in both languages
- **Results**: Export functionality and data tables with bilingual headers

#### API Responses
- **Location**: `/src/lib/api-responses.ts`
- Bilingual error messages based on request headers
- Success messages in user's preferred language

### 4. Usage Examples

#### In React Components

```typescript
import { useLanguage } from '@/components/LanguageProvider';

function MyComponent() {
  const { t, getFontClass, language } = useLanguage();
  
  return (
    <div>
      <h1 className={getFontClass()}>{t('welcome.title')}</h1>
      <p>{language === 'km' ? 'ខ្មែរ' : 'English'}</p>
    </div>
  );
}
```

#### In API Routes

```typescript
import { getLanguageFromRequest, errorResponse } from '@/lib/api-responses';

export async function POST(request: NextRequest) {
  const lang = getLanguageFromRequest(request);
  
  if (error) {
    return errorResponse('auth.invalid_credentials', 401, lang);
  }
}
```

### 5. Font Support

The system uses the Hanuman font for Khmer text rendering:
- Configured in Tailwind CSS (`font-khmer` class)
- Automatically applied via `getFontClass()` function
- Ensures proper rendering of Khmer Unicode characters

### 6. Key Translation Categories

1. **Common UI Elements** (`common.*`)
   - Buttons, labels, navigation items
   - Error and success messages

2. **Authentication** (`auth.*`)
   - Login form fields
   - Validation messages
   - Demo account information

3. **Student Interface** (`student.*`)
   - Dashboard elements
   - Progress tracking
   - Interactive components

4. **Assessment System** (`assessment.*`)
   - Form fields
   - Cycles (Baseline/Midline/Endline)
   - Level descriptions

5. **Analytics & Reports** (`analytics.*`, `results.*`)
   - Chart labels
   - Statistical descriptions
   - Export options

6. **User Management** (`users.*`)
   - Role descriptions
   - Action labels
   - Status indicators

7. **Simulations** (`simulations.*`)
   - Library interface
   - Filter options
   - Action buttons

### 7. Best Practices

1. **Always use the translation system**
   ```typescript
   // Good
   <Button>{t('common.save')}</Button>
   
   // Bad
   <Button>Save</Button>
   ```

2. **Apply font classes for mixed content**
   ```typescript
   <Label className={getFontClass()}>
     {t('form.label')}
   </Label>
   ```

3. **Handle pluralization**
   ```typescript
   t('items.count').replace('{count}', count.toString())
   ```

4. **Validate translations exist**
   - All keys should be defined in both languages
   - Use TypeScript for type safety

### 8. Adding New Translations

1. Add the key to `/src/lib/i18n.ts`:
   ```typescript
   'new.key': { en: 'English text', km: 'អក្សរខ្មែរ' }
   ```

2. Use in component:
   ```typescript
   const { t } = useLanguage();
   return <span>{t('new.key')}</span>;
   ```

### 9. Language Switching

Users can switch languages using:
- Language toggle in the login page
- Settings menu in the dashboard
- Preference persists across sessions

### 10. Testing Checklist

- [ ] All text displays correctly in Khmer
- [ ] Language switching works throughout the app
- [ ] Khmer font renders properly
- [ ] No hardcoded English text remains
- [ ] API error messages respect language preference
- [ ] Form validation messages are bilingual
- [ ] Export features include bilingual headers

## Conclusion

The platform now fully supports bilingual functionality with Khmer as the primary language and English as secondary. All major interfaces, forms, and interactive elements have been localized to provide a seamless experience for Cambodian users.