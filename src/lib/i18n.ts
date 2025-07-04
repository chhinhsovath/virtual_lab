// Internationalization utility for VirtualLab LMS
// Supports English (en) and Khmer (km) languages

export type Language = 'en' | 'km';

export interface Translation {
  en: string;
  km: string;
}

// Common translations used throughout the application
export const translations: Record<string, Translation> = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', km: 'ទំព័រដើម' },
  'nav.courses': { en: 'Courses', km: 'វគ្គសិក្សា' },
  'nav.assignments': { en: 'Assignments', km: 'កិច្ចការ' },
  'nav.labs': { en: 'Labs', km: 'ឯកសារពិសោធន៍' },
  'nav.reports': { en: 'Reports', km: 'របាយការណ៍' },
  'nav.users': { en: 'Users', km: 'អ្នកប្រើប្រាស់' },
  'nav.settings': { en: 'Settings', km: 'ការកំណត់' },
  'nav.messages': { en: 'Messages', km: 'សារ' },
  'nav.announcements': { en: 'Announcements', km: 'សេចក្តីប្រកាស' },

  // Common actions
  'action.create': { en: 'Create', km: 'បង្កើត' },
  'action.edit': { en: 'Edit', km: 'កែប្រែ' },
  'action.delete': { en: 'Delete', km: 'លុប' },
  'action.save': { en: 'Save', km: 'រក្សាទុក' },
  'action.cancel': { en: 'Cancel', km: 'បោះបង់' },
  'action.submit': { en: 'Submit', km: 'ប្រគល់' },
  'action.view': { en: 'View', km: 'មើល' },
  'action.download': { en: 'Download', km: 'ទាញយក' },
  'action.upload': { en: 'Upload', km: 'ផ្ទុកឡើង' },
  'action.search': { en: 'Search', km: 'ស្វែងរក' },
  'action.filter': { en: 'Filter', km: 'ត្រង' },
  'action.refresh': { en: 'Refresh', km: 'ធ្វើឲ្យស្រស់' },

  // Status
  'status.active': { en: 'Active', km: 'សកម្ម' },
  'status.inactive': { en: 'Inactive', km: 'អសកម្ម' },
  'status.pending': { en: 'Pending', km: 'កំពុងរង់ចាំ' },
  'status.completed': { en: 'Completed', km: 'បានបញ្ចប់' },
  'status.in_progress': { en: 'In Progress', km: 'កំពុងដំណើរការ' },
  'status.submitted': { en: 'Submitted', km: 'បានប្រគល់' },
  'status.graded': { en: 'Graded', km: 'បានដាក់ពិន្ទុ' },
  'status.overdue': { en: 'Overdue', km: 'ហួសកំណត់' },
  'status.draft': { en: 'Draft', km: 'សេចក្តីព្រាង' },
  'status.published': { en: 'Published', km: 'បានបោះពុម្ពផ្សាយ' },

  // Roles
  'role.super_admin': { en: 'Super Admin', km: 'អ្នកគ្រប់គ្រងកំពូល' },
  'role.admin': { en: 'Admin', km: 'អ្នកគ្រប់គ្រង' },
  'role.teacher': { en: 'Teacher', km: 'គ្រូ' },
  'role.student': { en: 'Student', km: 'សិស្ស' },
  'role.parent': { en: 'Parent', km: 'ឪពុកម្តាយ' },
  'role.guardian': { en: 'Guardian', km: 'អាណាព្យាបាល' },
  'role.director': { en: 'Director', km: 'នាយក' },
  'role.partner': { en: 'Partner', km: 'ដៃគូ' },
  'role.mentor': { en: 'Mentor', km: 'អ្នកណែនាំ' },
  'role.collector': { en: 'Collector', km: 'អ្នកប្រមូលទិន្នន័យ' },
  'role.observer': { en: 'Observer', km: 'អ្នកសង្កេតការណ៍' },
  'role.qa': { en: 'Quality Assurance', km: 'ការធានាគុណភាព' },

  // Course related
  'course.title': { en: 'Course Title', km: 'ចំណងជើងវគ្គសិក្សា' },
  'course.code': { en: 'Course Code', km: 'លេខកូដវគ្គសិក្សា' },
  'course.description': { en: 'Description', km: 'ការពិពណ៌នា' },
  'course.instructor': { en: 'Instructor', km: 'គ្រូបង្រៀន' },
  'course.students': { en: 'Students', km: 'សិស្សនិស្សិត' },
  'course.duration': { en: 'Duration', km: 'រយៈពេល' },
  'course.start_date': { en: 'Start Date', km: 'កាលបរិច្ឆេទចាប់ផ្តើម' },
  'course.end_date': { en: 'End Date', km: 'កាលបរិច្ឆេទបញ្ចប់' },
  'course.enrollment': { en: 'Enrollment', km: 'ការចុះឈ្មោះ' },

  // Assignment related
  'assignment.title': { en: 'Assignment Title', km: 'ចំណងជើងកិច្ចការ' },
  'assignment.instructions': { en: 'Instructions', km: 'សេចក្តីណែនាំ' },
  'assignment.due_date': { en: 'Due Date', km: 'កាលបរិច្ឆេទកំណត់' },
  'assignment.points': { en: 'Points', km: 'ពិន្ទុ' },
  'assignment.type': { en: 'Type', km: 'ប្រភេទ' },
  'assignment.submission': { en: 'Submission', km: 'ការប្រគល់' },

  // Lab related
  'lab.title': { en: 'Lab Title', km: 'ចំណងជើងមន្ទីរពិសោធន៍' },
  'lab.simulation': { en: 'Simulation', km: 'ការក្លែងធ្វើ' },
  'lab.worksheet': { en: 'Worksheet', km: 'សន្លឹកការងារ' },
  'lab.manual': { en: 'Manual', km: 'សៀវភៅណែនាំ' },
  'lab.resources': { en: 'Resources', km: 'ធនធាន' },
  'lab.duration': { en: 'Duration', km: 'រយៈពេល' },
  'lab.attempts': { en: 'Attempts', km: 'ការព្យាយាម' },

  // Form labels
  'form.name': { en: 'Name', km: 'ឈ្មោះ' },
  'form.email': { en: 'Email', km: 'អីមែល' },
  'form.password': { en: 'Password', km: 'ពាក្យសម្ងាត់' },
  'form.phone': { en: 'Phone', km: 'ទូរស័ព្ទ' },
  'form.address': { en: 'Address', km: 'អាសយដ្ឋាន' },
  'form.date_of_birth': { en: 'Date of Birth', km: 'ថ្ងៃខែឆ្នាំកំណើត' },
  'form.language': { en: 'Language', km: 'ភាសា' },

  // Messages
  'message.success': { en: 'Success', km: 'ជោគជ័យ' },
  'message.error': { en: 'Error', km: 'កំហុស' },
  'message.warning': { en: 'Warning', km: 'ការព្រមាន' },
  'message.info': { en: 'Information', km: 'ព័ត៌មាន' },
  'message.loading': { en: 'Loading...', km: 'កំពុងដំណើរការ...' },
  'message.no_data': { en: 'No data available', km: 'មិនមានទិន្នន័យ' },
  'message.unauthorized': { en: 'Unauthorized access', km: 'ការចូលដំណើរការមិនបានអនុញ្ញាត' },

  // Time and dates
  'time.minute': { en: 'minute', km: 'នាទី' },
  'time.minutes': { en: 'minutes', km: 'នាទី' },
  'time.hour': { en: 'hour', km: 'ម៉ោង' },
  'time.hours': { en: 'hours', km: 'ម៉ោង' },
  'time.day': { en: 'day', km: 'ថ្ងៃ' },
  'time.days': { en: 'days', km: 'ថ្ងៃ' },
  'time.week': { en: 'week', km: 'សប្តាហ៍' },
  'time.weeks': { en: 'weeks', km: 'សប្តាហ៍' },
  'time.month': { en: 'month', km: 'ខែ' },
  'time.months': { en: 'months', km: 'ខែ' },

  // Dashboard
  'dashboard.welcome': { en: 'Welcome back', km: 'សូមស្វាគមន៍' },
  'dashboard.overview': { en: 'Overview', km: 'ទិដ្ឋភាពទូទៅ' },
  'dashboard.recent_activity': { en: 'Recent Activity', km: 'សកម្មភាពថ្មីៗ' },
  'dashboard.quick_actions': { en: 'Quick Actions', km: 'សកម្មភាពរហ័ស' },
  'dashboard.statistics': { en: 'Statistics', km: 'ស្ថិតិ' },
  'dashboard.progress': { en: 'Progress', km: 'វឌ្ឍនភាព' },

  // File types
  'file.document': { en: 'Document', km: 'ឯកសារ' },
  'file.image': { en: 'Image', km: 'រូបភាព' },
  'file.video': { en: 'Video', km: 'វីដេអូ' },
  'file.audio': { en: 'Audio', km: 'សំឡេង' },
  'file.simulation': { en: 'Simulation', km: 'ការក្លែងធ្វើ' },
  'file.worksheet': { en: 'Worksheet', km: 'សន្លឹកការងារ' },
  'file.rubric': { en: 'Rubric', km: 'លក្ខណៈវិនិច្ឆ័យ' },
  'file.manual': { en: 'Manual', km: 'សៀវភៅណែនាំ' }
};

