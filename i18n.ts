import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './public/locales/en/translation.json';
import enUS from './public/locales/en-US/translation.json';
import hi from './public/locales/hi/translation.json';
import mr from './public/locales/mr/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      'en-US': { translation: enUS },
      hi: { translation: hi },
      mr: { translation: mr },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n; 