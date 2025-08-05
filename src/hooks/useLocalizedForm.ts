import { useLanguage } from '../components/LanguageProvider';

export function useLocalizedForm() {
  const { t } = useLanguage();

  // Form validation messages
  const validationMessages = {
    required: (field: string) => t('validation.required').replace('{field}', field),
    minLength: (field: string, length: number) => 
      t('validation.minLength').replace('{field}', field).replace('{length}', length.toString()),
    maxLength: (field: string, length: number) => 
      t('validation.maxLength').replace('{field}', field).replace('{length}', length.toString()),
    email: () => t('validation.email'),
    pattern: (field: string) => t('validation.pattern').replace('{field}', field),
    min: (field: string, value: number) => 
      t('validation.min').replace('{field}', field).replace('{value}', value.toString()),
    max: (field: string, value: number) => 
      t('validation.max').replace('{field}', field).replace('{value}', value.toString()),
  };

  return { validationMessages };
}