// Get browser language preference
export function getBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'km';
  
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('en')) return 'en';
  return 'km';
}

// Get user's preferred language from localStorage
export function getUserLanguage(): Language {
  if (typeof window === 'undefined') return 'km';
  
  const stored = localStorage.getItem('preferred_language') as Language;
  return stored || getBrowserLanguage();
}

// Set user's preferred language
export function setUserLanguage(lang: Language): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('preferred_language', lang);
  document.documentElement.lang = lang;
  
  // Update document direction for Khmer
  document.documentElement.dir = lang === 'km' ? 'ltr' : 'ltr';
}

// Translation function
export function t(key: string, lang?: Language): string {
  const currentLang = lang || getUserLanguage();
  const translation = translations[key];
  
  if (!translation) {
    console.warn(`Translation missing for key: ${key}`);
    return key;
  }
  
  return translation[currentLang] || translation.en || key;
}

// Get translated content from object with multiple language fields
export function getLocalizedContent(
  content: { [key: string]: any }, 
  baseKey: string, 
  lang?: Language
): string {
  const currentLang = lang || getUserLanguage();
  
  // Try current language first
  const localizedKey = currentLang === 'km' ? `${baseKey}_km` : baseKey;
  if (content[localizedKey]) {
    return content[localizedKey];
  }
  
  // Fallback to English
  if (content[baseKey]) {
    return content[baseKey];
  }
  
  // If no content found, return empty string
  return '';
}

