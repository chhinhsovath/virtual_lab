import { NextRequest } from 'next/server';

// Helper to get language from request headers
export function getLanguageFromRequest(request: NextRequest): 'en' | 'km' {
  const acceptLanguage = request.headers.get('accept-language') || '';
  const language = request.headers.get('x-language') || '';
  
  if (language === 'km' || acceptLanguage.includes('km')) {
    return 'km';
  }
  return 'en';
}

// Bilingual error messages
export const errorMessages = {
  invalidCredentials: {
    en: 'Invalid credentials',
    km: 'ព័ត៌មានផ្ទៀងផ្ទាត់មិនត្រឹមត្រូវ'
  },
  usernamePasswordRequired: {
    en: 'Username and password are required',
    km: 'ឈ្មោះអ្នកប្រើប្រាស់ និងពាក្យសម្ងាត់ត្រូវតែមាន'
  },
  internalServerError: {
    en: 'Internal server error',
    km: 'កំហុសម៉ាស៊ីនមេ'
  },
  unauthorized: {
    en: 'Unauthorized',
    km: 'មិនមានការអនុញ្ញាត'
  },
  sessionExpired: {
    en: 'Session expired',
    km: 'វគ្គបានផុតកំណត់'
  },
  notFound: {
    en: 'Not found',
    km: 'រកមិនឃើញ'
  },
  invalidRequest: {
    en: 'Invalid request',
    km: 'សំណើមិនត្រឹមត្រូវ'
  },
  accessDenied: {
    en: 'Access denied',
    km: 'ការចូលប្រើត្រូវបានបដិសេធ'
  },
  dataNotFound: {
    en: 'Data not found',
    km: 'រកមិនឃើញទិន្នន័យ'
  },
  operationFailed: {
    en: 'Operation failed',
    km: 'ប្រតិបត្តិការបរាជ័យ'
  },
  validationError: {
    en: 'Validation error',
    km: 'កំហុសក្នុងការផ្ទៀងផ្ទាត់'
  },
  duplicateEntry: {
    en: 'Duplicate entry',
    km: 'ធាតុស្ទួន'
  },
  insufficientPermissions: {
    en: 'Insufficient permissions',
    km: 'សិទ្ធិមិនគ្រប់គ្រាន់'
  },
  saveSuccess: {
    en: 'Saved successfully',
    km: 'បានរក្សាទុកដោយជោគជ័យ'
  },
  updateSuccess: {
    en: 'Updated successfully',
    km: 'បានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ'
  },
  deleteSuccess: {
    en: 'Deleted successfully',
    km: 'បានលុបដោយជោគជ័យ'
  },
  loadingError: {
    en: 'Error loading data',
    km: 'កំហុសក្នុងការផ្ទុកទិន្នន័យ'
  }
};

// Helper to get localized message
export function getLocalizedMessage(key: keyof typeof errorMessages, language: 'en' | 'km' = 'en'): string {
  return errorMessages[key]?.[language] || errorMessages[key]?.en || key;
}

// Success response helper
export function successResponse(data: any, message?: string, language: 'en' | 'km' = 'en') {
  return {
    success: true,
    message,
    data
  };
}

// Error response helper
export function errorResponse(key: keyof typeof errorMessages, language: 'en' | 'km' = 'en', details?: any) {
  return {
    success: false,
    error: getLocalizedMessage(key, language),
    errorKey: key,
    details
  };
}