// Format date according to language
export function formatDate(date: Date | string, lang?: Language): string {
  const currentLang = lang || getUserLanguage();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (currentLang === 'km') {
    // Khmer date format
    return dateObj.toLocaleDateString('km-KH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } else {
    // English date format
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

// Format time according to language
export function formatTime(date: Date | string, lang?: Language): string {
  const currentLang = lang || getUserLanguage();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleTimeString(currentLang === 'km' ? 'km-KH' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format number according to language
export function formatNumber(num: number, lang?: Language): string {
  const currentLang = lang || getUserLanguage();
  
  return num.toLocaleString(currentLang === 'km' ? 'km-KH' : 'en-US');
}

// Pluralization helper
export function pluralize(
  count: number, 
  singular: string, 
  plural?: string, 
  lang?: Language
): string {
  const currentLang = lang || getUserLanguage();
  
  if (currentLang === 'km') {
    // Khmer doesn't have plural forms like English
    return t(singular, lang);
  } else {
    return count === 1 ? t(singular, lang) : t(plural || `${singular}s`, lang);
  }
}

// Language selector options (Khmer first as primary language)
export const languageOptions = [
  { value: 'km', label: 'Khmer', nativeLabel: 'ខ្មែរ' },
  { value: 'en', label: 'English', nativeLabel: 'English' }
];

// Check if language is RTL (not applicable for supported languages, but kept for extensibility)
export function isRTL(lang?: Language): boolean {
  const currentLang = lang || getUserLanguage();
  return false; // Neither English nor Khmer are RTL
}

// Get font class for language
export function getFontClass(lang?: Language): string {
  const currentLang = lang || getUserLanguage();
  return currentLang === 'km' ? 'font-hanuman' : 'font-sans';
}

// Create a React hook for translations (if using React)
export function useTranslation(initialLang?: Language) {
  const [language, setLanguage] = React.useState(
    initialLang || getUserLanguage()
  );
  
  const changeLanguage = (newLang: Language) => {
    setUserLanguage(newLang);
    setLanguage(newLang);
  };
  
  const translate = (key: string) => t(key, language);
  
  return {
    language,
    changeLanguage,
    t: translate,
    formatDate: (date: Date | string) => formatDate(date, language),
    formatTime: (date: Date | string) => formatTime(date, language),
    formatNumber: (num: number) => formatNumber(num, language),
    getLocalizedContent: (content: any, baseKey: string) => 
      getLocalizedContent(content, baseKey, language)
  };
}

// Export React import for the hook
const React = typeof window !== 'undefined' ? require('react') : { useState: () => {} };